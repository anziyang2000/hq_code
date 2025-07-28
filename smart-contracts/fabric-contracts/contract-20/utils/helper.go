package utils

import (
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
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
	TransferHelper: 从一个账户向另一个账户转移资产
	from: 发送者账户
	to: 接收者账户
	amount: 数量
*/
func TransferHelper(ctx contractapi.TransactionContextInterface, from string, tos []string, amounts []int) error {
	// 参数校验
	var totalAmount = 0
	for i := 0; i < len(tos); i++ {
		if from == tos[i] {
			return fmt.Errorf("[TransferHelper] cannot transfer to and from same client account")
		}
		if amounts[i] < 0 {
			return fmt.Errorf("[TransferHelper] transfer amount cannot be negative")
		}
		totalAmount += amounts[i]
	}

	// 获取发送方账户信息
	fromCurrentBalanceBytes, err := ctx.GetStub().GetState(from)
	if err != nil {
		return fmt.Errorf("[TransferHelper] failed to read sender account (%s) from world state, err: %v", from, err)
	}
	// 发送方账户不能为空
	if fromCurrentBalanceBytes == nil {
		return fmt.Errorf("[TransferHelper] client account (%s) has no balance", from)
	}
	// 发送方余额转为int类型
	fromCurrentBalance, _ := strconv.Atoi(string(fromCurrentBalanceBytes))
	// 发送方余额不足
	if fromCurrentBalance < totalAmount {
		return fmt.Errorf("[TransferHelper] client account (%s) have balance(%d), need balance(%d), balance not enough", from, fromCurrentBalance, totalAmount)
	}

	// 发送方转账后余额
	fromUpdatedBalance := fromCurrentBalance - totalAmount
	// 更新发送方的账户信息
	if err = ctx.GetStub().PutState(from, []byte(strconv.Itoa(fromUpdatedBalance))); err != nil {
		return err
	}
	log.Printf("[TransferHelper] sender (%s) balance updated from %d to %d", from, fromCurrentBalance, fromUpdatedBalance)

	// 循环给接收人加资产
	for i := 0; i < len(tos); i++ {
		// 获取接收方账户信息
		toCurrentBalanceBytes, err := ctx.GetStub().GetState(tos[i])
		if err != nil {
			return fmt.Errorf("[TransferHelper] failed to read recipient account (%s) from world state, err: %v", tos[i], err)
		}

		var toCurrentBalance int
		if toCurrentBalanceBytes == nil {
			// 接收方账户余额信息不存在，初始化账户余额为零
			toCurrentBalance = 0
		} else {
			// 余额信息存在，转为int类型
			toCurrentBalance, _ = strconv.Atoi(string(toCurrentBalanceBytes))
		}

		// 转移资产后接收方的余额
		toUpdatedBalance := toCurrentBalance + amounts[i]
		// 更新接收方的账户信息
		if err = ctx.GetStub().PutState(tos[i], []byte(strconv.Itoa(toUpdatedBalance))); err != nil {
			return err
		}
		log.Printf("[TransferHelper] recipient (%s) balance updated from %d to %d", tos[i], toCurrentBalance, toUpdatedBalance)
	}

	return nil
}
