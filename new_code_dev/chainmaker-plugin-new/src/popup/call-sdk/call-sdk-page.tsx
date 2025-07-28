/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Input, Select } from 'tea-component';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { SignatureConfirmModal } from '@utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { SendRequestSDK } from '@src/event-page';

import { useChainStore } from '@popup/popup';
import GlossaryGuide from '@utils/glossary-guide';
import chainStorageUtils from '@utils/storage';
import { Account } from '@utils/interface';
import { callSDK } from '@src/services/call-sdk';

function CallSdkPage() {
  const location = useLocation();
  const SDKRequest = location.state as SendRequestSDK;
  const { module, method, paramList } = SDKRequest.body;
  const navigate = useNavigate();
  const {
    control,
    setValue,
    formState: { isValid },
  } = useForm({
    mode: 'onBlur',
  });
  const selectedChainId: string = useWatch({ name: 'chainId', control });
  const selectedAccountId: string = useWatch({ name: 'accountId', control });
  const { currentTab, selectedChain, currentAccount, chains } = useChainStore();
  const [disableSelectChain, setDisableSelectChain] = useState(false);
  const [chainOptions, setChainOptions] = useState([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // const accounts = useAccounts(selectedChain?.chainId);
  const [loading, setLoading] = useState(false);

  const curChain = useMemo(() => chains.find((chain) => chain.chainId === selectedChainId), [selectedChainId]);
  const curAccount = useMemo(
    () => accounts.find((account) => account.address === selectedAccountId),
    [selectedAccountId, accounts],
  );
  const accountOptions = useMemo(
    () =>
      accounts.map((item) => ({
        value: item.address,
        text: item.name,
      })),
    [accounts],
  );

  const signatureConfirmRef = useRef();

  const requestSdk = useCallback(async () => {
    try {
      const success = await callSDK({
        account: curAccount,
        chainId: curChain.chainId,
        module,
        method,
        paramList,
        ticket: SDKRequest.ticket,
      });

      success &&
        setTimeout(() => {
          backToHome();
        }, 1500);
      // 检查加入订阅
      chainStorageUtils.setLastTransTime();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [curAccount, curChain, SDKRequest]);

  const onSubmit = useCallback(async () => {
    if (await chainStorageUtils.getLastTransTime()) {
      await requestSdk();
    } else {
      // @ts-ignore
      signatureConfirmRef.current.show({
        confirm: requestSdk,
      });
    }
  }, [requestSdk]);

  useEffect(() => {
    if (!selectedChainId) return;
    const defaultAddress = SDKRequest?.accountAddress || currentAccount?.address;
    chainStorageUtils.getChainAccounts(selectedChainId).then((accounts) => {
      setAccounts(accounts);
      let curAddress = defaultAddress;
      if (!accounts.some((ac) => ac.address === defaultAddress)) {
        curAddress = accounts[0]?.address;
      }
      setValue('accountId', curAddress, { shouldValidate: true });
    });
  }, [selectedChainId]);

  const backToHome = useCallback(() => {
    navigate('/');
  }, []);

  useEffect(() => {
    setChainOptions(
      chains.map((chain) => ({
        value: chain.chainId,
        text: chain.chainName,
      })),
    );
    const validChainId = chains.some((chain) => chain.chainId === SDKRequest?.chainId);
    const chainId = validChainId ? SDKRequest?.chainId : selectedChain.chainId || chains[0].chainId;
    setValue('chainId', chainId, { shouldValidate: true });
    setDisableSelectChain(validChainId);
  }, []);

  return (
    <div className="transaction-wrapper">
      <div className={'signature'}>
        <div className="page-title">请求调用sdk</div>
        <div className="current-web-info">
          <img src={currentTab?.favIconUrl} />
          <div className="current-web-addr">{currentTab?.host}</div>
        </div>
        <Form layout={'vertical'}>
          <Form.Item label={<GlossaryGuide title="请求参数" />}>
            <div>
              <div className="font-min pb-10">{`请求调用${module}模块的${method}方法`}</div>
              <Input size={'full'} readOnly multiline value={JSON.stringify(paramList)} />
            </div>
          </Form.Item>
          <Controller
            control={control}
            rules={{
              required: '请输入',
            }}
            name="chainId"
            render={({ field }) => (
              <Form.Item label={<GlossaryGuide title={'选择签名账户'} />}>
                <Select
                  disabled={disableSelectChain}
                  size={'full'}
                  matchButtonWidth
                  appearance="button"
                  options={chainOptions}
                  placeholder="区块链网络名称"
                  {...field}
                />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            rules={{
              required: '请输入',
            }}
            name="accountId"
            render={({ field }) => (
              <Form.Item>
                <Select
                  size={'full'}
                  appearance="button"
                  matchButtonWidth
                  options={accountOptions}
                  placeholder="请选择账户"
                  {...field}
                />
              </Form.Item>
            )}
          />
        </Form>
        <div className={'flex-grow'} />
        <div className="signature-options">
          <div className="connect-concel connect-bt" onClick={backToHome}>
            取消
          </div>
          <Button
            type={'primary'}
            className="connect-sub connect-bt"
            disabled={!isValid || !Boolean(SDKRequest)}
            onClick={() => {
              onSubmit();
            }}
            loading={loading}
          >
            确定发起
          </Button>
        </div>
        <SignatureConfirmModal ref={signatureConfirmRef} />
      </div>
    </div>
  );
}

export default CallSdkPage;
