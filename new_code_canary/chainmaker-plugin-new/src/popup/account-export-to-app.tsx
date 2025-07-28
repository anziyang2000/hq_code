import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageInfoCode, SendRequestParam } from '../event-page';
import { ConfirmModal } from '../utils/common';
import { AccountOption } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { accountSign, responseAccountInfo } from '../utils/utils';
import { AccountListComponent } from './account/account-list';
import { useChainStore } from './popup';
import { file2Txt } from '../../web-sdk/glue';

export default function AccountExportToApp() {
  const location = useLocation();
  const pageState = location.state as SendRequestParam;
  const navigate = useNavigate();
  const { currentTab, selectedChain, setSelectedChain, chains } = useChainStore();
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
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
      const options: AccountOption[] = res.map((ac) => ({
        ...ac,
        selected: false,
      }));
      setAccounts(options);
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
  const updateAccount = (ac: AccountOption) => {
    if (!pageState.body?.isSingle) {
      ac.selected = !ac.selected;
      setAccounts(accounts.slice());
    } else {
      setAccounts(
        accounts.map((acc) => {
          acc.selected = acc.address === ac.address;
          return acc;
        }),
      );
    }
  };
  const backToHome = () => {
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '插件取消授权',
    });
    navigate('/');
  };
  const subAuth = () => {
    const ac = accounts.filter((item) => item.selected);
    if (!ac.length) {
      return;
    }
    const { chainName, chainId } = selectedChain;
    const resAccounts = responseAccountInfo(ac);
    const signAccounts = [];
    (async () => {
      for (let i = 0; i < ac.length; i++) {
        // 签名
        const selectAc = ac[i];
        const signBase64 = await accountSign({ account: selectAc, hexStr: selectAc.address });
        const singAccount = { ...resAccounts[i], signBase64 };
        // 提取公钥户证书
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
      navigate('/');
    })();
  };
  return (
    <div className="connect-web-page">
      <div className="page-title">请求授权导出链账户</div>
      <div className="current-web-info">
        <img src={currentTab?.favIconUrl} />
        <div className="current-web-addr">{currentTab?.host}</div>
      </div>
      <div className="connect-warning">
        申请获取链账户信息，授权后将把指定的链账户的地址以及公钥信息，同步给该应用。
      </div>
      <div className="connect-account">
        <AccountListComponent
          accountClick={updateAccount}
          accounts={accounts}
          options={(acc) => (
            <div className="connect-list_op" onClick={() => updateAccount(acc as AccountOption)}>
              {(acc as AccountOption).selected && <img src="/img/select40.png" />}
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
          确认授权
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
