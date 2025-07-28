/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Form, Input, message, Select, Switch } from 'tea-component';
import { Controller, useForm, useWatch } from 'react-hook-form';
import formUtils, { Validator } from '../utils/form-utils';
import { useNavigate } from 'react-router-dom';
import chainStorageUtils from '../utils/storage';
import { AccountForm, Chain, ChainForm, PluginSetting } from '../utils/interface';
import { DetailPage, ConfirmModal } from '../utils/common';
import {
  pick,
  isSupportHTTP,
} from '../utils/utils';
import { useChainStore } from './popup';
import GlossaryGuide from '../utils/glossary-guide';
import { DEFAULT_HOSTNAME } from '../config/chain';
import { initChainSubscribe } from '../services/chain';
import { BEACON_EVENTS, beacon } from '../beacon';

function ChainNewPage() {
  const {
    control,
    formState: { isValidating, isSubmitted, isValid },
    getValues,
    setValue,
    trigger,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      tlsEnable: true,
      protocol: 'GRPC',
      hostName: DEFAULT_HOSTNAME,
      accountMode: 'permissionedWithCert',
    } as any,
  });
  const navigate = useNavigate();
  const { chains, setChains, setSelectedChain, setCurrentAccount } = useChainStore((state) => state);

  const initialized = useChainStore((state) => state.initialized);
  const setInitialized = useChainStore((state) => state.setInitialized);
  const [pluginSetting, setPluginSetting] = useState<PluginSetting>();
  const [address, setAddress] = useState('');

  const tlsEnable: ChainForm['tlsEnable'] = useWatch({ name: 'tlsEnable', control });
  const accountMode: ChainForm['accountMode'] = useWatch({ name: 'accountMode', control });

  const handleCancel = useCallback(() => {
    navigate('/chains');
  }, []);

  const [loading, setLoading] = useState(false);
  const httpFailRef = useRef<typeof ConfirmModal>();
  const chainFailRef = useRef<typeof ConfirmModal>();

  const handleClick = useCallback(async () => {
    
    const values = getValues() as ChainForm & AccountForm;
    // console.log('[DEBUG] 点击添加按钮，当前表单值:', values);
  
    // ✅ 检查是否填写了至少一个关键字段
    const requiredFields = ['chainName', 'nodeIp', 'chainId'];
    const hasAnyRequiredField = requiredFields.some(
      (field) => !!values[field]?.toString().trim()
    );
  
    if (!hasAnyRequiredField) {
      message.error({
        content: '请至少填写链名称、节点地址或链ID中的任意一项',
      });
      return;
    }
  
    setLoading(true);
    beacon.onUserAction(BEACON_EVENTS.BLOCKCHAIN_ADD_CONFIRM);
  
    try {
      // console.log('[DEBUG] 构建 chain 对象...');
      const chain: Chain = {
        ...pick(values, [
          'chainId',
          'chainName',
          'nodeIp',
          'tlsEnable',
          'accountMode',
          'hostName',
          'protocol',
          'browserLink',
        ]),
        userTLSKeyFile: null,
        userTLSCrtFile: null,
        nodeTLSCrtFile: null,
        version: null,
        httpSupport: isSupportHTTP(values),
      };
  
      // console.log('[DEBUG] 跳过链配置步骤，直接保存链信息');
  
      // ✅ 只添加链，不添加账户
      const chains = await chainStorageUtils.addChain(chain);
      setChains(chains as Chain[]);
      await initChainSubscribe(chain);
  
      if (chains.length === 1) {
        setSelectedChain(chains[0]);
        await chainStorageUtils.setSelectedChain(chains[0]);
  
        // ✅ 安全获取当前账户，如果没有就跳过
        const account = await chainStorageUtils.getCurrentAccount();
        if (account) {
          setCurrentAccount(account);
        }
      }
  
      setLoading(false);
      if (initialized) {
        navigate('/chains');
      } else {
        setInitialized(true);
        navigate('/');
      }
    } catch (e: any) {
      // console.error('[ERROR] 添加失败:', e);
      setLoading(false);
      message.error({
        content: `添加区块链网络失败\n${e.message || e}`,
        duration: 5000,
      });
    }
  }, [initialized, pluginSetting, address]);

  useEffect(() => {
    chainStorageUtils.getSetting().then((res) => {
      setPluginSetting(res);
    });
  }, []);

  useEffect(() => {
    trigger(['userTLSKeyFile', 'userTLSCrtFile', 'hostName']);
  }, [tlsEnable]);

  useEffect(() => {
    accountMode === 'public' && setValue('tlsEnable', false);
  }, [accountMode]);

  return (
    <>
      <DetailPage title={'添加区块链网络'} backUrl={'/chains'}>
        <Form layout={'vertical'}>
          <Controller
            control={control}
            rules={{
                required: '请输入',
                validate: (value) => {
                    if (chains.some((item) => item.chainName === value)) {
                        return '已添加过该网络名称';
                    }
                    return true;
                },
            }}
            name="chainName"
            render={({ field, fieldState }) => (
                <Form.Item
                    status={formUtils.getStatus({
                        fieldState,
                        isValidating,
                        isSubmitted,
                    })}
                    message={fieldState.error?.message}
                    label={<GlossaryGuide title={'区块链网络名称'} />}
                >
                    <Input placeholder={'输入网络名称'} size={'full'} {...field} />
                </Form.Item>
            )}
          />
          <Controller
            control={control}
            rules={{
              validate: (value) => {
                if (!value) return true; // 可选允许为空

                const trimmed = value.trim();

                // 必须以 http:// 或 https:// 开头
                if (!/^https?:\/\//i.test(trimmed)) {
                  return '请输入以 http:// 或 https:// 开头的有效 URL';
                }

                // 去掉协议部分用于后续 IP:PORT 校验
                const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
                const [ipPart] = withoutProtocol.split(':');

                // 校验 IP 格式
                if (!/^\d{1,3}(\.\d{1,3}){0,3}$/.test(ipPart)) {
                  return '请输入有效的 IPv4 地址';
                }

                return true;
              },
            }}
            name="nodeIp"
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                message={fieldState.error?.message}
                label={<GlossaryGuide title={'默认RPC(远程过程调用)URL'} />}
              >
                <Input
                  size={'full'}
                  placeholder={'如 http://127.0.0.1:8080'}
                  {...field}
                  onBlur={(e) => {
                    let v = e.target.value.trim();
                    if (!v) {
                      field.onChange(v);
                      field.onBlur();
                      return;
                    }

                    // 如果仅输入了 http:// 或 https://，补全为 http://0.0.0.0
                    if (/^https?:\/\/$/i.test(v)) {
                      v = `${v}0.0.0.0`;
                    }

                    // 若符合 http(s)://IP 或 IP:PORT 格式但不足 4 段则自动补零
                    if (/^https?:\/\/\d{1,3}(\.\d{0,3}){0,3}(:\d+)?$/i.test(v)) {
                      const matched = v.match(/^(https?:\/\/)([\d\.]+)(:\d+)?$/i);
                      if (matched) {
                        const protocol = matched[1];
                        const ipPart = matched[2];
                        const portPart = matched[3] || '';
                        const ipSegments = ipPart.split('.');
                        while (ipSegments.length < 4) {
                          ipSegments.push('0');
                        }
                        v = `${protocol}${ipSegments.join('.')}${portPart}`;
                      }
                    }

                    field.onChange(v);
                    field.onBlur();
                  }}
                />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            rules={{
              validate: (value) => {
                const validateRes = Validator.validateChainId(value);
                if (validateRes) {
                  return validateRes;
                }
                if (chains.some((item) => item.chainId === value)) {
                  return '已添加过该链';
                }
              },
            }}
            name="chainId"
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                label={<GlossaryGuide title={'链ID'} />}
                message={fieldState.error?.message}
              >
                <Input placeholder={'输入链ID'} size={'full'} {...field} />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            name="coin"
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                message={fieldState.error?.message}
                label={<GlossaryGuide title={'货币符号'} />}
              >
                <Input size={'full'} placeholder={'输入符号'} {...field} />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            name="browserLink"
            rules={{
              validate: (value) => {
                if (!value) return true; // 可选，允许为空
                if (/^https?:\/\//i.test(value.trim())) {
                  return true;
                }
                return '请输入以 http:// 或 https:// 开头的有效 URL';
              },
            }}
            render={({ field, fieldState }) => (
              <Form.Item
                status={formUtils.getStatus({
                  fieldState,
                  isValidating,
                  isSubmitted,
                })}
                label={<GlossaryGuide title={'区块链浏览器 URL（选填）'} />}
                message={fieldState.error?.message}
              >
                <Input
                  size={'full'}
                  placeholder={'如 https://scan.xxx.com'}
                  {...field}
                  onBlur={(e) => {
                    let v = e.target.value.trim();

                    // 如果仅输入了 http:// 或 https://，补全为 http://0.0.0.0 或 https://0.0.0.0
                    if (/^https?:\/\/$/i.test(v)) {
                      v = `${v}0.0.0.0`;
                    }

                    // 如果输入了 http(s):// 开头，且是 IP 且不足四段，则自动补 0
                    if (/^https?:\/\/\d{1,3}(\.\d{0,3}){0,3}$/i.test(v)) {
                      const matched = v.match(/^(https?:\/\/)([\d\.]+)$/i);
                      if (matched) {
                        const protocol = matched[1];
                        const ipPart = matched[2];
                        const ipSegments = ipPart.split('.');
                        while (ipSegments.length < 4) {
                          ipSegments.push('0');
                        }
                        v = `${protocol}${ipSegments.join('.')}`;
                      }
                    }

                    // 更新值并立即触发校验
                    field.onChange(v);
                    field.onBlur();
                  }}
                />
              </Form.Item>
            )}
          />

        </Form>
        {initialized === false ? (
          <>
            <Button
              type={'primary'}
              disabled={!isValid}
              loading={loading}
              onClick={() => {
                handleClick();
              }}
              className={'mt-12n btn-lg'}
            >
              完成
            </Button>
          </>
        ) : (
          <footer className={'mt-12n btn-group'}>
            <Button type={'weak'} onClick={handleCancel}>
              取消
            </Button>
            <Button
              type={'primary'}
              disabled={!isValid}
              onClick={() => {
                handleClick();
              }}
              loading={loading}
            >
              添加
            </Button>
          </footer>
        )}
        <ConfirmModal title={'系统提示'} ref={httpFailRef} isHideConfirmBtn={true} cancelBtnText={'关闭'}>
          {'https请求失败，请检测tls证书是否被信任'}
        </ConfirmModal>
        <ConfirmModal title={'系统提示'} ref={chainFailRef} isHideConfirmBtn={true} cancelBtnText={'关闭'}>
          {'添加链配置失败，请检测长安链节点配置是否支持HTTP协议、TLS验证模式是否配置正确'}
        </ConfirmModal>
      </DetailPage>
    </>
  );
}

export default ChainNewPage;
