/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { Button, Status } from 'tea-component';
import { FixedSizeList } from 'react-window';
import { balanceOf } from '../../../utils/utils';
import { contractStoreUtils, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { ContractLogo } from '../../../components/contract-logo';
import { TxsItem } from '../../../components/txs-item';
import { useCancelSubscribe } from '../../../utils/hooks';

interface RowData {
  list: any[];
  contract: SubscribeContractItem & { balance: string };
  browserLink: string;
  chainId: string;
}

const Row: React.FC<{ index: number; style: CSSProperties; data: RowData }> = memo(({ index, style, data }) => {
  const { list, contract, browserLink, chainId } = data;
  const item = list[index];
  const navigate = useNavigate();

  return (
    <div style={style}>
      <TxsItem
        {...item}
        {...contract}
        copyable={false}
        onClick={() =>
          navigate('/subscribe-contract/transaction-detail', {
            state: {
              txInfo: item,
              contractInfo: contract,
              browserLink,
            },
          })
        }
      />
    </div>
  );
});

export function CMDFAContractPage() {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem & { balance: string };
  const [txList, setTxsList] = useState<any[]>([]);
  const { contractName, FTPerName, FTMinPrecision, contractIcon, balance } = contractInfo;
  const [sum, setSum] = useState(balance);
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;
  const browserLink = selectedChain?.browserLink;
  const cancelSubscribe = useCancelSubscribe();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accountId) return;

    balanceOf({ contractName, account: currentAccount, chainId }).then((res: string) => {
      if (balance !== res) {
        setSum(res);
        contractStoreUtils.setContractBalance({ accountId, contractName, chainId, balance: res });
      }
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
  }, [accountId, contractName, chainId, currentAccount, balance]);

  const rowData: RowData = {
    list: txList,
    contract: contractInfo,
    browserLink,
    chainId: chainId || '',
  };

  return (
    <DetailPage title={'合约详情'} className="free-width" backUrl={'/'}>
      <div className="contract-header">
        <div className="contract-header-logo">
          <ContractLogo logoToken={contractIcon} size={40} />
        </div>
        <div className="contract-header-title">{Number(sum || 0).toFixed(FTMinPrecision)} {FTPerName}</div>
      </div>
      <div className="txs-h2 tea-mt-4n">交易记录</div>
      <div className="txs-list">
        {txList.length === 0 ? (
          <Status icon={'blank'} size={'l'} className="cancel-bold" title={'暂无转账记录'} />
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
            height: 230,
            itemCount: txList.length,
            itemSize: 77,
            width: '100%',
            itemData: rowData,
            className: 'txlogs-vtable',
            children: Row,
          } )
        )}
      </div>

      <footer className="flex-space-between">
        <div
          className="connect-concel connect-bt"
          onClick={() => {
            if (chainId && contractName) cancelSubscribe(chainId, contractName);
          }}
        >
          取消订阅
        </div>
        <Button
          type={'primary'}
          className="connect-sub connect-bt"
          onClick={() => {
            navigate(`/transaction/transfer`, {
              state: {
                ...contractInfo,
                balance: sum,
                prevPath: '/subscribe-contract/contract-detail',
                prevState: location.state,
              },
            });
          }}
        >
          转账
        </Button>
      </footer>
    </DetailPage>
  );
}
