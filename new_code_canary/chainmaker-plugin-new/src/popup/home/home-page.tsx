/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'tea-component';
import { ContractList } from './contract-list';
import { ConfirmModal } from '../../utils/common';
import { Account } from '../../utils/interface';
import chainStorageUtils, { contractStoreUtils, SubscribeContractItem  } from '../../utils/storage';
import { useChainStore } from '../popup';
import { AccountSelect } from '../account/account-select';
import HeaderIcon from '../account/heaederIcon';
import { getNowSeconds, sendMessageToContentScript } from '../../utils/tools';
import { responseAccountInfo } from '../../utils/utils';
import { getBalanceGas } from '../../services/gas';
import { AccountCard } from './account-card';
import { CONTRACT_TYPE } from '../../config/contract';
import { DidInfo } from './did-info';
import { isSupportDidChain } from '../../services/did';
import SvgIcon from '../../components/svg-icon';
import { MessageInfoCode } from '@src/event-page';
import TxLogsPage from '../tx-logs-page';
import { CMNFAContractPage } from '../subscribe-detail/contracts/nft-contract';
import { initEthereumProvider } from '../../utils/utils';
import { TxLog } from '../../utils/interface';
import { ethers } from 'ethers';
import { TokenContractPage } from '../subscribe-detail/contracts/token-contract';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import SyncOutlined from '@ant-design/icons/SyncOutlined';
import eventBus from '@utils/eventBus';

export enum HomeTabs {
  TOKENS,
  COLLECTIBLES,
  HISTORY_RECORDS,
  DID_VC, 
}
const HOME_TAB_OPTIONS = [
  { title: '代币', value: HomeTabs.TOKENS },
  { title: 'NFT', value: HomeTabs.COLLECTIBLES },
  { title: '交易', value: HomeTabs.HISTORY_RECORDS },
];

const HOME_DID_TAB = {
  title: 'DID信息',
  value: HomeTabs.DID_VC,
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeTab = HomeTabs.TOKENS,
    newTxLog,
    newContractAddress,
  } = (location.state || {}) as {
    activeTab: HomeTabs;
    newTxLog?: TxLog;
    newContractAddress?: string;
  };

  const [connected, setConnected] = useState(false);
  const [accountSelectVisible, setAccountSelectVisible] = useState(false);
  const { selectedChain, currentAccount, setCurrentAccount, currentTab } = useChainStore();
  const switchConfirmRef = useRef<typeof ConfirmModal>();
  const [gasBalance, setGasBalance] = useState(0);
  const [homeTabActive, setHomeTabActive] = useState(activeTab);
  const [ethBalance, setEthBalance] = useState('0');
  const [currentOrigin, setCurrentOrigin] = useState<string>();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        try {
          const origin = new URL(tab.url).origin;
          console.log('现在的origin是:', origin);
          setCurrentOrigin(origin);
        } catch (e) {
          console.error('无法解析 tab 的 origin', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    // console.log('selectedChain', selectedChain);
    // console.log('xyxyxyx-newTxLog:', newTxLog);
    // console.log('currentTab:', currentTab);
    // console.log('accountSelectVisible:', accountSelectVisible);
    
    const connectEthereum = async () => {
      try {
        // 从当前链的 rpcs 数组中获取第一个 RPC 地址
        // 根据链名选择正确的 RPC URL
        const rpcUrl = selectedChain?.chainName === '数科链主网' ? DEFAULT_MAINNET_RPC : selectedChain?.nodeIp;

        if (!rpcUrl) {
          console.warn('未配置 RPC URL，无法连接');
          return;
        }
  
        const provider = await initEthereumProvider(rpcUrl);
  
        console.log('xxx currentAccount:', currentAccount);
  
        if (!currentAccount?.address) {
          console.warn('当前账户为空，无法查询余额');
          return;
        }
  
        const balance = await provider.getBalance(currentAccount.address);
        console.log('连接成功！');
        console.log('余额（ETH）：', ethers.utils.formatEther(balance));
        const formattedBalance = Number(ethers.utils.formatEther(balance)).toFixed(2);
  
        setConnected(true);
        setEthBalance(formattedBalance);
      } catch (error) {
        console.error('连接以太坊失败:', error);
        setEthBalance('0');
        setConnected(false);
      }
    };
  
    // 只有在链名是“数科链主网”时才执行（去掉这个判断，就变成任何链都连接）
    // if (selectedChain?.chainName === '数科链主网') {
    connectEthereum();
    // }
  }, [selectedChain, currentAccount]);

  // 切换账户、授权逻辑
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestId = searchParams.get('requestId');
    const originParam = searchParams.get('origin');
    const fallbackOrigin = 'unknown-site.com';
  
    const handleAuthorization = (origin: string, reqId: string | null) => {
      if (!currentAccount) {
        navigate('/accounts');
        message.success({ content: '请先创建或导入账户' });
        return;
      }
  
      chrome.storage.local.get(['authorizedAccounts'], (result) => {
        const authorizedMap = result.authorizedAccounts || {};
        const authorizedList: string[] = authorizedMap[origin] || [];
        const isAuthorized = authorizedList.includes(currentAccount.address);
  
        if (reqId) {
          // 通过 eth_requestAccounts 打开的：未授权 → 跳转授权页，已授权 → 返回数据
          if (isAuthorized) {
            chrome.runtime.sendMessage(
              {
                type: 'authorize-response',
                requestId: reqId,
                accounts: [currentAccount.address],
              },
              () => {
                window.close();
              }
            );
          } else {
            if(origin == 'http://localhost:3000' || origin == 'http://192.168.10.127' || 'http://192.168.50.41/') {
              navigate('/authorize', {
                state: {
                  origin,
                  requestId: reqId,
                  account: {
                    name: currentAccount.name,
                    address: currentAccount.address,
                  },
                },
              });
            }
          }
        } else {
          // 手动打开插件 popup 的情况：未授权也跳转授权页（仅当 origin 可识别）
          if (!isAuthorized) {
            if(origin == 'http://localhost:3000'|| origin == 'http://192.168.10.127' || origin == 'http://192.168.50.41/') {
              navigate('/authorize', {
                state: {
                  origin,
                  requestId: reqId,
                  account: {
                    name: currentAccount.name,
                    address: currentAccount.address,
                  },
                },
              });
            }
          }
        }

        // 授权过，当前账户变化都应通知外部页面
        if(isAuthorized && currentAccount !== undefined) {
          chrome.runtime.sendMessage({
            type: 'accountsChanged',
            accounts: [currentAccount.address],
          }, () => {
            console.log('✅ sendMessage(accountsChanged) 已发出！');
          });
        }
      });
     };
  
    if (requestId && originParam) {
      // 外部网站请求授权的正常流程
      handleAuthorization(originParam, requestId);
    } else {
      // 插件被手动打开，主动读取当前 tab 页面 URL 拿 origin
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url) {
          try {
            const activeOrigin = new URL(tab.url).origin;
            handleAuthorization(activeOrigin, null);
          } catch (e) {
            console.warn('无法解析当前 tab 的 origin:', e);
          }
        }
      });
    }

  }, [currentAccount]);

  const handleRefreshBalance = async () => {
    // 触发余额查询逻辑
    console.log('[首页] 收到子组件通知，开始刷新余额');

    const rpcUrl =
        selectedChain.chainName === '数科链主网'
          ? DEFAULT_MAINNET_RPC
          : selectedChain.nodeIp;

      if (!rpcUrl) return;

    const provider = await initEthereumProvider(rpcUrl);
    const balance = await provider.getBalance(currentAccount.address);
    const formatted = Number(ethers.utils.formatEther(balance)).toFixed(2);
    setEthBalance(formatted);
  };

  useEffect(() => {
    const handleRefresh = () => {
      handleRefreshBalance(); // 调用已有刷新余额逻辑
    };
  
    eventBus.on('refresh_balance', handleRefresh);
  
    return () => {
      eventBus.off('refresh_balance', handleRefresh);
    };
  }, []);
  
  const syncOutlinedBalance = async () => {
    try {
      // 触发余额查询逻辑
      console.log('[首页] 收到子组件通知，开始刷新余额');
      message.success({ content: '正在刷新余额...', duration: 1 });

      const rpcUrl =
          selectedChain.chainName === '数科链主网'
            ? DEFAULT_MAINNET_RPC
            : selectedChain.nodeIp;

        if (!rpcUrl) return;

      const provider = await initEthereumProvider(rpcUrl);
      const balance = await provider.getBalance(currentAccount.address);
      const formatted = Number(ethers.utils.formatEther(balance)).toFixed(2);
      setEthBalance(formatted);
      message.success({ content: '余额刷新成功' });
    } catch (error) {
      console.error('刷新失败', error);
      setEthBalance('0');
      message.error({ content: '余额刷新失败' });
    }
  };

  const openSelect = useCallback(() => {
    if (currentAccount) {
      setAccountSelectVisible(true);
    }
  }, [currentAccount]);

  const selectAccount = useCallback(
    async (ac: Account) => {
      const orgaccount = currentAccount;
      const account = await chainStorageUtils.setCurrentAccount(ac.address || '');
      setAccountSelectVisible(false);
      if (orgaccount?.authHosts?.includes(currentTab?.host || '') && !account.authHosts?.includes(currentTab?.host)) {
        setCurrentAccount(account);
        // @ts-ignore
        switchConfirmRef.current.show({
          confirm: async () => {
            const accounts = await chainStorageUtils.getCurrentChainAccounts();
            const newAccount = accounts.find((item) => item.address === ac.address);
            if (!newAccount.authHosts) {
              newAccount.authHosts = [];
            }
            newAccount.authHosts.push(currentTab?.host);
            await chainStorageUtils.setCurrentChainAccount(accounts);
            chainStorageUtils.setCurrentAccount(ac.address).then((res) => {
              setCurrentAccount(res);
              const { chainName, chainId } = selectedChain;
              sendMessageToContentScript({
                operation: 'changeConnectedAccounts',
                data: {
                  status: 'done',
                  timestamp: getNowSeconds(),
                  info: {
                    code: MessageInfoCode.success,
                    connectedAccounts: responseAccountInfo([res], currentTab?.host),
                    accounts: responseAccountInfo(accounts, currentTab?.host),
                    chain: { chainName, chainId },
                  },
                },
              });
            });
          },
        });
      } else {
        setCurrentAccount(account);
      }
    },
    [currentAccount],
  );

  useEffect(() => {
    setConnected(Boolean(currentTab?.host && currentAccount?.authHosts?.includes(currentTab?.host)));
    // 获取gas selectedChain, currentAccount
    if (currentAccount && selectedChain.enableGas) {
      contractStoreUtils
        .getContractBalance({
          accountId: currentAccount.address,
          chainId: selectedChain.chainId,
          contractName: CONTRACT_TYPE.GAS,
        })
        .then((cacheBalance) => {
          setGasBalance(+cacheBalance || 0);
          getBalanceGas({ chainId: selectedChain.chainId, account: currentAccount }).then((result) => {
            if (result !== +cacheBalance) {
              setGasBalance(result || 0);
              contractStoreUtils.setContractBalance({
                accountId: currentAccount.address,
                chainId: selectedChain.chainId,
                contractName: CONTRACT_TYPE.GAS,
                balance: result,
              });
            }
          });
        });
    }
  }, [currentAccount]);
  useEffect(() => {
    const state = location.state as any;
    if (state?.alert) {
      message.error({
        content: state.alert,
        duration: 5000,
      });
    }
  }, []);

  const supporDid = useMemo(() => isSupportDidChain(selectedChain?.chainId), [selectedChain]);
  const homeTabOptions = useMemo(() => {
    const result = [...HOME_TAB_OPTIONS];
    if (supporDid) {
      result.push(HOME_DID_TAB);
    }
    return result;
  }, [selectedChain]);

  // 构造你要传入的 contractInfo
  const ERC1155Info: SubscribeContractItem = {
    contractType: CONTRACT_TYPE.ERC1155,
    currentAccount
  };
  const ERC20Info: SubscribeContractItem = {
    contractType: CONTRACT_TYPE.ERC20,
    currentAccount
  };

  return (
    <>
      <div className="home-t">
        {/* <div className={`home-status ${connected ? 'link' : ''}`} onClick={toSetting}>
          <div className="icon"></div>
          {connected ? currentTab?.host : '未连接'}
        </div> */}
        {/* <div className={`home-status ${connected ? 'link' : ''}`} onClick={toSetting}> */}
        <div className={`home-status ${connected ? 'link' : ''}`} style={{ display:'flex', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center' }}>
            <div className="icon"></div>
            <span> {connected ? '已连接' : '未连接'} </span>
          </div>

          {/* 刷新按钮紧贴右侧 */}
          <SyncOutlined
            onClick={syncOutlinedBalance}
          />
        </div>
        <div className="home-user">
          {currentAccount ? (
            <AccountCard
              account={currentAccount}
              onOpenSelect={openSelect}
              // balance={String(20)}
              balance={ethBalance}
              onSendClick={() => {
                navigate('/transaction/transfer', {
                  state: {
                    ethBalance, // 传递 ethBalance
                  },
                });
              }}
            />
          ) : (
            <>
              <HeaderIcon
                color="#BF760A&#F4EA2A"
                onClick={() =>
                  navigate('/accounts/new', {
                    state: {
                      chain: selectedChain,
                      initial: false,
                    },
                  })
                }
                classN="home-header"
                width={70}
                height={70}
              />
              <div className="home-account">
                暂无数据，请先
                <span
                  onClick={() =>
                    // navigate('/wallet/jbok-wallet-detail', {
                    navigate('/accounts', {
                      state: {
                        chain: selectedChain,
                        // initial: false,
                      },
                    })
                  }
                >
                  添加链账户
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      {/* <div className="contract-ls-b">
        <div className="contract-ls-t">
          {homeTabOptions.map(({ title, value }) => (
            <div
              key={value}
              onClick={() => {
                setHomeTabActive(value);
              }}
              className={homeTabActive === value ? 'home-tab-active mr-5n' : 'mr-5n'}
            >
              {title}
            </div>
          ))}
        </div>
      </div> */}
      <div className="contract-ls-b">
        <div className="contract-ls-t">
          {HOME_TAB_OPTIONS.map(({ title, value }) => (
            <div
              key={value}
              onClick={() => setHomeTabActive(value)}
              className={`home-tab ${homeTabActive === value ? 'home-tab-active' : ''}`}
            >
              {title}
            </div>
          ))}
        </div>
      </div>

      {homeTabActive === HomeTabs.TOKENS && <div> <TokenContractPage contractInfo={ERC20Info} /> </div>}
      {homeTabActive === HomeTabs.COLLECTIBLES && (
        <div>
          <CMNFAContractPage
            contractInfo={ERC1155Info}
          />
        </div>
      )}
      {homeTabActive === HomeTabs.HISTORY_RECORDS && <div> <TxLogsPage showDetailPage={false} extraLog={newTxLog} onRequestRefreshBalance={handleRefreshBalance} /> </div>}

      <AccountSelect
        onSelect={(ac) => {
          selectAccount(ac);
        }}
        visible={accountSelectVisible}
        onClose={() => setAccountSelectVisible(false)}
      />
      <ConfirmModal
        title={'切换链账户授权'}
        confirmBtnText={'确定授权'}
        cancelBtnText="暂不授权"
        ref={switchConfirmRef}
      >
        {`您准备切换的链账户“${currentAccount?.name}”尚未授权给“${currentTab?.host}”，请确定是否要授权。如果不授权的话，将临时中断和该Dapp的连接。`}
      </ConfirmModal>
    </>
  );
}