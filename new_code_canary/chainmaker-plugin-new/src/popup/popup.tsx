/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useEffect, useState } from 'react';
import './account.less';
import ChainsPage from './chains-page';
import { MemoryRouter as Router, NavigateFunction, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './login-page';
import SendTransactionPage from './transaction/send-transaction';
import AccountAction from './account-action';
import CreateAccount from './create-account';
import ChainNewPage from './chain-new-page';
import ChainDetailPage from './chain-detail-page';
import chainStorageUtils from '../utils/storage';
import AccountsPage from './accounts-page';
import AccountNew from '../components/account-new';
import AccountNewPage from './account-new-page';
import SignaturePage from './transaction/signature-page';
import TransferConfirmPage from './transaction/transfer-confirm';
import TxLogsPage from './tx-logs-page';
import AuthorizePage from './authorize-page';
import SignPage from './sign-page'; // 确保路径正确
import SettingPage from './setting-page';
import LoginLockPage from './lock-page';
import HomePage from './home/home-page';
import { Account, AccountForm, Chain, Wallet } from '../utils/interface';
import { ChainPage } from '../utils/common';
import create from 'zustand';
import AboutPage from './about-page';
import SubscribeContractPage from './subscribe-contract-page';
import { ContractDetailPage } from './subscribe-detail/contract-detail';
import { TransactionDetailPage } from './subscribe-detail/transaction-detail';
import AccountConnect from './account-connect';
import AccountSignature from './account-signature';
import AccountConnectSetting from './account-connect-setting';
import '../iconsvg/index';
import { MessageInfoCode, SendRequestParam } from '../event-page';
import { isLackTLSChain, responseAccountInfo, updateChainConfig } from '../utils/utils';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import deepEqual from 'deep-equal';
import ChainImportPage from './chain-import-page';
import AccountImportPage from './account-import-page';
import { checkUpdateExpiredOfficialChainData } from '../utils/official-chain';
import ChainUpdatePage from './chain-update-page';
import HdWalletCreateByMnemonic from './wallet/hd-wallet-create-by-mnemonic';
import HdWalletImportByMnemonic from './wallet/hd-wallet-import-by-mnemonic';
import AddNft from './subscribe-detail/contracts/add-nft';
import AddERC20 from './subscribe-detail/contracts/add-erc20';
import HdWalletDetail from './wallet/hd-wallet-detail';
import HdWalletMnemonicDetail from './wallet/hd-wallet-mnemonic-detail';
import JbokWalletAccountImportByMnemonic from './wallet/jbok-wallet-account-import-by-mnemonic';
import JbokWalletDetail from './wallet/jbok-wallet-detail';
import WalletAccountDetail from './wallet/wallet-account-detail';
import '../beacon';
import { VcDetailPage } from './did/vc-detail';
import { DidDetailPage } from './did/did-detail';
import DidAuthority from './did/authority-did';
import VcAuthority from './did/authority-vc';
import AccountExportToApp from './account-export-to-app';
import TransferPage from './transaction/transfer-page';
import Transfer1155Page from './transaction/transfer1155-page';
import TransferHistoryPage from './transaction/history-page';
import { TransactionHistoryDetailPage } from './transaction/history-detail';

import AccountImportByMnemonicPage from './account-import-by-mnemonic-page';
import { initChainSubscribe } from '../services/chain';
import { message } from 'tea-component';
import { updateAccountDidAndVc } from '../services/did';
import CallSdkPage from './call-sdk/call-sdk-page';
import TransferErc20Page from './transaction/transferErc20-page';
/**
 * @description
 */
chrome.runtime.connect({ name: 'popup' });

const initState: {
  chains: Chain[];
  selectedChain: Chain;
  currentAccount: Account;
  initialized: boolean;
  currentTab: chrome.tabs.Tab;
  currentWallet: Wallet;
} = {
  chains: [],
  selectedChain: null,
  currentAccount: null,
  /**
   *@description 初始化完成标记位，用户从登录页进入添加网络页面，完成首次网络添加后，标记位恢复为true
   */
  initialized: true,
  currentTab: null,
  currentWallet: null,
};

const OPERATION_NAV_MAP = {
  createUserContract: '/signature',
  invokeUserContract: '/signature',
  openConnect: '/accounts/connect',
  openAccountExport: '/accounts/export-to-app',
  openAccountSignature: '/accounts/signature',
  importChainConfig: '/chains/import',
  importAccountConfig: '/accounts/import',
  importSubscribeContract: '/subscribe-contract/new',
  openDidAuthority: '/did/authority-did',
  openVcAuthority: '/did/authority-vc',
  openAccountImportByMnemonic: '/accounts/import-by-mnemonic',
  callSDK: '/call-sdk',
};

const hideChainSelectPage = [
  '/login',
  '/login-lock',
  '/signature',
  '/accounts/connect',
  '/accounts/export-to-app',
  '/accounts/signature',
  '/did/authority-did',
  '/did/authority-vc',
];

export const navByMessage = (nav: NavigateFunction, temp: SendRequestParam) => {
  const navPath = OPERATION_NAV_MAP[temp.operation] || '/';
  nav(navPath, {
    state: temp,
  });
};

type Tab = chrome.tabs.Tab & { host?: string };

/**
 * 全局状态上下文
 */
export const useChainStore = create<{
  chains: Chain[];
  selectedChain: Chain;
  currentAccount?: Account;
  initialized: boolean;
  currentTab: Tab;
  currentWallet: Wallet;
  checkChainIsConnect: ({ chainId, account }: { chainId: string; account: AccountForm }) => Promise<boolean>;
  /**
   * 添加链账户，并同步到storage，
   * 如果没有当前账户就设置,
   * 会判断当前链是否已连接过，未连接将用此账号连接被将链账户存储到链配置里
   * 传入的公私钥字段为文件类型数据，无需上传到db
   * */
  addChainAccount: ({ chain, account }: { chain: Chain; account: Account }) => Promise<void>;
  setChains: (chains: Chain[]) => void;
  setSelectedChain: (chains: Chain) => void;
  setCurrentAccount: (account: Account) => void;
  updateSelectData: ({ chain, account }: { chain?: Chain; account?: Account }) => Promise<void>;
  reset: () => void;
  setInitialized: (b: Boolean) => void;
  setCurrentTab: (tab?: Tab) => void;
  setCurrentWallet: (wallet: Wallet) => void;
}>((set: any, get) => ({
  ...initState,
  setChains: (chains) =>
    set((state) => ({
      ...state,
      chains,
    })),
  async updateSelectData({ chain, account }) {
    let { currentAccount, selectedChain } = get();
    if (chain && chain?.chainId !== selectedChain.chainId) {
      await chainStorageUtils.setSelectedChain(chain);
      selectedChain = chain;
    }
    if (account && account?.address !== currentAccount?.address) {
      await chainStorageUtils.setCurrentAccount(account.address);
      currentAccount = account;
    }
    set((state) => ({
      ...state,
      selectedChain,
      currentAccount,
    }));
  },
  // 检查链是否可连接
  checkChainIsConnect: async ({ chainId, account }) => {
    const { chains } = get();
    const chain = chains.filter((ele) => ele.chainId === chainId)[0];
    const lackTLS = isLackTLSChain(chain);
    // 未链接的链。链接并更新信息
    // if (!chain.version) {
    //   const res = await updateChainConfig({ ...chain }, account, lackTLS);
    //   if (res) {
    //     // setSelectedChain(res.updatedChain);
    //     set((state) => ({
    //       ...state,
    //       selectedChain: res.updatedChain,
    //       chains: res.chains,
    //     }));
    //     await chainStorageUtils.setSelectedChain(res.updatedChain);
    //     await initChainSubscribe(res.updatedChain);
    //     return true;
    //   }
    //   message.error({
    //     content: '区块链网络连接失败',
    //     duration: 5000,
    //   });
    //   return false;
    // }
    return true;
  },
  addChainAccount: async ({ chain, account }: { chain: Chain; account: Account }) => {
    const { currentAccount, checkChainIsConnect } = get();

    if (!(await checkChainIsConnect({ chainId: chain.chainId, account: account as AccountForm }))) {
      return;
    }
    const accountWithDbFile: any = { ...account };
    if (typeof account.userSignKeyFile !== 'string') {
      const [userSignKeyFile] = await chainStorageUtils.uploadFiles([account.userSignKeyFile]);
      accountWithDbFile.userSignKeyFile = userSignKeyFile;
    }
    if (typeof account.userPublicKeyFile !== 'string') {
      const [userPublicKeyFile] = await chainStorageUtils.uploadFiles([account.userPublicKeyFile]);
      accountWithDbFile.userPublicKeyFile = userPublicKeyFile;
    }
    await chainStorageUtils.addChainAccount(chain.chainId, accountWithDbFile);
    if (!currentAccount) {
      const current = await chainStorageUtils.setCurrentAccount(accountWithDbFile.address);
      set((state) => ({
        ...state,
        currentAccount: current,
      }));
    }
    // 获取did，vc信息
    await updateAccountDidAndVc({ chainId: chain.chainId, account: accountWithDbFile });
  },
  setSelectedChain: (chain) =>
    set((state) => ({
      ...state,
      selectedChain: chain,
    })),
  setCurrentAccount: (account) =>
    set((state) => {
      if (!deepEqual(account, state.currentAccount)) {
        const { chainName, chainId } = state.selectedChain || {};
        sendMessageToContentScript({
          operation: 'changeCurrentAccount',
          data: {
            status: 'done',
            timestamp: getNowSeconds(),
            info: {
              code: MessageInfoCode.success,
              accounts: responseAccountInfo([account], state.currentTab?.host),
              chain: { chainName, chainId },
            },
          },
        });
      }
      return {
        ...state,
        currentAccount: account,
      };
    }),
  reset: () => set(() => initState),
  setInitialized: (b: boolean) =>
    set((state) => ({
      ...state,
      initialized: b,
    })),
  setCurrentTab: (tab: Tab) =>
    set((state) => ({
      ...state,
      currentTab: tab,
    })),
  setCurrentWallet: (wallet: Wallet) =>
    set((state) => ({
      ...state,
      currentWallet: wallet,
    })),
}));
/**
 * @description 全局上下文
 */
export const AppContext = React.createContext<{
  isLoggedIn: boolean;
}>({ isLoggedIn: false });

export default function Popup() {

  return (
    <Router>
      <CustomRoutes />
    </Router>
  );
}

function CustomRoutes() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = new URLSearchParams(window.location.search);
  const route = search.get('route') || 'authorize';
  const allowedRoutes = ['sign'];

  const { setSelectedChain, setChains, setCurrentTab, setCurrentAccount, selectedChain, setCurrentWallet } =
    useChainStore();
  const [hasInit, setHasInit] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    setIsLoggedIn(hideChainSelectPage.indexOf(pathname) === -1);
  }, [pathname]);
  useEffect(() => {
    const checkFn = async () => {
      const [loginRes, loginLifeRes, tempOperationRes] = await Promise.all([
        chainStorageUtils.getLogin(),
        chainStorageUtils.getLoginLife(),
        chainStorageUtils.getTempOperation(),
      ]);
      setHasInit(true);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      chrome.tabs.query({ active: true }, async (tabs) => {
        const tab = tabs.find((ele) => ele.id === tempOperationRes?.tabId);
        // const tab = tabs[0];
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if (!tab) setCurrentTab({} as Tab);
        // eslint-disable-next-line no-useless-escape
        const host = tab?.url?.match(/^https?:\/\/[^\/]+/)?.[0];
        if (host) {
          setCurrentTab({
            ...tab,
            host,
          });
        }
        if (!loginRes) {
          return navigate('/login');
        }
        // 为了开发调试，暂时去掉这个  登录“活跃时间状态”（是否过期） 的校验
        // if (!loginLifeRes) {
        //   await chainStorageUtils.setLoginLock();
        //   return navigate('/login-lock', {
        //     state: tempOperationRes,
        //   });
        // }
        if (tempOperationRes) {
          navByMessage(navigate, tempOperationRes);
        } else {
          // return navigate('/');
          console.log('popup------route:', route);
          
          if (route && allowedRoutes.includes(route)) {
            return navigate(`/${route}`);
          }
          return navigate('/');
        }
      });
    };

    Promise.all([
      chainStorageUtils.getChains(),
      chainStorageUtils.getSelectedChain(),
      chainStorageUtils.getCurrentAccount(),
      chainStorageUtils.getCurrentWallet(),
    ])
      .then(async ([chains, selectedChain, currentAccount, currentWallet]) => {
        // 检测更新过期的测试链数据
        const { correctChains, correctSelectedChain } = await checkUpdateExpiredOfficialChainData({
          chains,
          selectedChain,
        });
        setSelectedChain(correctSelectedChain);
        setChains(correctChains);
        setCurrentAccount(currentAccount);
        setCurrentWallet(currentWallet);
      })
      .then(checkFn);
  }, []);

  useEffect(() => {
    chainStorageUtils.getCurrentAccount().then((account) => {
      console.debug('setCurrentAccount', account);
      setCurrentAccount(account);
    });
    chainStorageUtils.getCurrentWallet().then((wallet) => {
      console.debug('setCurrentWallet', wallet);
      setCurrentWallet(wallet);
    });
  }, [selectedChain]);

  return (
    <div className={'content'}>
      <AppContext.Provider
        value={{
          isLoggedIn,
        }}
      >
        {hasInit && (
          <ChainPage isLoggedIn={isLoggedIn}>
            <Routes>
              <Route path={'/'} element={<HomePage />} />
              <Route index element={<HomePage />} />
              {/* <Route path={'login'} element={<LoginPage onLogged={() => setIsLoggedIn(true)} />} />
          <Route path={'login-lock'} element={<LoginLockPage onClocked={() => setIsLoggedIn(true)} onReset={() => setIsLoggedIn(false)} />} /> */}
              <Route path={'login'} element={<LoginPage />} />
              <Route path={'login-lock'} element={<LoginLockPage />} />

              <Route path="/accountAction" element={<AccountAction />} />  
              <Route path="/transaction/send" element={<SendTransactionPage />} />
              <Route path="/createAccount" element={<CreateAccount />} />

              {/* <Route index element={<SignaturePage/>}/> */}
              <Route path={'signature'} element={<SignaturePage />} />
              <Route path={'transferConfirm'} element={<TransferConfirmPage />} />
              <Route path={'tx-logs'} element={<TxLogsPage />} />
              <Route path={'authorize'} element={<AuthorizePage />} />
              <Route path={'sign'} element={<SignPage />} />
              {/* <Route path="/sign" element={<SignPage />} />
              <Route path="sign" element={<SignPage />} /> */}

              <Route path={'chains'}>
                <Route index element={<ChainsPage />} />
                <Route path={'new'} element={<ChainNewPage />} />
                {/* 导入 */}
                <Route path={'import'} element={<ChainImportPage />} />
                <Route path={':id'} element={<ChainDetailPage />} />
                <Route path={'update'} element={<ChainUpdatePage />} />
              </Route>
              <Route path={'accounts'}>
                <Route index element={<AccountsPage />} />
                <Route path={'new'} element={<AccountNewPage />} />
                <Route
                  path="add"
                  element={
                    <AccountNew
                      chain={undefined}
                      onSuccess={() => console.log('Success')}
                      onError={(err) => console.error(err)}
                      onCancel={() => console.log('Cancelled')}
                    />
                  }
                />
                {/* 导入 */}
                <Route path={'import'} element={<AccountImportPage />} />
                <Route path={'import-by-mnemonic'} element={<AccountImportByMnemonicPage />} />
                <Route path={'connect'} element={<AccountConnect />} />
                <Route path={'signature'} element={<AccountSignature />} />
                <Route path={'connect-setting'} element={<AccountConnectSetting />} />
                {/* 导出 */}
                <Route path={'export-to-app'} element={<AccountExportToApp />} />
              </Route>
              <Route path={'setting'} element={<SettingPage onReset={() => setIsLoggedIn(false)} />} />
              <Route path={'about-us'} element={<AboutPage />} />

              <Route path={'subscribe-contract'}>
                <Route path={'new'} element={<SubscribeContractPage />} />
                <Route path={'contract-detail'} element={<ContractDetailPage />} />
                <Route path={'add-nft'} element={<AddNft />} />
                <Route path={'add-erc20'} element={<AddERC20 />} />
                <Route path={'transaction-detail'} element={<TransactionDetailPage />} />
              </Route>

              <Route path={'wallet'}>
                <Route path={'hd-wallet-create-by-mnemonic'} element={<HdWalletCreateByMnemonic />} />
                <Route path={'hd-wallet-import-by-mnemonic'} element={<HdWalletImportByMnemonic />} />
                <Route path={'hd-wallet-detail'} element={<HdWalletDetail />} />
                <Route path={'hd-wallet-mnemonic-detail'} element={<HdWalletMnemonicDetail />} />
                <Route
                  path={'jbok-wallet-account-import-by-mnemonic'}
                  element={<JbokWalletAccountImportByMnemonic />}
                />
                <Route path={'jbok-wallet-detail'} element={<JbokWalletDetail />} />
                <Route path={'wallet-account-detail'} element={<WalletAccountDetail />} />
              </Route>
              <Route path={'did'}>
                <Route path={'did-detail'} element={<DidDetailPage />} />
                <Route path={'vc-detail'} element={<VcDetailPage />} />
                <Route path={'authority-did'} element={<DidAuthority />} />
                <Route path={'authority-vc'} element={<VcAuthority />} />
              </Route>
              <Route path={'transaction'}>
                <Route path={'transfer'} element={<TransferPage />} />
                <Route path={'transfer1155'} element={<Transfer1155Page />} />
                <Route path={'transferErc20'} element={<TransferErc20Page />} />
                <Route path={'history'} element={<TransferHistoryPage />} />
                <Route path={'history-detail'} element={<TransactionHistoryDetailPage />} />
              </Route>

              <Route path={'call-sdk'} element={<CallSdkPage />} />
            </Routes>
          </ChainPage>
        )}
      </AppContext.Provider>
    </div>
  );
}
