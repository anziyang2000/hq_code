package contract

import (
	"contract-721-digital/chaincode/config"
	"contract-721-digital/chaincode/utils"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

/*
	Define data struct
*/

type DigitalUgcBaseData struct {
	TokenId  string
	Owner    string
	TokenURI string
	Approved string
}

type DigitalUgcApprovalData struct {
	Owner    string
	Operator string
	Approved string
}

type DigitalUgcApprovalAllData struct {
	Owner    string
	Operator string
	Approved bool
}

/*
	Define event struct
*/
type EventTransfer struct {
	From    string
	To      string
	TokenId string
}

type EventApproval struct {
	Owner    string
	Operator string
	Approved string
	TokenId  string
}

type EventApprovalAll struct {
	Owner    string
	Operator string
	Approved bool
	TokenId  string
}

/*
	Define object struct
*/
type DigitalUgcContact struct {
	contractapi.Contract
}

// BalanceOf
// @title       BalanceOf
// @description "BalanceOf counts all non-fungible tokens assigned to an owner"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       owner     string                       "An owner for whom to query the balance"
// @return      balance   int                          "The number of non-fungible tokens owned by the owner, possibly zero"
func (ugc *DigitalUgcContact) BalanceOf(ctx contractapi.TransactionContextInterface, owner string) (int, error) {
	// There is a key record for every non-fungible token in the format of balancePrefix.owner.tokenId.
	// BalanceOf() queries for and counts all records matching balancePrefix.owner.*
	balanceIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(config.BalancePrefix, []string{owner})
	if err != nil {
		return 0, fmt.Errorf("[BalanceOf] GetStateByPartialCompositeKey[ balanceIterator: %v%s ] error, throw-err: %v", config.BalancePrefix, owner, err)
	}

	// Count the number of returned composite keys
	balance := 0
	for balanceIterator.HasNext() {
		if _, err = balanceIterator.Next(); err != nil {
			return 0, fmt.Errorf("[BalanceOf] Failed to get the next state for prefix[ %v ], throw-err: %v", config.BalancePrefix, err)
		}
		balance++
	}
	defer balanceIterator.Close()

	return balance, nil
}

// OwnerOf
// @title       OwnerOf
// @description "OwnerOf finds the owner of a non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string                       "The identifier for a non-fungible token"
// @return      owner     string                       "Return the owner of the non-fungible token"
func (ugc *DigitalUgcContact) OwnerOf(ctx contractapi.TransactionContextInterface, tokenId string) (string, error) {
	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return "", fmt.Errorf("[OwnerOf] _readNFT tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}
	if nft.Owner == "" {
		return "", fmt.Errorf("[OwnerOf] No owner is assigned to this tokenId[ %v ]", tokenId)
	}

	return nft.Owner, nil
}

// TransferFrom
// @title       TransferFrom
// @description "TransferFrom transfers the ownership of a non-fungible token from one owner to another owner"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       from      string                       "The current owner of the non-fungible token"
// @param       to        string                       "The new owner"
// @param       tokenId   string                       "the non-fungible token to transfer"
// @return                bool                         "Return whether the transfer was successful or not"
func (ugc *DigitalUgcContact) TransferFrom(ctx contractapi.TransactionContextInterface, from string, to string, tokenId string) (bool, error) {

	// 检查from
	if content := utils.StringStrip(from); content == "" {
		return false, fmt.Errorf("[TransferFrom] from was empty")
	}

	// 检查to
	if content := utils.StringStrip(to); content == "" {
		return false, fmt.Errorf("[TransferFrom] to was empty")
	}

	// 检查tokenId
	if tokenId = utils.StringStrip(tokenId); tokenId == "" {
		return false, fmt.Errorf("[TransferFrom] tokenId was empty")
	}

	// 转账
	_, err := ugc._transform(ctx, from, to, tokenId)
	if err != nil {
		return false, fmt.Errorf("[TransferFrom] _transform error, throw-err: %v", err)
	}

	return true, nil
}

// TransferFromBatch
// @title       TransferFromBatch
// @description "TransferFrom transfers the ownership of a non-fungible token from one owner to another owner"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       from      string                       "The current owner of the non-fungible token"
// @param       to        string                       "The new owner"
// @param       tokenId   string                       "the non-fungible token to transfer"
// @return                bool                         "Return whether the transfer was successful or not"
func (ugc *DigitalUgcContact) TransferFromBatch(ctx contractapi.TransactionContextInterface, from string, to string, tokenIds []string) (bool, error) {

	// 检查from
	if content := utils.StringStrip(from); content == "" {
		return false, fmt.Errorf("[TransferFromBatch] from was empty")
	}

	// 检查to
	if content := utils.StringStrip(to); content == "" {
		return false, fmt.Errorf("[TransferFromBatch] to was empty")
	}

	// 检查tokenIds
	if len(tokenIds) == 0 {
		return false, fmt.Errorf("[TransferFromBatch] tokenIds list was empty")
	}

	// 检查tokenId
	for _, tokenId := range tokenIds {
		if tokenId = utils.StringStrip(tokenId); tokenId == "" {
			return false, fmt.Errorf("[TransferFromBatch] tokenIds list found empty tokenId")
		}
	}

	// 转账
	for _, tokenId := range tokenIds {
		_, err := ugc._transform(ctx, from, to, tokenId)
		if err != nil {
			return false, fmt.Errorf("[TransferFromBatch] _transform error, throw-err: %v", err)
		}
	}

	return true, nil
}

// Approve
// @title       Approve
// @description "Approve changes or reaffirms the approved client for a non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       approved  string                       "The new approved client"
// @param       tokenId   string                       "the non-fungible token to approve"
// @return                bool                         "Return whether the approval was successful or not"
func (ugc *DigitalUgcContact) Approve(ctx contractapi.TransactionContextInterface, approved string, tokenId string) (bool, error) {
	sender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return false, fmt.Errorf("[Approve] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return false, fmt.Errorf("[Approve] _readNFT tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}

	// Check if the sender is the current owner of the non-fungible token
	// or an authorized operator of the current owner
	owner := nft.Owner
	operatorApproval, err := ugc.IsApprovedForAll(ctx, owner, sender)
	if err != nil {
		return false, fmt.Errorf("[Approve] IsApprovedForAll[ owner:%v, sender:%v ] error, throw-err: %v", owner, sender, err)
	}
	if owner != sender && !operatorApproval {
		return false, fmt.Errorf("[Approve] The sender is not the current owner nor an authorized operator")
	}

	// Update the approved client of the non-fungible token
	nft.Approved = approved
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("[Approve] CreateCompositeKey[ nftKey: %v%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}
	nftBytes, err := json.Marshal(nft)
	if err != nil {
		return false, fmt.Errorf("[Approve] Json Marshal[ nftBytes:%v ] error, throw-err: %v", nft, err)
	}
	err = ctx.GetStub().PutState(nftKey, nftBytes)
	if err != nil {
		return false, fmt.Errorf("[Approve] PutState[ nftKey, nftBytes ] error, throw-err: %v", err)
	}

	// Emit the Approval event
	newEventApproval := EventApproval{
		Owner:    owner,
		Approved: approved,
		TokenId:  tokenId,
	}
	newEventApprovalBytes, err := json.Marshal(newEventApproval)
	if err != nil {
		return false, fmt.Errorf("[Approve] Json Marshal[ newEventApprovalBytes ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval", newEventApprovalBytes)
	if err != nil {
		return false, fmt.Errorf("[Approve] SetEvent[ newEventApprovalBytes ] error, throw-err: %v", err)
	}

	return true, nil
}

// SetApprovalForAll
// @title       SetApprovalForAll
// @description "SetApprovalForAll enables or disables approval for a third party ("operator") to manage, all message sender's assets"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       operator  string                       "A client to add to the set of authorized operators"
// @param       approved  bool                         "True if the operator is approved, false to revoke approval"
// @return                bool                         "Return whether the approval was successful or not"
func (ugc *DigitalUgcContact) SetApprovalForAll(ctx contractapi.TransactionContextInterface, operator string, approved bool) (bool, error) {
	sender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	newApprovalAll := DigitalUgcApprovalAllData{
		Owner:    sender,
		Operator: operator,
		Approved: approved,
	}
	approvalAllKey, err := ctx.GetStub().CreateCompositeKey(config.ApprovalPrefix, []string{sender, operator})
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] CreateCompositeKey[ approvalAllKey: %v%s%s ] error, throw-err: %v", config.ApprovalPrefix, sender, operator, err)
	}
	approvalAllBytes, err := json.Marshal(newApprovalAll)
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] Json Marshal[ approvalAllBytes ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().PutState(approvalAllKey, approvalAllBytes)
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] PutState[ approvalAllKey, approvalAllBytes ] error, throw-err: %v", err)
	}

	// Emit the ApprovalForAll event
	approvalForAllEvent := EventApprovalAll{
		Owner:    sender,
		Operator: operator,
		Approved: approved,
	}
	approvalForAllEventBytes, err := json.Marshal(approvalForAllEvent)
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] Json Marshal[ approvalForAllEvent ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().SetEvent("ApprovalForAll", approvalForAllEventBytes)
	if err != nil {
		return false, fmt.Errorf("[SetApprovalForAll] SetEvent[ approvalForAllEventBytes ] error, throw-err: %v", err)
	}

	return true, nil
}

// GetApproved
// @title       GetApproved
// @description "GetApproved returns the approved client for a single non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string                       "the non-fungible token to find the approved client for"
// @return                string                       "Return the approved client for this non-fungible token, or null if there is none"
func (ugc *DigitalUgcContact) GetApproved(ctx contractapi.TransactionContextInterface, tokenId string) (string, error) {
	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return "", fmt.Errorf("[GetApproved] _readNFT tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}
	return nft.Approved, nil
}

// IsApprovedForAll
// @title       IsApprovedForAll
// @description "IsApprovedForAll returns if a client is an authorized operator for another client"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       owner     string                       "The client that owns the non-fungible tokens"
// @param       operator  string                       "The client that acts on behalf of the owner"
// @return                string                       "Return true if the operator is an approved operator for the owner, false otherwise"
func (ugc *DigitalUgcContact) IsApprovedForAll(ctx contractapi.TransactionContextInterface, owner string, operator string) (bool, error) {
	approvalAllKey, err := ctx.GetStub().CreateCompositeKey(config.ApprovalPrefix, []string{owner, operator})
	if err != nil {
		return false, fmt.Errorf("[IsApprovedForAll] CreateCompositeKey[ approvalAllKey: %v%s%s ] error, throw-err: %v", config.ApprovalPrefix, owner, operator, err)
	}
	approvalAllBytes, err := ctx.GetStub().GetState(approvalAllKey)
	if err != nil {
		return false, fmt.Errorf("[IsApprovedForAll] GetState[ approvalAllKey: %s ] error, throw-err: %v", approvalAllKey, err)
	}

	approved := false
	if len(approvalAllBytes) > 0 {
		approval := new(DigitalUgcApprovalAllData)
		err := json.Unmarshal(approvalAllBytes, &approval)
		if err != nil {
			return false, fmt.Errorf("[IsApprovedForAll] Json Unmarshal[ approvalAllBytes ] error, throw-err: %v", err)
		}
		approved = approval.Approved
	}

	return approved, nil
}

// ============== ERC721 metadata extension ===============

// Name
// @title       Name
// @description "Name returns a descriptive name for a collection of non-fungible tokens in this contract"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @return                string                       "Returns the name of the token"
func (ugc *DigitalUgcContact) Name(ctx contractapi.TransactionContextInterface) (string, error) {
	nameAsBytes, err := ctx.GetStub().GetState(config.NameKey)
	if err != nil {
		return "", fmt.Errorf("[Name] GetState[ %s ] error, throw-err: %v", config.NameKey, err)
	}
	return string(nameAsBytes), nil
}

// Symbol
// @title       Symbol
// @description "Symbol returns an abbreviated name for non-fungible tokens in this contract."
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @return                string                       "Returns the symbol of the token"
func (ugc *DigitalUgcContact) Symbol(ctx contractapi.TransactionContextInterface) (string, error) {
	symbolBytes, err := ctx.GetStub().GetState(config.SymbolKey)
	if err != nil {
		return "", fmt.Errorf("[Symbol] GetState[ %s ] error, throw-err: %v", config.SymbolKey, err)
	}
	return string(symbolBytes), nil
}

// TokenURI
// @title       TokenURI
// @description "TokenURI returns a distinct Uniform Resource Identifier (URI) for a given token."
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string                       "The identifier for a non-fungible token"
// @return                string                       "Returns the URI of the token"
func (ugc *DigitalUgcContact) TokenURI(ctx contractapi.TransactionContextInterface, tokenId string) (string, error) {
	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return "", fmt.Errorf("[TokenURI] _readNFT for tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}
	return nft.TokenURI, nil
}

// ============== ERC721 enumeration extension ===============

// TotalSupply
// @title       TotalSupply
// @description "TokenURI returns a distinct Uniform Resource Identifier (URI) for a given token."
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @return                string                       "Returns a count of valid non-fungible tokens tracked by this contract, where each one of them has an assigned and queryable owner."
func (ugc *DigitalUgcContact) TotalSupply(ctx contractapi.TransactionContextInterface) (int, error) {
	// There is a key record for every non-fungible token in the format of nftPrefix.tokenId.
	// TotalSupply() queries for and counts all records matching nftPrefix.*
	totalSupplyIterator, err := ctx.GetStub().GetStateByPartialCompositeKey(config.NftPrefix, []string{})
	if err != nil {
		return 0, fmt.Errorf("[TotalSupply] GetStateByPartialCompositeKey[ totalSupplyIterator: %s ] error, throw-err: %v", config.NftPrefix, err)
	}

	totalSupply := 0
	for totalSupplyIterator.HasNext() {
		if _, err = totalSupplyIterator.Next(); err != nil {
			return 0, fmt.Errorf("[TotalSupply] Failed to get the next state for prefix %v: %v", config.BalancePrefix, err)
		}
		totalSupply++
	}
	defer totalSupplyIterator.Close()

	return totalSupply, nil
}

// ============== Extended Functions for this contract ===============

func (ugc *DigitalUgcContact) SetOption(ctx contractapi.TransactionContextInterface, name string, symbol string) (bool, error) {
	// Check minter authorization - this sample assumes Org1 is the issuer with privilege to set the name and symbol
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return false, fmt.Errorf("[SetOption] GetClientIdentity.GetMSPID error, throw-err: %v", err)
	}

	if clientMSPID == "" {
		return false, fmt.Errorf("[SetOption] client is not authorized to set the name and symbol of the token")
	}

	nameBytes, err := json.Marshal(name)
	if err != nil {
		return false, fmt.Errorf("[SetOption] Json Marshal[ nameBytes ] error, throw-err: %v", err)
	}
	symbolBytes, err := json.Marshal(symbol)
	if err != nil {
		return false, fmt.Errorf("[SetOption] Json Marshal[ symbolBytes ] error, throw-err: %v", err)
	}

	err = ctx.GetStub().PutState(config.NameKey, nameBytes)
	if err != nil {
		return false, fmt.Errorf("[SetOption] PutState[ nameKey, nameBytes ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().PutState(config.SymbolKey, symbolBytes)
	if err != nil {
		return false, fmt.Errorf("[SetOption] PutState[ symbolKey, symbolBytes ] error, throw-err: %v", err)
	}

	return true, nil
}

// MintWithTokenURI
// @title       MintWithTokenURI
// @description "Mint a new non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string  "Unique ID of the non-fungible token to be minted"
// @param       tokenURI  string  "URI containing metadata of the minted non-fungible token"
// @return                string  "Return the non-fungible token object"
func (ugc *DigitalUgcContact) MintWithTokenURI(ctx contractapi.TransactionContextInterface, tokenId string, tokenURI string) (int, error) {

	// 判断tokenId
	tokenId = utils.StringStrip(tokenId)
	if tokenId == "" {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintWithTokenURI] tokenId is empty")
	}

	// 判断tokenUri
	tokenURI = utils.StringStrip(tokenURI)
	if tokenURI == "" {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintWithTokenURI] tokenURI is empty")
	}

	// Get ID of submitting client identity
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintWithTokenURI] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	_, code, err := ugc._mintNFT(ctx, minter, tokenId, tokenURI, false)
	if err != nil {
		return code, fmt.Errorf("[MintWithTokenURI] _mintNFT error, throw-err: %v", err)
	}
	if code != config.CODE_MINT_SUCCESS {
		return code, fmt.Errorf("[MintWithTokenURI] _mintNFT error, throw-err: %v", err)
	}

	return config.CODE_MINT_SUCCESS, nil
}

// MintBatchWithTokenURI
// @title       MintBatchWithTokenURI
// @description "Mint some non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string  "Unique ID of the non-fungible token to be minted"
// @param       tokenURI  string  "URI containing metadata of the minted non-fungible token"
// @return                string  "Return the non-fungible token object"
func (ugc *DigitalUgcContact) MintBatchWithTokenURI(ctx contractapi.TransactionContextInterface, tokenIds []string, tokenURIs []string) (int, error) {

	// 判断参数是否一致
	if len(tokenIds) != len(tokenURIs) {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintBatchWithTokenURI] tokenIds length must equal tokenURIs length")
	}

	// 检查tokenId是否存在空的值
	for _, content := range tokenIds {
		tokenId := utils.StringStrip(content)
		if tokenId == "" {
			return config.CODE_MINT_FAILED, fmt.Errorf("[MintBatchWithTokenURI] tokenIds list is found empty tokenId")
		}
	}

	// 检查tokenUri是否存在空的值
	for _, content := range tokenURIs {
		tokenURI := utils.StringStrip(content)
		if tokenURI == "" {
			return config.CODE_MINT_FAILED, fmt.Errorf("[MintBatchWithTokenURI] tokenURIs list is found empty uri")
		}
	}

	// Get ID of submitting client identity
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintBatchWithTokenURI] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	// 执行批量铸造
	assetLength := len(tokenIds)
	for i := 0; i < assetLength; i++ {
		tokenId := tokenIds[i]
		tokenURI := tokenURIs[i]

		_, code, err := ugc._mintNFT(ctx, minter, tokenId, tokenURI, false)
		if err != nil {
			return code, fmt.Errorf("[MintBatchWithTokenURI] _mintNFT error, throw-err: %v", err)
		}
	}

	return config.CODE_MINT_SUCCESS, nil
}

// MintFungibleTokenUriWithBatch
// @title       MintFungibleTokenUriWithBatch
// @description "Mint some token with fungible tokenUri"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string  "Unique ID of the non-fungible token to be minted"
// @param       tokenURI  string  "URI containing metadata of the minted non-fungible token"
// @return                string  "Return the non-fungible token object"
func (ugc *DigitalUgcContact) MintFungibleTokenUriWithBatch(ctx contractapi.TransactionContextInterface, tokenIds []string, tokenURI string) (int, error) {

	// 判断参数是否一致
	if len(tokenIds) <= 0 {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintFungibleTokenUriWithBatch] tokenIds length == 0")
	}

	// 判断 tokenUri 是否为空
	if utils.StringStrip(tokenURI) == "" {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintFungibleTokenUriWithBatch] tokenURI is empty")
	}

	// 检查tokenId是否存在空的值
	for _, content := range tokenIds {
		tokenId := utils.StringStrip(content)
		if tokenId == "" {
			return config.CODE_MINT_FAILED, fmt.Errorf("[MintFungibleTokenUriWithBatch] tokenIds list is found empty tokenId")
		}
	}

	// Get ID of submitting client identity
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return config.CODE_MINT_FAILED, fmt.Errorf("[MintFungibleTokenUriWithBatch] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	// 执行批量铸造
	assetLength := len(tokenIds)
	for i := 0; i < assetLength; i++ {
		tokenId := tokenIds[i]

		_, code, err := ugc._mintNFT(ctx, minter, tokenId, tokenURI, true)
		if err != nil {
			return code, fmt.Errorf("[MintFungibleTokenUriWithBatch] _mintNFT error, throw-err: %v", err)
		}
	}

	return config.CODE_MINT_SUCCESS, nil
}

// Burn
// @title       Burn
// @description "Burn a non-fungible token"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @param       tokenId   string  "Unique ID of a non-fungible token"
// @return                bool    "Return whether the burn was successful or not"
func (ugc *DigitalUgcContact) Burn(ctx contractapi.TransactionContextInterface, tokenId string) (bool, error) {
	owner, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return false, fmt.Errorf("[Burn] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	// Check if a caller is the owner of the non-fungible token
	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return false, fmt.Errorf("[Burn] _readNFT tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}
	if nft.Owner != owner {
		return false, fmt.Errorf("[Burn] Non-fungible token %s is not owned by %s", tokenId, owner)
	}

	// Delete the token
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("[Burn] CreateCompositeKey[ nftKey: %s%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}
	err = ctx.GetStub().DelState(nftKey)
	if err != nil {
		return false, fmt.Errorf("[Burn] DelState[ nftKey: %s ] error, throw-err: %v", nftKey, err)
	}

	// Remove a composite key from the balance of the owner
	balanceKey, err := ctx.GetStub().CreateCompositeKey(config.BalancePrefix, []string{owner, tokenId})
	if err != nil {
		return false, fmt.Errorf("[Burn] CreateCompositeKey[ nftKey: %s%s%s ] error, throw-err: %v", config.BalancePrefix, owner, tokenId, err)
	}
	err = ctx.GetStub().DelState(balanceKey)
	if err != nil {
		return false, fmt.Errorf("[Burn] DelState[ balanceKey: %s ] error, throw-err: %v", balanceKey, err)
	}

	// Remove UniqueTokenUri
	err = ugc._burnUniqueTokenUri(ctx, nft.TokenURI)
	if err != nil {
		return false, fmt.Errorf("[Burn] _burnUniqueTokenUri[ TokenURI: %s ] error, throw-err: %v", nft.TokenURI, err)
	}

	// Emit the Transfer event
	newEventTransfer, err := json.Marshal(EventTransfer{From: owner, To: "0x0", TokenId: tokenId})
	if err != nil {
		return false, fmt.Errorf("[Burn] Json Marshal[ newEventTransfer ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", newEventTransfer)
	if err != nil {
		return false, fmt.Errorf("[Burn] SetEvent[ newEventTransfer ] error, throw-err: %v", err)
	}

	return true, nil
}

func (ugc *DigitalUgcContact) _mintNFT(ctx contractapi.TransactionContextInterface, minter, tokenId, tokenURI string, isFungible bool) (bool, int, error) {

	// Check if the token to be minted does not exist
	tokenIdExists, tokenUriExists, err := ugc._nftExists(ctx, tokenId, tokenURI)
	if err != nil {
		return false, config.CODE_MINT_TOKEN_EXISTS, fmt.Errorf("[_mintNFT] _nftExists[ tokenId:%s, tokenURI:%s ] get error, thow-error: %v", tokenId, tokenURI, err)
	}
	if tokenIdExists {
		return false, config.CODE_MINT_TOKENID_MINTED, fmt.Errorf("[_mintNFT] The tokenID[ %v ] was minted, TokenExist", tokenId)
	}

	// 同质化铸造忽略tokenUri检测结果
	if !isFungible {
		if tokenUriExists {
			return false, config.CODE_MINT_TOKENURI_MINTED, fmt.Errorf("[_mintNFT] The tokenURI[ %v ] was minted, TokenExist", tokenURI)
		}
	}

	// Add a non-fungible token
	newUgcToken := DigitalUgcBaseData{
		TokenId:  tokenId,
		Owner:    minter,
		TokenURI: tokenURI,
	}
	newNftBytes, err := json.Marshal(newUgcToken)
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] Json Marshal[ newUgcToken ] error, throw-err: %v", err)
	}
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] CreateCompositeKey[ nftKey: %v%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}
	err = ctx.GetStub().PutState(nftKey, newNftBytes)
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] PutState[ nftKey,newNftBytes ] error, throw-err: %v", err)
	}

	// A composite key would be balancePrefix.owner.tokenId, which enables partial
	// composite key query to find and count all records matching balance.owner.*
	// An empty value would represent a deleted, so we simply insert the null character.
	balanceKey, err := ctx.GetStub().CreateCompositeKey(config.BalancePrefix, []string{minter, tokenId})
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] CreateCompositeKey[ balanceKey: %s%s%s ] error, throw-err: %v", config.BalancePrefix, minter, tokenId, err)
	}
	err = ctx.GetStub().PutState(balanceKey, []byte{'0'})
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] PutState[ balanceKey,[]byte ] error, throw-err: %v", err)
	}

	// Save token-uri
	err = ugc._saveUniqueTokenUri(ctx, tokenURI)
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] _saveUniqueTokenUri[ tokenURI:%s ] error, throw-err: %v", tokenURI, err)
	}

	// Emit the Transfer event
	newTransferEvent, err := json.Marshal(EventTransfer{From: "0x0", To: minter, TokenId: tokenId})
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] Json Marshal[ newTransferEvent ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", newTransferEvent)
	if err != nil {
		return false, config.CODE_MINT_FAILED, fmt.Errorf("[_mintNFT] SetEvent[ newTransferEvent ] error, throw-err: %v", err)
	}

	return true, config.CODE_MINT_SUCCESS, nil
}

func (ugc *DigitalUgcContact) _transform(ctx contractapi.TransactionContextInterface, from string, to string, tokenId string) (bool, error) {

	sender, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return false, fmt.Errorf("[_transform] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	nft, err := ugc._readNFT(ctx, tokenId)
	if err != nil {
		return false, fmt.Errorf("[_transform] _readNFT for tokenId[ %v ] error, throw-err: %v", tokenId, err)
	}

	// Check if the sender is the current owner, an authorized operator,
	// or the approved client for this non-fungible token.
	owner := nft.Owner
	tokenApproval := nft.Approved
	operatorApproval, err := ugc.IsApprovedForAll(ctx, owner, sender)
	if err != nil {
		return false, fmt.Errorf("[_transform] IsApprovedForAll[ owner:%v, sender:%v ] error, throw-err: %v", owner, sender, err)
	}
	if owner != sender && tokenApproval != sender && !operatorApproval {
		return false, fmt.Errorf("[_transform] The sender is not allowed to transfer the non-fungible tokenId")
	}

	// Check if `from` is the current owner
	if owner != from {
		return false, fmt.Errorf("[_transform] The from is not the current owner")
	}

	// Clear the approved client for this non-fungible token
	nft.Approved = ""
	// Overwrite a non-fungible token to assign a new owner.
	nft.Owner = to
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return false, fmt.Errorf("[_transform] CreateCompositeKey[ nftKey: %v%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}
	nftBytes, err := json.Marshal(nft)
	if err != nil {
		return false, fmt.Errorf("[_transform] Json Marshal[ nftBytes ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().PutState(nftKey, nftBytes)
	if err != nil {
		return false, fmt.Errorf("[_transform] PutState[ nftKey, nftBytes ] error, throw-err: %v", err)
	}

	// Remove a composite key from the balance of the current owner
	balanceKeyFrom, err := ctx.GetStub().CreateCompositeKey(config.BalancePrefix, []string{from, tokenId})
	if err != nil {
		return false, fmt.Errorf("[_transform] CreateCompositeKey[ balanceKeyFrom: %s%s%s ] error, throw-err: %v", config.BalancePrefix, from, tokenId, err)
	}
	err = ctx.GetStub().DelState(balanceKeyFrom)
	if err != nil {
		return false, fmt.Errorf("[_transform] DelState[ balanceKeyFrom: %s ] error, throw-err: %v", balanceKeyFrom, err)
	}

	// Save a composite key to count the balance of a new owner
	balanceKeyTo, err := ctx.GetStub().CreateCompositeKey(config.BalancePrefix, []string{to, tokenId})
	if err != nil {
		return false, fmt.Errorf("[_transform] CreateCompositeKey[ balanceKeyTo: %s%s%s ] error, throw-err: %v", config.BalancePrefix, to, tokenId, err)
	}
	err = ctx.GetStub().PutState(balanceKeyTo, []byte{'0'})
	if err != nil {
		return false, fmt.Errorf("[_transform] PutState[ balanceKeyTo, []bytes ] error, throw-err: %v", err)
	}

	// Emit the Transfer event
	newEventTransfer := EventTransfer{
		From:    from,
		To:      to,
		TokenId: tokenId,
	}
	newEventTransferBytes, err := json.Marshal(newEventTransfer)
	if err != nil {
		return false, fmt.Errorf("[_transform] Json Marshal[ newEventTransfer ] error, throw-err: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer", newEventTransferBytes)
	if err != nil {
		return false, fmt.Errorf("[_transform] SetEvent[ newEventTransferBytes ] error, throw-err: %v", err)
	}

	return true, nil
}

func (ugc *DigitalUgcContact) _readNFT(ctx contractapi.TransactionContextInterface, tokenId string) (DigitalUgcBaseData, error) {
	// Build compositeKey
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return DigitalUgcBaseData{}, fmt.Errorf("[_readNFT] CreateCompositeKey[ nftKey: %s%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}

	// Get origin bytes from ledger
	nftBytes, err := ctx.GetStub().GetState(nftKey)
	if err != nil {
		return DigitalUgcBaseData{}, fmt.Errorf("[_readNFT] GetState[ nftKey: %s ] error, throw-err: %v", nftKey, err)
	}
	if len(nftBytes) <= 0 {
		return DigitalUgcBaseData{}, fmt.Errorf("[_readNFT] The tokenId[ %v ] is invalid. It does not exist", tokenId)
	}

	// Build nft object
	nft := DigitalUgcBaseData{}
	err = json.Unmarshal(nftBytes, &nft)
	if err != nil {
		return DigitalUgcBaseData{}, fmt.Errorf("[_readNFT] Json Unmarshal[ nft ] error, throw-err: %v", err)
	}

	return nft, nil
}

func (ugc *DigitalUgcContact) _nftExists(ctx contractapi.TransactionContextInterface, tokenId string, tokenURI string) (bool, bool, error) {
	nftKey, err := ctx.GetStub().CreateCompositeKey(config.NftPrefix, []string{tokenId})
	if err != nil {
		return false, false, fmt.Errorf("[_nftExists] CreateCompositeKey[ nftKey: %s%s ] error, throw-err: %v", config.NftPrefix, tokenId, err)
	}

	nftBytes, err := ctx.GetStub().GetState(nftKey)
	if err != nil {
		return false, false, fmt.Errorf("[_nftExists] GetState[ nftKey: %s ] error, throw-err: %v", nftKey, err)
	}

	// 检查是否存在 tokenUri唯一值
	tokenUriExists, err := ugc._checkUniqueTokenUri(ctx, tokenURI)
	if err != nil {
		return false, false, fmt.Errorf("[_nftExists] _checkUniqueTokenUri[ tokenURI: %s ] error, throw-err: %v", tokenURI, err)
	}

	return len(nftBytes) > 0, tokenUriExists, nil
}

// 检查 uniqueUri
func (ugc *DigitalUgcContact) _checkUniqueTokenUri(ctx contractapi.TransactionContextInterface, tokenURI string) (bool, error) {
	uniqueUriKey, err := ctx.GetStub().CreateCompositeKey(config.UriPrefix, []string{tokenURI})
	if err != nil {
		return false, fmt.Errorf("[_checkUniqueTokenUri] CreateCompositeKey[ uriPrefix: %s%s ] error, throw-err: %v", config.UriPrefix, tokenURI, err)
	}

	uniqueUriBytes, err := ctx.GetStub().GetState(uniqueUriKey)
	if err != nil {
		return false, fmt.Errorf("[_checkUniqueTokenUri] GetState[ uniqueUriKey: %s ] error, throw-err: %v", uniqueUriKey, err)
	}

	return len(uniqueUriBytes) > 0, nil
}

// 存储 uniqueUri
func (ugc *DigitalUgcContact) _saveUniqueTokenUri(ctx contractapi.TransactionContextInterface, tokenURI string) error {
	uniqueUriKey, err := ctx.GetStub().CreateCompositeKey(config.UriPrefix, []string{tokenURI})
	if err != nil {
		return fmt.Errorf("[_saveUniqueTokenUri] CreateCompositeKey[ uriPrefix: %s%s ] error, throw-err: %v", config.UriPrefix, tokenURI, err)
	}
	err = ctx.GetStub().PutState(uniqueUriKey, []byte{'0'})
	if err != nil {
		return fmt.Errorf("[_saveUniqueTokenUri] PutState[ uniqueUriKey: %s ] error, throw-err: %v", uniqueUriKey, err)
	}

	return nil
}

// 销毁 uniqueUri
func (ugc *DigitalUgcContact) _burnUniqueTokenUri(ctx contractapi.TransactionContextInterface, tokenURI string) error {
	// Delete the token
	uniqueUriKey, err := ctx.GetStub().CreateCompositeKey(config.UriPrefix, []string{tokenURI})
	if err != nil {
		return fmt.Errorf("[_burnUniqueTokenUri] CreateCompositeKey[ uriPrefix: %s%s ] error, throw-err: %v", config.UriPrefix, tokenURI, err)
	}
	err = ctx.GetStub().DelState(uniqueUriKey)
	if err != nil {
		return fmt.Errorf("[_burnUniqueTokenUri] DelState[ uniqueUriKey: %s ] error, throw-err: %v", uniqueUriKey, err)
	}

	return nil
}

// ClientAccountBalance
// @title       ClientAccountBalance
// @description "ClientAccountBalance returns the balance of the requesting client's account."
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @return                int                          "Returns the account balance"
func (ugc *DigitalUgcContact) ClientAccountBalance(ctx contractapi.TransactionContextInterface) (int, error) {
	// Get ID of submitting client identity
	clientAccountId, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return 0, fmt.Errorf("[ClientAccountBalance] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	return ugc.BalanceOf(ctx, clientAccountId)
}

// ClientAccountID
// @title       ClientAccountID
// @description "returns the id of the requesting client's account,In this implementation, the client account ID is the clientId itself
// @description Users can use this function to get their own account id, which they can then give to others as the payment address"
// @param       ctx       TransactionContextInterface  "ctx the transaction context"
// @return                string  "Return client account id"
func (ugc *DigitalUgcContact) ClientAccountID(ctx contractapi.TransactionContextInterface) (string, error) {
	// Get ID of submitting client identity
	clientAccountId, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("[ClientAccountID] GetClientIdentity.GetID for sender error, throw-err: %v", err)
	}

	return clientAccountId, nil
}
