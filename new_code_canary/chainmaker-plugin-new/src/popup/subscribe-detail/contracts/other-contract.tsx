import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage, CancelSubscribe } from '../../../utils/common';
import { Status } from 'tea-component';

import { FixedSizeList } from 'react-window';
import { contractStoreUtils, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { TxsItem } from '../../../components/txs-item';
import { getBrowserTransactionLink } from '../../../config/chain';

// 1. 声明 RowData 类型
interface RowData {
  list: any[];
  contract: SubscribeContractItem;
  browserLink?: string;
  chainId?: string;
}

// 2. 定义 Row 组件，和你示例一样写法
const Row: React.FC<{ index: number; style: CSSProperties; data: RowData }> = memo(({ index, style, data }) => {
  const { list, contract, browserLink, chainId } = data;
  const item = list[index];

  return (
    <div style={style} key={item.txId || index}>
      <TxsItem
        {...item}
        {...contract}
        copyable={false}
        href={browserLink && getBrowserTransactionLink({ browserLink, txId: item.txId, chainId })}
      />
    </div>
  );
});

export function OtherContractPage() {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem;
  const [txList, setTxList] = useState<any[]>([]);
  const { contractName } = contractInfo;
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;
  const browserLink = selectedChain?.browserLink;

  useEffect(() => {
    if (!accountId) return;

    contractStoreUtils
      .getContractTxs({
        chainId,
        contractName,
        accountId,
      })
      .then((res) => {
        setTxList(res || []);
      });
  }, [accountId, contractName, chainId]);

  const rowData: RowData = {
    list: txList,
    contract: contractInfo,
    browserLink,
    chainId,
  };

  return (
    <DetailPage title={'合约详情'} backUrl={'/'}>
      <div className="tx-list">
        {txList.length === 0 ? (
          <Status icon={'blank'} size={'l'} title={'暂无交易记录'} className="cancel-bold" />
        ) : (
          (FixedSizeList as any as React.FC<{
            height: number;
            itemCount: number;
            itemSize: number;
            width: string | number;
            itemData: RowData;
            className?: string;
            children: React.ComponentType<{ index: number; style: CSSProperties; data: RowData }>;
          }>)( {
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
      <CancelSubscribe chainId={chainId} contractName={contractName} />
    </DetailPage>
  );
}
