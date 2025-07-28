import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageInfoCode, SendRequestParam } from '../event-page';
import { DetailPage } from '../utils/common';
import { Account } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { responseAccountInfo } from '../utils/utils';
import { AccountListComponent } from './account/account-list';
import { useChainStore } from './popup';
export default function AccountConnect() {
  const navigate = useNavigate();
  const { currentTab, selectedChain, setSelectedChain, chains, setCurrentAccount } = useChainStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAccounts, setShowAccounts] = useState<Account[]>([]);
  useEffect(() => {
    chainStorageUtils.getCurrentChainAccounts().then((res) => {
      setAccounts(res);
      const ls = res.filter((item) => item.authHosts?.includes(currentTab?.host));
      setShowAccounts(ls);
    });
  }, [chains]);
  const updateAccount = useCallback(
    (ac: Account) => {
      const ind = ac.authHosts?.indexOf(currentTab?.host);
      if (ind > -1) {
        ac.authHosts.splice(ind, 1);
      } else {
        if (!ac.authHosts) {
          ac.authHosts = [];
        }
        ac.authHosts.push(currentTab?.host);
      }
      setAccounts(accounts.slice());
    },
    [accounts],
  );
  const backToHome = useCallback(() => {
    navigate('/');
  }, []);
  const subAuth = useCallback(() => {
    const removed = showAccounts.filter((item) => !item.authHosts.includes(currentTab?.host));
    if (removed.length === 0) {
      navigate('/');
      return;
    }
    const ac = accounts.filter((item) => item.authHosts?.includes(currentTab?.host));
    const { chainName, chainId } = selectedChain;
    const currentAccount = accounts.filter((item) => item.isCurrent)[0];
    chainStorageUtils.setCurrentChainAccount(accounts).then(() => {
      chainStorageUtils.setCurrentAccount(currentAccount.address).then((res) => {
        setCurrentAccount(res);
        sendMessageToContentScript({
          operation: 'changeConnectedAccounts',
          data: {
            status: 'done',
            timestamp: getNowSeconds(),
            info: {
              code: MessageInfoCode.success,
              disconnectedAccounts: responseAccountInfo(removed, currentTab?.host),
              accounts: responseAccountInfo(accounts, currentTab?.host),
              chain: { chainName, chainId },
            },
          },
        });
        navigate('/');
      });
    });
  }, [accounts]);
  return (
    <>
      <DetailPage title={'连接详情'} backUrl={'/'}>
        <div className="connect-web-info">
          <img src={currentTab?.favIconUrl} />
          <div className="connect-web-addr">{currentTab?.host}</div>
        </div>
        <div className="connect-warning">已授权该站点访问区块链网络信息、链账户信息、以及发起交易申请的权限。</div>
        <div className="connect-account">
          <AccountListComponent
            accountClick={updateAccount}
            accounts={showAccounts}
            options={(acc) => (
              <div className="connect-list_op" onClick={() => updateAccount(acc)}>
                {acc.authHosts?.indexOf(currentTab?.host) > -1 && <img src="/img/select40.png" />}
              </div>
            )}
          />
        </div>
      </DetailPage>
      <div className={'flex-grow'} />
      <div className="main-options">
        <div className="connect-concel connect-bt" onClick={backToHome}>
          取消
        </div>
        <button className="connect-sub connect-bt" onClick={subAuth}>
          确定
        </button>
      </div>
    </>
  );
}
