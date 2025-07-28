import React, { useState } from 'react';
import { Button } from 'tea-component';
import { useLocation } from 'react-router-dom';
import './authorize-page.less';

const AuthorizePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { origin, requestId, account } = location.state || {};

  const handleCancel = () => {
    if (requestId) {
      chrome.runtime.sendMessage({
        type: 'authorize-response',
        requestId,
        accounts: null,
      });
    }
    window.close();
  };

  const handleConnect = () => {
    // console.log('授权页面requestId:', requestId);
    // console.log('授权页面account:', account);
    // console.log('授权页面account?.addres:', account?.address);
    // console.log('授权页面origin:', origin);
    if (!account?.address || !origin) return;
    
    setLoading(true);

    // 保存当前账户对 origin 的授权记录
    chrome.storage.local.get(['authorizedAccounts'], (res) => {
      const authorizedMap = res.authorizedAccounts || {};
      const list = new Set(authorizedMap[origin] || []);
      list.add(account.address);
      authorizedMap[origin] = Array.from(list);

      chrome.storage.local.set({ authorizedAccounts: authorizedMap }, () => {
        // 发消息给 background 脚本返回授权账户
        chrome.runtime.sendMessage(
          {
            type: 'authorize-response',
            requestId,
            accounts: [account.address],
          },
          () => {
            setLoading(false);
            window.close();
          }
        );
      });
    });
  };

  return (
    <div className="authorize-container">
      <h2 className="authorize-title">
        <div>{origin}</div>
        <div>请求连接</div>
      </h2>

      <div className="authorize-box">
        <div className="authorize-left">
          <div className="authorize-avatar">
            {account.address?.[2]?.toUpperCase() || '?'}
          </div>
          <div className="authorize-info">
            <div className="authorize-name">{account.name}</div>
            <div className="authorize-address">
              {account.address
                ? `${account.address.slice(0, 7)}...${account.address.slice(-5)}`
                : ''}
            </div>
          </div>
        </div>
        <div className="authorize-right">{/* 可拓展区域 */}</div>
      </div>

      <footer className="guide-footer-btn-group">
        <Button type="weak" onClick={handleCancel}>
          取消
        </Button>
        <Button type="primary" loading={loading} onClick={handleConnect}>
          连接
        </Button>
      </footer>
    </div>
  );
};

export default AuthorizePage;