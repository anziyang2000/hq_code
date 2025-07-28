/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { formatDate } from '../../../utils/utils';
import { ContractTxItem, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { TextInfo, TextInfoItem } from '../../../components/text-info';
import { getBrowserTransactionLink } from '../../../config/chain';
import { EvidenceDetail, findEviByHash } from '../../../services/cmevi';
import { Status } from 'tea-component';

export function CmeviDetailPage() {
  const location = useLocation();
  const { currentAccount, selectedChain } = useChainStore();
  const accountId = currentAccount.address;
  const chainId = selectedChain?.chainId;
  const { txInfo, contractInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    txInfo: ContractTxItem;
    browserLink?: string;
  };
  const { eviHash, eviId } = txInfo;
  const [eviData, setEviData] = useState<EvidenceDetail>(null);

  useEffect(() => {
    if (!accountId) return;
    findEviByHash({
      chainId: selectedChain.chainId,
      account: currentAccount,
      contractName: contractInfo.contractName,
      eviHash,
    }).then((txsInfo) => {
      setEviData(txsInfo);
    });
  }, [eviHash]);

  const detailInfo: TextInfoItem[] = useMemo(() => {
    if (eviData) {
      return [
        {
          label: '存证ID(业务流水号)',
          value: eviId,
        },
        {
          label: '存证类型',
          value: eviData.metadata.hashType,
        },
        {
          label: '存证内容',
          value: eviData.metadata.content,
        },
        {
          label: '存证哈希',
          value: eviHash,
        },
        {
          label: '哈希算法',
          value: eviData.metadata.hashAlgorithm,
        },
        {
          label: '存证人',
          value: eviData.metadata.username,
          className: 'split-line-bottom',
        },
        {
          label: '交易id',
          value: eviData.txId,
          copyable: true,
          href: browserLink && getBrowserTransactionLink({ browserLink, txId: eviData.txId, chainId }),
        },
        {
          label: '区块',
          value: eviData.blockHeight,
        },
        {
          label: '交易时间',
          value: formatDate(new Date(eviData.timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
        },
      ];
    }
  }, [eviData]);

  return (
    <DetailPage title="详情" backUrl={'/subscribe-contract/contract-detail'} backState={contractInfo}>
      <div className="tx-detail tea-mt4n">
        {detailInfo ? (
          <TextInfo sourceData={detailInfo} />
        ) : (
          <Status icon={'loading'} size={'l'} className="cancel-bold" title={'加载中...'} />
        )}
      </div>
    </DetailPage>
  );
}
