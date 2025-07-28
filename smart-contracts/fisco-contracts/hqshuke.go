// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package hqshuke_testv1

import (
	"math/big"
	"strings"

	"github.com/FISCO-BCOS/go-sdk/abi"
	"github.com/FISCO-BCOS/go-sdk/abi/bind"
	"github.com/FISCO-BCOS/go-sdk/core/types"
	"github.com/FISCO-BCOS/go-sdk/event"
	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// HqshukeTestv1ABI is the input ABI used to generate the binding from.
const HqshukeTestv1ABI = "[{\"constant\":true,\"inputs\":[{\"name\":\"Quantity_Name\",\"type\":\"string\"}],\"name\":\"Search\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string[]\"},{\"name\":\"\",\"type\":\"string[]\"},{\"name\":\"\",\"type\":\"string[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"Quantity_Name\",\"type\":\"string\"}],\"name\":\"Kill\",\"outputs\":[{\"name\":\"\",\"type\":\"int256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"Quantity_Name\",\"type\":\"string\"},{\"name\":\"Owner\",\"type\":\"string\"},{\"name\":\"Spot\",\"type\":\"string\"},{\"name\":\"Price_Origin\",\"type\":\"string\"},{\"name\":\"Price_Now\",\"type\":\"string\"},{\"name\":\"Quantity\",\"type\":\"string\"}],\"name\":\"Create\",\"outputs\":[{\"name\":\"\",\"type\":\"int256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"Quantity_Name\",\"type\":\"string\"},{\"name\":\"Owner\",\"type\":\"string\"},{\"name\":\"Price_Now\",\"type\":\"string\"}],\"name\":\"Alter\",\"outputs\":[{\"name\":\"\",\"type\":\"int256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"count\",\"type\":\"int256\"}],\"name\":\"CreateResult\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"count\",\"type\":\"int256\"}],\"name\":\"InsertResult\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"count\",\"type\":\"int256\"}],\"name\":\"UpdateResult\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"count\",\"type\":\"int256\"}],\"name\":\"RemoveResult\",\"type\":\"event\"}]"

// HqshukeTestv1Bin is the compiled bytecode used for deploying new contracts.
var HqshukeTestv1Bin = "0x60806040523480156200001157600080fd5b506110016000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663c92a78016040805190810160405280600e81526020017f68717368756b655f7465737476310000000000000000000000000000000000008152506040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040162000101919062000270565b602060405180830381600087803b1580156200011c57600080fd5b505af115801562000131573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525062000157919081019062000174565b506200031a565b60006200016c8251620002c9565b905092915050565b6000602082840312156200018757600080fd5b600062000197848285016200015e565b91505092915050565b6000620001ad82620002be565b808452620001c3816020860160208601620002d3565b620001ce8162000309565b602085010191505092915050565b6000602a82527f4f776e65722c53706f742c50726963655f4f726967696e2c50726963655f4e6f60208301527f772c5175616e74697479000000000000000000000000000000000000000000006040830152606082019050919050565b6000600d82527f5175616e746974795f4e616d65000000000000000000000000000000000000006020830152604082019050919050565b600060608201905081810360008301526200028c8184620001a0565b90508181036020830152620002a18162000239565b90508181036040830152620002b681620001dc565b905092915050565b600081519050919050565b6000819050919050565b60005b83811015620002f3578082015181840152602081019050620002d6565b8381111562000303576000848401525b50505050565b6000601f19601f8301169050919050565b61228f806200032a6000396000f300608060405260043610610061576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168062faded614610066578063121b4eab146100a657806362dbc1fa146100e3578063a5f45fe114610120575b600080fd5b34801561007257600080fd5b5061008d60048036036100889190810190611971565b61015d565b60405161009d9493929190611e31565b60405180910390f35b3480156100b257600080fd5b506100cd60048036036100c89190810190611971565b6109f4565b6040516100da9190611df4565b60405180910390f35b3480156100ef57600080fd5b5061010a60048036036101059190810190611a8a565b610d0b565b6040516101179190611df4565b60405180910390f35b34801561012c57600080fd5b50610147600480360361014291908101906119f3565b6112ca565b6040516101549190611df4565b60405180910390f35b606080606080600080600060608060606000806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166359a48b656040805190810160405280600e81526020017f68717368756b655f7465737476310000000000000000000000000000000000008152506040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040161021b9190611e0f565b602060405180830381600087803b15801561023557600080fd5b505af1158015610249573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061026d919081019061191f565b97508773ffffffffffffffffffffffffffffffffffffffff1663c74f8caf6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b1580156102d357600080fd5b505af11580156102e7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061030b91908101906118a4565b96508773ffffffffffffffffffffffffffffffffffffffff1663d8ac59578e896040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610364929190611e92565b602060405180830381600087803b15801561037e57600080fd5b505af1158015610392573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506103b691908101906118cd565b95508573ffffffffffffffffffffffffffffffffffffffff1663d3e9af5a6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b15801561041c57600080fd5b505af1158015610430573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506104549190810190611948565b60405190808252806020026020018201604052801561048757816020015b60608152602001906001900390816104725790505b5094508573ffffffffffffffffffffffffffffffffffffffff1663d3e9af5a6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b1580156104ee57600080fd5b505af11580156fffffffffffffffffffffffffffffffffff16639bca41e86040518163ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040161095c90611f30565b600060405180830381600087803b15801561097657600080fd5b505af115801561098a573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052506109b391908101906119b2565b83838151811015156109c157fe5b90602001906020020181905250816001019150610633565b8c8585859b509b509b509b5050505050505050509193509193565b6000806000806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166359a48b656040805190810160405280600e81526020017f68717368756b655f7465737476310000000000000000000000000000000000008152506040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610aa59190611e0f565b602060405180830381600087803b158015610abf57600080fd5b505af1158015610ad3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610af7919081019061191f565b92508273ffffffffffffffffffffffffffffffffffffffff1663c74f8caf6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b158015610b5d57600080fd5b505af1158015610b71573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610b9591908101906118a4565b91508173ffffffffffffffffffffffffffffffffffffffff1663ae763db5866040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610bec919061200f565b600060405180830381600087803b158015610c0657600080fd5b505af1158015610c1a573d6000803e3d6000fd5b505050508273ffffffffffffffffffffffffffffffffffffffff166309ff42f086846040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610c75929190611e92565b602060405180830381600087803b158015610c8f57600080fd5b505af1158015610ca3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610cc79190810190611948565b90507fe7769b56c2afa8e40381956f76b91d9ec19c34c0a81791702fdcae68e35a727181604051610cf89190611df4565b60405180910390a1809350505050919050565b6000806000806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166359a48b656040805190810160405280600e81526020017f68717368756b655f7465737476310000000000000000000000000000000000008152506040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610dbc9190611e0f565b602060405180830381600087803b158015610dd657600080fd5b505af1158015610dea573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610e0e919081019061191f565b92508273ffffffffffffffffffffffffffffffffffffffff16635887ab246040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b158015610e7457600080fd5b505af1158015610e88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610eac91908101906118f6565b91508173ffffffffffffffffffffffffffffffffffffffff16631a391cb48b6040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610f03919061200f565b600060405180830381600087803b158015610f1d57600080fd5b505af1158015610f31573d6000803e3d6000fd5b505050508173ffffffffffffffffffffffffffffffffffffffff16631a391cb48a6040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401610f8a9190611fda565b600060405180830381600087803b158015610fa457600080fd5b505af1158015610fb8573d6000803e3d6000fd5b500000000000000000000000000000002815260040161122f929190611ec2565b602060405180830381600087803b15801561124957600080fd5b505af115801561125d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506112819190810190611948565b90507fdfc533ec2b52797a1229dc2495dbd3f4948f7c4c982ec077ad9d80810ec5c1f9816040516112b29190611df4565b60405180910390a18093505050509695505050505050565b60008060008060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166359a48b656040805190810160405280600e81526020017f68717368756b655f7465737476310000000000000000000000000000000000008152506040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040161137d9190611e0f565b602060405180830381600087803b15801561139757600080fd5b505af11580156113ab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506113cf919081019061191f565b93508373ffffffffffffffffffffffffffffffffffffffff16635887ab246040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b15801561143557600080fd5b505af1158015611449573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061146d91908101906118f6565b92508273ffffffffffffffffffffffffffffffffffffffff16631a391cb4876040518263ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004016114c49190612064565b600060405180830381600087803b1580156114de57600080fd5b505af11580156114f2573d6000803e3d6000fd5b505050508273ffffffffffffffffffffffffffffffffffffffff16631a391cb4886040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040161154b9190611fda565b600060405180830381600087803b15801561156557600080fd5b505af1158015611579573d6000803e3d6000fd5b505050508373ffffffffffffffffffffffffffffffffffffffff1663c74f8caf6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b1580156115e157600080fd5b505af11580156115f5573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061161991908101906118a4565b91508173ffffffffffffffffffffffffffffffffffffffff1663ae763db5896040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401611670919061200f565b600060405180830381600087803b15801561168a57600080fd5b505af115801561169e573d6000803e3d6000fd5b505050508373ffffffffffffffffffffffffffffffffffffffff1663664b37d68985856040518463ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004016116fb93929190611ef2565b602060405180830381600087803b15801561171557600080fd5b505af1158015611729573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061174d9190810190611948565b90507fd72ab475a08df05fbd4f7f8cb4db1ad9dbdc26f54437fa6794acd97357779d2a8160405161177e9190611df4565b60405180910390a1809450505050509392505050565b60006117a0825161218c565b905092915050565b60006117b4825161219e565b905092915050565b60006117c882516121b0565b905092915050565b60006117dc82516121c2565b905092915050565b60006117f082516121d4565b905092915050565b600082601f830112151561180b57600080fd5b813561181e611819826120fb565b6120ce565b9150808252602083016020830185838301111561183a57600080fd5b611845838284612202565b50505092915050565b600082601f830112151561186157600080fd5b815161187461186f826120fb565b6120ce565b9150808252602083016020830185838301111561189057600080fd5b61189b838284612211565b50505092915050565b6000602082840312156118b657600080fd5b60006118c484828501611794565b91505092915050565b6000602082840312156118df57600080fd5b60006118ed848285016117a8565b91505092915050565b60006020828403121561190857600080fd5b6000611916848285016117bc565b91505092915050565b60006020828403121561193157600080fd5b600061193f848285016117d0565b91505092915050565b60006020828403121561195a57600080fd5b6000611968848285016117e4565b91505092915050565b60006020828403121561198357600080fd5b600082013567ffffffffffffffff81111561199d57600080fd5b6119a9848285016117f8565b91505092915050565b6000602082840312156119c457600080fd5b600082015167ffffffffffffffff8111156119de57600080fd5b6119ea8482850161184e565b91505092915050565b600080600060608486031215611a0857600080fd5b600084013567ffffffffffffffff811115611a2257600080fd5b611a2e868287016117f8565b935050602084013567ffffffffffffffff811115611a4b57600080fd5b611a57868287016117f8565b925050604084013567ffffffffffffffff811115611a7457600080fd5b611a80868287016117f8565b9150509250925092565b60008060008060008060c08789031215611aa357600080fd5b600087013567ffffffffffffffff811115611abd57600080fd5b611ac989828a016117f8565b965050602087013567ffffffffffffffff811115611ae657600080fd5b611af289828a016117f8565b955050604087013567ffffffffffffffff811115611b0f57600080fd5b611b1b89828a016117f8565b945050606087013567ffffffffffffffff811115611b3857600080fd5b611b4489828a016117f8565b935050608087013567ffffffffffffffff811115611b6157600080fd5b611b6d89828a016117f8565b92505060a087013567ffffffffffffffff811115611b8a57600080fd5b611b9689828a016117f8565b9150509295509295509295565b6000611bae82612134565b80845260208401935083602082028501611bc785612127565b60005b84811015611c00578383038852611be2838351611c74565b9250611bed82612155565b9150602088019750600181019050611bca565b508196508694505050505092915050565b611c1a816121de565b82525050565b611c29816121f0565b82525050565b611c3881612182565b82525050565b6000611c498261214a565b808452611c5d816020860160208601612211565b611c6681612244565b602085010191505092915050565b6000611c7f8261213f565b808452611c93816020860160208601612211565b611c9c81612244565b602085010191505092915050565b6000600882527f5175616e746974790000000000000000000000000000000000000000000000006020830152604082019050919050565b6000600482527f53706f74000000000000000000000000000000000000000000000000000000006020830152604082019050919050565b6000600582527f4f776e65720000000000000000000000000000000000000000000000000000006020830152604082019050919050565b6000600d82527f5175616e746974795f4e616d65000000000000000000000000000000000000006020830152604082019050919050565b6000600982527f50726963655f4e6f7700000000000000000000000000000000000000000000006020830152604082019050919050565b6000600c82527f50726963655f4f726967696e00000000000000000000000000000000000000006020830152604082019050919050565b6000602082019050611e096000830184611c2f565b92915050565b60006020820190508181036000830152611e298184611c74565b905092915050565b60006080820190508181036000830152611e4b8187611c3e565b90508181036020830152611e5f8186611ba3565b90508181036040830152611e738185611ba3565b90508181036060830152611e878184611ba3565b905095945050505050565b60006040820190508181036000830152611eac8185611c3e565b9050611ebb6020830184611c11565b9392505050565b60006040820190508181036000830152611edc8185611c3e565b9050611eeb6020830184611c20565b9392505050565b60006060820190508181036000830152611f0c8186611c3e565b9050611f1b6020830185611c20565b611f286040830184611c11565b949350505050565b60006020820190508181036000830152611f4981611caa565b9050919050565b60006040820190508181036000830152611f6981611caa565b90508181036020830152611f7d8184611c3e565b905092915050565b60006040820190508181036000830152611f9e81611ce1565b90508181036020830152611fb28184611c3e565b905092915050565b60006020820190508181036000830152611fd381611d18565b9050919050565b60006040820190508181036000830152611ff381611d18565b905081810360208301526120078184611c3e565b905092915050565b6000604082019050818103600083015261202881611d4f565b9050818103602083015261203c8184611c3e565b905092915050565b6000602082019050818103600083015261205d81611d86565b9050919050565b6000604082019050818103600083015261207d81611d86565b905081810360208301526120918184611c3e565b905092915050565b600060408201905081810360008301526120b281611dbd565b905081810360208301526120c68184611c3e565b905092915050565b6000604051905081810181811067ffffffffffffffff821117156120f157600080fd5b8060405250919050565b600067ffffffffffffffff82111561211257600080fd5b601f19601f8301169050602081019050919050565b6000602082019050919050565b600081519050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061219782612162565b9050919050565b60006121a982612162565b9050919050565b60006121bb82612162565b9050919050565b60006121cd82612162565b9050919050565b6000819050919050565b60006121e982612162565b9050919050565b60006121fb82612162565b9050919050565b82818337600083830152505050565b60005b8381101561222f578082015181840152602081019050612214565b8381111561223e576000848401525b50505050565b6000601f19601f83011690509190505600a265627a7a723058200a896db3a8b0b1ee4eaac108d781124ff6d9650d09d8bb40cc3cafef9384c8df6c6578706572696d656e74616cf50037"

// DeployHqshukeTestv1 deploys a new contract, binding an instance of HqshukeTestv1 to it.
func DeployHqshukeTestv1(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *HqshukeTestv1, error) {
	parsed, err := abi.JSON(strings.NewReader(HqshukeTestv1ABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}

	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(HqshukeTestv1Bin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &HqshukeTestv1{HqshukeTestv1Caller: HqshukeTestv1Caller{contract: contract}, HqshukeTestv1Transactor: HqshukeTestv1Transactor{contract: contract}, HqshukeTestv1Filterer: HqshukeTestv1Filterer{contract: contract}}, nil
}

func AsyncDeployHqshukeTestv1(auth *bind.TransactOpts, handler func(*types.Receipt, error), backend bind.ContractBackend) (*types.Transaction, error) {
	parsed, err := abi.JSON(strings.NewReader(HqshukeTestv1ABI))
	if err != nil {
		return nil, err
	}

	tx, err := bind.AsyncDeployContract(auth, handler, parsed, common.FromHex(HqshukeTestv1Bin), backend)
	if err != nil {
		return nil, err
	}
	return tx, nil
}

// HqshukeTestv1 is an auto generated Go binding around a Solidity contract.
type HqshukeTestv1 struct {
	HqshukeTestv1Caller     // Read-only binding to the contract
	HqshukeTestv1Transactor // Write-only binding to the contract
	HqshukeTestv1Filterer   // Log filterer for contract events
}

// HqshukeTestv1Caller is an auto generated read-only Go binding around a Solidity contract.
type HqshukeTestv1Caller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HqshukeTestv1Transactor is an auto generated write-only Go binding around a Solidity contract.
type HqshukeTestv1Transactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HqshukeTestv1Filterer is an auto generated log filtering Go binding around a Solidity contract events.
type HqshukeTestv1Filterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// HqshukeTestv1Session is an auto generated Go binding around a Solidity contract,
// with pre-set call and transact options.
type HqshukeTestv1Session struct {
	Contract     *HqshukeTestv1    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// HqshukeTestv1CallerSession is an auto generated read-only Go binding around a Solidity contract,
// with pre-set call options.
type HqshukeTestv1CallerSession struct {
	Contract *HqshukeTestv1Caller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// HqshukeTestv1TransactorSession is an auto generated write-only Go binding around a Solidity contract,
// with pre-set transact options.
type HqshukeTestv1TransactorSession struct {
	Contract     *HqshukeTestv1Transactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// HqshukeTestv1Raw is an auto generated low-level Go binding around a Solidity contract.
type HqshukeTestv1Raw struct {
	Contract *HqshukeTestv1 // Generic contract binding to access the raw methods on
}

// HqshukeTestv1CallerRaw is an auto generated low-level read-only Go binding around a Solidity contract.
type HqshukeTestv1CallerRaw struct {
	Contract *HqshukeTestv1Caller // Generic read-only contract binding to access the raw methods on
}

// HqshukeTestv1TransactorRaw is an auto generated low-level write-only Go binding around a Solidity contract.
type HqshukeTestv1TransactorRaw struct {
	Contract *HqshukeTestv1Transactor // Generic write-only contract binding to access the raw methods on
}

// NewHqshukeTestv1 creates a new instance of HqshukeTestv1, bound to a specific deployed contract.
func NewHqshukeTestv1(address common.Address, backend bind.ContractBackend) (*HqshukeTestv1, error) {
	contract, err := bindHqshukeTestv1(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1{HqshukeTestv1Caller: HqshukeTestv1Caller{contract: contract}, HqshukeTestv1Transactor: HqshukeTestv1Transactor{contract: contract}, HqshukeTestv1Filterer: HqshukeTestv1Filterer{contract: contract}}, nil
}

// NewHqshukeTestv1Caller creates a new read-only instance of HqshukeTestv1, bound to a specific deployed contract.
func NewHqshukeTestv1Caller(address common.Address, caller bind.ContractCaller) (*HqshukeTestv1Caller, error) {
	contract, err := bindHqshukeTestv1(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1Caller{contract: contract}, nil
}

// NewHqshukeTestv1Transactor creates a new write-only instance of HqshukeTestv1, bound to a specific deployed contract.
func NewHqshukeTestv1Transactor(address common.Address, transactor bind.ContractTransactor) (*HqshukeTestv1Transactor, error) {
	contract, err := bindHqshukeTestv1(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1Transactor{contract: contract}, nil
}

// NewHqshukeTestv1Filterer creates a new log filterer instance of HqshukeTestv1, bound to a specific deployed contract.
func NewHqshukeTestv1Filterer(address common.Address, filterer bind.ContractFilterer) (*HqshukeTestv1Filterer, error) {
	contract, err := bindHqshukeTestv1(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1Filterer{contract: contract}, nil
}

// bindHqshukeTestv1 binds a generic wrapper to an already deployed contract.
func bindHqshukeTestv1(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(HqshukeTestv1ABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HqshukeTestv1 *HqshukeTestv1Raw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _HqshukeTestv1.Contract.HqshukeTestv1Caller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HqshukeTestv1 *HqshukeTestv1Raw) Transfer(opts *bind.TransactOpts) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.HqshukeTestv1Transactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HqshukeTestv1 *HqshukeTestv1Raw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.HqshukeTestv1Transactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_HqshukeTestv1 *HqshukeTestv1CallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _HqshukeTestv1.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_HqshukeTestv1 *HqshukeTestv1TransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_HqshukeTestv1 *HqshukeTestv1TransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.contract.Transact(opts, method, params...)
}

// Search is a free data retrieval call binding the contract method 0x00faded6.
//
// Solidity: function Search(string Quantity_Name) constant returns(string, string[], string[], string[])
func (_HqshukeTestv1 *HqshukeTestv1Caller) Search(opts *bind.CallOpts, Quantity_Name string) (string, []string, []string, []string, error) {
	var (
		ret0 = new(string)
		ret1 = new([]string)
		ret2 = new([]string)
		ret3 = new([]string)
	)
	out := &[]interface{}{
		ret0,
		ret1,
		ret2,
		ret3,
	}
	err := _HqshukeTestv1.contract.Call(opts, out, "Search", Quantity_Name)
	return *ret0, *ret1, *ret2, *ret3, err
}

// Search is a free data retrieval call binding the contract method 0x00faded6.
//
// Solidity: function Search(string Quantity_Name) constant returns(string, string[], string[], string[])
func (_HqshukeTestv1 *HqshukeTestv1Session) Search(Quantity_Name string) (string, []string, []string, []string, error) {
	return _HqshukeTestv1.Contract.Search(&_HqshukeTestv1.CallOpts, Quantity_Name)
}

// Search is a free data retrieval call binding the contract method 0x00faded6.
//
// Solidity: function Search(string Quantity_Name) constant returns(string, string[], string[], string[])
func (_HqshukeTestv1 *HqshukeTestv1CallerSession) Search(Quantity_Name string) (string, []string, []string, []string, error) {
	return _HqshukeTestv1.Contract.Search(&_HqshukeTestv1.CallOpts, Quantity_Name)
}

// Alter is a paid mutator transaction binding the contract method 0xa5f45fe1.
//
// Solidity: function Alter(string Quantity_Name, string Owner, string Price_Now) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Transactor) Alter(opts *bind.TransactOpts, Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.contract.Transact(opts, "Alter", Quantity_Name, Owner, Price_Now)
}

func (_HqshukeTestv1 *HqshukeTestv1Transactor) AsyncAlter(handler func(*types.Receipt, error), opts *bind.TransactOpts, Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, error) {
	return _HqshukeTestv1.contract.AsyncTransact(opts, handler, "Alter", Quantity_Name, Owner, Price_Now)
}

// Alter is a paid mutator transaction binding the contract method 0xa5f45fe1.
//
// Solidity: function Alter(string Quantity_Name, string Owner, string Price_Now) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Session) Alter(Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Alter(&_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Price_Now)
}

func (_HqshukeTestv1 *HqshukeTestv1Session) AsyncAlter(handler func(*types.Receipt, error), Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncAlter(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Price_Now)
}

// Alter is a paid mutator transaction binding the contract method 0xa5f45fe1.
//
// Solidity: function Alter(string Quantity_Name, string Owner, string Price_Now) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) Alter(Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Alter(&_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Price_Now)
}

func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) AsyncAlter(handler func(*types.Receipt, error), Quantity_Name string, Owner string, Price_Now string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncAlter(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Price_Now)
}

// Create is a paid mutator transaction binding the contract method 0x62dbc1fa.
//
// Solidity: function Create(string Quantity_Name, string Owner, string Spot, string Price_Origin, string Price_Now, string Quantity) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Transactor) Create(opts *bind.TransactOpts, Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.contract.Transact(opts, "Create", Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

func (_HqshukeTestv1 *HqshukeTestv1Transactor) AsyncCreate(handler func(*types.Receipt, error), opts *bind.TransactOpts, Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, error) {
	return _HqshukeTestv1.contract.AsyncTransact(opts, handler, "Create", Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

// Create is a paid mutator transaction binding the contract method 0x62dbc1fa.
//
// Solidity: function Create(string Quantity_Name, string Owner, string Spot, string Price_Origin, string Price_Now, string Quantity) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Session) Create(Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Create(&_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

func (_HqshukeTestv1 *HqshukeTestv1Session) AsyncCreate(handler func(*types.Receipt, error), Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncCreate(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

// Create is a paid mutator transaction binding the contract method 0x62dbc1fa.
//
// Solidity: function Create(string Quantity_Name, string Owner, string Spot, string Price_Origin, string Price_Now, string Quantity) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) Create(Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Create(&_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) AsyncCreate(handler func(*types.Receipt, error), Quantity_Name string, Owner string, Spot string, Price_Origin string, Price_Now string, Quantity string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncCreate(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name, Owner, Spot, Price_Origin, Price_Now, Quantity)
}

// Kill is a paid mutator transaction binding the contract method 0x121b4eab.
//
// Solidity: function Kill(string Quantity_Name) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Transactor) Kill(opts *bind.TransactOpts, Quantity_Name string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.contract.Transact(opts, "Kill", Quantity_Name)
}

func (_HqshukeTestv1 *HqshukeTestv1Transactor) AsyncKill(handler func(*types.Receipt, error), opts *bind.TransactOpts, Quantity_Name string) (*types.Transaction, error) {
	return _HqshukeTestv1.contract.AsyncTransact(opts, handler, "Kill", Quantity_Name)
}

// Kill is a paid mutator transaction binding the contract method 0x121b4eab.
//
// Solidity: function Kill(string Quantity_Name) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1Session) Kill(Quantity_Name string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Kill(&_HqshukeTestv1.TransactOpts, Quantity_Name)
}

func (_HqshukeTestv1 *HqshukeTestv1Session) AsyncKill(handler func(*types.Receipt, error), Quantity_Name string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncKill(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name)
}

// Kill is a paid mutator transaction binding the contract method 0x121b4eab.
//
// Solidity: function Kill(string Quantity_Name) returns(int256)
func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) Kill(Quantity_Name string) (*types.Transaction, *types.Receipt, error) {
	return _HqshukeTestv1.Contract.Kill(&_HqshukeTestv1.TransactOpts, Quantity_Name)
}

func (_HqshukeTestv1 *HqshukeTestv1TransactorSession) AsyncKill(handler func(*types.Receipt, error), Quantity_Name string) (*types.Transaction, error) {
	return _HqshukeTestv1.Contract.AsyncKill(handler, &_HqshukeTestv1.TransactOpts, Quantity_Name)
}

// HqshukeTestv1CreateResultIterator is returned from FilterCreateResult and is used to iterate over the raw logs and unpacked data for CreateResult events raised by the HqshukeTestv1 contract.
type HqshukeTestv1CreateResultIterator struct {
	Event *HqshukeTestv1CreateResult // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HqshukeTestv1CreateResultIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HqshukeTestv1CreateResult)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HqshukeTestv1CreateResult)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HqshukeTestv1CreateResultIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HqshukeTestv1CreateResultIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HqshukeTestv1CreateResult represents a CreateResult event raised by the HqshukeTestv1 contract.
type HqshukeTestv1CreateResult struct {
	Count *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterCreateResult is a free log retrieval operation binding the contract event 0x0000000000000000000000000000000000000000000000000000000038411b2e.
//
// Solidity: event CreateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) FilterCreateResult(opts *bind.FilterOpts) (*HqshukeTestv1CreateResultIterator, error) {

	logs, sub, err := _HqshukeTestv1.contract.FilterLogs(opts, "CreateResult")
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1CreateResultIterator{contract: _HqshukeTestv1.contract, event: "CreateResult", logs: logs, sub: sub}, nil
}

// WatchCreateResult is a free log subscription operation binding the contract event 0x0000000000000000000000000000000000000000000000000000000038411b2e.
//
// Solidity: event CreateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) WatchCreateResult(opts *bind.WatchOpts, sink chan<- *HqshukeTestv1CreateResult) (event.Subscription, error) {

	logs, sub, err := _HqshukeTestv1.contract.WatchLogs(opts, "CreateResult")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HqshukeTestv1CreateResult)
				if err := _HqshukeTestv1.contract.UnpackLog(event, "CreateResult", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseCreateResult is a log parse operation binding the contract event 0x0000000000000000000000000000000000000000000000000000000038411b2e.
//
// Solidity: event CreateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) ParseCreateResult(log types.Log) (*HqshukeTestv1CreateResult, error) {
	event := new(HqshukeTestv1CreateResult)
	if err := _HqshukeTestv1.contract.UnpackLog(event, "CreateResult", log); err != nil {
		return nil, err
	}
	return event, nil
}

// HqshukeTestv1InsertResultIterator is returned from FilterInsertResult and is used to iterate over the raw logs and unpacked data for InsertResult events raised by the HqshukeTestv1 contract.
type HqshukeTestv1InsertResultIterator struct {
	Event *HqshukeTestv1InsertResult // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HqshukeTestv1InsertResultIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HqshukeTestv1InsertResult)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HqshukeTestv1InsertResult)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HqshukeTestv1InsertResultIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HqshukeTestv1InsertResultIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HqshukeTestv1InsertResult represents a InsertResult event raised by the HqshukeTestv1 contract.
type HqshukeTestv1InsertResult struct {
	Count *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterInsertResult is a free log retrieval operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000dfc533ec.
//
// Solidity: event InsertResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) FilterInsertResult(opts *bind.FilterOpts) (*HqshukeTestv1InsertResultIterator, error) {

	logs, sub, err := _HqshukeTestv1.contract.FilterLogs(opts, "InsertResult")
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1InsertResultIterator{contract: _HqshukeTestv1.contract, event: "InsertResult", logs: logs, sub: sub}, nil
}

// WatchInsertResult is a free log subscription operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000dfc533ec.
//
// Solidity: event InsertResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) WatchInsertResult(opts *bind.WatchOpts, sink chan<- *HqshukeTestv1InsertResult) (event.Subscription, error) {

	logs, sub, err := _HqshukeTestv1.contract.WatchLogs(opts, "InsertResult")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HqshukeTestv1InsertResult)
				if err := _HqshukeTestv1.contract.UnpackLog(event, "InsertResult", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseInsertResult is a log parse operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000dfc533ec.
//
// Solidity: event InsertResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) ParseInsertResult(log types.Log) (*HqshukeTestv1InsertResult, error) {
	event := new(HqshukeTestv1InsertResult)
	if err := _HqshukeTestv1.contract.UnpackLog(event, "InsertResult", log); err != nil {
		return nil, err
	}
	return event, nil
}

// HqshukeTestv1RemoveResultIterator is returned from FilterRemoveResult and is used to iterate over the raw logs and unpacked data for
// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
//func (it *HqshukeTestv1RemoveResultIterator) Next() bool {
//	// If the iterator failed, stop iterating
//	if it.fail != nil {
//		return false
//	}
//	// If the iterator completed, deliver directly whatever's available
//	if it.done {
//		select {
//		case log := <-it.logs:
//			it.Event = new(HqshukeTestv1RemoveResult)
//			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
//				it.fail = err
//				return false
//			}
//			it.Event.Raw = log
//			return true
//
//		default:
//			return false
//		}
//	}
//	// Iterator still in progress, wait for either a data or an error event
//	select {
//	case log := <-it.logs:
//		it.Event = new(HqshukeTestv1RemoveResult)
//		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
//			it.fail = err
//			return false
//		}
//		it.Event.Raw = log
//		return true
//
//	case err := <-it.sub.Err():
//		it.done = true
//		it.fail = err
//		return it.Next()
//	}
//}
//
//// Error returns any retrieval or parsing error occurred during filtering.
//func (it *HqshukeTestv1RemoveResultIterator) Error() error {
//	return it.fail
//}
//
//// Close terminates the iteration process, releasing any pending underlying
//// resources.
//func (it *HqshukeTestv1RemoveResultIterator) Close() error {
//	it.sub.Unsubscribe()
//	return nil
//}

// HqshukeTestv1RemoveResult represents a RemoveResult event raised by the HqshukeTestv1 contract.
type HqshukeTestv1RemoveResult struct {
	Count *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterRemoveResult is a free log retrieval operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000e7769b56.
//
// Solidity: event RemoveResult(int256 count)

//func (_HqshukeTestv1 *HqshukeTestv1Filterer) FilterRemoveResult(opts *bind.FilterOpts) (*HqshukeTestv1RemoveResultIterator, error) {
//
//	logs, sub, err := _HqshukeTestv1.contract.FilterLogs(opts, "RemoveResult")
//	if err != nil {
//		return nil, err
//	}
//	return &HqshukeTestv1RemoveResultIterator{contract: _HqshukeTestv1.contract, event: "RemoveResult", logs: logs, sub: sub}, nil
//}

// WatchRemoveResult is a free log subscription operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000e7769b56.
//
// Solidity: event RemoveResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) WatchRemoveResult(opts *bind.WatchOpts, sink chan<- *HqshukeTestv1RemoveResult) (event.Subscription, error) {

	logs, sub, err := _HqshukeTestv1.contract.WatchLogs(opts, "RemoveResult")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HqshukeTestv1RemoveResult)
				if err := _HqshukeTestv1.contract.UnpackLog(event, "RemoveResult", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRemoveResult is a log parse operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000e7769b56.
//
// Solidity: event RemoveResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) ParseRemoveResult(log types.Log) (*HqshukeTestv1RemoveResult, error) {
	event := new(HqshukeTestv1RemoveResult)
	if err := _HqshukeTestv1.contract.UnpackLog(event, "RemoveResult", log); err != nil {
		return nil, err
	}
	return event, nil
}

// HqshukeTestv1UpdateResultIterator is returned from FilterUpdateResult and is used to iterate over the raw logs and unpacked data for UpdateResult events raised by the HqshukeTestv1 contract.
type HqshukeTestv1UpdateResultIterator struct {
	Event *HqshukeTestv1UpdateResult // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *HqshukeTestv1UpdateResultIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(HqshukeTestv1UpdateResult)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(HqshukeTestv1UpdateResult)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *HqshukeTestv1UpdateResultIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *HqshukeTestv1UpdateResultIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// HqshukeTestv1UpdateResult represents a UpdateResult event raised by the HqshukeTestv1 contract.
type HqshukeTestv1UpdateResult struct {
	Count *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterUpdateResult is a free log retrieval operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000d72ab475.
//
// Solidity: event UpdateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) FilterUpdateResult(opts *bind.FilterOpts) (*HqshukeTestv1UpdateResultIterator, error) {

	logs, sub, err := _HqshukeTestv1.contract.FilterLogs(opts, "UpdateResult")
	if err != nil {
		return nil, err
	}
	return &HqshukeTestv1UpdateResultIterator{contract: _HqshukeTestv1.contract, event: "UpdateResult", logs: logs, sub: sub}, nil
}

// WatchUpdateResult is a free log subscription operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000d72ab475.
//
// Solidity: event UpdateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) WatchUpdateResult(opts *bind.WatchOpts, sink chan<- *HqshukeTestv1UpdateResult) (event.Subscription, error) {

	logs, sub, err := _HqshukeTestv1.contract.WatchLogs(opts, "UpdateResult")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(HqshukeTestv1UpdateResult)
				if err := _HqshukeTestv1.contract.UnpackLog(event, "UpdateResult", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseUpdateResult is a log parse operation binding the contract event 0x00000000000000000000000000000000000000000000000000000000d72ab475.
//
// Solidity: event UpdateResult(int256 count)
func (_HqshukeTestv1 *HqshukeTestv1Filterer) ParseUpdateResult(log types.Log) (*HqshukeTestv1UpdateResult, error) {
	event := new(HqshukeTestv1UpdateResult)
	if err := _HqshukeTestv1.contract.UnpackLog(event, "UpdateResult", log); err != nil {
		return nil, err
	}
	return event, nil
}
