package config

const (
	// Define objectType names for prefix

	BalancePrefix  = "balance"
	NftPrefix      = "nft"
	UriPrefix      = "uniqueUri"
	ApprovalPrefix = "approvalAll"

	// Define key names for options

	NameKey   = "name"
	SymbolKey = "symbol"
)

const (
	CODE_MINT_SUCCESS         = 0
	CODE_MINT_FAILED          = 1
	CODE_MINT_TOKEN_EXISTS    = 2
	CODE_MINT_TOKENID_MINTED  = 3
	CODE_MINT_TOKENURI_MINTED = 4
)
