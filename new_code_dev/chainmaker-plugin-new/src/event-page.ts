import { getContractName } from './utils/getMethodName';


// background-新增兼容ETH代码
// ✅ 替换原先的 pendingRequests 类型定义
const pendingRequests: Record<string, { type: 'authorize' | 'sign'; respond: (response: any) => void }> = {};
const ports: { [key: string]: chrome.runtime.Port } = {};
// 定义一个全局对象来暂存消息
const pendingTxMessages: { [requestId: string]: { tx: any, origin: string, requestId: string } } = {};

// 监听来自页面的连接
chrome.runtime.onConnect.addListener((port) => {
  console.log('[background] 新连接:', port.name);
  ports[port.name] = port;

  // 检查是否有暂存的 tx 消息要发
  const pending = pendingTxMessages[port.name];
  if (pending) {
    console.log('[background] ⏳ 延迟发送 tx 消息:', pending);
    port.postMessage(pending);
    delete pendingTxMessages[port.name];
  }

  port.onDisconnect.addListener(() => {
    console.log('[background] 连接断开:', port.name);
    delete ports[port.name];
  });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const operation = request.operation || request.method;
  const { params, requestId, type, method } = request;
  const origin = sender.url ? new URL(sender.url).origin : 'unknown';
  
  console.log('[background] ✅ 接收到 operation:', operation, 'params:', params);
  console.log('[background] 收到完整请求:', { operation, params, requestId, type, origin });

  if (operation) {
    switch (operation) {
      case 'eth_accounts': {
        chrome.storage.local.get('activeAuthorizedAccount', (res) => {
          const activeAccount = res.activeAuthorizedAccount?.[origin];
          sendResponse(activeAccount ? [activeAccount] : []);
        });
        return true;
      }

      case 'eth_requestAccounts': {
        (chrome.system as any).display.getInfo((displays: any[]) => {
          const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
          const screenWidth = primaryDisplay.workArea.width;

          chrome.windows.create({
            url: chrome.runtime.getURL('popup.html') + `?requestId=${requestId}&origin=${encodeURIComponent(origin)}`,
            type: 'popup',
            height: 640,
            width: 377,
            top: 0,
            left: screenWidth - 357,
          });

          pendingRequests[requestId] = {
            type: 'authorize', // ✅ 修改
            respond: sendResponse,
          };
        });
        return true;
      }

      // 你原来的拦截交易处理部分，改成用已保存的 port 发送消息
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction': {
        console.log('[background] ✅ 拦截交易:', operation, params);

        const [tx] = params;

        console.log('events--------operation:', operation);
        console.log('events--------params:', params);
        
        const contractName = getContractName(tx);
        console.log('[解析函数名] 获取到合约名:', contractName);
        if (!tx) {
          sendResponse({ error: 'Missing transaction parameter' });
          return true;
        }

        (chrome.system as any).display.getInfo(async (displays: any[]) => {
          const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
          const screenWidth = primaryDisplay.workArea.width;

          const requestId = request.requestId || `${Date.now()}_${Math.random().toString(36).slice(2)}`;

          const popupUrl = chrome.runtime.getURL('popup.html') + `?route=sign&requestId=${requestId}`;

          // ✅ 查出账户信息，补全 tx.from 字段
          try {
            const accounts = await chainStorageUtils.getCurrentAccount();
            // console.log('background-------------accounts:', accounts);

            if (accounts) {
              tx.from = accounts; // 替换 from 为完整对象
            } else {
              console.warn('[background] ⚠️ 找不到 from 对应的账户信息，仅传地址');
            }
          } catch (err) {
            console.error('[background] ❌ 查找账户信息失败:', err);
          }

          chrome.windows.create({
            url: popupUrl,
            type: 'popup',
            height: 640,
            width: 377,
            top: 0,
            left: screenWidth - 357,
          });

          // 通过保存的 port 发送消息给 SignPage
          const messageToSend = { tx, origin, requestId, contractName  };
          const port = ports[requestId];
          if (port) {
            port.postMessage(messageToSend);
            console.log('[background] ✅ 立即发送消息到 sign 页:', messageToSend);
          } else {
            console.warn('[background] ⚠️ port 不存在，缓存等待连接:', requestId);
            pendingTxMessages[requestId] = messageToSend;
          }

          pendingRequests[requestId] = {
            type: 'sign',
            respond: sendResponse,
          };
        });

        return true;
      }

      case 'eth_getBalance': {
        console.log('[background] 处理 eth_getBalance 请求，参数:', params);
        const [address, blockTag] = params;
        fetch(DEFAULT_MAINNET_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, blockTag || 'latest'],
            id: requestId,
          }),
        })
          .then(res => res.json())
          .then(data => sendResponse(data.result || null))
          .catch(err => {
            console.error('[background] 查询余额失败:', err);
            sendResponse(null);
          });
        return true;
      }
      
      case 'eth_call': {
        fetch(DEFAULT_MAINNET_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: requestId,
            method: 'eth_call',
            params,
          }),
        })
          .then(res => res.json())
          .then(json => sendResponse(json.result))
          .catch(err => {
            console.error('eth_call 失败:', err);
            sendResponse(null);
          });
        return true;
      }

      case 'eth_estimateGas': {
        sendResponse('0x5208'); // 21000
        return true;
      }

      case 'eth_gasPrice': {
        sendResponse('0x3B9ACA00'); // 1 Gwei
        return true;
      }

      case 'eth_feeHistory': {
        sendResponse({
          baseFeePerGas: ['0x1a2b3c'],
          gasUsedRatio: [0.5],
          oldestBlock: '0x10',
          reward: [['0x5f5e100']],
        });
        return true;
      }

      case 'eth_getBlockByNumber': {
        fetch(DEFAULT_MAINNET_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params,
            id: requestId,
          }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('[background] 区块链完整响应:', data);
            
            if (!data || !data.result) {
              console.error('[background] 区块返回值为空或结构不对:', data);
              sendResponse(null);
              return;
            }
            console.log('[background] 返回区块数据:', data.result);
            
            sendResponse(data.result); // 👈 返回完整区块对象
          })
          .catch(err => {
            console.error('[background] 查询区块失败:', err);
            sendResponse(null);
          });
      
        return true;
      }

      case 'eth_getTransactionReceipt': {
        console.log('[background] 收到 eth_getTransactionReceipt 请求', params);
      
        fetch(DEFAULT_MAINNET_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params,
            id: requestId,
          }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('[background] 返回交易回执:', data);
            if (!data || !data.result) {
              console.error('[background] 回执为空:', data);
              sendResponse(null);
              return;
            }
      
            sendResponse(data.result); // 必须返回完整交易回执结构
          })
          .catch(err => {
            console.error('[background] 回执查询失败:', err);
            sendResponse(null);
          });
      
        return true;
      }

      default: {
        console.warn('[background] ❗ 未处理的 operation:', operation); // ✅ default 打印
        sendResponse({ error: `Unsupported operation: ${operation}` }); // ✅ 给个兜底响应
        return true;
      }
    }
  }

  // ✅ 自定义 type 处理
  if (type) {
    switch (type) {
      case 'authorize-response': {
        const { requestId, accounts } = request;
        console.log('[background] 处理授权响应，requestId:', requestId, 'accounts:', accounts);

        const pending = pendingRequests[requestId];
        if (pending?.type === 'authorize') {
          pending.respond({ accounts });
          delete pendingRequests[requestId];

          if (accounts && accounts.length > 0) {
            chrome.storage.local.get(['authorizedAccounts', 'activeAuthorizedAccount'], (res) => {
              const authorizedAccounts = res.authorizedAccounts || {};
              const activeAuthorizedAccount = res.activeAuthorizedAccount || {};

              for (const origin in authorizedAccounts) {
                if (authorizedAccounts[origin]?.includes(accounts[0])) {
                  activeAuthorizedAccount[origin] = accounts[0];
                }
              }

              chrome.storage.local.set({ activeAuthorizedAccount });
            });

            chrome.tabs.query({}, (tabs) => {
              for (const tab of tabs) {
                if (tab.id) {
                  chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (accounts: string[]) => {
                      window.postMessage({
                        target: 'changan-emit',
                        event: 'accountsChanged',
                        data: accounts,
                      }, '*');
                    },
                    args: [accounts],
                  });
                }
              }
            });
          }
        } else {
          console.warn('[background] authorize-response 收到未知 requestId 或类型不匹配:', requestId);
        }
        break;
      }

      case 'sign-tx-response': {
        const { requestId, rawTransaction, error } = request;
        console.log('[background] 处理签名交易响应，requestId:', requestId);
      
        const pending = pendingRequests[requestId];
        if (pending?.type === 'sign') {
          const respond = pending.respond;
          delete pendingRequests[requestId];
      
          if (error) {
            // respond({ error });
            respond({ error, result: null }); // 统一结构
            return;
          }

          fetch(DEFAULT_MAINNET_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_sendRawTransaction',
              params: [rawTransaction],
              id: requestId,
            }),
          })
            .then(async res => {
              try {
                const data = await res.json();
                if (data.result) {
                  respond(data.result);
                } else {
                  respond({ error: data.error || '未知错误' });
                }
              } catch (err) {
                console.error('[background] 返回不是 JSON:', err);
                respond({ error: '响应非 JSON 格式' });
              }
            })
            .catch(err => {
              console.error('[background] 发送原始交易失败:', err);
              respond({ error: err.message });
            });
      
        } else {
          console.warn('[background] sign-tx-response 收到未知 requestId 或类型不匹配:', requestId);
          // ✅ 保证 respond 一定会返回
          if (typeof sendResponse === 'function') {
            sendResponse({ error: '未知 requestId 或类型不匹配' });
          }
        }
        break;
      }

      case 'accountsChanged': {
        const { accounts } = request;
        console.log('[background] 收到 accountsChanged，准备广播', accounts);
        if (!accounts) break;

        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            if (tab.id) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (accounts: string[]) => {
                  window.postMessage({
                    target: 'changan-emit',
                    event: 'accountsChanged',
                    data: accounts,
                  }, '*');
                },
                args: [accounts],
              });
            }
          }
        });
        break;
      }
    }
  }
});























/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

// Listen to messages sent from other parts of the extension.
import chainStorageUtils, { settingStoreUtils } from './utils/storage';
import { Chain, InvokeUserContract, UserContract } from './utils/interface';
import { TabIdentifier } from 'chrome-tab-identifier';
import * as common_result_pb from '../web-sdk/grpc-web/common/result_pb';
import { getNowSeconds, sendMessageToContentScript } from './utils/tools';
import { DEFAULT_MAINNET_RPC } from './config/chain';

type ResponseStatus = 'info' | 'error' | 'warn' | 'success' | 'done';
export type ChainMakerTicket = any;
export type ChainMakerRequest<T, Y> = {
  operation: Y;
  /**
   * 网页透传票据信息，插件本身不做任何处理，只在消息返回时携带
   * 记录事件ID，比operation更为精细，一个event可以接收多次response返回
   */
  ticket?: ChainMakerTicket;
  /**
   * 链id
   */
  chainId?: string;
  /**
   * 用户地址
   */
  accountAddress?: string;
  body?: T;
  tabId?: number;
};

/**
 * 创建用户合约
 */
export type CreateUserContractRequest = ChainMakerRequest<UserContract, 'createUserContract'>;
/**
 * 调用用户合约
 */
export type InvokeUserContractRequest = ChainMakerRequest<InvokeUserContract, 'invokeUserContract'>;

/**
 * 导入链
 */
export type SendRequestImportChainConfig = ChainMakerRequest<Chain, string>;

/**
 * 导入账户
 */

interface AccountParams {
  // 文件名称
  userSignKeyName?: string;
  userSignCrtName?: string;
  userPublicKeyName?: string;
  // 文件内容
  userSignKeyContent: string;
  userSignCrtContent: string;
  userPublicKeyContent: string;
  name: string;
  crtName?: string;
  address?: string;
  orgId: string;
}

/**
 * 账户签名
 */
export interface AccountSignParams {
  /**
   * 返回编码格式
   * @default 'base64'
   */
  resCode?: 'hex' | 'base64';
  /**
   * 待签名十六进制字符
   * @default 'base64'
   */
  hexContent: string;
  /**
   * 指定算法，目只支持知道sm；，默认会根据私钥header信息和 ec椭圆曲线算法参数识别
   */
  alg?: 'sm2';
}

/**
 * did授权
 */
export interface DidAuthorityParams {
  /**
   * 链id
   */
  chainId: string;
  /**
   * 签名随机数
   */
  vp: string;
  /**
   * vp验证者did（dapp did）
   */
  verifier?: string;
}
export interface VcAuthorityParams extends DidAuthorityParams {
  /**
   * 指定需要授权的did
   */
  did?: string;
  /**
   * 用户地址
   */
  accountAddress?: string;
  /**
   * 指定vc类型
   * '100000': 个人实名认证
   * '100001': 企业实名认证
   */
  templateId?: '100000' | '100001';
}

export interface VerifyAccounts {
  /**
   * 链id
   */
  chainId: string;
  /**
   * 待校验账户地址列表
   */
  addressList: string[];
}

export type SendRequestAccountSignParams = ChainMakerRequest<AccountSignParams, string>;

export type SendRequestImportAccountConfig = ChainMakerRequest<AccountParams, string>;

export type SendRequestImportSubscribeContract = ChainMakerRequest<
  {
    chainId: string;
    contractName: string;
    contractType: ContractType;
  },
  string
>;

export type SendRequestSDK = ChainMakerRequest<
  {
    module: string;
    method: string;
    paramList: any[];
  },
  string
>;
/**
 * 调用通用
 */
export type SendRequestParam = ChainMakerRequest<any, string>;

/**
 * 拓展程序回复网页消息结构
 */
export interface ExtensionResponse {
  /**
   * 记录来自哪个操作的响应
   */

  operation?: string;

  ticket?: ChainMakerTicket;
  /**
   * 链id
   */
  chainId?: string;
  /**
   * 用户地址
   */
  accountAddreess?: string;

  data?: {
    /**
     * 如果是done/error，则为该ticket的最后一条消息，之后不会有任何消息发送
     */
    status: ResponseStatus;

    /**
     * 单位秒，针对交易后发回的时间为准确的出块时间等价于如下字段
     * @see TxLog.timestamp
     */
    timestamp?: number;

    /**
     * 详情，针对status=success时显示的信息为chainNodeResult.contractResult.message
     */
    detail?: string;

    /**
     * 链节点交易返回完整信息，这里透传暴露给接入dapp
     */
    chainNodeResult?: common_result_pb.Result.AsObject;

    /**
     *  其他 消息数据
     */
    info?: MessageInfo;
  };
}

type RuntimeMessageRequest = ChainMakerRequest<any, any> & {
  tabId: number;
  from?: string;
};
interface MessageResults {
  message?: string;
  info?: MessageInfo;
  status?: ResponseStatus;
}

export enum MessageInfoCode {
  success = 0,
  cancel = 1,
  error = 2,
  timeout = 3,
}
export type MessageInfo = {
  // 成功，取消，错误，超时
  code: MessageInfoCode;
  result?: any;
  message?: string;
  // 错误信息
  res?: string;
  // 接口自定义返回
  [key: string]: any;
};
new TabIdentifier();
const openPopup = async (request: RuntimeMessageRequest) => {
  await chainStorageUtils.setTempOperation(request);
  return new Promise((resolve, reject) => {
    chrome.windows.create(
      {
        url: `popup.html`,
        type: 'popup',
        height: 620,
        width: 357,
        left: 100,
        top: 100,
        focused: true,
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (v) => {
        try {
          // HACK
          chrome.runtime.getPlatformInfo((info) => {
            if (info.os === 'win') {
              // win下窗体宽度初始化时不正确
              chrome.windows.update(v.id, { width: 357 + 16 });
            }
          });
          const existVid = await settingStoreUtils.getWindowId();
          existVid &&
            chrome.windows.get(existVid, (window) => {
              window && chrome.windows.remove(existVid);
            });
          await settingStoreUtils.setWindowId(v.id);
          resolve(existVid);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

type Operationhandle = (request: RuntimeMessageRequest) => Promise<MessageResults | void>;
const defaultMessageResults: MessageResults = {
  message: '插件已唤起，请在插件继续操作',
  status: 'info',
};
class ChainMakerOperationHandler {
  handles: Record<string, Operationhandle> = {};
  register(name: string, handle: Operationhandle) {
    const nameList = name.replace(/\s/g, '').split(',');
    nameList.forEach((name) => {
      this.handles[name] = handle;
    });
  }
  async bootstrap(request: RuntimeMessageRequest): Promise<MessageResults> {
    try {
      if (typeof this.handles[request.operation] !== 'function') {
        throw new Error(`operation '${request.operation}' 未注册`);
      }
      const result = (await this.handles[request.operation](request)) || {};
      return { ...defaultMessageResults, ...result };
    } catch (error) {
      return {
        status: 'error',
        message: String(error),
      };
    }
  }
}
const chainMakerOperationHandler = new ChainMakerOperationHandler();
chainMakerOperationHandler.register('debug', async (request) => {
  if (!request.body) {
    return {
      message: 'request.body不能为空',
      status: 'error',
    };
  }
  const value = request.body.debug;
  await settingStoreUtils.setDebug(value);
  return {
    status: 'success',
    message: value ? 'debug模式开启，请小心操作' : 'debug模式已关闭',
  };
});
chainMakerOperationHandler.register('createUserContract,invokeUserContract', async (request) => {
  await openPopup(request);
  return {
    message: '插件已唤起，请在插件上选择网络/账户发起上链请求',
  };
});

chainMakerOperationHandler.register('openConnect,openAccountSignature,openAccountExport', async (request) => {
  await openPopup(request);
  return {
    message: '插件已唤起，请在插件上选择连接的账户',
  };
});
chainMakerOperationHandler.register(
  'importChainConfig,importAccountConfig,openAccountImportByMnemonic',
  async (request) => {
    await openPopup(request);
  },
);

chainMakerOperationHandler.register('importSubscribeContract', async (request) => {
  if (!request.body?.contractName || !request.body.chainId) {
    const msg = 'contractName、chainId不能为空';
    return {
      status: 'done',
      message: msg,
      info: {
        code: 2,
        res: msg,
      },
    };
  }
  await openPopup(request);
});

chainMakerOperationHandler.register('getConnectAccounts', async () => {
  const info: MessageInfo = await new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    chrome.tabs.query({ active: true }, async (tabs) => {
      try {
        const host = tabs[0].url?.match(/^https?:\/\/[^\/]+/)[0];
        const currentChainAccounts = await chainStorageUtils.getCurrentChainAccounts();
        const selectedChain = await chainStorageUtils.getSelectedChain();
        const accounts = currentChainAccounts
          .filter((item) => item.authHosts?.indexOf(host) > -1)
          .map((ac) => {
            const { color, address, isCurrent } = ac;
            return { color, address, isCurrent };
          });
        const { chainName, chainId } = selectedChain;
        resolve({
          code: 0,
          accounts,
          chain: { chainName, chainId },
        });
      } catch (error) {
        resolve({
          code: 2,
          accounts: [],
          chain: {},
          res: error.message,
        });
      }
    });
  });
  return { info, status: 'done' };
});

chainMakerOperationHandler.register('openDidAuthority, openVcAuthority', async (request) => {
  await openPopup(request);
  return {
    message: '插件已唤起，请在插件上选择连接的账户',
  };
});

chainMakerOperationHandler.register('verifyAccounts', async (request) => {
  const info: MessageInfo = await new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises

    (async () => {
      try {
        const { addressList, chainId } = request.body;
        const chainAccounts = await chainStorageUtils.getChainAccounts(chainId);
        const results = chainAccounts
          .filter((item) => addressList.indexOf(item.address) !== -1)
          .map((ac) => ac.address);
        resolve({
          code: 0,
          addressList: results,
        });
      } catch (error) {
        resolve({
          code: 2,
          addressList: [],
          res: error.message,
        });
      }
    })();
  });
  return { info, status: 'done' };
});

chainMakerOperationHandler.register('callSDK', async (request) => {
  await openPopup(request);
  return {
    message: '插件已唤起，请在插件上选择网络/账户发起上链请求',
  };
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener(async (request: RuntimeMessageRequest, _sender, sendResponse) => {
  // onMessage must return "true" if response is async.
  if (!request?.tabId || request.from === 'chainmaker-plugin') {
    return true;
  }
  await chainStorageUtils.setActiveTabId(request.tabId);

  const { status, message, info } = await chainMakerOperationHandler.bootstrap(request);
  sendMessageToContentScript({
    operation: request.operation,
    data: {
      status,
      detail: message,
      info,
      timestamp: getNowSeconds(),
    },
    ticket: request.ticket,
  });

  return true;
});

chrome.runtime.onMessageExternal.addListener(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-misused-promises
  async (_request, sender, sendResponse) =>
    // console.log(_request);
    true,
);

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    port.onDisconnect.addListener(async () => {
      const [login, lock] = await Promise.all([chainStorageUtils.getLogin(), chainStorageUtils.getLoginLock()]);
      if (login && !lock) {
        chainStorageUtils.setLoginLife();
      }
      // console.log('popup has been closed');
    });
  }
});