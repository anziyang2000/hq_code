package main

import (
	"contract-1155/contract"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {

	chaincode, err := contractapi.NewChaincode(new(contract.SmartContract))

	if err != nil {
		fmt.Printf("Error create ticket chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting ticket chaincode: %s", err.Error())
	}
}
