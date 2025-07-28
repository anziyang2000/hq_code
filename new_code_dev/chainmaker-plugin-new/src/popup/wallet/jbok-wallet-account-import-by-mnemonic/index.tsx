import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// @ts-ignore
import { Button, Form, Input, message } from 'tea-component';
import chainStorageUtils from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { createPemFile, isLackTLSChain, updateChainConfig } from '../../../utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { Account, AccountForm, Chain } from '../../../utils/interface';
import formUtils from '../../../utils/form-utils';
import './index.less';
import { updateAccountDidAndVc } from '../../../services/did';
import { initChainSubscribe } from '../../../services/chain';
import { ethers } from "ethers";
// 非确定性钱包-助记词导入链账户
// 1.导入助记词
// 2.成功
function JbokWalletAccountImportByMnemonic() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chain } = location.state as {
    chain: Chain;
  };
  const lackTLS = useMemo(() => isLackTLSChain(chain), [chain]);
  const [loading, setLoading] = useState(false);
  const { setSelectedChain, setChains, currentAccount, setCurrentAccount } = useChainStore();
  const [mnemonicArr, setMnemonicArr] = useState<{ id: string; word: string }[]>(() => {
    const ary = [];
    for (let i = 0; i < 12; i++) {
      ary.push({
        id: uuidv4(),
        word: '',
      });
    }
    return ary;
  });

  const {
    control,
    formState: { isValidating, isSubmitted, isValid },
    getValues,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      accountName: '',
    },
  });
  const back = useMemo(
    () => ({
      url: '/wallet/jbok-wallet-detail',
      state: {
        chain,
      },
    }),
    [chain],
  );
  const mnemonic = useMemo(() => mnemonicArr.map((item) => item.word.trim()).join(' '), [mnemonicArr]);
  // 验证助记词是否有为空的
  const checkMnemonicSomeEmpty = useCallback(() => mnemonicArr.some((item) => !item.word.trim().length), [mnemonicArr]);
  // 验证助记词是否有效
  const checkMnemonicValid = useCallback(() => {
    let flag = true;
    if (mnemonicArr.length !== 12) {
      flag = false;
    }
    if (checkMnemonicSomeEmpty()) {
      flag = false;
    }
    if (!ethers.utils.isValidMnemonic(mnemonic)) {
      flag = false;
    }
    return flag;
  }, [mnemonic, mnemonicArr]);
  // 验证账户备注名
  const checkAccountNameValid = useCallback(() => {
    const { accountName } = getValues();
    let flag = true;
    if (accountName.length === 0) {
      flag = false;
    }
    return flag;
  }, []);

  const createAccount = useCallback(async () => {
    const { accountName } = getValues();
    const walletSdk = ethers.Wallet.fromMnemonic(mnemonic);
    const pri = walletSdk.privateKey
    const pub = walletSdk.publicKey
    const address = walletSdk.address
    const userSignKeyName = `${accountName}.key`;
    const userPublicKeyName = `${accountName}.pem`;
    const priFile = createPemFile(pri, userSignKeyName);
    const pubFile = createPemFile(pub, userPublicKeyName, 'application/x-x509-ca-cert');
    const [userSignKeyFile, userPublicKeyFile] = await chainStorageUtils.uploadFiles([priFile, pubFile]);
    const account: Account = {
      userSignKeyFile,
      userPublicKeyFile,
      name: accountName,
      //crtName: null,
      address,
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
  }, [mnemonic]);
  // 保存到本地
  const saveAccountDb = useCallback(
    async (account: Account) => {
      await chainStorageUtils.addChainAccount(chain.chainId, account);
      if (!currentAccount) {
        const current = await chainStorageUtils.setCurrentAccount(account.address);
        setCurrentAccount(current);
      }
    },
    [currentAccount],
  );

  // 确认导入
  // const nextStep = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     if (!checkAccountNameValid()) {
  //       message.error({ content: '链账户注名不可为空' });
  //       return;
  //     }
  
  //     if (!checkMnemonicValid()) {
  //       message.error({ content: '助记词无效' });
  //       return;
  //     }
  
  //     const { account } = await createAccount();
  
  //     // ✅ 使用新增的全局账户检测方法
  //     const existAccount = await chainStorageUtils.checkGlobalAccountExist(account);
  //     if (existAccount) {
  //       message.error({ content: '账户已存在' });
  //       return;
  //     }
  
  //     // ✅ 保存到全局账户列表中
  //     await chainStorageUtils.saveGlobalAccount(account);
  
  //     // ❓按链保存 DID 或 vc 信息，这个根据业务需求决定保留或不保留
  //     await updateAccountDidAndVc({ chainId: chain.chainId, account });
  
  //     navigate(back.url, { state: back.state });
  //   } catch (error) {
  //     console.debug(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [checkMnemonicValid, checkAccountNameValid, createAccount, navigate]);
  
  const nextStep = useCallback(async () => {
    setLoading(true);
    try {
      const walletNameValid = checkAccountNameValid();
      if (!walletNameValid) {
        message.error({
          content: '链账户注名不可为空',
        });
        setLoading(false);
      } else {
        const mnemonicValid = checkMnemonicValid();
        if (!mnemonicValid) {
          message.error({
            content: '助记词无效',
          });
          setLoading(false);
        } else {
          const { account, values } = await createAccount();
          const existAccount = await chainStorageUtils.checkChainAccountExist(chain.chainId, account);
          if (existAccount) {
            message.error({
              content: '链账户已存在',
            });
            setLoading(false);
          } else {
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
            await saveAccountDb(account);
            // 获取did，vc信息
            await updateAccountDidAndVc({ chainId: chain.chainId, account });
            setLoading(false);
            navigate(back.url, {
              state: back.state,
            });
          }
        }
      }
    } catch (error) {
      console.debug(error);
      setLoading(false);
    }
  }, [checkMnemonicValid, checkAccountNameValid, createAccount, saveAccountDb]);
  // 按钮可点击
  const nextDisabled = useMemo(
    () => (!isValid && !checkAccountNameValid()) || checkMnemonicSomeEmpty(),
    [isValid, checkAccountNameValid, mnemonicArr],
  );
  const handlePaste = useCallback((e: any, index: number) => {
    const mnemonics = e.clipboardData.getData('Text') || '';
    const arr = [...mnemonicArr];
    const mnemonicsAry = mnemonics.split(' ');
    if (mnemonicsAry.length >= 12) {
      arr.forEach((item, i) => {
        // eslint-disable-next-line no-param-reassign
        item.word = mnemonicsAry[i];
      });
    } else {
      mnemonicsAry.forEach((item) => {
        arr[index].word = item;
        // eslint-disable-next-line no-param-reassign
        index += 1;
      });
    }

    setMnemonicArr(arr);
  }, []);
  return (
    <>
      <DetailPage
        title={'导入链账户'}
        backUrl={back.url}
        backState={back.state}
        className="jbok-wallet-account-import-by-mnemonic"
      >
        <>
          <div className="wallect-account-name-container">
            <div className="tips">链账户备注名</div>
            <Form layout={'vertical'}>
              <Controller
                control={control}
                name="accountName"
                rules={{
                  required: '请输入链账户备注名',
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
          <div className="mnemonics-container">
            <div className="tips">请按顺序输入您的12位助记词</div>
            <Form layout={'vertical'} className="mnemonic-list">
              {mnemonicArr.map((item, index) => (
                <Form.Item className="mnemonic-item" key={item.id}>
                  <>
                    <div className="index">{index + 1}</div>
                    <Input
                      onPaste={(e: any) => {
                        handlePaste(e, index);
                        e.preventDefault();
                      }}
                      size={'full'}
                      className="radius-4"
                      value={item.word}
                      onChange={(word) => {
                        setMnemonicArr((state) => {
                          const arr = [...state];
                          arr[index] = {
                            ...arr[index],
                            word,
                          };
                          return arr;
                        });
                      }}
                    />
                  </>
                </Form.Item>
              ))}
            </Form>
          </div>
        </>
      </DetailPage>
      <footer className="jbok-wallet-account-import-by-mnemonic-footer">
        <Button
          onClick={() => {
            nextStep();
          }}
          type={'primary'}
          className={'btn-lg'}
          disabled={nextDisabled}
          loading={loading}
        >
          确认导入
        </Button>
      </footer>
    </>
  );
}

export default JbokWalletAccountImportByMnemonic;
