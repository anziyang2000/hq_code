package main

import (
	"contract-20/contract"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
)

func main() {
	tokenChaincode, err := contractapi.NewChaincode(&contract.SmartContract{})
	if err != nil {
		log.Panicf("Error creating token-erc-20 chaincode: %v", err)
	}

	if err = tokenChaincode.Start(); err != nil {
		log.Panicf("Error starting token-erc-20 chaincode: %v", err)
	}
}
