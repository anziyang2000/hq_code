package proto

const (
	CoinName        = "RMB"
	CoinSymbol      = "hqsk-RMB"
	CoinDecimals    = 2
	TotalSupplyKey  = "totalSupply"
	EmptyAccount    = "0x0"
	AllowancePrefix = "allowance"

	OperateAuthLevelName = "level"
)

const (
	OperateAuthNeedLevel = 999
)

// Event 事件触发结构体
type Event struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Amount int    `json:"amount"`
}

type EventBatch struct {
	From    string   `json:"from"`
	Tos     []string `json:"tos"`
	Amounts []int    `json:"amounts"`
}
