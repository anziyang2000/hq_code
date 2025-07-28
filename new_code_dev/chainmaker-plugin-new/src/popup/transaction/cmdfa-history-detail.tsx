import React from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '@utils/common';
import { formatDate, shortStr } from '@utils/utils';
import { ContractTxItem, SubscribeContractItem } from '@utils/storage';
import { useChainStore } from '@popup/popup';
import { TextInfoItem, TextListInfo } from '@components/text-info';
import { getBrowserTransactionLink } from '@config/chain';

export function DfaDetailPage() {
  const location = useLocation();
  const { contractInfo, txInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    txInfo: ContractTxItem;
    browserLink?: string;
  };

  const { selectedChain, currentAccount } = useChainStore();

  const { txId, timestamp, from, to, height, gasUsed, success, amount } = txInfo;
  const { contractName, FTPerName: ftPerName, FTMinPrecision: ftMinPrecision } = contractInfo;
  // const fromMe = txInfo.from === currentAccount.address;
  // const txType = fromMe ? '转出' : '转入';
  const currentAddress = currentAccount?.address ?? '';
  const fromMe = txInfo.from === currentAddress;
  const txType = fromMe ? '转出' : '转入';
  const personInfo: TextInfoItem[] = [
    {
      label: '发起用户',
      value: shortStr(from),
      copyValue: from,
      copyable: true,
    },
    {
      label: '接收用户',
      value: shortStr(to),
      copyValue: to,
      copyable: true,
    },
  ];

  const detailInfo: TextInfoItem[] = [
    {
      label: '时间',
      value: timestamp && formatDate(new Date(timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    },
    {
      label: '合约名',
      value: contractName,
    },
    {
      label: '类型',
      value: txType,
    },
    {
      label: 'GAS消耗',
      value: gasUsed,
    },
    {
      label: 'FT简称',
      value: ftPerName,
    },
    {
      label: '交易id',
      value: shortStr(txId, 5, 5),
      copyValue: txId,
      copyable: true,
      href: browserLink && getBrowserTransactionLink({ browserLink, txId, chainId: selectedChain.chainId }),
    },
    {
      label: '区块高度',
      value: height,
    },
    {
      label: '交易结果',
      value: success === false ? '失败' : '成功',
    },
  ];
  return (
    // <DetailPage title="交易历史详情" backUrl={'/transaction/history'}>
    <DetailPage title="交易历史详情" backUrl="/" backState={{ activeTab: 2 }}>
      <div>
        <h2 className="split-line-bottom padding-v5">
          {fromMe ? '-' : '+'}
          {Number(amount).toFixed(ftMinPrecision)} {ftPerName}
        </h2>
        <TextListInfo lineBreak sourceData={personInfo} className="split-line-bottom padding-v5" />
        <TextListInfo sourceData={detailInfo} className="padding-v5" />
      </div>
    </DetailPage>
  );
}
