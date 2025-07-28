/**
 * @Description: 查询gas余额
 * @param address: 查询账户的致信链地址
 * @return uint64: gas余额
 * @return error: 错误信息
 */
// GetBalance(address []byte) (uint64, error)

import { Result } from '../../web-sdk/grpc-web/common/result_pb';
import { accountSign, getChainConfig, initChainSdkFromStorage, isSupportHTTP } from '../utils/utils';
import { Account, InvokeUserContract, UserContract } from '../utils/interface';
import chainStorageUtils, { DidItem, VcItem } from '../utils/storage';
import {
  file2Uint8Array,
  stringToUint8Array,
  toHex,
  file2Txt,
  uint8Array2hex,
  base64Array2hex,
} from '../../web-sdk/glue';
import { httpsRequest } from './http';
import { verify } from 'crypto';

interface DidHttpsResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface DidDocument {
  id: string;
  created: string;
  updated: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyPem: string;
    address: string;
  }[];
  service: [
    {
      id: string;
      type: 'IssuerService';
      serviceEndpoint: string;
    },
  ];
}

const DID_VCS_PAGE = '/did/vc/list';
const DID_CONTRACT_NAME = 'DIDhy';
const DID_VERIFY_NUMBER = 'http://pre-api.cnbn.org.cn/api_manage/api/v1/did/verify/random';

export const isSupportDidChain = (chainId) => chainId === 'chainmaker_pk';
/**
 * @description 通过账户地址获取did
 * @author svenmanli
 * @date 12/01/2024
 * @param {{ account: Account; chainId: string }} { account, chainId }
 * @return {*}
 */
export const getDidByAddress = async ({ account, chainId }: { account: Account; chainId: string }) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName: DID_CONTRACT_NAME,
    params: {
      address: account.address, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'GetDidByAddress',
    withSyncResult: true,
  };
  try {
    const queryResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const contractResults = queryResult.contractResult;
    const did = typeof contractResults.result === 'string' ? atob(contractResults.result) : contractResults.result;
    if (queryResult.code === 0) {
      return did as string;
    }
    throw new Error(`getDidByAddress failed: ${did}`);
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return null;
  }
};

export const getDidDocument = async ({ account, chainId, did }: { account: Account; chainId: string; did: string }) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName: DID_CONTRACT_NAME,
    params: {
      did, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'GetDidDocument',
    withSyncResult: true,
  };
  try {
    const queryResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const contractResults = queryResult.contractResult;
    const json = typeof contractResults.result === 'string' ? atob(contractResults.result) : contractResults.result;
    const didDocument = JSON.parse(json as string);
    if (queryResult.code === 0) {
      console.debug('didDocument', didDocument);
      return didDocument as DidDocument;
    }
    throw new Error(`getDidByAddress failed: ${json}`);
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return null;
  }
};

export const getVcIssuers = async ({ account, chainId, did }: { account: Account; chainId: string; did: string }) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName: DID_CONTRACT_NAME,
    params: {
      did, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'GetVcIssuers',
    withSyncResult: true,
  };
  try {
    const queryResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const contractResults = queryResult.contractResult;
    const json = typeof contractResults.result === 'string' ? atob(contractResults.result) : contractResults.result;
    const issuerDids = JSON.parse(json as string);

    if (queryResult.code === 0) {
      return issuerDids;
    }
    throw new Error(`GetVcIssuers failed: ${json}`);
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return [];
  }
};

function base64ToHex(base64) {
  const raw = atob(base64);
  let hex = '';

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    const hexChar = code.toString(16).padStart(2, '0');
    hex += hexChar;
  }

  return hex;
}
export const createVPParems = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  did,
  verifier,
  account,
  verificationMethod,
  extend,
  vc,
}: {
  account: Account;
  verifier?: string;
  did?: string;
  vc?: any;
  extend?: Record<string, any>;
  verificationMethod: string;
}) => {
  const now = new Date();
  const exDate = new Date();
  exDate.setMinutes(exDate.getMinutes() + 60 * 24);
  const params = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
    id: `${now.getTime()}`,
    type: 'VerifiablePresentation',
    verifier,
    verifiableCredential: vc,
    extend,
    timestamp: now.toISOString(), // 时间戳秒
    presentationUsage: '身份验证',
    expirationDate: exDate.toISOString(),
  };
  if (!vc) {
    delete params.verifiableCredential;
  }
  if (!extend) {
    delete params.extend;
  }
  if (!verifier) {
    delete params.verifier;
  }

  const json = JSON.stringify(params);
  const hexParams = uint8Array2hex(stringToUint8Array(json));
  console.log(json, await accountSign({ account, hexStr: hexParams }));

  const proof = [
    {
      type: 'SM2Signature2022', // 证明类型
      created: now.toISOString(), // 证明时间,时间戳可以() RFC3339格式
      // "proofPurpose": "证明用途", //证明用途，可选
      proofPurpose: 'authentication',
      verificationMethod, // 用户公钥
      proofValue: await accountSign({ account, hexStr: hexParams }), // 签名
    },
  ]; // 证明结构

  // 获取签名
  return {
    ...params,
    proof,
  };
};

const VcStatusMap = {
  0: '正常',
  1: '吊销',
};
export const getVcList = async ({
  account,
  did,
  serviceEndpoint,
  issuer,
  verificationMethod,
}: {
  account: Account;
  did: string;
  serviceEndpoint: string;
  issuer: string;
  verificationMethod: string;
}) => {
  try {
    const params = await createVPParems({
      did,
      verifier: issuer,
      account,
      verificationMethod,
      extend: {
        page: {
          page: 1,
          size: 100,
        },
        issuer, // 签发者DID
        // "templateId": "100000", // 非必传
        status: 0, // VC状态 -1 0正常，1吊销
      },
    });
    const vcListRes = await httpsRequest<DidHttpsResponse<{ list: { vc: VcItem; status: 0 | 1 }[]; total: number }>>({
      url: serviceEndpoint + DID_VCS_PAGE,
      data: params,
    });
    return vcListRes.data.list.map((item) => ({
      ...item.vc,
      status: VcStatusMap[item.status],
    }));
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return [];
  }
};

export const getIssuersVcList = async ({
  issuers,
  account,
  did,
  chainId,
  verificationMethod,
}: {
  account: Account;
  did: string;
  chainId: string;
  issuers: string[];
  verificationMethod: string;
}): Promise<VcItem[]> => {
  const len = issuers.length;
  if (!len) return [];
  let count = 0;
  let result: VcItem[] = [];

  return await new Promise((res) => {
    issuers.forEach((issuer) => {
      (async () => {
        try {
          const didDoc = await getDidDocument({
            chainId,
            account,
            did: issuer,
          });
          console.debug('getIssuersVcList didDoc', didDoc);
          const { serviceEndpoint } = didDoc.service?.[0] || {};
          const vcList = await getVcList({
            account,
            did,
            serviceEndpoint: serviceEndpoint || 'http://192.168.1.181:30005/api_manage/api/v1',
            verificationMethod,
            issuer,
          });
          console.debug('vcList', vcList);
          if (result.length >= 100) return;
          if (vcList.length) {
            result = result.concat(vcList);
          }
        } catch (error) {
          console.debug('getIssuersVcList error', error);
        }
        count += 1;
        if (count >= len || result.length > 100) {
          console.debug('vcList result', result);
          res(result);
        }
      })();
    });
  });
};

// 获取did下所有vc
export const getDidVcList = async ({ account, chainId, did, verificationMethod }) => {
  console.debug('getDidVcList', did, chainId);
  const issuers = await getVcIssuers({ account, chainId, did });
  const vcList = await getIssuersVcList({ issuers, account, did, chainId, verificationMethod });
  chainStorageUtils.setDidVCList({ chainId, did, vcList });
  return vcList;
};

// 获取链下所有账号did
export const getChainsDidList = async ({ chainId }: { chainId: string }) => {
  const accounts = await chainStorageUtils.getChainAccounts(chainId);
  return await new Promise((res) => {
    const len = accounts.length;
    let count = 0;
    const results = [];

    accounts.forEach((account) => {
      (async function () {
        const did = await getDidByAddress({ account, chainId });
        if (did && results.indexOf(did) === -1) {
          results.push(did);
        }
        count += 1;
        if (count >= len) {
          res(results);
        }
      })();
    });
  });
};
export const getAccountDid = async ({ chainId, account }: { chainId: string; account: Account }) => {
  // 远程数据更新
  const chainCurrentDid = await getDidByAddress({ account, chainId });
  if (!chainCurrentDid) {
    // 如果链上did移除，本地有就清除
    // chainStorageUtils.clearAccountDidDocument({ chainId, accountAddress: account.address });
    return null;
  }

  const chainDocument = await getDidDocument({ account, chainId, did: chainCurrentDid });
  const accounts = await chainStorageUtils.getChainAccounts(chainId);
  const { id, created, updated } = chainDocument;
  const doc = {
    id,
    createTime: created,
    updateTime: updated,
    deactivated: false,
    accounts: chainDocument.verificationMethod.map((item) => {
      const account = accounts.find((ac) => ac.address === item.address);
      const { color = '', name = '' } = account || {};
      return {
        id: item.id,
        address: item.address,
        name,
        color,
      };
    }),
  };

  chainStorageUtils.saveDidDocument({
    chainId,
    didItem: doc,
  });

  return doc;
};

// 使用场景:通过上传私钥新建/导入账号， 通过助记词导入账号，通过助记词导入钱包创建账号
export const updateAccountDidAndVc = async ({ chainId, account }: { chainId: string; account: Account }) => {
  // 链数据更新
  if (!isSupportDidChain(chainId)) return;
  const chainDidDoc = await getAccountDid({ account, chainId });
  if (chainDidDoc) {
    await getDidVcList({
      account,
      did: chainDidDoc.id,
      chainId,
      verificationMethod: chainDidDoc.accounts.find((ele) => ele.address === account.address)?.id,
    });
  }
};

export const verifyNonce = async ({ vp }: { vp: string }) => {
  // 获取公共公钥

  const res = await httpsRequest<DidHttpsResponse<null>>({
    url: DID_VERIFY_NUMBER,
    body: vp,
  });
  return res.code === 200;
};

export const getAuthVc = async ({
  vc,
  verifier,
  account,
}: {
  vc: VcItem;
  // dapp提供的三方did
  verifier: string;
  account: Account;
}) => {
  // 获取公共公钥

  const signVc = await accountSign({ account, hexStr: toHex(JSON.stringify(vc)) });
  // 签
  return {
    signVc,
    verifier,
    // 验证有效时间（10分钟）
    expirationData: '',
  };
};

// sign did
