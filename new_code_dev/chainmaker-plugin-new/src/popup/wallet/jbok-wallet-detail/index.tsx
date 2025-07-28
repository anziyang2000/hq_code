import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Account, Chain } from '../../../utils/interface';
import chainStorageUtils from '../../../utils/storage';
import { ConfirmModal, DetailPage, VerifyPasswordModal } from '../../../utils/common';
import { getNowSeconds, sendMessageToContentScript } from '../../../utils/tools';
import { responseAccountInfo } from '../../../utils/utils';
import { useChainStore } from '../../popup';
import { WalletAccountList } from '../../../components/wallet-account-list';
import { Button } from 'tea-component';
import { ActionSheet } from '../../../components/action-sheet';
import { MessageInfoCode } from '@src/event-page';
// 非确定性钱包-钱包详情
// 接收参数：chain
function JbokWalletDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const actionSheetRef = useRef();
  const { chain } = location.state as {
    chain: Chain;
  };
  const { currentAccount, setCurrentAccount, currentTab } = useChainStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const deleteConfirmRef = useRef<typeof ConfirmModal>();
  const verifyPaaswordRef = useRef();
  // 点击查看账户详情
  const handleAccountDetail = useCallback(
    (account: Account) => {
      navigate(`/wallet/wallet-account-detail`, {
        state: {
          account,
          chain,
        },
      });
    },
    [location],
  );
  // 删除账户
  const handleDeleteChain = useCallback(
    (account: Account) => {
      // @ts-ignore
      deleteConfirmRef.current.show({
        confirm: () =>
          chainStorageUtils.deleteChainAccount(chain.chainId, account).then((res) => {
            if (account.address === currentAccount.address) {
              chainStorageUtils.getCurrentAccount().then((res) => {
                setCurrentAccount(res);
              });
            }
            setAccounts(res);
            const { chainName, chainId } = chain;
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
    [chain, accounts, currentAccount],
  );

  // 通过私钥导入链账户
  const handleImporyByKey = useCallback(() => {
    navigate('/accounts/new', {
      state: {
        chain,
        initial: false,
      },
    });
  }, [navigate, chain]);
  // 通过助记词导入链账户
  const handleImportByMnemonic = useCallback(() => {
    navigate('/wallet/jbok-wallet-account-import-by-mnemonic', {
      state: {
        chain,
      },
    });
  }, [navigate, chain]);

  useEffect(() => {
    if (chain?.chainId) {
      chainStorageUtils.getChainAccounts(chain.chainId, 'jbok').then((accunts) => {
        setAccounts(accunts);
      });
    }
  }, [chain]);

  return (
    <>
      <DetailPage title={'钱包详情'} backUrl={'/accounts'} className="jbok-wallet-detail">
        <WalletAccountList
          accounts={accounts}
          mode="public"
          onDetail={(account) => {
            // @ts-ignore
            verifyPaaswordRef.current.show({
              confirm: () => {
                handleAccountDetail(account);
              },
            });
          }}
          onDelete={(account) => {
            handleDeleteChain(account);
          }}
        />
        <ConfirmModal title={'删除确认'} ref={deleteConfirmRef}>
          {'删除链账号后，将无法使用该账号进行交易签名，请确认是否删除该账号。'}
        </ConfirmModal>
      </DetailPage>
      <footer className="jbok-wallet-detail-footer">
        <Button
          onClick={() => {
            // @ts-ignore
            actionSheetRef.current?.show?.();
          }}
          type={'primary'}
          className={'btn-lg'}
        >
          导入链账户
        </Button>
      </footer>
      <ActionSheet ref={actionSheetRef}>
        <>
          <Button
            onClick={() => {
              handleImportByMnemonic();
            }}
            type={'primary'}
            className={'btn-lg'}
          >
            通过助记词导入链账户
          </Button>
          <Button
            onClick={() => {
              handleImporyByKey();
            }}
            type={'primary'}
            className={'btn-lg mt-2n '}
          >
            通过私钥导入链账户
          </Button>
          <Button
            onClick={() => {
              // @ts-ignore
              actionSheetRef.current?.hide?.();
            }}
            type={'weak'}
            className={'btn-lg mt-2n '}
          >
            取消
          </Button>
        </>
      </ActionSheet>
      <VerifyPasswordModal ref={verifyPaaswordRef} />
    </>
  );
}

export default JbokWalletDetail;