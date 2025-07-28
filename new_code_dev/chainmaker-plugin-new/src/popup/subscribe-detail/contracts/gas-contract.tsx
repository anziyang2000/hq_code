/*
 * Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { Status } from 'tea-component';
import { FixedSizeList } from 'react-window';
import { contractStoreUtils, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { ContractLogo } from '../../../components/contract-logo';
import { TxsItem } from '../../../components/txs-item';
import { getBalanceGas } from '../../../services/gas';
import { getBrowserTransactionLink } from '../../../config/chain';

// 1. 声明自定义 FixedSizeList 类型
declare module 'react-window' {
  interface FixedSizeListProps {
    ref?: React.Ref<any>;
    // 添加其他需要的属性
  }
}

interface RowData {
  list: any[];
  contract: SubscribeContractItem & { gasBalance: string };
  browserLink: string;
  chainId: string;
}

// 2. 使用正确的类型定义
const Row: React.FC<{ index: number; style: CSSProperties; data: RowData }> = memo(({ index, style, data }) => {
  const { list, contract, browserLink, chainId } = data;
  const item = list[index];
  
  return (
    <div style={style}>
      <TxsItem
        {...item}
        {...contract}
        copyable={false}
        href={browserLink && getBrowserTransactionLink({ browserLink, txId: item.txId, chainId })}
      />
    </div>
  );
});

export function GASContractPage() {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem & { gasBalance: string };
  const [txList, setTxsList] = useState<any[]>([]);
  const { contractName, contractIcon, gasBalance: balance } = contractInfo;
  const [gasBalance, setGasBalance] = useState(balance);
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;
  const browserLink = selectedChain?.browserLink;

  useEffect(() => {
    if (!accountId) return;
    
    getBalanceGas({ chainId, account: currentAccount }).then((result) => {
      setGasBalance(`${result}`);
    });

    contractStoreUtils
      .getContractTxs({
        chainId,
        contractName,
        accountId,
      })
      .then((res) => {
        setTxsList(res || []);
      });
  }, [accountId, contractName, chainId, currentAccount]);

  const rowData: RowData = {
    list: txList,
    contract: contractInfo,
    browserLink,
    chainId
  };

  return (
    <DetailPage title={'合约详情'} className="free-width" backUrl={'/'}>
      <div className="contract-header">
        <div className="contract-header-logo">
          <ContractLogo logoToken={contractIcon} size={40} />
        </div>
        <div className="contract-header-title">{gasBalance || 0} GAS</div>
      </div>
      <div className="txs-h2 tea-mt-4n">使用记录</div>
      <div className="txs-list">
        {txList.length === 0 ? (
          <Status icon={'blank'} size={'l'} className="cancel-bold" title={'暂无使用记录'} />
        ) : (
          // 3. 使用类型断言解决最终问题
          (FixedSizeList as any as React.FC<{
            height: number;
            itemCount: number;
            itemSize: number;
            width: string | number;
            itemData: RowData;
            className?: string;
            children: React.ComponentType<{ index: number; style: CSSProperties; data: RowData }>;
          }>)({
            height: 430,
            itemCount: txList.length,
            itemSize: 77,
            width: '100%',
            itemData: rowData,
            className: 'txlogs-vtable',
            children: Row
          })
        )}
      </div>
    </DetailPage>
  );
}