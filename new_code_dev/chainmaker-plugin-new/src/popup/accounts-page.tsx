/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { useNavigate } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Account, Wallet } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { Button, List, Copy } from 'tea-component';
import { ConfirmModal, DetailPage, ListContainer } from '../utils/common';
import { useChainStore } from './popup';
import { responseAccountInfo } from '../utils/utils';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { BEACON_EVENTS, beacon } from '../beacon';
import { HdWalletCard } from '../components/hd-wallet-card';
import { JbokWalletCard } from '../components/jboj-wallet-card';
import GuideeWalletFooter from '../components/guide-wallet-footer';
import { MessageInfoCode } from '@src/event-page';

function AccountsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const { selectedChain, currentAccount, setCurrentAccount, currentTab } = useChainStore();

  const gotoClick = useCallback(() => {
    beacon.onUserAction(BEACON_EVENTS.ACCOUNT_ADD_START);
    navigate(`/accounts/new`, {
      state: {
        chain: selectedChain,
        initial: false,
      },
    });
  }, [selectedChain]);
  const deleteConfirmRef = useRef<typeof ConfirmModal>();

  useEffect(() => {
    if (!selectedChain) {
      return;
    }
    chainStorageUtils.getChainAccounts(selectedChain.chainId).then((res) => {
      setAccounts(res);
    });
    // if (selectedChain.accountMode === 'public') {
    chainStorageUtils.getChainWallets(selectedChain.chainId).then((res) => {
      setWallets(res);
    });
    // }
  }, [selectedChain]);

  const handleDeleteChain = useCallback(
    (account: Account) => {
      // @ts-ignore
      deleteConfirmRef.current.show({
        confirm: () =>
          chainStorageUtils.deleteChainAccount(selectedChain.chainId, account).then((res) => {
            if (account.address === currentAccount.address) {
              chainStorageUtils.getCurrentAccount().then((res) => {
                setCurrentAccount(res);
              });
            }
            setAccounts(res);
            const { chainName, chainId } = selectedChain;
            sendMessageToContentScript({
              operation: 'deleteChainAccounts',
              data: {
                status: 'done',
                timestamp: getNowSeconds(),
                info: {
                  code: MessageInfoCode.success,
                  removedAccounts: responseAccountInfo([account], currentTab?.host),
                  chain: { chainName, chainId },
                },
              },
            });
          }),
      });
    },
    [selectedChain, accounts, currentAccount],
  );

  return (
    <>
      <DetailPage title={'链账户管理'} backUrl={'/'} className="chain-account-manage">
        {/* {selectedChain?.accountMode === 'permissionedWithCert' && (
          <>
            <ListContainer items={accounts} notFound={'暂无账户'}>
              <List className={'chains mt-2n'}>
                {accounts.map((item) => (
                  <List.Item key={item.address} className={'account-item'}>
                    <div className={'flex-grow'}>
                      <div className={'flex-grow'}>
                        <span
                          className={`${
                            selectedChain.accountMode === 'permissionedWithCert'
                              ? 'avatar-certificate'
                              : 'avatar-public-key'
                          } tea-mr-3n`}
                        >
                          {selectedChain.accountMode === 'permissionedWithCert' ? 'C' : 'P'}
                        </span>
                        {item.name}
                      </div>
                      {item.address && (
                        <div className={'tea-mt-1n'}>
                          <span className={'tea-mr-1n'}>{item.address}</span>
                          <Copy text={item.address} />
                        </div>
                      )}
                    </div>
                    <img src={'/img/icon-delete.png'} onClick={() => handleDeleteChain(item)} title={'删除'} />
                  </List.Item>
                ))}
              </List>
            </ListContainer>
            <ConfirmModal title={'删除确认'} ref={deleteConfirmRef}>
              {'删除链账号后，将无法使用该账号进行交易签名，请确认是否删除该账号。'}
            </ConfirmModal>
          </>
        )} */}

        {/* {selectedChain?.accountMode === 'public' && ( */}
        <>
          {!!wallets.length && (
            <>
              {wallets.map((wallet) => (
                <HdWalletCard
                  key={wallet.id}
                  name={wallet.name}
                  onClick={() => {
                    navigate('/wallet/hd-wallet-detail', {
                      state: {
                        chain: selectedChain,
                        wallet,
                      },
                    });
                  }}
                ></HdWalletCard>
              ))}
              <div className="split-line"></div>
            </>
          )}
          <JbokWalletCard
            onClick={() => {
              navigate('/wallet/jbok-wallet-detail', {
                state: {
                  chain: selectedChain,
                },
              });
            }}
          ></JbokWalletCard>
        </>
      </DetailPage>
      {/* {selectedChain?.accountMode === 'permissionedWithCert' && (
        <footer>
          <Button onClick={gotoClick} type={'primary'} className={'btn-lg'} disabled={selectedChain === null}>
            添加链账户
          </Button>
        </footer>
      )} */}
      {/* {selectedChain?.accountMode === 'public' && wallets?.length === 0 && ( */}
      {wallets?.length === 0 && (
        <GuideeWalletFooter
          onCreate={() => {
            navigate('/wallet/hd-wallet-create-by-mnemonic', {
              state: {
                chain: selectedChain,
              },
            });
          }}
          onImport={() => {
            navigate('/wallet/hd-wallet-import-by-mnemonic', {
              state: {
                chain: selectedChain,
              },
            });
          }}
        />
      )}
    </>
  );
}

export default AccountsPage;