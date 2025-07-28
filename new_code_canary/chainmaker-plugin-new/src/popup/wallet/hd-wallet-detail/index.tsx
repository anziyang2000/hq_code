import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChainStore } from '../../popup';
import chainStorageUtils from '../../../utils/storage';
import { Account, Chain, Wallet } from '../../../utils/interface';
import { ConfirmModal, DetailPage, VerifyPasswordModal } from '../../../utils/common';
import { createPemFile, zero } from '../../../utils/utils';
import './index.less';
import { WalletAccountList } from '../../../components/wallet-account-list';
import { Button, message } from 'tea-component';
import { ethers } from "ethers";
// 确定性钱包-钱包详情
// 接收参数：chain wallet
function HdWalletDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const hdWalletDetailRef = useRef();
  const { wallet, chain } = location.state as {
    chain: Chain;
    wallet: Wallet;
  };
  const { currentAccount, setCurrentAccount } = useChainStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const verifyPaaswordRef = useRef();
  // 点击查看助记词
  const handleMnemonicDetail = useCallback(() => {
    navigate(`/wallet/hd-wallet-mnemonic-detail`, {
      state: {
        wallet,
        chain,
      },
    });
  }, [wallet]);
  // 点击查看账户详情
  const handleAccountDetail = useCallback(
    (account: Account) => {
      navigate(`/wallet/wallet-account-detail`, {
        state: {
          account,
          wallet,
          chain,
        },
      });
    },
    [location],
  );
  // 新建链账户
  // const handleCreateAccount = useCallback(async () => {
  //   if (!chain || !wallet) {
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     let walletIndex: number;
  //     if (accounts.length) {
  //       walletIndex = accounts[accounts.length - 1].walletIndex + 1;
  //     } else {
  //       walletIndex = 0;
  //     }
  //     const { name, mnemonic, id } = wallet;
  //     const accountName = `${name}${zero(walletIndex + 1)}`;
  //     const walletSdk = ethers.Wallet.fromMnemonic(mnemonic);
  //     const pri = walletSdk.privateKey
  //     const pub = walletSdk.publicKey
  //     const address = walletSdk.address
  //     const userSignKeyName = `${accountName}.key`;
  //     const userPublicKeyName = `${accountName}.pem`;
  //     const priFile = createPemFile(pri, userSignKeyName);
  //     const pubFile = createPemFile(pub, userPublicKeyName, 'application/x-x509-ca-cert');
  //     const [userSignKeyFile, userPublicKeyFile] = await chainStorageUtils.uploadFiles([priFile, pubFile]);
  //     const account: Account = {
  //       userSignKeyFile,
  //       userPublicKeyFile,
  //       name: accountName,
  //       //crtName: null,
  //       address,
  //       walletId: id,
  //       walletIndex,
  //     };
  //     const existAccount = await chainStorageUtils.checkChainAccountExist(chain.chainId, account);
  //     if (existAccount) {
  //       // 钱包内创建链账户，发现重复了
  //       setExistConfirmText(
  //         `检测到您所要恢复的链账户“${existAccount.address}”已导入到未分类钱包内，是否将之移动到本钱包内。`,
  //       );
  //       // @ts-ignore
  //       existConfirmRef.current.show({
  //         confirm: async () => {
  //           // handleAccountDetail(account);
  //           await chainStorageUtils.deleteChainAccount(chain.chainId, existAccount);
  //           account.name = existAccount.name;
  //           await chainStorageUtils.addChainAccount(chain.chainId, account);
  //           const newAccounts = await chainStorageUtils.getChainAccounts(chain.chainId, 'hd', wallet.id);
  //           setAccounts(newAccounts);
  //           if (!currentAccount) {
  //             const current = await chainStorageUtils.setCurrentAccount(account.address);
  //             setCurrentAccount(current);
  //           }
  //           if (hdWalletDetailRef.current) {
  //             // @ts-ignore
  //             hdWalletDetailRef.current?.scrollToBottom?.();
  //           }
  //           setLoading(false);
  //         },
  //         close: () => {
  //           setLoading(false);
  //         },
  //       });
  //     } else {
  //       await chainStorageUtils.addChainAccount(chain.chainId, account);
  //       const newAccounts = await chainStorageUtils.getChainAccounts(chain.chainId, 'hd', wallet.id);
  //       setAccounts(newAccounts);
  //       if (!currentAccount) {
  //         const current = await chainStorageUtils.setCurrentAccount(account.address);
  //         setCurrentAccount(current);
  //       }
  //       message.success({ content: '新建成功' });
  //       if (hdWalletDetailRef.current) {
  //         // @ts-ignore
  //         hdWalletDetailRef.current?.scrollToBottom?.();
  //       }

  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.debug(error);
  //     setLoading(false);
  //   }
  // }, [wallet, chain, accounts, hdWalletDetailRef]);

  useEffect(() => {
    if (chain?.chainId) {
      chainStorageUtils.getChainAccounts(chain.chainId, 'hd', wallet.id).then((accunts) => {
        setAccounts(accunts);
      });
    }
  }, [chain]);

  const existConfirmRef = useRef();
  const [existConfirmText, setExistConfirmText] = useState('');

  return (
    <>
      <DetailPage title={'钱包详情'} backUrl={'/accounts'} className="hd-wallet-detail" ref={hdWalletDetailRef}>
        <div
          className="hd-wallet-mnemonic-entry"
          onClick={() => {
            // @ts-ignore
            verifyPaaswordRef.current.show({
              confirm: () => {
                handleMnemonicDetail();
              },
            });
          }}
        >
          <div className="mnemonic-icon">
            <img src="../../../img/icon-mnemonic.png" alt="" />
          </div>
          <div className="text">查看钱包助记词</div>
          <div className="arrow-icon">
            <img src="../../../img/icon-arrow.png" alt="" />
          </div>
        </div>
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
        />
      </DetailPage>
      <footer className="hd-wallet-detail-footer">
        <Button
          onClick={() => {
            // handleCreateAccount();
            navigate('/')
          }}
          type={'primary'}
          className={'btn-lg'}
          loading={loading}
        >
          {/* 新增链账户 */}
          返回首页
        </Button>
      </footer>
      <VerifyPasswordModal ref={verifyPaaswordRef} />
      <ConfirmModal title={'链账户已存在'} ref={existConfirmRef} cancelBtnText="取消" confirmBtnText="确认移动">
        {existConfirmText}
      </ConfirmModal>
    </>
  );
}

export default HdWalletDetail;