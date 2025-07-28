/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import md5 from 'md5';
import {
  ChainMakerRequest,
  CreateUserContractRequest,
  InvokeUserContractRequest,
  SendRequestParam,
} from './event-page';
import { WebSDK } from './web-sdk';

async function handler(request: ChainMakerRequest<any, any>) {
  request.operation !== 'debug' && console.log('sdk call, params', request);
  window.postMessage(request, '*');
}

const createResponseMessage = () => {
  const map = {};
  function addResponseMessage(ticket: string, fn: (value: unknown) => void) {
    map[ticket] = fn;
  }
  window.addEventListener('message', (event) => {
    if (event.source !== window) {
      return;
    }
    // console.log("addEventListener response:", event);
    const { data, ticket, operation } = event.data;
    if (map[ticket] && (data?.status === 'done' || data?.status === 'error')) {
      map[ticket](data);
    }
    if (window.chainMaker?.event_list?.[operation]?.length) {
      // window.chainMaker.event_list?.[operation](data);
      window.chainMaker.emit(operation, data);
    }
  });
  return addResponseMessage;
};

const addResponseMessage = createResponseMessage();

export class PluginSDK {
  chainId: string;
  accountAddress: string;
  constructor(chainId?: string, accountAddress?: string) {
    this.chainId = chainId;
    this.accountAddress = accountAddress;
  }
}

window.chainMaker = {
  ...(window.chainMaker || {}),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  version: require('../package.json').version,
  createUserContract: (req: Omit<CreateUserContractRequest, 'operation'>, callback?: any) => {
    handler({
      ...req,
      operation: 'createUserContract',
    });
    if (typeof callback === 'function') {
      const ticket = md5(Math.random().toString());
      addResponseMessage(ticket, callback);
    }
  },
  invokeUserContract: (req: Omit<InvokeUserContractRequest, 'operation'>, callback?: any) => {
    handler({
      ...req,
      operation: 'invokeUserContract',
    });
    if (typeof callback === 'function') {
      const ticket = md5(Math.random().toString());
      addResponseMessage(ticket, callback);
    }
  },
  sendRequest: (operation: string, info?: any, callback?: (res: any) => void) => {
    const ticket = md5(Math.random().toString());
    let params;
    if (typeof operation !== 'string') {
      callback = info;
      params = operation;
    } else {
      params = {
        ...info,
        operation,
      };
    }
    handler({
      ...params,
      ticket,
    });
    if (typeof callback === 'function') {
      addResponseMessage(ticket, callback);
    }
  },
  getWebSDK: (chainId?: string, accountAddress?: string) => new WebSDK(chainId, accountAddress),
  set debug(debug: boolean) {
    handler({
      body: {
        debug,
      },
      operation: 'debug',
    });
  },
  event_list: {},
  // 订阅
  on(event, fn) {
    const _this = this;
    // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
    // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
    (_this.event_list[event] || (_this.event_list[event] = [])).push(fn);
    return _this;
  },
  // 监听一次
  once(event, fn) {
    // 先绑定，调用后删除
    const _this = this;
    function on(data) {
      _this.off(event, on);
      fn.apply(_this, [data]);
    }
    on.fn = fn;
    _this.on(event, on);
    return _this;
  },
  // 取消订阅
  off(event, fn) {
    const _this = this;
    const fns = _this.event_list[event];
    // 如果缓存列表中没有相应的 fn，返回false
    if (!fns) return false;
    if (!fn) {
      // 如果没有传 fn 的话，就会将 event 值对应缓存列表中的 fn 都清空
      fns && (fns.length = 0);
    } else {
      // 若有 fn，遍历缓存列表，看看传入的 fn 与哪个函数相同，如果相同就直接从缓存列表中删掉即可
      let cb;
      for (let i = 0, cbLen = fns.length; i < cbLen; i++) {
        cb = fns[i];
        if (cb === fn || cb.fn === fn) {
          fns.splice(i, 1);
          break;
        }
      }
    }
    return _this;
  },
  // 发布
  emit(event, data) {
    const _this = this;
    // 第一个参数是对应的 event 值，直接用数组的 shift 方法取出
    const fns = [..._this.event_list[event]];
    // 如果缓存列表里没有 fn 就返回 false
    if (!fns || fns.length === 0) {
      return false;
    }
    // 遍历 event 值对应的缓存列表，依次执行 fn
    fns.forEach((fn) => {
      fn.apply(_this, [data]);
    });
    return _this;
  },
};
// window.chainMaker.emit("load");
window.chainMaker?.onLoad?.();


// SDK-新增兼容ETH代码
// 这是 sdk.ts 或者你注入的 provider.js 中的逻辑
let injected = false;

function generateRequestId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

if (!injected) {
  injected = true;
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const { method, params, target, requestId: incomingRequestId } = event.data;
    if (target !== 'changan-contentscript') return;

    const requestId = incomingRequestId || generateRequestId(); // 优先使用已有的 requestId

    // console.log('SDK------requestId:', requestId);
    // 这里只发消息给 content-script，不能用 chrome.runtime
    window.postMessage(
      {
        target: 'changan-forward-to-extension',
        method,
        params,
        requestId,
      },
      '*'
    );
  });
}

// window.addEventListener('message', async (event) => {
//   if (event.source !== window) return;
//   const { method, params, target } = event.data;
//   if (target !== 'changan-contentscript') return;

//   console.log('[Changan Wallet] DApp 请求方法:', method, params);

//   let result: any = null;
//   let error: any = null;

//   try {
//     switch (method) {
//       case 'eth_requestAccounts':
//         // alert('11111111111111111111');
//         console.log('11111111111111111111');

//         window.addEventListener('message', async (event) => {
//           if (event.source !== window) return;
//           const { method, params, target, requestId } = event.data;
//           if (target !== 'changan-contentscript') return;
        
//           console.log('[Changan Wallet] DApp 请求方法:', method, params);
        
//           // 转发请求到 background
//           chrome.runtime.sendMessage({ operation: method, params }, (response) => {
//             window.postMessage(
//               {
//                 target: 'changan-injected-response',
//                 method,
//                 requestId,
//                 result: response?.accounts || null,
//                 error: null,
//               },
//               '*'
//             );
//           });
//         });
//         // result = await getAccounts(); // 提示用户授权，返回地址
//         break;

//       case 'eth_accounts':
//         alert('22222222222222222222');
//         // result = await getAccounts(); // 不提示用户，直接返回地址
//         break;

//       case 'eth_chainId':
//         alert('33333333333333333333');
//         // result = await getChainId(); // 返回 chainId，16 进制字符串，如 "0x2710"
//         break;

//       case 'eth_sendTransaction':
//         alert('44444444444444444444');
//         // result = await sendTransaction(params); // 启动弹窗，用户确认交易
//         break;

//       default:
//         error = 'Unsupported method';
//         break;
//     }
//   } catch (e: any) {
//     error = e.message || String(e);
//   }

//   window.postMessage(
//     {
//       target: 'changan-injected-response',
//       method,
//       result,
//       error,
//     },
//     '*'
//   );
// });

