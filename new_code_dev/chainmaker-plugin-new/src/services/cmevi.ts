import { Result } from '../../web-sdk/grpc-web/common/result_pb';
import { base64decode, formatDate, initChainSdkFromStorage } from '../utils/utils';

export enum IdentityLevel {
  UN_AUTH,
  OFFICIAL_AUTH,
  OFFICIAL_COMPANY_AUTH,
  PERSON_AUTH,
}
export interface EvidenceDetail {
  // Id 业务流水号必填
  id: string;
  // Hash 哈希值必填
  hash: string;
  // TxId 存证时交易ID
  txId: string;
  // BlockHeight 存证时区块高度
  blockHeight: number;
  // Timestamp 存证时区块时间
  timestamp: number;
  // Metadata 可选，其他信息；具体参考下方 Metadata 对象。
  metadata: EvidenceMetadata;
}

export interface EvidenceMetadata {
  // HashType 哈希的类型，文字、文件、视频、音频等
  hashType: string;
  // HashAlgorithm 哈希算法，sha256、sm3等
  hashAlgorithm: string;
  // Username 存证人，用于标注存证的身份
  username: string;
  // Timestamp 可信存证时间
  timestamp: string;
  // ProveTimestamp 可信存证时间证明
  proveTimestamp: string;
  // 存证内容
  content: string;
  // 其他自定义扩展字段
  // ...
}

export async function findEviByHash({ account, chainId, contractName, eviHash }): Promise<EvidenceDetail> {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName,
    params: {
      hash: eviHash, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'FindByHash',
    withSyncResult: true,
  };
  try {
    const queryResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const contractResults = queryResult.contractResult;
    const eviResult = JSON.parse(base64decode(String(contractResults.result)));
    console.debug('eviResult', eviResult);
    const metadata = eviResult.metadata ? JSON.parse(eviResult.metadata) : {};
    const results = { ...eviResult, metadata };
    return results;
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return null;
  }
}
