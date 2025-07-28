declare module '*.svg' {
  const content: any;
  export default content;
}

type ContractType = 'CMID' | 'CMDFA' | 'CMNFA' | 'GAS' | 'OTHER' | 'CMEVI' | 'ERC20' | 'ERC721' | 'ERC1155' | 'ERC404' | 'Proof' | 'Exchange' | 'MarketPlace' | 'Logic' | 'Loan';
// type OfficialChainId = 'chainmaker_testnet_chain' | 'chainmaker_testnet_pk' | 'chainmaker_pk';
type OfficialChainId = '32849';