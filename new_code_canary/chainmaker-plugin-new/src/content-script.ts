// content-script - 新增兼容 ETH 代码
function injectProvider() {
  const container = document.head || document.documentElement;
  if (!container) {
    console.warn('[Changan Wallet] 页面还没加载完，等待注入 provider');
    setTimeout(injectProvider, 50);
    return;
  }

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('js/provider.js');
  script.type = 'text/javascript';
  script.async = false;
  container.appendChild(script);
  script.onload = () => {
    console.log('[Changan Wallet] provider.js 成功注入');
    script.remove();
  };
}

injectProvider();

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const { method, params, target, requestId } = event.data;
  if (target !== 'changan-forward-to-extension') return;

  console.log('[content-script] 收到页面请求', method, params, requestId);

  chrome.runtime.sendMessage({ method, params, requestId }, (response) => {
    console.log('[content-script] 收到 background 响应', response, '对应请求ID:', requestId);

    // 更健壮的 result 提取逻辑，兼容直接返回对象的情况
    const result =
      typeof response === 'object' && response !== null && 'result' in response
        ? response.result
        : response;

    const error =
      typeof response === 'object' && response !== null && 'error' in response
        ? response.error
        : null;

    window.postMessage(
      {
        target: 'changan-injected-response',
        method,
        requestId,
        result,
        origin: window.location.origin,
        error,
      },
      '*'
    );
  });
});

// ✅ 监听 background / popup 推送的事件，转发给页面
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[content-script] 收到 background 消息', message);

  if (message.type === 'event' && message.eventName && message.data) {
    window.postMessage(
      {
        target: 'changan-injected-event',
        eventName: message.eventName,
        data: message.data,
      },
      '*'
    );
  }

  // ✅ 快捷处理 accountsChanged
  if (message.type === 'accountsChanged') {
    console.log('🔁 content-script 收到 accountsChanged，准备转发：', message.accounts);
    window.postMessage(
      {
        target: 'changan-injected-event',
        eventName: 'accountsChanged',
        data: message.accounts,
      },
      '*'
    );
  }

  // ✅ ✨ 新增：处理签名交易响应（包含用户取消）
  if (message.type === 'sign-tx-response') {
    console.log('[content-script] 转发 sign-tx-response 给页面', message);
    window.postMessage(
      {
        type: 'sign-tx-response', // DApp 页面通过这个字段识别消息
        requestId: message.requestId,
        error: message.error,
        result: message.result,
      },
      '*'
    );
  }
});






















/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { TabIdentifierClient } from 'chrome-tab-identifier';

console.log('content-script loaded.');
const tabIdClient = new TabIdentifierClient();

/**
 * 关于message类型定义
 * @see ExtensionResponse
 */
chrome.runtime.onMessage.addListener(
  (message) => {
    if (message.operation === 'debug') {
      console.log(`%c${message.data.detail}`, 'color:red');
    } else {
      window.postMessage(message, '*');
    }
    return true;
  },
);

window.addEventListener('message', function (event) {
  if (event.data.operation) {
    tabIdClient.getTabId().then(tabId => {
      chrome.runtime.sendMessage({
        ...event.data,
        tabId,
      });
    });
  }
});

function injectScript(file, node) {
  const th = document.getElementsByTagName(node)[0];  
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th.appendChild(s);
}

injectScript(chrome.runtime.getURL('js/sdk.js'), 'body');
