import { InvokeUserContract } from '../utils/interface';

export const getFATransferContractContent = ({
  contractName,
  amount,
  to,
  gasLimit,
}: {
  contractName: string;
  amount: number;
  to: string;
  gasLimit?: number;
}): InvokeUserContract => ({
  contractName,
  params: {
    amount,
    to,
    time: (Date.now() / 1000) | 0,
  },
  method: 'Transfer',
  limit: { gasLimit },
});
