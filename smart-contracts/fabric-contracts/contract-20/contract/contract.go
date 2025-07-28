package contract

import (
	"contract-20/proto"
	"contract-20/utils"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
	"strconv"
)

type SmartContract struct {
	contractapi.Contract
}

// Name 币名
func (s *SmartContract) Name(ctx contractapi.TransactionContextInterface) (string, error) {
	return proto.CoinName, nil
}

// Symbol 币的代号
func (s *SmartContract) Symbol(ctx contractapi.TransactionContextInterface) (string, error) {
	return proto.CoinSymbol, nil
}

// Decimals 使用的小数位数
func (s *SmartContract) Decimals(ctx contractapi.TransactionContextInterface) (uint8, error) {
	return proto.CoinDecimals, nil
}

// Mint 创建新的币并发放到账户中
func (s *SmartContract) Mint(ctx contractapi.TransactionContextInterface, amount int) error {
	// 参数校验
	if amount <= 0 {
		return fmt.Errorf("[Mint] mint amount must be a positive integer")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevel); err != nil {
		return fmt.Errorf("[Mint] author failed, err: %v", err)
	} else if !author {
		return fmt.Errorf("[Mint] author level not enough")
	}

	// 获取用户客户端身份ID
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[Mint] failed to get client id: %v", err)
	}

	// 获取该账户信息
	currentBalanceBytes, err := ctx.GetStub().GetState(minter)
	if err != nil {
		return fmt.Errorf("[Mint] failed to read minter account %s from world state: %v", minter, err)
	}

	var currentBalance int

	// 如果该账户信息目前还不存在，则创建一个并将余额设置为零
	if currentBalanceBytes == nil {
		currentBalance = 0
	} else {
		// 存在则先将余额转为int类型
		currentBalance, _ = strconv.Atoi(string(currentBalanceBytes))
	}

	// 计算出新的余额
	updatedBalance := currentBalance + amount

	// 将新的余额更新到账户信息中
	if err = ctx.GetStub().PutState(minter, []byte(strconv.Itoa(updatedBalance))); err != nil {
		return fmt.Errorf("[Mint] failed to put state: %v", err)
	}

	// 获取目前币的数量
	totalSupplyBytes, err := ctx.GetStub().GetState(proto.TotalSupplyKey)
	if err != nil {
		return fmt.Errorf("[Mint] failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	// 如果总数量目前不存在，则初始化总数量
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		// 存在则先将总量转为int类型
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}

	totalSupply += amount

	// 更新总数量
	if err = ctx.GetStub().PutState(proto.TotalSupplyKey, []byte(strconv.Itoa(totalSupply))); err != nil {
		return err
	}

	// 事件触发
	transferEvent := proto.Event{
		From:   proto.EmptyAccount,
		To:     minter,
		Amount: amount,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("[Mint] failed to obtain JSON encoding: %v", err)
	}

	if err = ctx.GetStub().SetEvent("Transfer", transferEventJSON); err != nil {
		return fmt.Errorf("[Mint] failed to set event: %v", err)
	}

	log.Printf("[Mint] minter account (%s) balance updated from %d to %d", minter, currentBalance, updatedBalance)

	return nil
}

// Burn 销毁账户中的代币
func (s *SmartContract) Burn(ctx contractapi.TransactionContextInterface, amount int) error {
	// 校验参数
	if amount <= 0 {
		return fmt.Errorf("[Burn] burn amount must be a positive integer")
	}

	// 权限验证
	if author, err := utils.AuthorizationHelper(ctx, proto.OperateAuthNeedLevel); err != nil {
		return fmt.Errorf("[Burn] author failed, err: %v", err)
	} else if !author {
		return fmt.Errorf("[Burn] author level not enough")
	}

	// 获取用户客户端身份ID
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[Burn] failed to get client id: %v", err)
	}

	// 获取该用户的账户信息
	currentBalanceBytes, err := ctx.GetStub().GetState(minter)
	if err != nil {
		return fmt.Errorf("[Burn] failed to read minter account %s from world state: %v", minter, err)
	}

	var currentBalance int

	// 账户信息不存在则无法销毁
	if currentBalanceBytes == nil {
		return fmt.Errorf("[Burn] the balance does not exist")
	}

	currentBalance, _ = strconv.Atoi(string(currentBalanceBytes))

	// 计算出销毁后的余额
	updatedBalance := currentBalance - amount

	// 更新账户余额
	if err = ctx.GetStub().PutState(minter, []byte(strconv.Itoa(updatedBalance))); err != nil {
		return fmt.Errorf("[Burn] put state update balance failed, err: %v", err)
	}

	// 获取代币总量
	totalSupplyBytes, err := ctx.GetStub().GetState(proto.TotalSupplyKey)
	if err != nil {
		return fmt.Errorf("[Burn] failed to retrieve total token supply: %v", err)
	}
	// 如果代币总量信息不存在，则直接返回错误信息
	if totalSupplyBytes == nil {
		return fmt.Errorf("[Burn] totalSupply does not exist")
	}
	// 计算出新的代币总量
	totalSupply, _ := strconv.Atoi(string(totalSupplyBytes))
	totalSupply -= amount
	// 更新代币总量
	if err = ctx.GetStub().PutState(proto.TotalSupplyKey, []byte(strconv.Itoa(totalSupply))); err != nil {
		return fmt.Errorf("[Burn] update total supply failed, err: %v", err)
	}

	// 事件触发
	transferEvent := proto.Event{
		From:   minter,
		To:     proto.EmptyAccount,
		Amount: amount,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("[Burn] failed to obtain JSON encoding: %v", err)
	}

	err = ctx.GetStub().SetEvent("Transfer", transferEventJSON)
	if err != nil {
		return fmt.Errorf("[Burn] failed to set event: %v", err)
	}

	log.Printf("[Burn] minter account %s balance updated from %d to %d", minter, currentBalance, updatedBalance)

	return nil
}

// Transfer 从客户端账户转移资产到另一个账户
func (s *SmartContract) Transfer(ctx contractapi.TransactionContextInterface, recipient string, amount int) error {

	// 获取用户客户端信息ID
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[Transfer] failed to get client id: %v", err)
	}

	// 资产转移
	err = utils.TransferHelper(ctx, clientID, []string{recipient}, []int{amount})
	if err != nil {
		return fmt.Errorf("[Transfer] failed to transfer: %v", err)
	}

	// 事件触发
	transferEvent := proto.Event{
		From:   clientID,
		To:     recipient,
		Amount: amount,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("[Transfer] failed to obtain JSON encoding: %v", err)
	}

	if err = ctx.GetStub().SetEvent("Transfer", transferEventJSON); err != nil {
		return fmt.Errorf("[Transfer] failed to set event: %v", err)
	}

	return nil
}

// TransferFrom 从一个账户转移已授权的资产到另一个账户
func (s *SmartContract) TransferFrom(ctx contractapi.TransactionContextInterface, from string, to string, amount int) error {

	// 获取操作的用户客户端信息ID
	spender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[TransferFrom] failed to get client id: %v", err)
	}

	// 拼接授权的key
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(proto.AllowancePrefix, []string{from, spender})
	if err != nil {
		return fmt.Errorf("[TransferFrom] failed to create the composite key for prefix (%s): %v", proto.AllowancePrefix, err)
	}

	// 获取授权额度信息
	currentAllowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return fmt.Errorf("[TransferFrom] failed to retrieve the allowance for (%s) from world state: %v", allowanceKey, err)
	}

	var currentAllowance int
	currentAllowance, _ = strconv.Atoi(string(currentAllowanceBytes))

	// 授权额度不足
	if currentAllowance < amount {
		return fmt.Errorf("[TransferFrom] spender does not have enough allowance for transfer")
	}

	// 转移资产
	err = utils.TransferHelper(ctx, from, []string{to}, []int{amount})
	if err != nil {
		return fmt.Errorf("[TransferFrom] failed to transfer, err: %v", err)
	}

	// 更新授权额度信息
	updatedAllowance := currentAllowance - amount
	if err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(updatedAllowance))); err != nil {
		return fmt.Errorf("[TransferFrom] failed to update allowance, err: %v", err)
	}

	// 事件触发
	transferEvent := proto.Event{
		From:   from,
		To:     to,
		Amount: amount,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("[TransferFrom] failed to obtain JSON encoding: %v", err)
	}

	if err = ctx.GetStub().SetEvent("Transfer", transferEventJSON); err != nil {
		return fmt.Errorf("[TransferFrom] failed to set event: %v", err)
	}

	log.Printf("[TransferFrom] spender (%s) allowance updated from %d to %d", spender, currentAllowance, updatedAllowance)

	return nil
}

// TransferBatch 从客户端账户批量转移资产到其他账户
func (s *SmartContract) TransferBatch(ctx contractapi.TransactionContextInterface, recipients []string, amounts []int) error {

	// 获取用户客户端信息ID
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[TransferBatch] failed to get client id: %v", err)
	}

	// 资产转移
	err = utils.TransferHelper(ctx, clientID, recipients, amounts)
	if err != nil {
		return fmt.Errorf("[TransferBatch] failed to transfer: %v", err)
	}

	// 事件触发
	transferEvent := proto.EventBatch{
		From:    clientID,
		Tos:     recipients,
		Amounts: amounts,
	}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("[TransferBatch] failed to obtain JSON encoding: %v", err)
	}

	if err = ctx.GetStub().SetEvent("TransferBatch", transferEventJSON); err != nil {
		return fmt.Errorf("[TransferBatch] failed to set event: %v", err)
	}

	return nil
}

// ClientAccountBalance 查询客户端账户的余额
func (s *SmartContract) ClientAccountBalance(ctx contractapi.TransactionContextInterface) (int, error) {

	// 获取客户端用户信息的ID
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("[ClientAccountBalance] failed to get client id: %v", err)
	}

	// 根据客户端ID查询用户余额信息
	balanceBytes, err := ctx.GetStub().GetState(clientID)
	if err != nil {
		return 0, fmt.Errorf("[ClientAccountBalance] failed to read from world state: %v", err)
	}
	if balanceBytes == nil {
		// 没有余额信息
		return 0, nil
	}

	balance, _ := strconv.Atoi(string(balanceBytes))

	return balance, nil
}

// BalanceOf 查询指定账户的余额
func (s *SmartContract) BalanceOf(ctx contractapi.TransactionContextInterface, account string) (int, error) {
	// 根据账户查询余额信息
	balanceBytes, err := ctx.GetStub().GetState(account)
	if err != nil {
		return 0, fmt.Errorf("failed to read from world state: %v", err)
	}
	if balanceBytes == nil {
		return 0, fmt.Errorf("the account (%s) does not exist", account)
	}

	balance, _ := strconv.Atoi(string(balanceBytes))

	return balance, nil
}

// TotalSupply 查询已经发行的代币总量
func (s *SmartContract) TotalSupply(ctx contractapi.TransactionContextInterface) (int, error) {
	// 根据代币总量的key查询
	totalSupplyBytes, err := ctx.GetStub().GetState(proto.TotalSupplyKey)
	if err != nil {
		return 0, fmt.Errorf("[TotalSupply] failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	// 若还没有发行过，则返回零值
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes))
	}

	log.Printf("[TotalSupply] TotalSupply: (%d) tokens", totalSupply)

	return totalSupply, nil
}

// Approve 授权账户可以从客户端账户转移的资产
func (s *SmartContract) Approve(ctx contractapi.TransactionContextInterface, spender string, value int) error {

	// Get ID of submitting client identity
	owner, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("[Approve] failed to get client id: %v", err)
	}

	// 拼接授权的key
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(proto.AllowancePrefix, []string{owner, spender})
	if err != nil {
		return fmt.Errorf("[Approve] failed to create the composite key for prefix %s: %v", proto.AllowancePrefix, err)
	}

	// 更新授权和对应的额度
	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(value)))
	if err != nil {
		return fmt.Errorf("[Approve] failed to update state of smart contract for key %s: %v", allowanceKey, err)
	}

	// 事件触发
	approvalEvent := proto.Event{
		From:   owner,
		To:     spender,
		Amount: value,
	}
	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("[Approve] failed to obtain JSON encoding: %v", err)
	}

	if err = ctx.GetStub().SetEvent("Approval", approvalEventJSON); err != nil {
		return fmt.Errorf("[Approve] failed to set event: %v", err)
	}

	log.Printf("[Approve] client (%s) approved a withdrawal allowance of (%d) for spender (%s)", owner, value, spender)

	return nil
}

// Allowance 查询owner授权给spender的额度
func (s *SmartContract) Allowance(ctx contractapi.TransactionContextInterface, owner string, spender string) (int, error) {

	// 拼接授权的key
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(proto.AllowancePrefix, []string{owner, spender})
	if err != nil {
		return 0, fmt.Errorf("[Allowance] failed to create the composite key for prefix %s: %v", proto.AllowancePrefix, err)
	}

	// 根据授权的key查询到对应的额度
	allowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return 0, fmt.Errorf("[Allowance] failed to read allowance for (%s) from world state: %v", allowanceKey, err)
	}

	var allowance int

	// 如果没有授权，则返回零值
	if allowanceBytes == nil {
		allowance = 0
	} else {
		allowance, err = strconv.Atoi(string(allowanceBytes))
	}

	log.Printf("[Allowance] The allowance left for spender (%s) to withdraw from owner (%s): %d", spender, owner, allowance)

	return allowance, nil
}
