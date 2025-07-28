/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Status } from 'tea-component';
import { DetailPage } from '../../utils/common';

function SendTransactionPage() {
  const navigate = useNavigate();

  const handleSend = () => {
    // TODO: 实现发送交易的逻辑
    console.log('发送交易');
  };

  return (
    <DetailPage title="发送交易" backUrl="/">
      <div className="send-transaction-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
        <Button type="primary" onClick={handleSend}>
          发送交易
        </Button>

        <div style={{ marginTop: 32 }}>
        </div>
      </div>
    </DetailPage>
  );
}

export default SendTransactionPage;
