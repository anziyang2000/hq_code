/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useMemo } from 'react';
import { DetailPage } from '../utils/common';
import { Chain } from '../utils/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountNew from '../components/account-new';
import { BEACON_EVENTS, beacon } from '../beacon';

function AccountNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chain, initial } = location.state as {
    chain: Chain;
    initial: boolean;
  };
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

  if (!chain) return null;
  return (
    <DetailPage title={'导入链账户'} backUrl={back.url} backState={back.state}>
      {initial && <p className="body-tips">请导入“{chain.chainName}”的链账户，完成初始化操作。</p>}
      <AccountNew
        chain={chain}
        initial={initial}
        onSuccess={() => {
          beacon.onUserAction(BEACON_EVENTS.ACCOUNT_ADD_CONFIRM);
          navigate(back.url, {
            state: back.state,
          });
        }}
        onCancel={handleCancel}
        onError={handleCancel}
      />
    </DetailPage>
  );
}

export default AccountNewPage;
