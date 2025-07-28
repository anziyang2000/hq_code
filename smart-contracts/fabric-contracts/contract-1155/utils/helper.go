package utils

import (
	"contract-1155/proto"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
	"math"
	"sort"
	"strconv"
)

/*
	AuthorizationHelper: 权限验证
	fixme 测试时不开，ca写好后再开
*/
func AuthorizationHelper(ctx contractapi.TransactionContextInterface, needLevel int64) (bool, error) {
	//value, found, err := ctx.GetClientIdentity().GetAttributeValue(proto.OperateAuthLevelName)
	//if err != nil {
	//	return false, fmt.Errorf("[AuthorizationHelper] get attribute value failed, err: %v", err)
	//} else if !found {
	//	return false, fmt.Errorf("[AuthorizationHelper] value(%v) not exist", proto.OperateAuthLevelName)
	//}
	//
	//// string转int46
	//res, _ := strconv.ParseInt(value, 10, 64)
	//
	//// 判断权限
	//return res >= needLevel, nil
	return true, nil
}

/*
	ReadNFRHelper 查询NFR信息
*/
func ReadNFRHelper(ctx contractapi.TransactionContextInterface, tokenId string) (*proto.NftMetadata, error) {
	nft := new(proto.NftMetadata)
	nftKey, err := ctx.GetStub().CreateCompositeKey(proto.PrefixNft, []string{tokenId})
	if err != nil {
		return nft, fmt.Errorf("[ReadNFRHelper] failed to create the composite key for prefix %s: %v", proto.PrefixNft, err)
	}
	// 查找到该 NFT
	nftBytes, err := ctx.GetStub().GetState(nftKey)
	if err != nil {
		return nft, fmt.Errorf("[ReadNFRHelper] failed to get nft (%v) data, err: %v", nftKey, err)
	}

	// 解析出来
	if err = json.Unmarshal(nftBytes, nft); err != nil {
		return nft, fmt.Errorf("[ReadNFRHelper] json unmarshal failed, err: %v", err)
	}

	return nft, nil
}

/*
	MintHelper: 根据条件给账户发币
	operator: 操作者
	account: 账户
	id: 币的类型
	amount: 数量
*/
func MintHelper(ctx contractapi.TransactionContextInterface, account, batchID, tokenId string, nft *proto.NftMetadata) error {
	// 参数校验
	if account == proto.EmptyAccount {
		return fmt.Errorf("[INFO]-[MintHelper] mint to the zero address")
	}

	// 创建nft复合键
	nftKey, err := ctx.GetStub().CreateCompositeKey(proto.PrefixNft, []string{tokenId})
	if err != nil {
		return fmt.Errorf("[ERROR]-[MintHelper] failed to create the composite key for prefix %s: %v", proto.PrefixNft, err)
	}
	// 保存NFT
	nftBytes, err := json.Marshal(nft)
	if err != nil {
		return fmt.Errorf("[ERROR]-[MintHelper] json marshal nft value failed, err: %v", err)
	}
	if err = ctx.GetStub().PutState(nftKey, nftBytes); err != nil {
		return fmt.Errorf("[ERROR]-[MintHelper] put state nft failed, err: %v", err)
	}

	// 给账户增加一个该币的键（增加一个nft的余额）
	balanceKey, err := ctx.GetStub().CreateCompositeKey(proto.PrefixBalance, []string{account, batchID, tokenId})
	if err != nil {
		return fmt.Errorf("[ERROR]-[MintHelper] failed to create the composite key for prefix %s: %v", proto.PrefixBalance, err)
	}
	if err = ctx.GetStub().PutState(balanceKey, []byte("1")); err != nil {
		return fmt.Errorf("[ERROR]-[MintHelper] put state balance failed, err: %v", err)
	}

	return nil
}

/*
	MintNFRPayCoinsHelper 创建NFR手续费收取
	feeCollector: 手续费收取账户
*/
func MintNFRPayCoinsHelper(ctx contractapi.TransactionContextInterface, feeCollector string) error {
	// fixme 目前扣除手续费是写死(10000个稳定币), 后期需要修改
	fee := 10000

	args := [][]byte{[]byte(proto.FcnCoinsTransfer), []byte(feeCollector), []byte(strconv.Itoa(fee))}
	response := ctx.GetStub().InvokeChaincode(proto.ChaincodeNameCoins, args, proto.ChannelID)
	if response.Status != shim.OK {
		log.Printf("[ERROR]-[MintNFRPayCoinsHelper] transfer coins failed, err: %v", response.Message)
		return fmt.Errorf("transfer coins failed, err: %v", response.Message)
	}

	return nil
}

/*
	BurnNFRHelper
	account: 需要消除NFR的账户
	batchIDs: NFR的类型切片(应与数量一一对应)
	amounts: 数量(应与类型一一对应)
*/
func BurnNFRHelper(ctx contractapi.TransactionContextInterface, account string, batchIDs []string, amounts []uint64) error {

	necessaryFunds := make(map[string]uint64)

	for i := 0; i < len(batchIDs); i++ {
		necessaryFunds[batchIDs[i]] += amounts[i]
	}

	// 根据key排序，因为map是无序的
	necessaryFundsKeys := SortedKeys(necessaryFunds)

	// 遍历需要移除的票的类型
	for _, batchId := range necessaryFundsKeys {
		// 此类票需要移除的数量
		neededAmount := necessaryFunds[batchId]

		var balanceKeys []string
		var partialBalance uint64

		// 获取此类票的余额
		balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(proto.PrefixBalance, []string{account, batchId})
		if err != nil {
			return fmt.Errorf("[RemoveBalance] failed to get state for prefix %v: %v", proto.PrefixBalance, err)
		}
		defer balanceIterator.Close()

		// 迭代所有的key
		for balanceIterator.HasNext() && partialBalance < neededAmount {
			// 存在即代表余额加1
			partialBalance++

			queryResponse, err := balanceIterator.Next()
			if err != nil {
				return fmt.Errorf("[RemoveBalance] failed to get the next state for prefix %v: %v", proto.PrefixBalance, err)
			}

			balanceKeys = append(balanceKeys, queryResponse.Key)
		}

		if partialBalance < neededAmount {
			// 余额不够
			return fmt.Errorf("[RemoveBalance] sender has insufficient funds for token (%v), needed funds: (%v), available fund: (%v)", batchId, neededAmount, partialBalance)
		} else {
			// 余额大于或等于需要的数量
			for i := 0; i < int(neededAmount); i++ {
				// 将需要的数量的键删除
				if err = ctx.GetStub().DelState(balanceKeys[i]); err != nil {
					return fmt.Errorf("[RemoveBalance] failed to delete the state of %v: %v", balanceKeys[i], err)
				}
			}
		}

	}

	return nil
}

/*
	TradeNFRPayCoinsHelper
	NFRSender: 收取稳定币账户
	value: 价值
*/
func TradeNFRPayCoinsHelper(ctx contractapi.TransactionContextInterface, NFRSender, feeCollector string, value uint64) error {
	// 计算手续费
	fee := Round(float64(value) * 0.03)
	log.Printf("[INFO]-[TradeNFRPayCoinsHelper] this trade fee handing is (%v) coins", fee)

	// 将手续费和NFR对应价值的稳定币转给手续费账户和NFR发送方
	accounts := []string{feeCollector, NFRSender}
	amounts := []int{int(fee), int(value)}
	accountsBytes, err := json.Marshal(accounts)
	if err != nil {
		log.Printf("json marshal accounts failed, err: %v", err)
		return fmt.Errorf("json marshal accounts failed, err: %v", err)
	}
	amountsBytes, err := json.Marshal(amounts)
	if err != nil {
		log.Printf("json marshal amounts failed, err: %v", err)
		return fmt.Errorf("json marshal amounts failed, err: %v", err)
	}
	args := [][]byte{[]byte(proto.FcnCoinsTransferBatch), accountsBytes, amountsBytes}
	response := ctx.GetStub().InvokeChaincode(proto.ChaincodeNameCoins, args, proto.ChannelID)
	if response.Status != shim.OK {
		log.Printf("[ERROR]-[TradeNFRPayCoinsHelper] transfer batch coins failed, err: %v", response.Message)
		return fmt.Errorf("transfer batch coins failed, err: %v", response.Message)
	}

	//// 将手续费转给手续费账户
	//feeArgs := [][]byte{[]byte("Transfer"), []byte(feeCollector), []byte(strconv.Itoa(int(fee)))}
	//feeResponse := ctx.GetStub().InvokeChaincode("contract-20-v1", feeArgs, "chan2021")
	//if feeResponse.Status != shim.OK {
	//	log.Printf("[ERROR]-[TradeNFRPayCoinsHelper] transfer fee coins failed, err: %v", feeResponse.Message)
	//	return fmt.Errorf("transfer coins failed, err: %v", feeResponse.Message)
	//}
	//
	//// 调用稳定币合约进行转账
	//senderArgs := [][]byte{[]byte("Transfer"), []byte(NFRSender), []byte(strconv.Itoa(int(value)))}
	//senderResponse := ctx.GetStub().InvokeChaincode("contract-20-v1", senderArgs, "chan2021")
	//if senderResponse.Status != shim.OK {
	//	log.Printf("[ERROR]-[TradeNFRPayCoinsHelper] transfer trade coins failed, err: %v", senderResponse.Message)
	//	return fmt.Errorf("transfer coins failed, err: %v", senderResponse.Message)
	//}

	return nil
}

/*
	TransferHelper
	sender: 发送者账户
	recipient: 接收者账户
	batchIDs: NFR的类型切片(应与数量一一对应)
	amounts: 数量(应与类型一一对应)
*/
func TransferHelper(ctx contractapi.TransactionContextInterface, sender, recipient string, batchIDs []string, amounts []uint64) ([]*proto.NftMetadata, error) {
	necessaryFunds := make(map[string]uint64)
	for i := 0; i < len(batchIDs); i++ {
		necessaryFunds[batchIDs[i]] += amounts[i]
	}
	// 根据key排序，因为map是无序的
	necessaryFundsKeys := SortedKeys(necessaryFunds)

	var updateNftList = make([]*proto.NftMetadata, 0)

	// 遍历需要转账的票的类型
	for _, batchId := range necessaryFundsKeys {
		// 此类票需要转账的数量
		neededAmount := necessaryFunds[batchId]

		var senderBalanceKeys []string
		var partialBalance uint64

		// 获取此类票的余额
		balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(proto.PrefixBalance, []string{sender, batchId})
		if err != nil {
			return updateNftList, fmt.Errorf("[TransferHelper] failed to get state for prefix %v: %v", proto.PrefixBalance, err)
		}
		defer balanceIterator.Close()

		// 迭代所有的key
		for balanceIterator.HasNext() && partialBalance < neededAmount {
			// 存在即代表余额加1
			partialBalance++

			queryResponse, err := balanceIterator.Next()
			if err != nil {
				return updateNftList, fmt.Errorf("[TransferHelper] failed to get the next state for prefix %v: %v", proto.PrefixBalance, err)
			}

			senderBalanceKeys = append(senderBalanceKeys, queryResponse.Key)
		}

		if partialBalance < neededAmount {
			// 余额不够
			return updateNftList, fmt.Errorf("[TransferHelper] sender has insufficient funds for token (%v), needed funds: (%v), available fund: (%v)", batchId, neededAmount, partialBalance)
		} else {
			// 余额大于或等于需要的数量
			for i := 0; i < int(neededAmount); i++ {
				// 将该复合键切割开
				_, compositeKeyParts, err := ctx.GetStub().SplitCompositeKey(senderBalanceKeys[i])
				if err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] SplitCompositeKey failed, err: %v", err)
				}

				// 根据 tokenId 找到该 nft
				nft, err := ReadNFRHelper(ctx, compositeKeyParts[2])
				if err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] read NFR helper failed, err: %v", err)
				}

				// 将owner修改成接收者账户
				nft.Owner = recipient
				// 保存 NFT
				nftMarshal, err := json.Marshal(nft)
				if err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] json marshal failed, err: %v", err)
				}

				// 将交易后的 nft 放入交易返回列表中
				updateNftList = append(updateNftList, nft)

				// 拼接该NFT的复合键
				nftKey, err := ctx.GetStub().CreateCompositeKey(proto.PrefixNft, []string{compositeKeyParts[2]})
				if err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] failed to create the composite key for prefix %s: %v", proto.PrefixNft, err)
				}
				if err = ctx.GetStub().PutState(nftKey, nftMarshal); err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] put data nft (%v) failed, err: %v", nftKey, err)
				}

				// 删除发送者的该 nft 余额
				if err = ctx.GetStub().DelState(senderBalanceKeys[i]); err != nil {
					return updateNftList, fmt.Errorf("[TransferHelper] failed to delete the state of %v: %v", senderBalanceKeys[i], err)
				}

				// 增加接收者的该 nft 余额
				balanceKey, err := ctx.GetStub().CreateCompositeKey(proto.PrefixBalance, []string{recipient, batchId, compositeKeyParts[2]})
				if err != nil {
					return updateNftList, fmt.Errorf("[MintHelper] failed to create the composite key for prefix %s: %v", proto.PrefixBalance, err)
				}
				if err = ctx.GetStub().PutState(balanceKey, []byte("1")); err != nil {
					return updateNftList, fmt.Errorf("[MintHelper] put state balance failed, err: %v", err)
				}

			}
		}

	}

	return updateNftList, nil
}

// SortedKeys 将map的key排序返回
func SortedKeys(m map[string]uint64) []string {
	// 把key复制到一个切片中
	keys := make([]string, len(m))
	i := 0
	for k := range m {
		keys[i] = k
		i++
	}
	// 将key进行排序
	sort.Slice(keys, func(i, j int) bool { return keys[i] < keys[j] })
	return keys
}

func SortedKeysContract(m map[string]*proto.NftMetadata) []string {
	// 把key复制到一个切片中
	keys := make([]string, len(m))
	i := 0
	for k := range m {
		keys[i] = k
		i++
	}
	// 将key进行排序
	sort.Slice(keys, func(i, j int) bool { return keys[i] < keys[j] })
	return keys
}

// SortedKeysToID 将map的key(proto.ToID类型)排序返回
func SortedKeysToID(m map[proto.ToID]uint64) []proto.ToID {
	// 把key复制到一个切片中
	keys := make([]proto.ToID, len(m))
	i := 0
	for k := range m {
		keys[i] = k
		i++
	}
	// 先根据ID排序，若相等再根据To排序
	sort.Slice(keys, func(i, j int) bool {
		if keys[i].ID != keys[j].ID {
			return keys[i].To < keys[j].To
		}
		return keys[i].ID < keys[j].ID
	})
	return keys
}

// EmitTransferSingle 单笔转账触发事件
func EmitTransferSingle(ctx contractapi.TransactionContextInterface, transferSingleEvent proto.TransferSingle) error {
	transferSingleEventJSON, err := json.Marshal(transferSingleEvent)
	if err != nil {
		return fmt.Errorf("[EmitTransferSingle] failed to obtain JSON encoding: %v", err)
	}

	err = ctx.GetStub().SetEvent("TransferSingle", transferSingleEventJSON)
	if err != nil {
		return fmt.Errorf("[EmitTransferSingle] failed to set event: %v", err)
	}

	return nil
}

// EmitTransferBatch 批量转账触发事件
func EmitTransferBatch(ctx contractapi.TransactionContextInterface, transferBatchEvent proto.TransferBatch) error {
	transferBatchEventJSON, err := json.Marshal(transferBatchEvent)
	if err != nil {
		return fmt.Errorf("[EmitTransferBatch] failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("TransferBatch", transferBatchEventJSON)
	if err != nil {
		return fmt.Errorf("[EmitTransferBatch] failed to set event: %v", err)
	}

	return nil
}

// EmitTransferBatchMultiRecipient 转账批量接收者触发事件
func EmitTransferBatchMultiRecipient(ctx contractapi.TransactionContextInterface, transferBatchMultiRecipientEvent proto.TransferBatchMultiRecipient) error {
	transferBatchMultiRecipientEventJSON, err := json.Marshal(transferBatchMultiRecipientEvent)
	if err != nil {
		return fmt.Errorf("[EmitTransferBatchMultiRecipient] failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("TransferBatchMultiRecipient", transferBatchMultiRecipientEventJSON)
	if err != nil {
		return fmt.Errorf("[EmitTransferBatchMultiRecipient] failed to set event: %v", err)
	}

	return nil
}

// BalanceOfHelper 查询账户某种类型的NFR的余额
func BalanceOfHelper(ctx contractapi.TransactionContextInterface, account, batchId string) (uint64, error) {
	// 参数校验
	if account == proto.EmptyAccount {
		return 0, fmt.Errorf("[BalanceOfHelper] balance query for the zero address")
	}

	var balance uint64 = 0

	// 拼接复合键，查询到该账户下的该类型币
	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(proto.PrefixBalance, []string{account, batchId})
	if err != nil {
		return 0, fmt.Errorf("[BalanceOfHelper] failed to get state for prefix %v: %v", proto.PrefixBalance, err)
	}
	defer balanceIterator.Close()

	// 计算出余额
	for balanceIterator.HasNext() {
		// 取出下一个
		if _, err = balanceIterator.Next(); err != nil {
			return 0, fmt.Errorf("[BalanceOfHelper] failed to get the next state for prefix %v: %v", proto.PrefixBalance, err)
		}
		// 余额加一
		balance++
	}

	return balance, nil
}

/*
	Round 小数四舍五入
*/
func Round(x float64) uint64 {
	return uint64(math.Floor(x + 0.5))
}
