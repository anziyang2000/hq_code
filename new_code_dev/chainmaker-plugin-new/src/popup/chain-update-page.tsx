/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chain, ChainForm, ChainProtocol, PluginSetting } from '../utils/interface';
import { DetailPage, ReadonlyFormItem } from '../utils/common';
import { Button, Form, Input, Select, Switch, message } from 'tea-component';
import { isSupportHTTP, pick, protocolOptions, uploadCerts } from '../utils/utils';
import GlossaryGuide from '../utils/glossary-guide';
import chainStorageUtils from '../utils/storage';
import { initChainSubscribe, pullRemoteChainConfig } from '../services/chain';
import { useChainStore } from './popup';
import { Controller, useForm, useWatch } from 'react-hook-form';
import formUtils, { Validator } from '../utils/form-utils';
import isValid from 'date-fns/isValid';

function ChainUpdatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setChains, selectedChain, setSelectedChain } = useChainStore();
  const chain = location.state as Chain;
  const [pluginSetting, setPluginSetting] = useState<PluginSetting>();
  const {
    control,
    formState: { isValidating, isSubmitted },
    getValues,
    setValue,
    handleSubmit, // 新增
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      tlsEnable: chain.tlsEnable || false,
      protocol: chain.protocol || 'GRPC',
      hostName: chain.hostName,
      browserLink: chain.browserLink,
      chainName: chain.chainName,
      nodeIp: chain.nodeIp,
    } as any,
  });
  const tlsEnable: ChainForm['tlsEnable'] = useWatch({ name: 'tlsEnable', control });
  const protocol: ChainProtocol = useWatch({ name: 'protocol', control });
  const [loading, setLoading] = useState(false);
  const refTlsCrt = useRef(null);
  const refTlsKey = useRef(null);
  useEffect(() => {
    // 获取代理配置
    chainStorageUtils.getSetting().then((res) => {
      setPluginSetting(res);
    });

    (async function () {
      // 设置默认tls
      if (chain.userTLSCrtFilePath && chain.userTLSKeyFilePath) {
        const [userTLSCrtFile, userTLSKeyFile] = await chainStorageUtils.getUploadFiles([
          chain.userTLSCrtFilePath,
          chain.userTLSKeyFilePath,
        ]);
        refTlsCrt.current?.setDefaultValue(userTLSCrtFile);
        refTlsKey.current?.setDefaultValue(userTLSKeyFile);
      }
    })();
  }, []);

  const handleSave = () => {
    setLoading(true);
    const values = getValues() as ChainForm;
    const nextChain = {
      ...chain,
      ...pick(values, ['chainName', 'nodeIp', 'tlsEnable', 'hostName', 'protocol', 'browserLink']),
      httpSupport: isSupportHTTP(values),
    };
  
    (async function () {
      try {
        // 使用本地 updateChain 替代远程拉取配置
        const { updatedChain, chains } = await chainStorageUtils.updateChain(nextChain.chainId, nextChain);
  
        if (updatedChain && chains) {
          setChains(chains);
          if (selectedChain.chainId === nextChain.chainId) {
            setSelectedChain(updatedChain);
          }
          await initChainSubscribe(updatedChain);
  
          navigate(`/chains/${nextChain.chainId}`, {
            state: updatedChain,
          });
          message.success({ content: '链配置已更新' });
        } else {
          message.error({ content: '链更新失败，请稍后重试' });
        }
      } catch (error) {
        console.error(error);
        message.error({ content: '修改区块链网络信息失败，请检查所填写的信息是否有误后重试' });
      } finally {
        setLoading(false);
      }
    })();
  };
  
  return (
    <DetailPage title={'区块链网络详情'} backUrl={`/chains/${chain.chainId}`} backState={chain}>
      <Form layout={'vertical'}>
        <ReadonlyFormItem label={<GlossaryGuide title={'区块链ID'} />} text={chain.chainId} />

        <Controller
          control={control}
          rules={{
            required: '请输入',
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
              <Input size={'full'} {...field} />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          name="nodeIp"
          rules={{
            required: '请输入节点 RPC 服务地址',
            validate: (value) => {
              const trimmed = value.trim();

              if (!/^https?:\/\//i.test(trimmed)) {
                return '请输入以 http:// 或 https:// 开头的 URL';
              }

              // 去掉协议后检查是否为 IP 格式（不校验域名）
              const withoutProtocol = trimmed.replace(/^https?:\/\//i, '').split('/')[0];
              const [ipPart] = withoutProtocol.split(':');

              if (!/^\d{1,3}(\.\d{1,3}){0,3}$/.test(ipPart)) {
                return '请输入有效的 IPv4 地址';
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Form.Item
              status={formUtils.getStatus({
                fieldState,
                isValidating,
                isSubmitted,
              })}
              message={fieldState.error?.message}
              label={<GlossaryGuide title={'节点 RPC 服务地址'} />}
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

                  // 仅输入 http:// 或 https:// 时自动补全
                  if (/^https?:\/\/$/i.test(v)) {
                    v = `${v}0.0.0.0`;
                  }

                  // http(s)://IP[:PORT]，自动补全 IP 段不足
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
          name="browserLink"
          rules={{
            validate: (value) => {
              if (!value) return true; // 可选允许为空

              const trimmed = value.trim();

              // 必须以 http:// 或 https:// 开头
              if (!/^https?:\/\//i.test(trimmed)) {
                return '请输入以 http:// 或 https:// 开头的有效 URL';
              }

              // 去掉协议后检查 IP（不校验域名，仅校验纯 IP）
              const withoutProtocol = trimmed.replace(/^https?:\/\//i, '').split('/')[0]; // 去掉路径部分
              const [ipPart] = withoutProtocol.split(':');

              if (!/^\d{1,3}(\.\d{1,3}){0,3}$/.test(ipPart)) {
                return '请输入有效的 IPv4 地址';
              }

              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <Form.Item
              status={
                fieldState.error
                  ? 'error'
                  : formUtils.getStatus({
                      fieldState,
                      isValidating,
                      isSubmitted,
                    })
              }
              label={<GlossaryGuide title={'区块链浏览器 URL（选填）'} />}
              message={fieldState.error?.message}
            >
              <Input
                size={'full'}
                placeholder={'如 https://scan.xxx.com'}
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

                  // 如果输入了 http(s)://IP[:PORT] 且 IP 不足四段则补 0
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

                  // 更新并立即触发校验
                  field.onChange(v);
                  field.onBlur();
                }}
              />
            </Form.Item>
          )}
        />
      </Form>
      <footer>
        {/* <div className="signature-options"> */}

        <Button
          type={'primary'}
          loading={loading}
          className={'btn-lg'}
          onClick={handleSubmit(handleSave)}
          disabled={!isValid || loading}
        >
          完成
        </Button>
        {/* <Button type={'weak'} onClick={handleRefresh}>
          刷新
        </Button>
        <Button type={'primary'} onClick={handleEdit}>
          修改
        </Button> */}
      </footer>
    </DetailPage>
  );
}

export default ChainUpdatePage;
