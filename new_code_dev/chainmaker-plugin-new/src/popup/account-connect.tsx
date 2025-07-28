import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageInfoCode, SendRequestParam } from '../event-page';
import { ConfirmModal } from '../utils/common';
import { Account } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { accountSign, responseAccountInfo } from '../utils/utils';
import { AccountListComponent } from './account/account-list';
import { useChainStore } from './popup';
import { file2Txt } from '../../web-sdk/glue';

export default function AccountConnect() {
  const location = useLocation();
  const pageState = location.state as SendRequestParam;
  const navigate = useNavigate();
  const { currentTab, selectedChain, setSelectedChain, chains, setCurrentAccount } = useChainStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const switchConfirmRef = useRef<typeof ConfirmModal>();
  const addConfirmRef = useRef<typeof ConfirmModal>();
  const sendMessage = useCallback((info) => {
    sendMessageToContentScript({
      operation: pageState.operation,
      ticket: pageState.ticket,
      data: {
        status: 'done',
        timestamp: getNowSeconds(),
        info,
      },
    });
  }, []);
  const getAccounts = useCallback(() => {
    chainStorageUtils.getCurrentChainAccounts().then((res) => {
      if (!res.length) {
        showAddAccount();
        return;
      }
      const hasConnect = res.filter((ac) => ac.authHosts?.includes(currentTab?.host));
      if (!hasConnect.length) {
        res.forEach((ac) => {
          if (ac.isCurrent) {
            if (!ac.authHosts) {
              ac.authHosts = [];
            }
            ac.authHosts.push(currentTab?.host);
          }
        });
      }
      setAccounts(res);
    });
  }, [currentTab]);
  const showAddAccount = useCallback(() => {
    // @ts-ignore
    addConfirmRef.current.show({
      confirm: async () => {
        navigate('/accounts/new', {
          state: {
            chain: selectedChain,
            initial: false,
          },
        });
      },
      close: () => {
        navigate('/');
      },
    });
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '缺少链账号',
    });
  }, [selectedChain]);
  useEffect(() => {
    if (!pageState) {
      return;
    }
    if (pageState?.chainId && pageState.chainId != selectedChain.chainId) {
      // console.log('chains', chains);
      const chain = chains.find((item) => item.chainId === pageState.chainId);
      if (!chain) {
        sendMessage({
          code: MessageInfoCode.error,
          res: '您指定的区块链网络未添加到插件里，请检查信息后重试。',
        });
        navigate('/', {
          state: {
            alert: '您指定的区块链网络未添加到插件里，请检查信息后重试。',
          },
        });
      }
      // @ts-ignore
      switchConfirmRef.current.show({
        confirm: async () => {
          await chainStorageUtils.setSelectedChain(chain);
          setSelectedChain(chain);
          getAccounts();
        },
        close: () => {
          sendMessage({
            code: MessageInfoCode.cancel,
            res: '插件拒绝了切换链',
          });
          navigate('/');
        },
      });
      return;
    }
    getAccounts();
  }, [pageState, chains, currentTab]);
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
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '插件取消授权',
    });
    navigate('/');
  }, []);
  const subAuth = useCallback(() => {
    chainStorageUtils.setCurrentChainAccount(accounts);
    const ac = accounts.filter((item) => item.authHosts?.includes(currentTab?.host));
    const currentAccount = accounts.filter((item) => item.isCurrent)[0];
    const { chainName, chainId } = selectedChain;
    const resAccounts = responseAccountInfo(ac, currentTab?.host);
    const signAccounts = [];
    (async () => {
      for (let i = 0; i < ac.length; i++) {
        // 签名
        const selectAc = ac[i];
        const signBase64 = await accountSign({ account: selectAc, hexStr: selectAc.address });
        const singAccount = { ...resAccounts[i], signBase64 };
        // 提前公钥户证书
        if (selectAc.userPublicKeyFile) {
          const userPublicKeyFile = await chainStorageUtils.getUploadFile(selectAc.userPublicKeyFile);
          singAccount.pubKey = await file2Txt(userPublicKeyFile);
        } else if (selectAc.userSignCrtFile) {
          const userSignCrtFile = await chainStorageUtils.getUploadFile(selectAc.userSignCrtFile);
          singAccount.signCrt = await file2Txt(userSignCrtFile);
        }
        signAccounts.push(singAccount);
      }
      sendMessage({
        code: MessageInfoCode.success,
        accounts: signAccounts,
        chain: { chainName, chainId },
      });
      chainStorageUtils.setCurrentChainAccount(accounts).then(() => {
        chainStorageUtils.setCurrentAccount(currentAccount.address).then((res) => {
          setCurrentAccount(res);
          navigate('/');
        });
      });
    })();
  }, [accounts, pageState]);
  return (
    <div className="connect-web-page">
      <div className="page-title">请求授权连接</div>
      <div className="current-web-info">
        <img src={currentTab?.favIconUrl} />
        <div className="current-web-addr">{currentTab?.host}</div>
      </div>
      <div className="connect-warning">
        申请建立连接，授权后将允许该站点访问区块链网络信息、链账户信息、以及发起交易申请的权限。
      </div>
      <div className="connect-account">
        <AccountListComponent
          accountClick={updateAccount}
          accounts={accounts}
          options={(acc) => (
            <div className="connect-list_op" onClick={() => updateAccount(acc)}>
              {acc.authHosts?.indexOf(currentTab?.host) > -1 && <img src="/img/select40.png" />}
            </div>
          )}
        />
      </div>
      <div className={'flex-grow'} />
      <div className="connect-options">
        <div className="connect-concel connect-bt" onClick={backToHome}>
          拒绝
        </div>
        <button className="connect-sub connect-bt" onClick={subAuth}>
          授权连接
        </button>
      </div>

      <ConfirmModal title={'切换网络'} confirmBtnText={'确定切换'} ref={switchConfirmRef}>
        {`Dapp请求切换到${pageState?.chainId}区块链网络，请确定是否要切换。`}
      </ConfirmModal>
      <ConfirmModal title={'添加链账户'} cancelBtnText="取消" confirmBtnText={'去添加'} ref={addConfirmRef}>
        {`当前网络尚无链账户，请先添加链账户，再进行授权连接操作。`}
      </ConfirmModal>
    </div>
  );
}
