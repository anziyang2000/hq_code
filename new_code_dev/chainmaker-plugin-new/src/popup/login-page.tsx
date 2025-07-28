/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useState } from 'react';
import { Button, Form, Input } from 'tea-component';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import chainStorageUtils from '../utils/storage';
import { ProductGuideLink } from '../utils/common';
import { useChainStore } from './popup';
import formUtils from '../utils/form-utils';
import { OFFICIAL_CHAIN_MAP, DEFAULT_CHAIN } from '../config/official-chain';
import { Chain } from '../utils/interface';
import { subscribeDefaultContract } from '../services/chain';
const { Password } = Input;

// function LoginPage({  }: {
//   onLogged: () => void
// }) {
function LoginPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const setInitialized = useChainStore((state) => state.setInitialized);
  const setChains = useChainStore((state) => state.setChains);
  const setSelectedChain = useChainStore((state) => state.setSelectedChain);

  const onClick = useCallback(() => {
    setLoading(true);
    chainStorageUtils.setLogin(getValues().password).then(async () => {
      // onLogged();
      setInitialized(false);
      const chains = Object.keys(OFFICIAL_CHAIN_MAP).map((chainId) => OFFICIAL_CHAIN_MAP[chainId]);
      await Promise.all([chainStorageUtils.setChains(chains), chainStorageUtils.setSelectedChain(DEFAULT_CHAIN)]);
      for (const chain of chains) {
        await subscribeDefaultContract(chain);
      }
      setChains(chains as Chain[]);
      setSelectedChain(DEFAULT_CHAIN);
      setLoading(false);
      // navigate('/');
      // navigate('/accountAction');
      // navigate('/signature');
      navigate('/accounts');
    });
  }, []);

  const {
    control,
    formState: { isValid, isSubmitted, isValidating },
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  return (
    <div className={'login'}>
      <img className={'login-img'} src={'./img/hqsk.png'} alt={''} />
      <div className={'tip'}>欢迎使用环球链 - 环球数科官方插件</div>
      <Form layout={'vertical'} className={'mt-8n'}>
        <Controller
          control={control}
          rules={{
            required: '请输入',
            validate: (password: string) => {
              if (!password?.length) {
                return '请输入密码';
              }
              const exp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;//规则：长度8-30，必须包含数字、字母、特殊符号
              if (!exp.test(password)) {
                return '必须包含8-16位数字、字母、特殊符号';
              }
              return undefined;
            },
          }}
          name="password"
          render={({ field, fieldState }) => (
            <Form.Item
              label={'登录密码'}
              message={fieldState.error?.message}
              status={formUtils.getStatus({ fieldState, isSubmitted, isValidating })}
            >
              <Password placeholder={'请输入6-16位字母和数字组合'} rules={false} size={'l'} {...field} />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          rules={{
            validate: (value) => {
              if (value !== getValues('password')) {
                return '两次密码输入不一致';
              }
              if (!value) {
                return '请输入';
              }
              return;
            },
          }}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Form.Item
              label={'确认密码'}
              message={fieldState.error?.message}
              status={formUtils.getStatus({ fieldState, isSubmitted, isValidating })}
            >
              <Password rules={false} onPressEnter={onClick} {...field} size={'l'} />
            </Form.Item>
          )}
        />
      </Form>
      <div className={'flex-grow'} />
      <footer>
        <Button type={'primary'} className={'btn-lg'} onClick={onClick} disabled={!isValid} loading={loading}>
          下一步
        </Button>
        <ProductGuideLink />
      </footer>
    </div>
  );
}

export default LoginPage;
