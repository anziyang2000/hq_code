// import ERC1155ABI from '../popup/contract-abi/ERC1155.json';
// import ERC404ABI from '../popup/contract-abi/ERC404.json';
// import ERC20ABI from '../popup/contract-abi/ERC20.json';
// import {
//   ERC1155_CONTRACT_ADDRESS,
//   ERC404_CONTRACT_ADDRESS,
//   ERC20_CONTRACT_ADDRESS
// } from '@src/config/contract';

// // 统一转小写，方便匹配
// export const ABI_REGISTRY: Record<string, any[]> = {
//   [ERC1155_CONTRACT_ADDRESS.toLowerCase()]: ERC1155ABI,
//   [ERC404_CONTRACT_ADDRESS.toLowerCase()]: ERC404ABI,
//   [ERC20_CONTRACT_ADDRESS.toLowerCase()]: ERC20ABI,
// };

import ERC1155ABI from '../popup/contract-abi/ERC1155.json';
import ERC404ABI from '../popup/contract-abi/ERC404.json';
import ERC20ABI from '../popup/contract-abi/ERC20.json';
import ExchangeABI from '../popup/contract-abi/Exchange.json';
import MarketPlaceABI from '../popup/contract-abi/MarketPlace.json';
import ProofABI from '../popup/contract-abi/Proof.json';
import LogicABI from '../popup/contract-abi/Logic.json';
import LoanABI from '../popup/contract-abi/Loan.json';
import {
  ERC1155_CONTRACT_ADDRESS,
  ERC404_CONTRACT_ADDRESS,
  ERC20_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
  PROOF_CONTRACT_ADDRESS,
  LOGIC_CONTRACT_ADDRESS,
  LOAN_CONTRACT_ADDRESS
} from '@src/config/contract';

interface ContractInfo {
  name: string;
  abi: any[];
}

export const ABI_REGISTRY: Record<string, ContractInfo> = {
  [ERC1155_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'ERC1155',
    abi: ERC1155ABI,
  },
  [ERC404_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'ERC404',
    abi: ERC404ABI,
  },
  [ERC20_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'ERC20',
    abi: ERC20ABI,
  },
  [EXCHANGE_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'Exchange',
    abi: ExchangeABI,
  },
  [MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'MarketPlace',
    abi: MarketPlaceABI,
  },
  [PROOF_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'Proof',
    abi: ProofABI,
  },
  [LOGIC_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'Logic',
    abi: LogicABI,
  },
  [LOAN_CONTRACT_ADDRESS.toLowerCase()]: {
    name: 'Loan',
    abi: LoanABI,
  },
};