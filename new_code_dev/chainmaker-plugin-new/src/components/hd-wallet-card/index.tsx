import React from 'react';
import './index.less';
// TODO:确定性钱包-入口面板
export function HdWalletCard({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <div className="hd-wallet-card" onClick={onClick}>
      <div className="name">{name}</div>
    </div>
  );
}
