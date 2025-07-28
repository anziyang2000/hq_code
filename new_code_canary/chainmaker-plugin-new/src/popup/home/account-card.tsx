import React, { useState, useEffect } from 'react';
import { Text, Copy } from 'tea-component';
import { Account } from '../../utils/interface';
import HeaderIcon from '../account/heaederIcon';
import EyeFilled from '@ant-design/icons/EyeFilled';
import EyeInvisibleFilled from '@ant-design/icons/EyeInvisibleFilled';
import './home.less';
import { showHeadandTail } from '../../utils/utils';

interface AccountCardProps {
  account: Account;
  onOpenSelect: () => void;
  balance?: string;
  onSendClick?: () => void;
}

export const AccountCard = (props: AccountCardProps) => <GasCard {...props} />;

const btn_click = () => {
  const web1 = window.open('about:blank');
  web1.location.href = 'http://192.168.10.127/withdraw';
};

const btn_click1 = () => {
  const web1 = window.open('about:blank');
  web1.location.href = 'http://192.168.10.127/save';
};

const btn_click2 = () => {
  const web2 = window.open('about:blank');
  web2.location.href = 'http://192.168.10.127/homePage';
};

const GasCard = ({ account, onOpenSelect, balance, onSendClick }: AccountCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('showBalance');
    if (saved !== null) {
      setShowBalance(saved === 'true');
    }
  }, []);

  const toggleBalance = () => {
    const newVal = !showBalance;
    setShowBalance(newVal);
    localStorage.setItem('showBalance', String(newVal));
  };

  return (
    <div className="account-gas-card">
      <div className="gas-account">
        <HeaderIcon color={account?.color} width={36} height={36} onClick={onOpenSelect} />
        <div className="gas-account-code">
          {/* 新增：显示地址名称 */}
          <div style={{ fontSize: 12, color: '#222', marginTop: 3, marginBottom: 2, height: 15 }} onClick={onOpenSelect}>
            {account.name}
          </div>
          {/* <Text onClick={onOpenSelect}>{showHeadandTail(account.address, 12)}</Text>{' '} */}
          <Text onClick={onOpenSelect} theme="weak">{showHeadandTail(account.address, 12)}</Text>{' '}
          <span style={{ color: '#999' }}>
            <Copy text={account.address} onCopy={() => false} />
          </span>
        </div>
      </div>

      <div className="gas-balance" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="gas">
          余额：{showBalance ? (balance || 0) : '••••••••••••'}
        </span>
        <span
          onClick={toggleBalance}
          style={{ cursor: 'pointer', fontSize: '18px' }}
          title={showBalance ? '隐藏余额' : '显示余额'}
        >
          {showBalance ? <EyeFilled/> : <EyeInvisibleFilled/>}
        </span>
      </div>

      <div>
        <span style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <button className="send-btn" onClick={btn_click1}>充值</button>
          <button className="send-btn" onClick={btn_click}>提现</button>
          <button className="send-btn" onClick={btn_click2}>业务</button>
          <button className="send-btn" onClick={onSendClick}>转账</button>
        </span>
      </div>
    </div>
  );
};
