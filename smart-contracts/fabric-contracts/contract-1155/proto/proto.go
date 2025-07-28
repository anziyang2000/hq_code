package proto

const (
	ChaincodeNameCoins = "BDSCoin"          // 生产环境
	ChannelID          = "chan-hqsk-ticket" // 生产环境

	FcnCoinsTransfer      = "Transfer"
	FcnCoinsTransferBatch = "TransferBatch"
)

const (
	EmptyAccount   = "0x0"
	UriKey         = "uri[%s]"
	PrefixNft      = "nft"
	PrefixBalance  = "account-batchId-tokenId"
	ApprovalPrefix = "account~operator"

	OperateAuthLevelName = "level"
)

const (
	OperateAuthNeedLevelMint = 50
	OperateAuthNeedLevelBurn = 999
)

// TokenIdPre 用毫秒级时间当tokenId的前缀
//var TokenIdPre = strconv.Itoa(int(time.Now().Unix())) + strconv.Itoa(13)

// NftMetadata 元数据
type NftMetadata struct {
	TokenID string `json:"token_id"`
	Owner   string `json:"owner"`
	Meta    string `json:"meta"`
}

/*
	ToID
	To 接收者地址
	ID 类型ID
*/
type ToID struct {
	To string
	ID string
}

// TransferSingle 单个转账时触发的事件
type TransferSingle struct {
	Operator string `json:"operator"`
	From     string `json:"from"`
	To       string `json:"to"`
	ID       string `json:"id"`
	Value    uint64 `json:"value"`
}

// TransferBatch 一对一账户批量转账时触发的事件
type TransferBatch struct {
	Operator string   `json:"operator"`
	From     string   `json:"from"`
	To       string   `json:"to"`
	IDs      []string `json:"ids"`
	Values   []uint64 `json:"values"`
}

// TransferBatchMultiRecipient 在一个账户批量转移资产给多个账户时触发的事件
type TransferBatchMultiRecipient struct {
	Operator string   `json:"operator"`
	From     string   `json:"from"`
	To       []string `json:"to"`
	IDs      []string `json:"ids"`
	Values   []uint64 `json:"values"`
}

// ApprovalForAll 在授权第二方时触发的事件
type ApprovalForAll struct {
	Owner    string `json:"owner"`
	Operator string `json:"operator"`
	Approved bool   `json:"approved"`
}
