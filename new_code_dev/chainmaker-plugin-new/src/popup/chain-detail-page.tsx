/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chain } from '../utils/interface';
import { DetailPage, ReadonlyFormItem } from '../utils/common';
import { Button, Form } from 'tea-component';
import { accountModeOptions, protocolOptions } from '../utils/utils';
import GlossaryGuide from '../utils/glossary-guide';
import { isOfficialChain } from '../utils/official-chain';
import chainStorageUtils from '../utils/storage';

function ChainDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const chain = location.state as Chain;
  const isOfficial = isOfficialChain(chain);

  const [disableChange, setDisableChange] = useState(true);
  useEffect(() => {
    if (!isOfficialChain(chain)) {
      (async function () {
        const accounts = await chainStorageUtils.getChainAccounts(chain.chainId);
        if (accounts.length) {
          setDisableChange(false);
        }
      })();
    }
  }, []);

  const handleUpdate = useCallback(() => {
    navigate(`/chains/update`, {
      state: chain,
    });
  }, [chain]);
  // console.log('chaindetail', chain);

  return (
    <DetailPage title={'区块链网络详情'} backUrl={'/chains'}>
      <Form layout={'vertical'}>
        <ReadonlyFormItem label={<GlossaryGuide title={'区块链网络名称'} />} text={chain.chainName} />
        <ReadonlyFormItem label={<GlossaryGuide title={'区块链ID'} />} text={chain.chainId} />
        <ReadonlyFormItem label={'区块链版本'} text={chain.version} />
        {/* <ReadonlyFormItem label={'网络通讯方式'} text={protocolText} copyable={false} /> */}
        {/* {!isOfficial && <ReadonlyFormItem label={<GlossaryGuide title={'默认 RPC (远程过程调用)URL'} />} text={chain.nodeIp} />} */}
        <ReadonlyFormItem label={<GlossaryGuide title={'默认 RPC (远程过程调用)URL'} />} text={chain.nodeIp} />
        {/* <ReadonlyFormItem label={'账户模式'} text={accountModeText} copyable={false} /> */}
        {/* <ReadonlyFormItem label={'是否开启TLS'} text={chain.tlsEnable ? '开启' : '关闭'} copyable={false} /> */}
        {/* <ReadonlyFormItem label={'TLS_Host_Name'} text={chain.hostName} /> */}
        <ReadonlyFormItem label={'区块链浏览器链接（选填）'} text={chain.browserLink || ''} />
      </Form>
      <footer>
        {/* <div className="signature-options"> */}

        <Button disabled={disableChange} type={'primary'} className="btn-lg" onClick={handleUpdate}>
          修改
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

export default ChainDetailPage;
