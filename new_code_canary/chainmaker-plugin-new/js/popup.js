window.addEventListener('DOMContentLoaded', () => {
    // 1. 获取 requestId 参数
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
  
    if (!requestId) {
      console.error('Missing requestId');
      return;
    }
  
    // 2. 动态插入一个授权按钮
    const container = document.getElementById('popup');
    const button = document.createElement('button');
    button.textContent = '授权连接钱包';
    button.style.padding = '10px 20px';
    button.style.margin = '20px';
    button.style.fontSize = '16px';
  
    container.appendChild(button);
  
    // 3. 点击后发送授权响应
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'authorize-response',
        requestId,
        accounts: ['0xABCD1234567890...'] // 你可以替换为真实的地址
      });
  
      window.close(); // 关闭弹窗
    });
  });
  