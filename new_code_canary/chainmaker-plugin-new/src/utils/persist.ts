// utils/persist.ts

// =========== NFT 导入管理 ===========
export function addImportedNFTContract(contractAddress: string) {
    const key = 'importedNFTContracts';
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    if (!existing.includes(contractAddress.toLowerCase())) {
      existing.push(contractAddress.toLowerCase());
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }
  
  export function getImportedNFTContracts(): string[] {
    return JSON.parse(localStorage.getItem('importedNFTContracts') || '[]') as string[];
  }
  
  // =========== ERC20 导入管理 ===========
  export type ImportedERC20Token = {
    address: string;
    symbol: string;
    decimals: number;
  };
  
  const ERC20_KEY = 'importedERC20Contracts';
  
  export function addImportedERC20Token(token: ImportedERC20Token) {
    const existing = JSON.parse(localStorage.getItem(ERC20_KEY) || '[]') as ImportedERC20Token[];
    const alreadyExists = existing.some(t => t.address.toLowerCase() === token.address.toLowerCase());
    if (!alreadyExists) {
      existing.push({
        address: token.address.toLowerCase(),
        symbol: token.symbol,
        decimals: token.decimals,
      });
      localStorage.setItem(ERC20_KEY, JSON.stringify(existing));
    }
  }
  
  export function getImportedERC20Tokens(): ImportedERC20Token[] {
    return JSON.parse(localStorage.getItem(ERC20_KEY) || '[]') as ImportedERC20Token[];
  }
  
  export function removeImportedERC20Token(address: string) {
    const existing = getImportedERC20Tokens();
    const filtered = existing.filter(t => t.address.toLowerCase() !== address.toLowerCase());
    localStorage.setItem(ERC20_KEY, JSON.stringify(filtered));
  }
  