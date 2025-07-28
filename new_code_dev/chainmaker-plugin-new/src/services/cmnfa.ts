import { InvokeUserContract } from '../utils/interface';
import { NFTMetaData } from '../utils/storage';

export const getNFATransferContractContent = ({
  contractName,
  from,
  to,
  metadata,
  tokenId,
  gasLimit,
}: {
  contractName: string;
  from: string;
  tokenId: string;
  metadata: NFTMetaData;
  to: string;
  gasLimit?: number;
}): InvokeUserContract => ({
  contractName,

  params: {
    from,
    to,
    metadata: JSON.stringify(metadata),
    tokenId,
    time: (Date.now() / 1000) | 0,
  },
  method: 'TransferFrom',
  limit: { gasLimit },
});
