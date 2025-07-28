/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { message } from 'tea-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { AccountForm } from '../utils/interface';
import { DetailPage } from '../utils/common';
import { useChainStore } from './popup';
import { SendRequestImportAccountConfig } from '../event-page';
import AccountNew from '../components/account-new';
import { createPemFile } from '../utils/utils';
import { ethers } from "ethers";

function AccountImportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = location.state as SendRequestImportAccountConfig;
  const { chainId, body: accountParems } = pageState;
  const { chains, setSelectedChain } = useChainStore();
  const chain = chains.filter((ele) => ele.chainId === chainId)[0];
  const back = useMemo(
    () => ({
      url: chain.accountMode === 'public' ? '/wallet/jbok-wallet-detail' : '/accounts',
      state: chain.accountMode === 'public' ? { chain } : {},
    }),
    [chain],
  );
  const handleCancel = useCallback(() => {
    navigate(back.url, {
      state: back.state,
    });
  }, []);
  // 修改选中链
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

  // 获取默认值
  const defaultValues = useMemo(() => {
    const accountName = accountParems.name || 'usr';
    const {
      orgId,
      userSignKeyName = `${accountName}.sign.key`,
      userSignCrtName = `${accountName}.sign.crt`,
      userPublicKeyName = `${accountName}.pem`,
    } = accountParems;
    if (chain.accountMode === 'public') {
      if (!accountParems.userPublicKeyContent && accountParems.userSignKeyContent) {
        try {
          // 推导公钥
          const wallet = new ethers.Wallet(accountParems.userSignKeyContent);
          accountParems.userPublicKeyContent = wallet.publicKey
        } catch (error) {
          accountParems.userPublicKeyContent = null;
        }
      }
    }
    const userSignKeyFile = createPemFile(accountParems.userSignKeyContent, userSignKeyName);
    const userSignCrtFile = createPemFile(
      accountParems.userSignCrtContent,
      userSignCrtName,
      'application/x-x509-ca-cert',
    );
    const userPublicKeyFile = createPemFile(
      accountParems.userPublicKeyContent,
      userPublicKeyName,
      'application/x-x509-ca-cert',
    );

    return {
      userSignKeyFile,
      userSignCrtFile,
      userPublicKeyFile,
      orgId,
      name: accountParems.name,
    } as AccountForm;
  }, [chain]);

  if (!chain || !defaultValues) return null;
  return (
    <>
      <DetailPage title={'导入链账户'} backUrl={back.url} backState={back.state}>
        <AccountNew
          defaultValues={defaultValues}
          chain={chain}
          onSuccess={() => {
            navigate(back.url, { state: back.state });
          }}
          onCancel={handleCancel}
          onError={handleCancel}
        />
      </DetailPage>
    </>
  );
}

export default AccountImportPage;
