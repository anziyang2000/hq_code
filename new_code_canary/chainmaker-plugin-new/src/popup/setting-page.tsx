/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { ConfirmModal, DetailPage } from '../utils/common';
import { Button, Form, Input, InputNumber, message } from 'tea-component';
import { Controller, useForm } from 'react-hook-form';
import formUtils, { getHostName, Validator } from '../utils/form-utils';
import { PluginSetting } from '../utils/interface';
import chainStorageUtils, { contractStoreUtils } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { useChainStore } from './popup';

function SettingPage(props: { onReset: () => void }) {
  const deleteConfirmRef = useRef<typeof ConfirmModal>();

  const {
    control,
    formState: { isValidating, isSubmitted, isValid },
    getValues,
    reset,
  } = useForm({
    mode: 'onBlur',
  });
  const navigate = useNavigate();
  const resetStore = useChainStore((state) => state.reset);
  const { selectedChain } = useChainStore();
  const chainId = selectedChain?.chainId;

  const handleClick = useCallback(async () => {
    const values = getValues() as PluginSetting;
    const updateValues = {
      ...values,
      proxyHostname: getHostName(values.proxyHostname),
      proxyHostnameTls: getHostName(values.proxyHostnameTls),
    };
    chainStorageUtils.setSetting(updateValues);
    reset(updateValues);
    message.success({
      content: '保存成功',
    });
  }, []);

  useEffect(() => {
    chainStorageUtils.getSetting().then((res) => {
      reset(res);
    });
  }, []);

  const resetClick = useCallback(() => {
    // @ts-ignore
    deleteConfirmRef.current.show({
      confirm: () => {
        Promise.all([chainStorageUtils.clearData(), contractStoreUtils.clearData()]).then(() => {
          // 删除合约
          // contractStoreUtils.abortSubscribe(chainId);
          props.onReset();
          resetStore();
          navigate('/login');
        });
      },
    });
  }, []);

  return (
    <DetailPage title={'系统设置'} backUrl={'/'} className={'pb-0'}>
      {/* <h3>设置网络转发代理</h3>
      <div className={'tea-mt-2n'}>
        该代理负责将HTTP请求转化为gRPC请求，默认由长安链官方提供代理，您可查看
        <a href={CHAIN_MAKER.proxyRepoURL} target={'_blank'} rel="noreferrer">
          官方代理源码
        </a>
        。如需自行部署可查看
        <a href={CHAIN_MAKER.helpMeURL} target={'_blank'} rel="noreferrer">
          帮助文档
        </a>
        。
      </div> */}
      <div className={'flex-grow mt-2n'}>
        <Form layout={'vertical'}>
          {/* <Controller
            control={control}
            rules={{
              validate: Validator.validateHostname,
            }}
            name="proxyHostname"
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                message={fieldState.error?.message}
                label="代理地址"
              >
                <Input size={'full'} {...field} />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            rules={{
              validate: Validator.validateHostname,
            }}
            name="proxyHostnameTls"
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                message={fieldState.error?.message}
                label="代理地址TLS"
              >
                <Input size={'full'} {...field} />
              </Form.Item>
            )}
          /> */}
          <h3>设置免输密码时间</h3>
          <div className={'tea-mt-2n'}>
            该设置用于控制，多长时间内发送交易可以免输交易密码以及多久未操作，就将插件锁屏。
          </div>
          <Controller
            control={control}
            name="lockLife"
            render={({ field }) => (
              <Form.Item showStatusIcon={false} label={<div className={'mt-4n'}>免密时长</div>}>
                <InputNumber size={'l'} min={1} max={60} unit="分钟" {...field} />
              </Form.Item>
            )}
          />
          <Button type={'primary'} className={'mt-8n btn-lg'} disabled={!isValid} onClick={handleClick}>
            保存
          </Button>
        </Form>
        <h3 className={'mt-xn'}>重置插件</h3>
        <div className={'tea-mt-2n'}>重置后，将复位到初始化状态，并清空已连接的区块链网络，以及链账户信息。</div>
        <Button type={'primary'} onClick={resetClick} className={'btn-lg mt-8n'}>
          重置插件
        </Button>
      </div>
      <footer className={'mt-6n version'}>
        版本号：v{chrome.runtime.getManifest().version}
        {!PROD && '（开发版）'}
      </footer>
      <ConfirmModal title={'重置插件'} ref={deleteConfirmRef}>
        {'确定重置'}
      </ConfirmModal>
    </DetailPage>
  );
}

export default SettingPage;
