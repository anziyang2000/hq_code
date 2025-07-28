/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage, CancelSubscribe } from '../../../utils/common';
import { Status } from 'tea-component';
import { SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { getiIdentityData, IdentityData, IdentityLevel } from '../../../services/identity';

import './cmid-contract.less';

export function CMIDContractPage() {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem & { balance: string };
  const { contractName } = contractInfo;
  const [indentityData, setIndentityData] = useState<IdentityData>();
  const [loading, setLoading] = useState(true);
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;
  // 默认合约不能取消
  const disableCancel = selectedChain.default_contract?.some((contact) => contact.contractName === contractName);
  useEffect(() => {
    // 查询合约余额
    if (!accountId) return setLoading(false);
    getiIdentityData({ account: currentAccount, chainId, contractName }).then((res: IdentityData) => {
      setIndentityData(res);
      setLoading(false);
    });
  }, [accountId, contractName]);

  const isAuth = indentityData && indentityData?.level !== IdentityLevel.UN_AUTH;

  return (
    <DetailPage title={'合约详情'} className="free-width" backUrl={'/'}>
      {isAuth ? (
        <div className="indentity-card">
          <p className="indentity-title">身份认证</p>
          <p>链账户地址：</p>
          <p>{accountId}</p>
          <p>已通过{indentityData.text}</p>
          <div className="indentity-card-footer">
            <p>{indentityData.orgId}</p>
            <p>{indentityData.time}</p>
          </div>
        </div>
      ) : (
        <Status
          icon={loading ? 'loading' : 'blank'}
          size={'l'}
          className="cancel-bold"
          // eslint-disable-next-line no-nested-ternary
          title={loading ? '加载中...' : accountId ? '当前链账户尚未通过认证' : '暂无数据'}
        />
      )}

      {disableCancel ? null : <CancelSubscribe chainId={chainId} contractName={contractName}></CancelSubscribe>}
    </DetailPage>
  );
}
