/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import moment from 'moment';
import { Account, AccountForm, Chain, InvokeUserContract, TxLog, UserContract } from './interface';
import chainStorageUtils, { ContractNFTItem, contractStoreUtils, ContractTxItem } from './storage';
import * as Sdk from '../../web-sdk';
import { file2Txt, file2Uint8Array, isRSA, isEC } from '../../web-sdk/glue';
import { ChainMakerTicket, MessageInfoCode } from '../event-page';
import { message } from 'tea-component';
import { TransactionInfo } from '../../web-sdk/grpc-web/common/transaction_pb';

import { X509, KJUR, hex2b64, KEYUTIL } from 'jsrsasign';
import { Result } from '../../web-sdk/grpc-web/common/result_pb';
import { ChainConfig } from '../../web-sdk/grpc-web/config/chain_config_pb.d';

import { getNowSeconds, sendMessageToContentScript } from './tools';
import { isOfficialChain, retryOfficialChain } from './official-chain';
import { CONTRACT_TYPE } from '../config/contract';
import { ethers } from 'ethers';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sm2SignWithPriKey, SM2_CURVE_NAME } = require('../../web-sdk/utils/sm3Sm2.js');
interface ContractInfo {
  method?: string;
  params?: Record<string, any>;
  contractName?: string;
}
interface TXRequestBaseParams {
  chainId: string;
  account: Account;
  contractInfo?: ContractInfo;
}
// type GetEthTxStatusParams = {
//   log: TxLog;
// };
/**
 * @description 代理服务地址
 */
export function pick<T extends Object, K extends keyof T>(obj: T, paths: K[] = []): Pick<T, K> {
  return paths.reduce((res: any, k) => {
    if (k in obj) {
      res[k] = obj[k];
    }
    return res;
  }, {});
}

export function omit<T, K extends keyof T>(obj: T, paths: K[] = []): Exclude<T, K> {
  return paths.reduce(
    (res: any, k) => {
      if (k in res) {
        delete res[k];
      }
      return res;
    },
    { ...obj },
  );
}

export async function initChainSdk(
  chain: Chain,
  account: {
    userSignKeyFile?: File;
    userSignCrtFile?: File;
    userPublicKeyFile?: File;
    orgId?: string;
  } = {},
  options: { timeout?: number } = {},
) {
  const setting = await chainStorageUtils.getSetting();
  return new Sdk.default.Sdk(
    chain.chainId,
    account.orgId,
    await file2Txt(account.userSignKeyFile),
    account.userSignCrtFile ? await file2Uint8Array(account.userSignCrtFile) : null,
    [
      {
        nodeAddr: chain.nodeIp,
        tlsEnable: chain.tlsEnable,
        httpSupport: chain.httpSupport,
        ...(chain.tlsEnable
          ? {
              // TLS的需要代理服务处理证书问题，因此需要传文件名参
              certFileName: chain.userTLSCrtFile,
              certKeyFileName: chain.userTLSKeyFile,
              nodeCrtFileName: chain.nodeTLSCrtFile,
              options: {
                hostName: chain.hostName || 'chainmaker.org',
              },
            }
          : {}),
      },
    ],
    options.timeout || 5 * 60 * 1000, // 5min
    chain.accountMode,
    {
      ...pick(setting, ['proxyHostname', 'proxyHostnameTls']),
      userPublicKeyFile: account.userPublicKeyFile ? await file2Txt(account.userPublicKeyFile) : null,
    },
  );
}

export async function initEthereumSdk(rpcUrl: string, privateKey: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // 校验链ID
  const network = await provider.getNetwork();
  if (network.chainId !== 3151908) {
    throw new Error(`链ID不匹配，期望为 3151908，实际为 ${network.chainId}`);
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  return { provider, wallet };
}

export async function initEthereumProvider(rpcUrl: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // 校验链ID
  // const network = await provider.getNetwork();
  // if (network.chainId !== 3151908) {
  //   throw new Error(`链ID不匹配，期望为 3151908，实际为 ${network.chainId}`);
  // }

  return provider;
}

/**
 * @description 初始化SDK Client
 */
export async function initChainSdkFromStorage(chainId: string, account: Account, options = {}) {
  const chain = await chainStorageUtils.getChain(chainId);
  const [userSignKeyFile, userSignCrtFile, userPublicKeyFile] = await chainStorageUtils.getUploadFiles([
    account.userSignKeyFile,
    account.userSignCrtFile,
    account.userPublicKeyFile,
  ]);
  const chainClient = await initChainSdk(
    chain,
    {
      userSignKeyFile,
      userSignCrtFile,
      userPublicKeyFile,
      orgId: account.orgId,
    },
    options,
  );
  return { chain, chainClient };
}

export async function getChainConfig(
  chain: Chain,
  account: Parameters<typeof initChainSdk>[1] = {},
): Promise<ChainConfig.AsObject> {
  const chainClient = await initChainSdk(chain, {
    userSignKeyFile: account.userSignKeyFile,
    userSignCrtFile: account.userSignCrtFile,
    userPublicKeyFile: account.userPublicKeyFile,
    orgId: account.orgId,
  });
  const chainConfig = await chainClient.chainConfig.getChainConfig();
  // console.debug('===getChainConfig===', chainConfig);
  return chainConfig;
}

/**
 * 初始化官方测试链
 */

export async function preCheckForSignature(chain: Chain) {
  if (chain.tlsEnable && chain.proxyURL && chain.proxyURL !== (await chainStorageUtils.getSetting()).proxyHostnameTls) {
    message.error({
      content: '添加该网络时使用的代理与当前代理地址TLS不一致，请重新添加该网络',
    });
    return false;
  }
  return true;
}

/**
 * @description 发起创建合约
 */
export async function createContract(
  chainId: Chain['chainId'],
  account: Account,
  userContract: UserContract,
  ticket: ChainMakerTicket,
) {
  sendMessageToContentScript({
    operation: 'createUserContract',
    ticket,
    data: {
      status: 'info',
      timestamp: getNowSeconds(),
      detail: '正在发起创建合约',
    },
  }); // 3
  const { chain, chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 10000 });
  const userContractFile = await chainStorageUtils.getUploadFile(userContract.contractFile);

  let result;

  try {
    // 多签投票部署
    if (userContract.MULTI_SIGN_REQ) {
      result = (await chainClient.callUserContract.invokeUserContract({
        contractName: 'MULTI_SIGN',
        method: 'REQ',
        params: {
          SYS_CONTRACT_NAME: 'CONTRACT_MANAGE',
          SYS_METHOD: 'INIT_CONTRACT',
          CONTRACT_RUNTIME_TYPE: 'DOCKER_GO',
          CONTRACT_NAME: userContract.contractName,
          CONTRACT_VERSION: userContract.contractVersion,
          CONTRACT_BYTECODE: await file2Uint8Array(userContractFile),
          ...userContract.params,
          _GAS_LIMIT: userContract.limit?.gasLimit,
        },
        withSyncResult: true,
      })) as {
        contractResult: TransactionInfo.AsObject;
        txId: string;
      };
    } else {
      // 常规部署
      result = (await chainClient.userContractMgr.createUserContract({
        ...userContract,
        contractName: userContract.contractName,
        contractVersion: userContract.contractVersion,
        contractFilePath: await file2Uint8Array(userContractFile),
        runtimeType: userContract.runtimeType,
        params: {
          ...userContract.params,
          _GAS_LIMIT: userContract.limit?.gasLimit,
        },
        userInfoList: [chainClient.userInfo],
        withSyncResult: true,
      })) as { contractResult: TransactionInfo.AsObject; txId: string };
    }
    if (typeof result.contractResult === 'string') {
      // 超时
      sendMessageToContentScript({
        operation: 'createUserContract',
        data: {
          status: 'done',
          timestamp: Date.now() / 1000,
          detail: '上链等待超时',
          info: {
            code: MessageInfoCode.timeout,
            txId: result.txId,
          },
        },
        ticket,
      });
      return await chainStorageUtils.addTxLog({
        txId: result.txId,
        chainId: chain.chainId,
        accountName: account.name,
        timestamp: Date.now() / 1000,
        code: 0,
        accountId: account.address,
        contractName: userContract.contractName,
        params: userContract.params,
        method: 'create',
        status: 'pending',
      });
    }
    const { contractResult } = result.contractResult.transaction.result;
    const { code } = contractResult;

    if (contractResult.gasUsed) {
      // 添加gas订阅交易记录
      await addSubscribeTxs({
        chainId,
        account,
        contractInfo: {
          contractName: CONTRACT_TYPE.GAS,
          params: userContract.params,
          method: 'INIT_CONTRACT',
        },
        contractResult: result.contractResult,
      });
    }

    await chainStorageUtils.addTxLog({
      txId: result.contractResult.transaction.payload.txId,
      chainId: chain.chainId,
      accountName: account.name,
      timestamp: result.contractResult.blockTimestamp,
      params: userContract.params,
      code,
      accountId: account.address,
      status: 'done',
    });
    sendMessageToContentScript({
      operation: 'createUserContract',
      data: {
        status: code === 0 ? 'done' : 'error',
        timestamp: result.contractResult.blockTimestamp,
        detail: contractResult.message,
        chainNodeResult: result.contractResult.transaction.result,
        info: {
          code: code === 0 ? MessageInfoCode.success : MessageInfoCode.error,
          txId: result.contractResult.transaction.payload.txId,
        },
      },
      ticket,
    });
  } catch (e) {
    console.error(e);
    message.error({
      content: `部署合约失败，请检查参数是否正确`,
    });
    sendMessageToContentScript({
      operation: 'createUserContract',
      data: {
        info: {
          code: MessageInfoCode.error,
          res: JSON.stringify(e),
        },
        status: 'done',
      },
      ticket,
    });
    throw new Error(e);
  }
}
export async function queryNFTNewestTxs({ chainId, account, contractName, tokenId }) {
  const queryTxs = {
    contractName, // erc721test
    params: {
      tokenId, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'TokenLatestTxInfo',
    withSyncResult: true,
  };
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = (await chainClient.callUserContract.queryContract(queryTxs)) as Result.AsObject;
    const txResults = result.contractResult;
    if (result.code !== 0) throw new Error(`获取nft最新交易数据失败：,txResults:${txResults.result}`);
    const tsxInfo = atob(String(txResults.result));
    return JSON.parse(tsxInfo);
  } catch (e) {
    console.error(e);
    return {};
    // message.error({
    //   content: '查询nft交易记录失败' + e.toString(),
    // });
  }
}

// chainId: Chain['chainId'],
// account: Account,
// userContract: InvokeUserContract,
export async function queryNFTList({ chainId, account, contractName }) {
  // 查询tokens
  const accountId = account.address;
  const queryTokens = {
    contractName, // erc721test
    params: {
      account: accountId, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'AccountTokens',
    withSyncResult: true,
  };
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = (await chainClient.callUserContract.queryContract(queryTokens)) as Result.AsObject;
    const txResults = result.contractResult;
    if (result.code !== 0) throw new Error(`查询nft失败,txResults:${txResults.result}`);
    const accountTokensResult = atob(String(txResults.result));

    const { tokens } = JSON.parse(accountTokensResult);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const NFTList = [];
    // 获取tokens metaData
    const historyNFTList = await contractStoreUtils.getContractNFT({ chainId, accountId, contractName });
    historyNFTList.forEach((ele) => {
      const index = tokens.indexOf(ele.tokenId);
      if (index !== -1) {
        // 提取有效metaData
        NFTList.push(ele);
        tokens.splice(index, 1);
      }
    });
    // // 获取更新nfg数据
    if (tokens.length) {
      const taskList = [];
      for (const tokenId of tokens) {
        taskList.push(getNFTMetadata({ account, chainId, contractName, tokenId }));
      }
      // getNFTMetadata 已做错无兼容，失败是返回 undefined不会 reject
      const taskListRes = await Promise.all(taskList);
      taskListRes.forEach((ele) => {
        if (ele) {
          NFTList.push(ele);
        }
      });
    }
    contractStoreUtils.setContractNFT({ chainId, accountId, contractName, NFTList });
    return NFTList;
  } catch (e) {
    return [];
    console.error(e);
    // message.error({
    //   content: '查询nft列表失败:' + e.toString(),
    // });
  }
}

export async function getNFTMetadata({ tokenId, contractName, account, chainId }) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName, // erc721
    params: {
      tokenId, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'TokenMetadata',
    withSyncResult: true,
  };
  try {
    const metaResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const metaTxResults = metaResult.contractResult;
    if (!metaTxResults.result) {
      return await getNFTTokenURI({ tokenId, contractName, account, chainId });
    }
    const metaDataResult = base64decode(String(metaTxResults.result));
    const metaData = JSON.parse(metaDataResult) as ContractNFTItem;
    metaData.tokenId = tokenId;
    return metaData;
  } catch (error) {
    console.error(error);
    // tokenURI
    // message.error({
    //   content: '查询nft metadata失败' + error.toString(),
    // });
  }
}

export async function getNFTTokenURI({ tokenId, contractName, account, chainId }) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName, // erc721
    params: {
      tokenId, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'TokenURI',
    withSyncResult: true,
  };
  try {
    const metaResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const metaTxResults = metaResult.contractResult;
    const tokenURI = base64decode(String(metaTxResults.result));
    if (!tokenURI) return;
    const metadata: ContractNFTItem = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('get', tokenURI, true);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send();
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`xhr request failed,status:${xhr.status}`));
        }
      };
    });
    metadata.tokenId = tokenId;
    return metadata;
  } catch (error) {
    console.error(error);
    // tokenURI
    // message.error({
    //   content: '查询nft metadata失败' + error.toString(),
    // });
  }
}

export async function balanceOf({ contractName, account, chainId }) {
  // 查询余额
  const queryContract = {
    contractName,
    params: {
      account: account.address, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'BalanceOf',
    withSyncResult: true,
  };
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = (await chainClient.callUserContract.queryContract(queryContract)) as Result.AsObject;
    const txResults = result.contractResult;
    const balanceOfResult = typeof txResults.result === 'string' ? atob(txResults.result) : txResults.result;
    if (result.code === 0) {
      return balanceOfResult as string;
    }
    throw new Error(`查询余额失败${balanceOfResult}`);
  } catch (e) {
    console.error(e);
    // message.error({
    //   content: '查询余额失败' + e.toString(),
    // });
  }
}

export async function getSymbol({ contractName, account, chainId }) {
  // 查询余额
  const queryContract = {
    contractName,
    params: {
      time: Math.round(Date.now() / 1000),
    },
    method: 'Symbol',
    withSyncResult: true,
  };

  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = (await chainClient.callUserContract.queryContract(queryContract)) as Result.AsObject;
    const txResults = result.contractResult;
    const symbolResult = typeof txResults.result === 'string' ? atob(txResults.result) : txResults.result;
    if (result.code === 0) {
      return symbolResult;
    }
    throw new Error(`查询失败${symbolResult}`);
  } catch (e) {
    console.error(e);
    // message.error({
    //   content: '查询失败' + e.toString(),
    // });
  }
}

export async function addSubscribeTxs({ chainId, account, contractInfo, contractResult }) {
  const { contractName, params, method } = contractInfo;
  const accountId = account.address;
  const subList = await contractStoreUtils.getSubscribe(chainId, contractName);
  const methodName = method === 'invoke_contract' ? params.method : method;

  const { contractType } = subList[0] || {};
  let txInfo: ContractTxItem = {
    txId: contractResult.transaction.payload.txId,
    method: methodName,
    timestamp: contractResult.blockTimestamp,
    height: contractResult.blockHeight,
    contractType,
    contractName,
    success: contractResult.transaction.result.contractResult.code === 0,
  };
  switch (contractType) {
    case CONTRACT_TYPE.GAS:
      // gas系统合约, 记录当前账户， gas消费额， to为空永用于扩展分发gas
      Object.assign(txInfo, {
        from: accountId,
        amount: String(contractResult.transaction.result.contractResult.gasUsed),
      });

      break;

    case CONTRACT_TYPE.CMDFA:
      // 只记录转账类型的交易 FT
      if (methodName === 'Transfer' || methodName === 'TransferFrom' || methodName === 'Mint') {
        Object.assign(txInfo, {
          from: methodName === 'TransferFrom' ? String(params.owner || params.from) : accountId,
          to: String(params.to || params.account),
          amount: String(params.amount),
          gasUsed: contractResult.transaction.result.contractResult.gasUsed,
        });

        if (methodName === 'Mint') {
          delete txInfo.from;
        }
      } else {
        txInfo = null;
      }

      break;
    // nft 不通过直上链交易存储
    case CONTRACT_TYPE.CMNFA:
      if (methodName === 'TransferFrom') {
        try {
          const { name, image, seriesName } = JSON.parse(params.metadata) || {};
          Object.assign(txInfo, {
            from: method === 'transferFrom' ? String(params.owner) : accountId,
            to: String(params.to),
            nftName: name || seriesName,
            nftImage: image,
            tokenId: params.tokenId,
            gasUsed: contractResult.transaction.result.contractResult.gasUsed,
          });
        } catch (error) {
          return console.log(`addSubscribeTxs failed ${CONTRACT_TYPE.CMNFA},${contractName}`, error);
        }
      } else {
        txInfo = null;
      }

      break;
    case CONTRACT_TYPE.CMEVI:
      // 存证合约执行Evidence时，保存参数中的Id和Hash
      if (methodName === 'Evidence') {
        Object.assign(txInfo, {
          eviId: params.id,
          eviHash: params.hash,
          operator: accountId,
        });
      }
      break;
    case 'OTHER':
      Object.assign(txInfo, {
        operator: accountId,
      });
      break;
    default:
      txInfo = null;
  }
  // console.log('addContractTxs', txInfo);
  if (txInfo) {
    await contractStoreUtils.addContractTxs({ chainId, contractName, txList: [txInfo] });
  }
}

export async function getSyncLogResult({ chainId, account, log }: TXRequestBaseParams & { log: TxLog }) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 20000 });
  const { txId, contractName, params = {}, method, timestamp } = log;
  // 10分钟未查询到结果（包含无交易）交易状态改为过期
  const isTimeOut = Date.now() / 1000 - timestamp >= 600;
  try {
    // const  tx = await this.getTxByTxId(txId);
    // if (tx && tx.transaction && tx.transaction.result && tx.transaction.result.contractResult) {

    // }
    const result = (await chainClient.callSystemContract.getTxByTxId(txId)) as TransactionInfo.AsObject;
    // console.log('getSyncLogResult', result);
    if (!result?.transaction?.result?.contractResult && isTimeOut) {
      return { code: 1 };
    }

    const { contractResult } = result.transaction.result;

    // 添加gas订阅交易记录
    if (contractResult.gasUsed) {
      await addSubscribeTxs({
        chainId,
        account,
        contractInfo: {
          contractName: CONTRACT_TYPE.GAS,
          params,
          method,
        },
        contractResult: result,
      });

      // 失败也计入、 计入订阅 成功code === 0
      if (method && method !== 'create') {
        await addSubscribeTxs({
          chainId,
          account,
          contractInfo: {
            contractName,
            params,
            method,
          },
          contractResult: result,
        });
      }
    }
    return contractResult;
  } catch (e) {
    console.error(e);
    if (isTimeOut) {
      return { code: 1 };
    }
    throw new Error(e);
  }
}

// export async function getSyncLogResultEth({ log }: GetEthTxStatusParams) {
//   const { txId, timestamp } = log;
//   const isTimeOut = Date.now() / 1000 - timestamp >= 600;

//   const provider = new ethers.providers.JsonRpcProvider(DEFAULT_MAINNET_RPC); // 固定节点

//   try {
//     const receipt = await provider.getTransactionReceipt(txId);

//     if (!receipt) {
//       if (isTimeOut) {
//         return { code: 1 };
//       }
//       return null;
//     }

//     return {
//       code: receipt.status === 1 ? 0 : 1,
//       blockNumber: receipt.blockNumber,
//       gasUsed: receipt.gasUsed.toString(),
//       status: receipt.status,
//       receipt,
//     };
//   } catch (err) {
//     console.error('getSyncLogResultEth error:', err);
//     if (isTimeOut) {
//       return { code: 1 };
//     }
//     throw err;
//   }
// }

/**
 * @description 上链
 */
export async function invokeContract(
  chainId: Chain['chainId'],
  account: Account,
  userContract: InvokeUserContract,
  ticket?: ChainMakerTicket,
) {
  const { chain, chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 10000 });

  const queryParameters: Record<string, any> = {
    ...userContract.params,
    // 添加gaslimit
    _GAS_LIMIT: userContract.limit?.gasLimit,
  };
  // 对执行合约时的合约文件进行转换
  if (userContract.params.CONTRACT_BYTECODE) {
    const userContractFile = await chainStorageUtils.getUploadFile(userContract.params.CONTRACT_BYTECODE as string);
    queryParameters.CONTRACT_BYTECODE = await file2Uint8Array(userContractFile);
  }

  try {
    const result = (await chainClient.callUserContract.invokeUserContract({
      contractName: userContract.contractName,
      params: queryParameters,
      method: userContract.method,
      withSyncResult: true,
    })) as {
      contractResult: TransactionInfo.AsObject;
      txId: string;
    };

    if (typeof result.contractResult === 'string') {
      // 超时
      sendMessageToContentScript({
        operation: 'invokeUserContract',
        data: {
          status: 'done',
          timestamp: Date.now() / 1000,
          detail: '上链等待超时',
          info: {
            code: MessageInfoCode.timeout,
            txId: result.txId,
          },
        },
        ticket,
      });

      await chainStorageUtils.addTxLog({
        txId: result.txId,
        chainId: chain.chainId,
        accountName: account.name,
        timestamp: Date.now() / 1000,
        code: 0,
        accountId: account.address,
        contractName: userContract.contractName,
        params: {
          ...userContract.params,
          _GAS_LIMIT: userContract.limit?.gasLimit,
        },
        method: userContract.method === 'invoke_contract' ? String(userContract.params.method) : userContract.method,
        status: 'pending',
      });
      return false;
    }

    const { contractResult } = result.contractResult.transaction.result;
    const { code } = contractResult;

    await chainStorageUtils.addTxLog({
      txId: result.contractResult.transaction.payload.txId,
      chainId: chain.chainId,
      accountName: account.name,
      timestamp: result.contractResult.blockTimestamp,
      params: {
        ...userContract.params,
        _GAS_LIMIT: userContract.limit?.gasLimit,
      },
      code,
      accountId: account.address,
      status: 'done',
    });
    sendMessageToContentScript({
      operation: 'invokeUserContract',
      data: {
        status: code === 0 ? 'done' : 'error',
        timestamp: result.contractResult.blockTimestamp,
        detail: contractResult.message,
        chainNodeResult: result.contractResult.transaction.result,
        info: {
          code: code === 0 ? MessageInfoCode.success : MessageInfoCode.error,
          txId: result.contractResult.transaction.payload.txId,
        },
      },
      ticket,
    });
    if (contractResult.gasUsed) {
      await addSubscribeTxs({
        chainId,
        account,
        contractInfo: {
          ...userContract,
          contractName: CONTRACT_TYPE.GAS,
        },
        contractResult: result.contractResult,
      });
    }
    // console.log('invoke', result);
    // if (code === 0) {
    // 失败也计入、 计入订阅 成功code === 0
    await addSubscribeTxs({
      chainId,
      account,
      contractInfo: userContract,
      contractResult: result.contractResult,
    });
    // }
    // gas合约订阅单独执行，无论成败

    return contractResult;
  } catch (e) {
    console.error(e);
    message.error({
      content: `发起上链失败，请检查参数是否正确`,
    });
    sendMessageToContentScript({
      operation: 'invokeUserContract',
      data: {
        status: 'done',
        info: {
          code: MessageInfoCode.error,
          res: JSON.stringify(e),
        },
      },
      ticket,
    });
    throw new Error(e);
  }
}

/**
 * @description
 * 目前不支持公钥模式
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const accountModeOptions = [
  {
    text: 'PermissionedWithCert',
    value: 'permissionedWithCert',
  },
  {
    text: 'Public',
    value: 'public',
  },
];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const protocolOptions = [
  {
    value: 'GRPC',
    text: 'gRPC连接',
  },
  {
    value: 'HTTP',
    text: 'HTTP直连',
  },
];
export const isSupportHTTP = (chain: Chain) => chain.protocol === 'HTTP';
export function uploadCerts(userTLSKeyFile: File, userTLSCrtFile: File) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise<{ crtFileName: string; keyFileName: string }>(async (resolve, reject) => {
    const setting = await chainStorageUtils.getSetting();
    const xhr = new XMLHttpRequest();
    xhr.open('post', `${setting.proxyHostnameTls}/upload-cert`, true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(
      JSON.stringify({
        crtFile: await file2Txt(userTLSCrtFile),
        keyFile: await file2Txt(userTLSKeyFile),
      }),
    );
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject();
      }
    };
  });
}

export function deleteUpstreamCerts(crtFileName: string, keyFileName: string, nodeCrtFileName: string) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise<void>(async (resolve, reject) => {
    const setting = await chainStorageUtils.getSetting();
    const xhr = new XMLHttpRequest();
    xhr.open('delete', `${setting.proxyHostnameTls}/upload-cert`, true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(
      JSON.stringify({
        crtFileName,
        keyFileName,
        nodeCrtFileName,
      }),
    );
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject();
      }
    };
  });
}

export function formatDate(date, template = 'MM-DD HH:mm:ss') {
  return moment(date).format(template);
}

export async function readNameFromCert(certFile: File) {
  if (!certFile) {
    return null;
  }
  try {
    const certStr = await file2Txt(certFile);
    const x = new X509(certStr);
    return x.getSubjectString().match(/(?<=CN=).+$/)?.[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

// 链未链接时，更新链信息
export async function updateChainConfig(chain: Chain, accountValues: AccountForm, lackTLS) {
  if (isOfficialChain(chain)) {
    return await retryOfficialChain(accountValues, chain);
  }
  let newChain;
  // const pluginSetting = await chainStorageUtils.getSetting();
  // if (lackTLS) {
  //   const { crtFileName, keyFileName } = await uploadCerts(accountValues.userTLSKeyFile, accountValues.userTLSCrtFile);
  //   newChain = {
  //     ...chain,
  //     userTLSCrtFile: crtFileName,
  //     userTLSKeyFile: keyFileName,
  //     proxyURL: pluginSetting.proxyHostnameTls,
  //   };
  // } else {
  //   newChain = {
  //     ...chain,
  //     proxyURL: chain.tlsEnable ? pluginSetting.proxyHostnameTls : pluginSetting.proxyHostname,
  //   };
  // }
  const chainConfig = await getChainConfig(newChain, {
    userSignKeyFile: accountValues.userSignKeyFile,
    //userSignCrtFile: accountValues.userSignCrtFile,
    userPublicKeyFile: accountValues.userPublicKeyFile,
    orgId: accountValues.orgId,
  });
  newChain.version = chainConfig.version;
  newChain.enableGas = chainConfig.accountConfig?.enableGas;

  return await chainStorageUtils.updateChain(chain.chainId, newChain);
}

export const isLackTLSChain = (chain: Chain) =>
  // chain.accountMode === 'permissionedWithCert'
  chain?.tlsEnable && !chain.httpSupport && (!chain.userTLSKeyFile || !chain.userTLSCrtFile);

/**
 * 文件名称后缀去掉
 * @param filename
 */
export const trimFileNameSuffix = (filename: string) => filename.match(/.+(?=\.\w+$)/)[0];

export async function getChainVersion(hostName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `${hostName}/v1/getversion`, true);
    xhr.send();
    xhr.onerror = (err) => {
      console.error('onerror', err);
      reject({ code: 0 });
    };
    xhr.onabort = (err) => {
      console.error('onabort', err);
    };
    xhr.onreadystatechange = () => {};
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject({ code: xhr.status });
      }
    };
  });
}
// export const shortStr = (str: string, start = 12, end = 12) => {
//   if (str.length > start + end) {
//     return `${str.slice(0, start)}......${str.slice(0 - end)}`;
//   }
//   return str;
// };
export const shortStr = (str?: string, start = 12, end = 12) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length > start + end) {
    return `${str.slice(0, start)}......${str.slice(str.length - end)}`;
  }
  return str;
};


/**
 * 使用私钥签名
 * @param hexContent
 * @param privateKey 私钥字符串
 * @param alg ?sm2
 * @returns signHex
 */
export const priKeySign = ({
  hexContent,
  privateKey,
  alg,
}: {
  hexContent: string;
  privateKey: string;
  alg?: 'sm2';
}) => {
  let res;
  const privateKeyObj = KEYUTIL.getKey(privateKey);
  console.debug('privateKeyObj.curveName', privateKeyObj.curveName, privateKeyObj);
  if (privateKeyObj.curveName === SM2_CURVE_NAME || alg === 'sm2') {
    res = sm2SignWithPriKey(hexContent, privateKey);
  } else if (!isRSA(privateKey) && !isEC(privateKey)) {
    throw new Error('不支持该算法');
  } else {
    const signature = new KJUR.crypto.Signature({
      alg: isRSA(privateKey) ? 'SHA256withRSA' : 'SHA256withECDSA',
    });
    signature.init(privateKeyObj);
    signature.updateHex(hexContent);
    res = signature.sign();
  }
  return res;
};

/**
 * @description
 * @author svenmanli
 * @date 25/05/2023
 * @param {Account} account
 * @param {hexString} hexStr the hex string
 * @param {string} base64 'base64' | 'hex'
 * @param {string} alg 'sm2' | 'hex'
 * @return {*} base64 sig
 */

export const accountSign = async ({
  account,
  hexStr,
  resCode = 'base64',
  alg,
}: {
  account: Account;
  hexStr: string;
  resCode?: 'base64' | 'hex';
  alg?: 'sm2';
}): Promise<string> => {
  const userPrivateKeyFile = await chainStorageUtils.getUploadFile(account.userSignKeyFile);
  const privateKey = await file2Txt(userPrivateKeyFile);
  const signHex = priKeySign({ hexContent: hexStr, privateKey, alg });
  return resCode === 'hex' ? signHex : hex2b64(signHex);
};

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
export const base64decode = (str) => {
  try {
    const bc = str.replace(/=/g, '').split('');
    let c;
    let b;
    let bs = '';
    bc.forEach((item) => {
      c = '';
      for (let z = 0, l = base64Chars.length; z < l; z++) {
        if (item === base64Chars[z]) {
          c = z;
          break;
        }
      }
      if (c === '') {
        // throw new Error('编码有误');
        return str;
      }
      b = Number(c).toString(2);
      if (b.length < 6) {
        b = `00000${b}`.slice(-6);
      }
      bs += b;
    });
    const j = Math.floor(bs.length / 8);
    let i;
    let ha = '';
    let hb;
    for (i = 0; i < j; i++) {
      hb = parseInt(bs.slice(i * 8, i * 8 + 8), 2).toString(16);
      if (hb.length < 2) hb = `00${hb}`.slice(-2);
      ha += `%${hb}`;
    }
    return decodeURIComponent(ha);
  } catch (e) {
    return str;
  }
};

export const responseAccountInfo = (accounts, host?: string) =>
  accounts.map((account) => {
    if (account) {
      const { color, address, isCurrent, authHosts, name, signBase64 } = account;
      return { color, name, address, isCurrent, isConnect: host ? authHosts?.includes(host) : false, signBase64 };
    }
    return account;
  });

export const showHeadandTail = (str, limit) => {
  if (str.length <= limit * 2) return str;
  const head = str.substring(0, limit);
  const tail = str.substring(str.length - limit, str.length);
  return `${head}......${tail}`;
};

export const createPemFile = function (base64Str, filename, type = '') {
  if (!base64Str) return null;
  const parts = new Blob([base64Str], { type: 'application/x-pem-file' });
  const file = new File([parts], filename, { type }) as File & string;
  return file;
  // 公钥证书： "application/x-x509-ca-cert"
  // 私钥：""
};

// 下载文件
export const downloadFile = (filename: string, data: string | ArrayBuffer, type = 'text/plain') => {
  const blob = new window.Blob([data], { type });
  // @ts-ignore
  if (window.navigator.msSaveOrOpenBlob) {
    // @ts-ignore
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = document.createElement('a');
    elem.target = '_blank';
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
// 复制到剪切板
export function copyToClipboard(text: string, successMsg = '复制成功') {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const successful = document.execCommand('copy');
  if (successful) {
    message.success({ content: successMsg });
  } else {
    message.error({ content: '复制失败' });
  }

  document.body.removeChild(textArea);
}

// 打乱数组
export function shuffleArray(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// 不满10补0
export function zero(number: number) {
  return number < 10 ? `0${number}` : number.toString();
}
