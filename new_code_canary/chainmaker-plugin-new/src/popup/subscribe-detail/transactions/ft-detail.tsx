/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { Text } from 'tea-component';
import { formatDate } from '../../../utils/utils';
import { ContractTxItem, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { TextInfo, TextInfoItem } from '../../../components/text-info';
import { getBrowserTransactionLink } from '../../../config/chain';

export function FtDetailPage() {
  const location = useLocation();
  const { currentAccount, selectedChain } = useChainStore();
  const accountId = currentAccount.address;
  const chainId = selectedChain?.chainId;
  const { txInfo, contractInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    txInfo: ContractTxItem;
    browserLink?: string;
  };
  const { txId, timestamp, from, to, amount, height } = txInfo;
  const { FTMinPrecision, FTPerName } = contractInfo;
  const detailInfo: TextInfoItem[] = [
    {
      label: '发起用户',
      value: from,
    },
    {
      label: '接收用户',
      value: to,
      className: 'split-line-bottom',
    },
    {
      label: '交易id',
      value: txId,
      copyable: true,
      href: browserLink && getBrowserTransactionLink({ browserLink, txId, chainId }),
    },
    {
      label: '区块',
      value: height,
    },
    {
      label: '交易时间',
      value: formatDate(new Date(timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    },
  ];
  const txType = to === accountId ? '+' : '-';
  return (
    <DetailPage title="详情" backUrl={'/subscribe-contract/contract-detail'} backState={contractInfo}>
      <div className="split-line-bottom text-center">
        <Text className="txs-h1" theme={txType === '+' ? 'success' : 'danger'}>
          {txType} {Number(amount || 0).toFixed(FTMinPrecision)} {FTPerName}
        </Text>
        <div className="txs-h3"> {txType === '+' ? '转入' : '转出'}</div>
      </div>
      <div className="tx-detail tea-mt4n">
        <TextInfo sourceData={detailInfo} />
      </div>
    </DetailPage>
  );
}
