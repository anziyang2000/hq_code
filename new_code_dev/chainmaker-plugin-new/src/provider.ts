declare global {
  interface Window {
    shukechain?: any;
  }
}

class ChanganEthereumProvider {
  isMetaMask = false;
  isChangan = true;
  selectedAddress: string | null = null;
  chainId: string = '0x1'; // 你可以根据具体链修改，比如 Changan 为自定义 chainId
  private eventListeners: { [key: string]: Function[] } = {};

  private currentRequest: {
    handler: (event: MessageEvent) => void;
    timeoutId: number;
    controller: AbortController;
  } | null = null;
  

  isConnected() {
    return true;
  }

  request({ method, params }: { method: string; params?: any }) {
    console.log('📤 [ChanganEthereumProvider] request 被调用:', method, params);
  
    // 模拟处理常见基础请求，避免插件后台没实现导致报错
    if (method === 'eth_blockNumber') {
      // 返回一个模拟的区块号，比如十六进制字符串
      return Promise.resolve('0x10d4f');
    }
    if (method === 'eth_chainId') {
      // 返回你的链ID，例子是主网1
      return Promise.resolve(this.chainId || '0x1');
    }
    if (method === 'net_version') {
      return Promise.resolve(parseInt(this.chainId, 16).toString());
    }
    if (method === 'eth_accounts') {
      // 返回当前地址数组，或空数组
      return Promise.resolve(this.selectedAddress ? [this.selectedAddress] : []);
    }
  
    // 其他请求通过 postMessage 转发给插件后台
    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString() + Math.random().toString(16).slice(2);
  
      window.postMessage(
        {
          target: 'changan-forward-to-extension',
          method,
          params,
          requestId,
        },
        '*'
      );

      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data?.target === 'changan-injected-response' && data?.requestId === requestId) {
          window.removeEventListener('message', handler);
          console.log('[✅ PROVIDER] 收到响应:', data);
  
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data.result);
          }
        }
      };

      window.addEventListener('message', handler);

      setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  }

  // ✅ send 方法兼容 send(method, params) 和 send(payload, callback)
  send(methodOrPayload: any, paramsOrCallback?: any) {
    if (typeof methodOrPayload === 'string') {
      return this.request({ method: methodOrPayload, params: paramsOrCallback });
    } else if (typeof methodOrPayload === 'object' && methodOrPayload.method) {
      const payload = methodOrPayload;
      const callback = paramsOrCallback;

      this.request({ method: payload.method, params: payload.params })
        .then((result) => {
          callback(null, {
            jsonrpc: '2.0',
            id: payload.id,
            result,
          });
        })
        .catch((error) => {
          callback(error, null);
        });
    }
  }

  // ✅ sendAsync 方法（legacy）
  sendAsync(payload: any, callback: (error: any, response: any) => void) {
    this.request({ method: payload.method, params: payload.params })
      .then((result) => {
        callback(null, {
          jsonrpc: '2.0',
          id: payload.id,
          result,
        });
      })
      .catch((error) => {
        callback(error, null);
      });
  }

  // ✅ 事件监听
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeListener(event: string, callback: Function) {
    const listeners = this.eventListeners[event];
    if (!listeners) return;
    this.eventListeners[event] = listeners.filter((cb) => cb !== callback);
  }

  // ✅ 内部调用（由 content-script 发事件来触发）
  _emit(event: string, data: any) {
    console.log(`[📣 PROVIDER] 触发事件 ${event}:`, data);

    if (event === 'accountsChanged') {
      this.selectedAddress = data[0] || null;
    }

    if (event === 'chainChanged') {
      this.chainId = data;
    }

    const callbacks = this.eventListeners[event] || [];
    callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error(`Error in ${event} listener:`, e);
      }
    });
  }
}

// ✅ 自动注入到 window.shukechain
if (!window.shukechain) {
  const changan = new ChanganEthereumProvider();
  window.shukechain = changan;

  // ✅ 监听 content-script 发送过来的事件
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source !== window) return;
    const { target, event: eventName, eventName: injectedEventName, data } = event.data || {};

    if (target === 'changan-emit') {
      changan._emit(eventName, data);
    } else if (target === 'changan-injected-event' && injectedEventName) {
      changan._emit(injectedEventName, data);
    }
  });

  console.log('[✅ Changan Wallet] 已挂载 window.shukechain');
}

export {};
