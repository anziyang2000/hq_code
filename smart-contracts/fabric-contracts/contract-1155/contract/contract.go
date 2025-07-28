package contract

import (
	"contract-1155/proto"
	"contract-1155/utils"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
	"strconv"
	"strings"
)

type SmartContract struct {
	contractapi.Contract
}

/*
	ReadNFR 查询票的信息
*/
func (s *SmartContract) NFRRead(ctx contractapi.TransactionContextInterface, tokenID string) (*proto.NftMetadata, error) {

	return utils.ReadNFRHelper(ctx, tokenID)
}

/*
	MintNFR 增加某一种nfr
	account: 账户
	batchID: 一类NFR的唯一KEY值
	meta: NFR的信息 (base64数据)
	amount: 数量
*/
func (s *SmartContract) NFRMint(ctx contractapi.TransactionContextInterface, account, batchID, meta string, amount uint64) ([]*proto.NftMetadata, error) {
	// 参数校验
	if account == proto.EmptyAccount {
		return nil, fmt.Errorf("[MintNFR] mint to the zero address")
	}
	if amount <= 0 {
		return nil, fmt.Errorf("[MintNFR] mint amount must be a positive integer")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelMint); err != nil {
		return nil, fmt.Errorf("[MintNFR] author failed, err: %v", err)
	} else if !author {
		return nil, fmt.Errorf("[MintNFR] author level not enough")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nil, fmt.Errorf("[MintNFR] failed to get client id: %v", err)
	}

	//// 设置URI
	//if err = s.SetURI(ctx, image, batchID); err != nil {
	//	return fmt.Errorf("[MintNFR] failed to set uri: %v", err)
	//}

	nftSlice := make([]*proto.NftMetadata, 0)

	//tokenPre := strconv.Itoa(int(time.Now().Unix()))
	tokenPre := batchID
	// 发NFR
	for i := 0; i < int(amount); i++ {
		// 用tokenId前缀加上发行数量的顺序id拼接tokenId
		tokenId := tokenPre + strconv.Itoa(i)
		// value信息
		value := &proto.NftMetadata{
			TokenID: tokenId,
			Owner:   account,
			Meta:    meta,
		}

		// 发NFR
		if err = utils.MintHelper(ctx, account, batchID, tokenId, value); err != nil {
			return nftSlice, fmt.Errorf("[MintNFR] mint failed, err: %v", err)
		}
		nftSlice = append(nftSlice, value)
	}

	// 单个资产变动事件触发
	transferSingleEvent := proto.TransferSingle{
		Operator: operator,
		From:     proto.EmptyAccount,
		To:       account,
		ID:       batchID,
		Value:    amount,
	}

	transferSingleEventJSON, err := json.Marshal(transferSingleEvent)
	if err != nil {
		return nftSlice, fmt.Errorf("[MintNFR] failed to obtain JSON encoding: %v", err)
	}

	return nftSlice, ctx.GetStub().SetEvent("TransferSingle", transferSingleEventJSON)
}

/*
	MintNFRBatch 一个账户批量增加多种类型的NFR
	account: 账户
	batchIDs: NFR的唯一KEY值列表
	metas: NFR的信息列表 (base64数据)
	amounts: 数量
*/
func (s *SmartContract) NFRMintBatch(ctx contractapi.TransactionContextInterface, account string, batchIDs, metas, tokenIds []string, amounts []uint64) ([][]*proto.NftMetadata, error) {
	// 参数校验
	length := len(batchIDs)
	if length != len(amounts) || length != len(metas) {
		return nil, fmt.Errorf("[NFRMintBatch] parma must have the same length")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelMint); err != nil {
		return nil, fmt.Errorf("[NFRMintBatch] author failed, err: %v", err)
	} else if !author {
		return nil, fmt.Errorf("[NFRMintBatch] author level not enough")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nil, fmt.Errorf("[NFRMintBatch] failed to get client id: %v", err)
	}

	resp := make([][]*proto.NftMetadata, 0)
	// 将所有的票种遍历出来
	for i := 0; i < length; i++ {
		nftSlice := make([]*proto.NftMetadata, 0)
		tokenPre := tokenIds[i]
		meta := metas[i]
		// 将一个票种的全部数量遍历
		for j := 0; j < int(amounts[i]); j++ {

			// 用tokenId前缀加上发行数量的顺序id拼接tokenId
			tokenId := tokenPre + strconv.Itoa(j)
			// value信息
			value := &proto.NftMetadata{
				TokenID: tokenId,
				Owner:   account,
				Meta:    meta,
			}

			nftSlice = append(nftSlice, value)

			// 发NFT
			if err = utils.MintHelper(ctx, account, batchIDs[i], tokenId, value); err != nil {
				return resp, fmt.Errorf("[NFRMintBatch] mint failed, err: %v", err)
			}

		}

		resp = append(resp, nftSlice)

	}

	// 批量操作事件触发
	transferBatchEvent := proto.TransferBatch{
		Operator: operator,
		From:     proto.EmptyAccount,
		To:       account,
		IDs:      batchIDs,
		Values:   amounts,
	}

	transferBatchEventJSON, err := json.Marshal(transferBatchEvent)
	if err != nil {
		return resp, fmt.Errorf("[MintNFRBatch] failed to obtain JSON encoding: %v", err)
	}

	return resp, ctx.GetStub().SetEvent("TransferBatch", transferBatchEventJSON)
}

/*
	NFRMintBatchWithFee 批量创建NFR(内置扣手续费操作)
	account: 账户
	feeCollector: 手续费收取账户
	batchIDs: NFR的唯一KEY值列表
	metas: NFR的信息列表 (base64数据)
	amounts: 数量
	fee: 手续费
*/
func (s *SmartContract) NFRMintBatchWithFee(ctx contractapi.TransactionContextInterface, account, feeCollector string, batchIDs, metas, tokenIds []string, amounts []uint64) ([][]*proto.NftMetadata, error) {
	log.Printf("[NFRMintBatchWithFee] start")
	// 参数校验
	length := len(batchIDs)
	if length != len(amounts) || length != len(metas) {
		log.Printf("[NFRMintBatchWithFee] parma must have the same length")
		return nil, fmt.Errorf("[NFRMintBatchWithFee] parma must have the same length")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelMint); err != nil {
		log.Printf("[NFRMintBatchWithFee] author failed, err: %v", err)
		return nil, fmt.Errorf("[NFRMintBatchWithFee] author failed, err: %v", err)
	} else if !author {
		log.Printf("[NFRMintBatchWithFee] author level not enough")
		return nil, fmt.Errorf("[NFRMintBatchWithFee] author level not enough")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nil, fmt.Errorf("[NFRMintBatchWithFee] failed to get client id: %v", err)
	}

	// 收取手续费
	if err = utils.MintNFRPayCoinsHelper(ctx, feeCollector); err != nil {
		log.Printf("MintNFRPayCoinsHelper failed, err: %v", err)
		return nil, err
	}

	resp := make([][]*proto.NftMetadata, 0)
	// 将所有的票种遍历出来
	for i := 0; i < length; i++ {
		nftSlice := make([]*proto.NftMetadata, 0)
		// NFT 的key前缀
		tokenPre := tokenIds[i]
		meta := metas[i]
		// 将一个票种的全部数量遍历
		for j := 0; j < int(amounts[i]); j++ {

			// 用tokenId前缀加上发行数量的顺序id拼接tokenId
			tokenId := tokenPre + strconv.Itoa(j)
			// value信息
			value := &proto.NftMetadata{
				TokenID: tokenId,
				Owner:   account,
				Meta:    meta,
			}

			nftSlice = append(nftSlice, value)

			// 发NFT
			if err = utils.MintHelper(ctx, account, batchIDs[i], tokenId, value); err != nil {
				log.Printf("[NFRMintBatchWithFee] mint failed, err: %v", err)
				return resp, fmt.Errorf("[NFRMintBatchWithFee] mint failed, err: %v", err)
			}

		}

		resp = append(resp, nftSlice)

	}

	// 批量操作事件触发
	transferBatchEvent := proto.TransferBatch{
		Operator: operator,
		From:     proto.EmptyAccount,
		To:       account,
		IDs:      batchIDs,
		Values:   amounts,
	}

	transferBatchEventJSON, err := json.Marshal(transferBatchEvent)
	if err != nil {
		return resp, fmt.Errorf("[NFRMintBatchWithFee] failed to obtain JSON encoding: %v", err)
	}

	log.Printf("[NFRMintBatchWithFee] end")

	return resp, ctx.GetStub().SetEvent("TransferBatch", transferBatchEventJSON)
}

/*
	BurnNFR: 销毁
	account: 账户
	batchId: NFR号
	amount: 数量
*/
func (s *SmartContract) NFRBurn(ctx contractapi.TransactionContextInterface, account, batchId string, amount uint64) error {
	// 参数校验
	if account == proto.EmptyAccount {
		return fmt.Errorf("[BurnNFR] burn to the zero address")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelBurn); err != nil {
		return fmt.Errorf("[BurnNFR] author failed, err: %v", err)
	} else if !author {
		return fmt.Errorf("[BurnNFR] author level not enough")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[BurnNFR] failed to get client id: %v", err)
	}

	// 销毁代币
	err = utils.BurnNFRHelper(ctx, account, []string{batchId}, []uint64{amount})
	if err != nil {
		return fmt.Errorf("[BurnNFR] failed to remove balance, err: %v", err)
	}

	// 单个资产变动事件触发
	transferSingleEvent := proto.TransferSingle{
		Operator: operator,
		From:     account,
		To:       proto.EmptyAccount,
		ID:       batchId,
		Value:    amount,
	}
	return utils.EmitTransferSingle(ctx, transferSingleEvent)
}

/*
	BurnNFRBatch: 批量销毁单个账户的多个类型的NFR
	account: 账户
	batchIds: NFR号码列表
	amounts: 数量列表
*/
func (s *SmartContract) NFRBurnBatch(ctx contractapi.TransactionContextInterface, account string, batchIds []string, amounts []uint64) error {
	// 参数校验
	if account == proto.EmptyAccount {
		return fmt.Errorf("BurnNFRBatch] burn to the zero address")
	}
	if len(batchIds) != len(amounts) {
		return fmt.Errorf("[BurnNFRBatch] parma must have the same length")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelBurn); err != nil {
		return fmt.Errorf("[BurnNFRBatch] author failed, err: %v", err)
	} else if !author {
		return fmt.Errorf("[BurnNFRBatch] author level not enough")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[BurnNFRBatch] failed to get client id: %v", err)
	}

	err = utils.BurnNFRHelper(ctx, account, batchIds, amounts)
	if err != nil {
		return err
	}

	// 批量操作事件触发
	transferBatchEvent := proto.TransferBatch{
		Operator: operator,
		From:     account,
		To:       proto.EmptyAccount,
		IDs:      batchIds,
		Values:   amounts,
	}
	return utils.EmitTransferBatch(ctx, transferBatchEvent)
}

/*
	NFRTrade NFR交易
	NFRSender: NFR当前持有账户
	batchId: NFR批次类型
	amount: 数量
	totalPrice: 总价值(相对于稳定币)
*/
func (s *SmartContract) NFRTrade(ctx contractapi.TransactionContextInterface, NFRSender, feeCollector, batchId string, amount, totalPrice uint64) ([]*proto.NftMetadata, error) {
	var nftTradeList []*proto.NftMetadata
	// 接收者不能为空账户
	if NFRSender == proto.EmptyAccount {
		return nftTradeList, fmt.Errorf("[NFRTrade] transfer from the zero address")
	}

	// 获取用户客户端信息ID
	recipient, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nftTradeList, fmt.Errorf("[NFRTrade] failed to get client id: %v", err)
	}

	// 支付稳定币费用和手续费
	if err = utils.TradeNFRPayCoinsHelper(ctx, NFRSender, feeCollector, totalPrice); err != nil {
		return nftTradeList, err
	}

	// NFR交易
	nftTradeList, err = utils.TransferHelper(ctx, NFRSender, recipient, []string{batchId}, []uint64{amount})
	if err != nil {
		return nftTradeList, err
	}

	// 单个资产转移事件触发
	transferSingleEvent := proto.TransferSingle{
		Operator: recipient,
		From:     NFRSender,
		To:       recipient,
		ID:       batchId,
		Value:    amount,
	}
	return nftTradeList, utils.EmitTransferSingle(ctx, transferSingleEvent)
}

/*
	NFRTrade NFR批量交易
	NFRSender: NFR当前持有账户
	feeCollector: 收取手续费账户
	batchIds: NFR批次类型列表
	amounts: 数量列表
	totalPrice: 总价值(相对于稳定币)
*/
func (s *SmartContract) NFRTradeBatch(
	ctx contractapi.TransactionContextInterface, NFRSender, feeCollector string, batchIds []string, amounts []uint64, totalPrice uint64,
) ([]*proto.NftMetadata, error) {
	var nftTradeList []*proto.NftMetadata
	// 接收者不能为空账户
	if NFRSender == proto.EmptyAccount {
		return nftTradeList, fmt.Errorf("[NFRTrade] transfer from the zero address")
	}

	// 获取用户客户端信息ID
	recipient, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nftTradeList, fmt.Errorf("[NFRTrade] failed to get client id: %v", err)
	}

	// 支付稳定币费用和手续费
	if err = utils.TradeNFRPayCoinsHelper(ctx, NFRSender, feeCollector, totalPrice); err != nil {
		return nftTradeList, err
	}

	// NFR交易
	nftTradeList, err = utils.TransferHelper(ctx, NFRSender, recipient, batchIds, amounts)
	if err != nil {
		return nftTradeList, err
	}

	// 批量资产转移事件触发
	transferBatchEvent := proto.TransferBatch{
		Operator: recipient,
		From:     NFRSender,
		To:       recipient,
		IDs:      batchIds,
		Values:   amounts,
	}
	return nftTradeList, utils.EmitTransferBatch(ctx, transferBatchEvent)
}

/*
	TransferFrom: 转移资产
	sender: 发送账号
	recipient: 接收账号
	batchId: NFR号码
	amount: 数量
*/
func (s *SmartContract) TransferFrom(ctx contractapi.TransactionContextInterface, sender, recipient, batchId string, amount uint64) ([]*proto.NftMetadata, error) {
	var nftTradeList []*proto.NftMetadata
	// 参数校验
	if sender == recipient {
		return nftTradeList, fmt.Errorf("[TransferFrom] transfer to self")
	}
	// 接收者不能为空账户
	if recipient == proto.EmptyAccount {
		return nftTradeList, fmt.Errorf("[TransferFrom] transfer to the zero address")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nftTradeList, fmt.Errorf("[TransferFrom] failed to get client id: %v", err)
	}

	// 如果发送账号不是操作者本人，则需要检查是否已授权（否则不能操作）
	if operator != sender {
		approved, err := _isApprovedForAll(ctx, sender, operator)
		if err != nil {
			return nftTradeList, err
		}
		if !approved {
			return nftTradeList, fmt.Errorf("[TransferFrom] caller is not owner nor is approved")
		}
	}

	// 减少发送者的资产
	nftTradeList, err = utils.TransferHelper(ctx, sender, recipient, []string{batchId}, []uint64{amount})
	if err != nil {
		return nftTradeList, err
	}

	// 单个资产转移事件触发
	transferSingleEvent := proto.TransferSingle{
		Operator: operator,
		From:     sender,
		To:       recipient,
		ID:       batchId,
		Value:    amount,
	}
	return nftTradeList, utils.EmitTransferSingle(ctx, transferSingleEvent)
}

/*
	BatchTransferFrom: 批量转移资产(一个账户转给一个账户)
	sender: 发送账号
	recipient: 接收账号
	batchIds: NFR号列表
	amounts: 数量列表
*/
func (s *SmartContract) BatchTransferFrom(ctx contractapi.TransactionContextInterface, sender, recipient string, batchIds []string, amounts []uint64) ([]*proto.NftMetadata, error) {
	var nftTradeList []*proto.NftMetadata
	// 不能转移给自己
	if sender == recipient {
		return nftTradeList, fmt.Errorf("[BatchTransferFrom] transfer to self")
	}
	// 接收者不能为空账户
	if recipient == proto.EmptyAccount {
		return nftTradeList, fmt.Errorf("[BatchTransferFrom] transfer to the zero address")
	}
	// 参数校验
	length := len(batchIds)
	if length != len(amounts) {
		return nftTradeList, fmt.Errorf("[BatchTransferFrom] ids and amounts must have the same length")
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nftTradeList, fmt.Errorf("[BatchTransferFrom] failed to get client id: %v", err)
	}

	// 如果发送账号不是操作者本人，则需要检查是否已授权（否则不能操作）
	if operator != sender {
		approved, err := _isApprovedForAll(ctx, sender, operator)
		if err != nil {
			return nftTradeList, err
		}
		if !approved {
			return nftTradeList, fmt.Errorf("[BatchTransferFrom] caller is not owner nor is approved")
		}
	}

	// 减少发送者的资产
	nftTradeList, err = utils.TransferHelper(ctx, sender, recipient, batchIds, amounts)
	if err != nil {
		return nftTradeList, fmt.Errorf("[BatchTransferFrom] failed to transfer balance, err: %v", err)
	}

	// 批量操作资产事件触发
	transferBatchEvent := proto.TransferBatch{
		Operator: operator,
		From:     sender,
		To:       recipient,
		IDs:      batchIds,
		Values:   amounts,
	}
	return nftTradeList, utils.EmitTransferBatch(ctx, transferBatchEvent)
}

/*
	BatchTransferFromMultiRecipient: 批量转移资产(一个账户转给多个账户)
	sender: 发送账号
	recipient: 接收账号列表
	batchIds: NFR号列表
	amounts: 数量列表
*/
func (s *SmartContract) BatchTransferFromMultiRecipient(ctx contractapi.TransactionContextInterface, sender string, recipients, batchIds []string, amounts []uint64) ([]*proto.NftMetadata, error) {
	var nftTradeList []*proto.NftMetadata
	// 参数校验
	if len(recipients) != len(batchIds) || len(recipients) != len(amounts) {
		return nftTradeList, fmt.Errorf("[BatchTransferFromMultiRecipient] ids and amounts must have the same length")
	}
	// 不能转移给自己
	for _, recipient := range recipients {
		if sender == recipient {
			return nftTradeList, fmt.Errorf("[BatchTransferFromMultiRecipient] transfer to self")
		}
	}

	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return nftTradeList, fmt.Errorf("[BatchTransferFromMultiRecipient] failed to get client id: %v", err)
	}

	// 如果发送账号不是操作者本人，则需要检查是否已授权（否则不能操作）
	if operator != sender {
		approved, err := _isApprovedForAll(ctx, sender, operator)
		if err != nil {
			return nftTradeList, err
		}
		if !approved {
			return nftTradeList, fmt.Errorf("[BatchTransferFromMultiRecipient] caller is not owner nor is approved")
		}
	}

	// 遍历接收者账户, 将对应的财产转移到其账户下
	for i, recipient := range recipients {
		nftTradeListRecv, err := utils.TransferHelper(ctx, sender, recipient, []string{batchIds[i]}, []uint64{amounts[i]})
		if err != nil {
			return nftTradeList, fmt.Errorf("[BatchTransferFromMultiRecipient] transfer failed, err: %v", err)
		}
		nftTradeList = append(nftTradeList, nftTradeListRecv...)
	}

	// 转账批量接收者事件触发
	transferBatchMultiRecipientEvent := proto.TransferBatchMultiRecipient{
		Operator: operator,
		From:     sender,
		To:       recipients,
		IDs:      batchIds,
		Values:   amounts,
	}
	return nftTradeList, utils.EmitTransferBatchMultiRecipient(ctx, transferBatchMultiRecipientEvent)
}

/*
	SetApprovalForAll: 授权转移资产
	account: 需要被授权的账户
	approved: 是否允许
*/
func (s *SmartContract) SetApprovalForAll(ctx contractapi.TransactionContextInterface, account string, approved bool) error {
	// 获取用户客户端信息ID
	operator, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to get client id: %v", err)
	}
	// 自己不能授权给自己
	if operator == account {
		return fmt.Errorf("[SetApprovalForAll] setting approval status for self")
	}

	// 授权事件触发
	approvalForAllEvent := proto.ApprovalForAll{
		Owner:    operator,
		Operator: account,
		Approved: approved,
	}
	approvalForAllEventJSON, err := json.Marshal(approvalForAllEvent)
	if err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to obtain JSON encoding: %v", err)
	}
	if err = ctx.GetStub().SetEvent("ApprovalForAll", approvalForAllEventJSON); err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to set event: %v", err)
	}

	approvalKey, err := ctx.GetStub().CreateCompositeKey(proto.ApprovalPrefix, []string{operator, account})
	if err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to create the composite key for prefix %s: %v", proto.ApprovalPrefix, err)
	}

	approvalJSON, err := json.Marshal(approved)
	if err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to encode approval JSON of operator %s for account %s: %v", account, operator, err)
	}

	if err = ctx.GetStub().PutState(approvalKey, approvalJSON); err != nil {
		return fmt.Errorf("[SetApprovalForAll] failed to put state: %v", err)
	}

	return nil
}

/*
	BalanceOf: 查询账户对应类型币的余额
*/
func (s *SmartContract) BalanceOf(ctx contractapi.TransactionContextInterface, account, batchId string) (uint64, error) {

	return utils.BalanceOfHelper(ctx, account, batchId)
}

/*
	BalanceOfBatch: 批量查询账户和对应的类型的币的余额
*/
func (s *SmartContract) BalanceOfBatch(ctx contractapi.TransactionContextInterface, accounts, batchIds []string) ([]uint64, error) {
	// 参数校验
	if len(accounts) != len(batchIds) {
		return nil, fmt.Errorf("[BalanceOfBatch] accounts and ids must have the same length")
	}

	balances := make([]uint64, len(accounts))

	for i := 0; i < len(accounts); i++ {
		var err error
		balances[i], err = utils.BalanceOfHelper(ctx, accounts[i], batchIds[i])
		if err != nil {
			return nil, fmt.Errorf("[BalanceOfBatch] BalanceOfHelper failed, err: %v", err)
		}
	}

	return balances, nil
}

/*
	ClientAccountBalance: 查询当前账户某一类型币的余额
*/
func (s *SmartContract) ClientAccountBalance(ctx contractapi.TransactionContextInterface, batchId string) (uint64, error) {

	// 获取用户客户端信息ID
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("[ClientAccountBalance] failed to get client id: %v", err)
	}

	return utils.BalanceOfHelper(ctx, clientID, batchId)
}

/*
	ClientAccountID: 查询当前账户ID
*/
func (s *SmartContract) ClientAccountID(ctx contractapi.TransactionContextInterface) (string, error) {

	// 获取用户客户端信息ID
	clientAccountID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("[ClientAccountID] failed to get client id: %v", err)
	}

	return clientAccountID, nil
}

/*
	URI: 查询URI
*/
func (s *SmartContract) URI(ctx contractapi.TransactionContextInterface, batchId string) (string, error) {

	uriBytes, err := ctx.GetStub().GetState(fmt.Sprintf(proto.UriKey, batchId))
	if err != nil {
		return "", fmt.Errorf("[URI] failed to get uri: %v", err)
	}

	if uriBytes == nil {
		return "", fmt.Errorf("[URI] no uri is set: %v", err)
	}

	return string(uriBytes), nil
}

/*
	SetURI: 设置URI的值
*/
func (s *SmartContract) SetURI(ctx contractapi.TransactionContextInterface, uri, batchId string) error {
	// 验证权限
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevelMint); err != nil {
		return fmt.Errorf("[SetURI] author failed, err: %v", err)
	} else if !author {
		return fmt.Errorf("[SetURI] author level not enough")
	}

	if !strings.Contains(uri, "{id}") {
		return fmt.Errorf("[SetURI] failed to set uri, uri should contain '{id}'")
	}

	if err := ctx.GetStub().PutState(fmt.Sprintf(proto.UriKey, batchId), []byte(uri)); err != nil {
		return fmt.Errorf("[SetURI] failed to set uri: %v", err)
	}

	return nil
}

/*
	_isApprovedForAll: 确认是否已经授权
*/
func _isApprovedForAll(ctx contractapi.TransactionContextInterface, account string, operator string) (bool, error) {
	// 拼接是否已授权的组合键
	approvalKey, err := ctx.GetStub().CreateCompositeKey(proto.ApprovalPrefix, []string{account, operator})
	if err != nil {
		return false, fmt.Errorf("failed to create the composite key for prefix %s: %v", proto.ApprovalPrefix, err)
	}

	approvalBytes, err := ctx.GetStub().GetState(approvalKey)
	if err != nil {
		return false, fmt.Errorf("failed to read approval of operator %s for account %s from world state: %v", operator, account, err)
	}

	if approvalBytes == nil {
		return false, nil
	}

	var approved bool
	err = json.Unmarshal(approvalBytes, &approved)
	if err != nil {
		return false, fmt.Errorf("failed to decode approval JSON of operator %s for account %s: %v", operator, account, err)
	}

	return approved, nil
}
