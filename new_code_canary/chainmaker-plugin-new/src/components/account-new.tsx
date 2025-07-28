import formUtils from '../utils/form-utils';
import { Account, AccountForm, Chain, ChainForm } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import {
  createPemFile,
} from '../utils/utils';
import { useAccounts } from '../utils/hooks';
import { useChainStore } from '../popup/popup';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, message } from 'tea-component';

import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './account-new.less';
const { Password } = Input;

// @ts-ignore
import { ethers } from 'ethers';

interface AccountNewProps {
  chain: Chain;
  initial?: boolean;
  defaultValues?: AccountForm;
  onSuccess: () => void;
  onError: (err: Error) => void;
  onCancel: () => void;
}

function AccountNew({ chain, defaultValues, onSuccess, onError, onCancel }: AccountNewProps) {
  const {
    control,
    reset,
    formState: { isValidating, isSubmitted, isValid },
    getValues,
    setValue
  } = useForm({
    mode: 'onBlur'
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentAccount, setCurrentAccount } = useChainStore();

  // 异常处理
  useMemo(() => {
    if (!chain) {
      const msg = '无效的chainId，请先添加链配置';
      message.error({
        content: msg
      });
      onError(new Error(msg));
    }
  }, []);

  const accounts = useAccounts(chain?.chainId);
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setValue('name', defaultValues.name, {
        shouldValidate: true
      });
    } else if (accounts.length) {
      reset({
        orgId: accounts[0].orgId
      });
    }
  }, []);

  function isValidPrivateKey(input: string): boolean {
    const trimmed = input.trim();
    return /^0x[0-9a-fA-F]{64}$/.test(trimmed) || /^[0-9a-fA-F]{64}$/.test(trimmed);
  }

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const values = getValues() as ChainForm & AccountForm & { accountName?: string };
      const rawInput = values.name?.trim(); // name 作为私钥字符串
      const inputAccountName = values.accountName?.trim();
  
      if (!rawInput || !isValidPrivateKey(rawInput)) {
        throw new Error('请输入合法的以太坊私钥（64位十六进制字符串）');
      }
  
      // 自动加上 0x 前缀（如果没有）
      const normalizedPrivateKey = rawInput.startsWith('0x') ? rawInput : `0x${rawInput}`;
      const wallet = new ethers.Wallet(normalizedPrivateKey);
      const pubPem = wallet.publicKey;
      const address = wallet.address;
  
      // console.log('用户输入的私钥内容:', rawInput);
      // console.log('派生的地址:', address);
      // console.log('派生的公钥:', pubPem);
  
      const userSignKeyName = `${address}.key`;
      const userPublicKeyName = `${address}.pem`;
  
      const userSignKeyFile = createPemFile(normalizedPrivateKey, userSignKeyName);
      const userPublicKeyFile = createPemFile(pubPem, userPublicKeyName, 'application/x-x509-ca-cert');

      const [uploadedSignKeyFile, uploadedPublicKeyFile] = await chainStorageUtils.uploadFiles([
        userSignKeyFile,
        userPublicKeyFile,
      ]);

      const accountName = inputAccountName || `未分类钱包账户${accounts.length + 1}`;

      const account: Account = {
        userSignKeyFile: uploadedSignKeyFile,
        userPublicKeyFile: uploadedPublicKeyFile,
        name: accountName,
        address,
      };

      const existAccount = await chainStorageUtils.checkChainAccountExist(chain.chainId, account);
      if (existAccount) {
        message.error({ content: '链账户已存在' });
      } else {
        await chainStorageUtils.addChainAccount(chain.chainId, account);
        if (!currentAccount) {
          const res = await chainStorageUtils.setCurrentAccount(account.address);
          setCurrentAccount(res);
        }
        // await updateAccountDidAndVc({ chainId: chain.chainId, account });
        onSuccess?.();
      }
    } catch (e) {
      message.error({
        content: `添加区块链账户失败\n${e.message || e}`,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [chain, currentAccount]);

  if (!chain) return null;

  return (
    <>
      <Form layout={'vertical'} className={'mt-8n'}>
        <Controller
          control={control}
          name="accountName"
          rules={{
            required: '账户名称不能为空',
            validate: (value) => {
              const trimmed = value?.trim();
              if (!trimmed) return '账户名称不能为空';
              const isDuplicate = accounts.some(acc => acc.name === trimmed);
              if (isDuplicate) return '账户名称已存在';
              return true;
            }
          }}
          render={({ field, fieldState }) => (
            <Form.Item
              status={formUtils.getStatus({ fieldState, isValidating, isSubmitted })}
              label={'账户名称（可自定义）'}
              message={fieldState.error?.message}
            >
              <Input size="full" placeholder="请输入账户名称" {...field} />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          rules={{
            required: '请输入私钥',
            validate: (privateKey: string) => {
              if (!privateKey?.length) return '请输入私钥';
              const trimmed = privateKey.trim();
              if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed) && !/^[0-9a-fA-F]{64}$/.test(trimmed)) {
                return '请输入合法的私钥（64位十六进制字符串）';
              }
              return undefined;
            },
          }}
          name="name"
          render={({ field, fieldState }) => (
            <Form.Item
              label="请输入账户私钥"
              message={fieldState.error?.message}
              status={formUtils.getStatus({ fieldState, isSubmitted, isValidating })}
              className='privateKeyInput'
            >
              <Password
                placeholder="请输入账户私钥"
                size="l"
                rules={false}
                {...field}
              />
            </Form.Item>
          )}
        />
      </Form>
      <footer className={'mt-12n btn-group'}>
        <Button type={'weak'} onClick={handleCancel}>
          取消
        </Button>
        <Button type={'primary'} disabled={!isValid} onClick={handleClick} loading={loading}>
          确认添加
        </Button>
      </footer>
    </>
  );
}

export default AccountNew;
