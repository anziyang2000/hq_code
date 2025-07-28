package main

import (
	"contract-721-digital/chaincode/contract"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {

	chaincode, err := contractapi.NewChaincode(&contract.DigitalUgcContact{})

	if err != nil {
		fmt.Printf("Error create digital-ugc-nft chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting digital-ugc-nft chaincode: %s", err.Error())
	}
}
