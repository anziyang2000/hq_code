/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'tea-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChainStore } from './popup';
import { MessageInfoCode, SendRequestParam } from '../event-page';
import { MnemonicContainer } from '../components/mnemonic-container';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import chainStorageUtils from '../utils/storage';
import { Controller, useForm, useWatch } from 'react-hook-form';
import formUtils from '../utils/form-utils';
import { createPemFile } from '../utils/utils';
import GlossaryGuide from '../utils/glossary-guide';
import { ethers } from "ethers";

function AccountImportByMnemonicPage() {
  const location = useLocation();
  const pageState = location.state as SendRequestParam;
  const navigate = useNavigate();
  const { currentTab, selectedChain, setSelectedChain, chains, addChainAccount } = useChainStore();
  const chain = chains.filter((ele) => ele.chainId === pageState.chainId)[0];
  const [mnemonicArr, setMnemonicArr] = useState<{ word: string; index: number }[]>([]);
  const [settingStep, setSettingStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<{
    pub?: string;
    pri?: string;
    address?: string;
  }>();
  const {
    control,
    formState: { isValidating, isSubmitted },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      accountName: '',
    },
  });
  const accountName = useWatch({ control, name: 'accountName' });
  useEffect(() => {
    if (pageState.body?.mnemonic) {
      setMnemonicArr(pageState.body.mnemonic.split(' ').map((word, index) => ({ word, index })));
    }
  }, [pageState.body?.mnemonic]);
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
  useEffect(() => {
    if (!chain) {
      message.error({
        content: '无效的chainId，请先添加链配置',
      });
      navigate('/chains');
      return;
    }
    setSelectedChain(chain);
  }, [chain]);
  const backToHome = () => {
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '插件取消助记词导入链账户',
    });
    navigate('/');
  };
  const subAccount = async () => {
    if (pageState.body?.mnemonic) {
      try {
        const baseWallet = ethers.utils.HDNode.fromMnemonic(pageState.body.mnemonic);
        const wallet = baseWallet.derivePath('0')
        const pri = wallet.privateKey
        const pub = wallet.publicKey
        const address = wallet.address
        const existAccount = await chainStorageUtils.checkChainAccountExist(selectedChain.chainId, {
          address,
        });

        if (existAccount) {
          message.error({
            content: '链账户已存在',
          });
          return;
        }
        setAccount({
          pub,
          pri,
          address,
        });
        setSettingStep(1);
      } catch (e) {
        message.error({
          content: '助记词无效',
        });
      }
    }
  };

  const subImport = async () => {
    const userSignKeyName = `${accountName}.key`;
    const userPublicKeyName = `${accountName}.pem`;
    const priFile = createPemFile(account.pri, userSignKeyName);
    const pubFile = createPemFile(account.pub, userPublicKeyName, 'application/x-x509-ca-cert');
    const value = {
      userSignKeyFile: priFile,
      userPublicKeyFile: pubFile,
      name: accountName,
      crtName: null,
      address: account.address,
    };

    await addChainAccount({ chain, account: value });
    setLoading(false);
    navigate('/wallet/jbok-wallet-detail', {
      state: {
        chain,
      },
    });
  };

  return (
    <div className="connect-web-page">
      <div className="page-title">请求授权导入链账户</div>
      {settingStep === 0 ? (
        <>
          <div className="current-web-info">
            <img src={currentTab?.favIconUrl} />
            <div className="current-web-addr">{currentTab?.host}</div>
          </div>
          <div className="connect-warning">该网页请求将链账户添加到Smartplugin里，请确定是否添加？</div>
          <div className="mnemonic-area">
            <MnemonicContainer orginArr={mnemonicArr} />
          </div>
          <div className={'flex-grow'} />
          <div className="connect-options">
            <div className="connect-concel connect-bt" onClick={backToHome}>
              拒绝
            </div>
            <button
              className="connect-sub connect-bt"
              onClick={() => {
                subAccount();
              }}
            >
              确认
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="chain-content">
            <Form layout={'vertical'}>
              <Controller
                control={control}
                name="accountName"
                rules={{
                  required: '请输入账户名称',
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    status={formUtils.getStatus({
                      fieldState,
                      isValidating,
                      isSubmitted,
                    })}
                    message={fieldState.error?.message}
                    label={<GlossaryGuide title={'账户名称'} />}
                  >
                    <Input size={'full'} {...field} />
                  </Form.Item>
                )}
              />
            </Form>
          </div>
          <div className={'flex-grow'} />
          <div className="connect-options">
            <div className="connect-concel connect-bt" onClick={backToHome}>
              拒绝
            </div>
            <Button
              className="connect-sub connect-bt"
              disabled={!accountName}
              onClick={() => {
                subImport();
              }}
              loading={loading}
            >
              确认
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default AccountImportByMnemonicPage;
