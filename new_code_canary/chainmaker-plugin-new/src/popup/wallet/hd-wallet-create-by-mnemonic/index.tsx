import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import { createPemFile, isLackTLSChain, shuffleArray, updateChainConfig, zero } from '../../../utils/utils';
import { DetailPage } from '../../../utils/common';
import { Button, Form, Input, message } from 'tea-component';
import chainStorageUtils from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { useLocation } from 'react-router-dom';
import { Account, AccountForm, Chain, Wallet } from '../../../utils/interface';
import './index.less';
import formUtils from '../../../utils/form-utils';
import { MnemonicContainer } from '../../../components/mnemonic-container';
import { initChainSubscribe } from '../../../services/chain';
import { ethers } from "ethers";

// 确定性钱包-助记词创建新钱包
// 1.填写钱包备注
// 2.生成助记词
// 3.验证助记词
// 4.成功
function HdWalletCreateByMnemonic() {
  const location = useLocation();
  const { chain } = location.state as {
    chain: Chain;
  };
  const lackTLS = useMemo(() => isLackTLSChain(chain), [chain]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { setSelectedChain, setChains, currentAccount, currentWallet, setCurrentAccount, setCurrentWallet } =
    useChainStore();
  const {
    control,
    formState: { isValidating, isSubmitted, isValid },
    getValues,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      walletName: '',
    },
  });
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicArr, setMnemonicArr] = useState([]);
  const [shuffleMnemonicArr, setShuffleMnemonicArr] = useState<{ word: string; index: number }[]>([]);
  const [selectedMnemonic, setSelectedMnemonic] = useState<{ word: string; index: number }[]>([]);
  // 创建助记词
  const wallet = ethers.Wallet.createRandom();
  const createMnemonic = useCallback(() => {
    try {
      const words = wallet.mnemonic.phrase;
      const wordsArr = words.split(' ');
      setMnemonic(words);
      setMnemonicArr(wordsArr.map((word, index) => ({ word, index })));
      setShuffleMnemonicArr(shuffleArray(wordsArr).map((word, index) => ({ word, index })));
    } catch (error) {
      console.debug(error);
    }
  }, []);

  // 处理选中,记录选中的单词 和 乱序中对应的索引
  const handleSelect = useCallback(
    ({ word, index }: { word: string; index: number }) => {
      setSelectedMnemonic((state) => [...state, { word, index }]);
      const pos = shuffleMnemonicArr.findIndex((item) => item.word === word && item.index === index);
      const newShuffleMnemonicArr = [...shuffleMnemonicArr];
      newShuffleMnemonicArr.splice(pos, 1);
      setShuffleMnemonicArr(newShuffleMnemonicArr);
    },
    [shuffleMnemonicArr],
  );

  // 处理删除，删除一个选中的单词
  const handleDelete = useCallback(
    (index: number) => {
      const removed = selectedMnemonic[index];
      setSelectedMnemonic((state) => {
        const arr = [...state];
        arr.splice(index, 1);
        return arr;
      });
      const newShuffleMnemonicArr = [...shuffleMnemonicArr, removed];
      setShuffleMnemonicArr(newShuffleMnemonicArr.sort((a, b) => a.index - b.index));
    },
    [selectedMnemonic, shuffleMnemonicArr],
  );

  // 验证选择助记词是否有效
  const checkSelectedMnemonicValid = useCallback(() => {
    let flag = true;
    if (selectedMnemonic.length !== mnemonicArr.length) {
      flag = false;
    }
    const selectedMnemonicStr = selectedMnemonic.map((item) => item.word).join(' ');
    if (selectedMnemonicStr !== mnemonic) {
      flag = false;
    }
    return flag;
  }, [selectedMnemonic, mnemonicArr, mnemonic]);

  const createWallet = useCallback(
    async (walletId: string) => {
      const { walletName } = getValues();
      const wallet = {
        id: walletId,
        name: walletName,
        mnemonic,
      };
      return wallet;
    },
    [mnemonic],
  );
  const saveWallectDb = useCallback(
    async (wallet: Wallet) => {
      await chainStorageUtils.addChainWallet(chain.chainId, wallet);
      if (!currentWallet) {
        const current = await chainStorageUtils.setCurrentWallet(wallet.id);
        setCurrentWallet(current);
      }
    },
    [chain, currentWallet],
  );
  const createAccount = useCallback(
    async (walletId: string, walletIndex: number) => {
      const { walletName } = getValues();
      const pri = wallet.privateKey
      const pub = wallet.publicKey
      const accountName = `${walletName}${zero(walletIndex + 1)}`;
      const address = wallet.address;
      const userSignKeyName = `${accountName}.key`;
      const userPublicKeyName = `${accountName}.pem`;
      const priFile = createPemFile(pri, userSignKeyName);
      const pubFile = createPemFile(pub, userPublicKeyName, 'application/x-x509-ca-cert');
      const [userSignKeyFile, userPublicKeyFile] = await chainStorageUtils.uploadFiles([priFile, pubFile]);
      const account = {
        userSignKeyFile,
        userPublicKeyFile,
        name: accountName,
        crtName: null,
        address,
        walletId,
        walletIndex,
      };
      return {
        account,
        values: {
          userSignKeyFile: priFile,
          userPublicKeyFile: pubFile,
          name: accountName,
          crtName: null,
        },
      };
    },
    [mnemonic, currentAccount],
  );
  // 保存到本地
  const saveAccountDb = useCallback(
    async (account: Account) => {
      await chainStorageUtils.addChainAccount(chain.chainId, account);
      if (!currentAccount) {
        const current = await chainStorageUtils.setCurrentAccount(account.address);
        setCurrentAccount(current);
      }
    },
    [currentAccount, chain],
  );

  const checkWalletNameValid = useCallback(() => {
    const { walletName } = getValues();
    let flag = true;
    if (walletName.length === 0) {
      flag = false;
    }
    return flag;
  }, []);
  // 下一步
  const nextStep = useCallback(async () => {
    setLoading(true);
    try {
      if (step === 1) {
        const walletNameValid = checkWalletNameValid();
        if (walletNameValid) {
          createMnemonic();
          setStep(step + 1);
        } else {
          message.error({
            content: '钱包备注名不可为空',
          });
        }
        setLoading(false);
        return;
      }
      if (step === 2) {
        setStep(step + 1);
        setLoading(false);
        return;
      }
      if (step === 3) {
        const mnemonicValid = checkSelectedMnemonicValid();
        if (mnemonicValid) {
          const walletId = uuidv4();
          const wallet = await createWallet(walletId);
          const { account, values } = await createAccount(walletId, 0);
          // 未链接的链。链接并更新信息
          // if (!chain.version) {
          //   const res = await updateChainConfig({ ...chain }, values as AccountForm, lackTLS);
          //   if (res) {
          //     setSelectedChain(res.updatedChain);
          //     setChains(res.chains);
          //     await chainStorageUtils.setSelectedChain(res.updatedChain);
          //     await initChainSubscribe(res.updatedChain);
          //   } else {
          //     message.error({
          //       content: '区块链网络连接失败',
          //       duration: 5000,
          //     });
          //     setLoading(false);
          //     return;
          //   }
          // }
          await saveWallectDb(wallet);
          await saveAccountDb(account);
          setStep(step + 1);
        } else {
          message.error({
            content: '助记词不正确',
          });
        }

        setLoading(false);
        return;
      }
    } catch (error) {
      console.debug(error);
      setLoading(false);
    }
  }, [
    step,
    checkSelectedMnemonicValid,
    checkWalletNameValid,
    createWallet,
    saveWallectDb,
    createAccount,
    saveAccountDb,
  ]);
  const nextDisabled = useMemo(() => {
    if (step === 1) {
      return !isValid && !checkWalletNameValid();
    }
    if (step === 2) {
      return !mnemonicArr.length;
    }
    if (step === 3) {
      return !checkSelectedMnemonicValid();
    }
    return true;
  }, [step, isValid, checkWalletNameValid, mnemonicArr, checkSelectedMnemonicValid]);
  return (
    <>
      <DetailPage title={'创建钱包'} backUrl={'/accounts'} className="hd-wallet-create-by-mnemonic">
        {step === 1 && (
          <div className="step stpe-1">
            <div className="tips">钱包备注名</div>
            <Form layout={'vertical'}>
              <Controller
                control={control}
                name="walletName"
                rules={{
                  required: '请输入钱包备注名',
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    message={fieldState.error?.message}
                    status={formUtils.getStatus({
                      fieldState,
                      isValidating,
                      isSubmitted,
                    })}
                  >
                    <Input size={'full'} {...field} placeholder="请输入" className="radius-4" />
                  </Form.Item>
                )}
              />
            </Form>
          </div>
        )}
        {step === 2 && (
          <div className="step step-2">
            <div className="tips">平台不托管助记词，请按顺序将助记词妥善保管在安全的环境内，避免遗失。</div>
            <MnemonicContainer orginArr={mnemonicArr} copy />
          </div>
        )}
        {step === 3 && (
          <div className="step step-3">
            <div className="tips">请按顺序选择您的12位助记词</div>
            <div className="selected-mnemonic-list">
              {selectedMnemonic.map((item, index) => (
                <div className="slected-item" key={item.word}>
                  <div className="word">{item.word}</div>
                  <div
                    className="close-icon"
                    onClick={() => {
                      handleDelete(index);
                    }}
                  >
                    <img src="../../../img/icon-delete-blue.png" alt="" />
                  </div>
                </div>
              ))}
            </div>
            <MnemonicContainer orginArr={shuffleMnemonicArr} select onSelect={handleSelect} />
          </div>
        )}
        {step === 4 && (
          <div className="step step-4">
            <div className="success-container">
              <div className="success-icon">
                <img src="../../../img/icon-success.png" alt="" />
              </div>
              <div className="success-text">恭喜您，钱包创建成功，为了您的资产安全，请妥善保管您的助记词。</div>
            </div>
          </div>
        )}
      </DetailPage>
      {step !== 4 && (
        <footer className="hd-wallet-create-by-mnemonic-footer">
          <Button
            onClick={() => {
              nextStep();
            }}
            type={'primary'}
            className={'btn-lg'}
            disabled={nextDisabled}
            loading={loading}
          >
            下一步
          </Button>
        </footer>
      )}
    </>
  );
}

export default HdWalletCreateByMnemonic;
