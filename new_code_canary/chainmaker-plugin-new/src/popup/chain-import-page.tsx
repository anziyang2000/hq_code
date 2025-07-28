/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback } from 'react';
import { Button, message } from 'tea-component';
import { Validator } from '../utils/form-utils';
import { useLocation, useNavigate } from 'react-router-dom';
import chainStorageUtils from '../utils/storage';
import { Chain } from '../utils/interface';
import { DetailPage } from '../utils/common';
import { isSupportHTTP, pick } from '../utils/utils';
import { useChainStore } from './popup';
import { TextInfo, TextInfoItem } from '../components/text-info';
import { chainFieldsLableMap } from '../config/chain';
import { SendRequestImportChainConfig } from '../event-page';

const chainValidateFieldMap = {
  chainId: {
    required: true,
    validator: Validator.validateChainId,
  },
  nodeIp: {
    required: true,
    validator: Validator.validateNodeIP,
  },
};
const validateChainConfig = (
  config: Chain,
  fieldMap: Record<string, { required: boolean; validator: (any) => string | undefined }> = chainValidateFieldMap,
) => {
  const fields = Object.keys(fieldMap);
  const len = fields.length;

  for (let i = 0; i < len; i++) {
    const key = fields[i];
    const { required, validator } = fieldMap[key];
    if (config[key] !== undefined || required) {
      const validate = validator(config[key]);
      if (validate) {
        return `'${key}'验证失败：${validate}`;
      }
    }
  }
};

function ChainImportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = location.state as SendRequestImportChainConfig;
  const { currentTab } = useChainStore();

  const { chains, setChains, setSelectedChain } = useChainStore((state) => state);

  const handleCancel = useCallback(() => {
    navigate('/chains');
  }, []);

  const values = pageState.body as Chain;
  const chainConfig: Chain = {
    ...pick(values, [
      'chainId',
      'chainName',
      'nodeIp',
      'tlsEnable',
      'accountMode',
      'hostName',
      'protocol',
      'hostName',
      'browserLink',
    ]),
    userTLSKeyFile: null,
    userTLSCrtFile: null,
    nodeTLSCrtFile: null,
    version: null,
    httpSupport: isSupportHTTP(values),
  };
  // TODO: 数据内容是否验证
  const handleClick = useCallback(async () => {
    // 1.判重
    if (chains.some((item) => item.chainId === chainConfig.chainId)) {
      return message.error({
        content: '已添加过该链',
        duration: 5000,
      });
    }
    // 验证链配置
    const errorMsg = validateChainConfig(chainConfig);
    if (errorMsg) {
      return message.error({
        content: errorMsg,
        duration: 5000,
      });
    }
    // 设置默认值
    if (!chainConfig.protocol) {
      chainConfig.protocol = 'GRPC';
    }
    if (!chainConfig.hostName) {
      chainConfig.hostName = 'chainmaker.org';
    }
    chainConfig.httpSupport = isSupportHTTP(chainConfig);

    try {
      const [chains] = await Promise.all([chainStorageUtils.addChain(chainConfig)]);
      setChains(chains as Chain[]);
      // 自动选链
      setSelectedChain(chainConfig);
      await chainStorageUtils.setSelectedChain(chainConfig);
      navigate('/accounts/new', {
        state: {
          chain: chainConfig,
          initial: true,
        },
      });
    } catch (e) {
      message.error({
        content: `添加区块链网络失败\n${e.message || e}`,
        duration: 5000,
      });
    }
  }, [chainConfig]);

  const chainConfigList: TextInfoItem[] = [];
  Object.keys(chainFieldsLableMap).forEach((key) => {
    const label = chainFieldsLableMap[key];
    const value = values[key];
    if (value || value === false) chainConfigList.push({ label, value: String(value) });
  });

  return (
    <DetailPage title={'请求添加链网络'} backUrl={'/chains'}>
      <div className="current-web-info">
        <img src={currentTab?.favIconUrl} />
        <div className="current-web-addr">{currentTab?.host}</div>
      </div>
      <p className="body-tips">该网页请求将如下长安链添加到SmartPlugin里，请确定是否添加？</p>
      <TextInfo labelBold={true} sourceData={chainConfigList} className="border-box" />

      <footer className={'btn-group'}>
        <Button type={'weak'} onClick={handleCancel}>
          取消
        </Button>
        <Button
          type={'primary'}
          onClick={() => {
            handleClick();
          }}
        >
          确认添加
        </Button>
      </footer>
    </DetailPage>
  );
}

export default ChainImportPage;
