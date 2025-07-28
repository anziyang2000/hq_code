// official_bns

import { Result } from '../../web-sdk/grpc-web/common/result_pb';
import { base64decode, initChainSdkFromStorage } from '../utils/utils';
import { Account } from '../utils/interface';

export const getAccountAddressByBNS = async ({
  chainId,
  account,
  domain,
}: {
  chainId: string;
  account: Account;
  domain: string;
}) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 10000 });

  const params: Record<string, any> = {
    domain,
    resourceType: '1',
    _QUE4RY_CONTRAoT: true,
  };

  const result = (await chainClient.callUserContract.queryContract({
    contractName: 'official_bns',
    params,
    method: 'Resolve', // GetDomainInfo
    withSyncResult: false,
  })) as Result.AsObject;
  console.log('====getAccountAddressByBNS===result', result);
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return base64decode(String(result.contractResult.result));
};
