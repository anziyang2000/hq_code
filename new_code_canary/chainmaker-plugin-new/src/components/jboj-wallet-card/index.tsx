import React from 'react';
import './index.less';
// TODO:非确定性钱包-入口面板
export function JbokWalletCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="jbok-wallet-card" onClick={onClick}>
      <div className="name">未分类钱包</div>
    </div>
  );
}
