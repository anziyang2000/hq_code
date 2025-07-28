import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage, CancelSubscribe } from '../../../utils/common';
import { Status } from 'tea-component';
import { FixedSizeList } from 'react-window';
import { contractStoreUtils, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { EviTxsItem } from '../../../components/txs-item';

interface RowProps {
  index: number;
  style: CSSProperties;
  data: {
    list: any[];
    contract: SubscribeContractItem & { balance: string };
    browserLink: string;
  };
}

const Row: React.FC<RowProps> = memo(({ index, style, data }) => {
  const item = data.list[index];
  const { contract, browserLink } = data;
  const navigate = useNavigate();

  return (
    <div key={index} style={style}>
      <EviTxsItem
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

export function CMEVIContractPage() {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem & { balance: string };
  const [txList, setTxsList] = useState([]);
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
        setTxsList(res);
      });
  }, [accountId, contractName]);

  return (
    <DetailPage title={'合约详情'} className="free-width" backUrl={'/'}>
      <div className="txs-list">
        {txList.length === 0 ? (
          <Status icon="blank" size="l" className="cancel-bold" title="暂无存证记录" />
        ) : (
          // ✅ 使用类型断言避开 TS 限制
          (FixedSizeList as any as React.FC<{
            height: number;
            itemCount: number;
            itemSize: number;
            width: string | number;
            itemData: RowProps['data'];
            className?: string;
            children: React.ComponentType<RowProps>;
          }>)( {
            height: 430,
            itemCount: txList.length,
            itemSize: 77,
            width: '100%',
            itemData: { list: txList, contract: contractInfo, browserLink },
            className: 'txlogs-vtable',
            children: Row,
          })
        )}
      </div>
      <CancelSubscribe chainId={chainId} contractName={contractName} />
    </DetailPage>
  );
}
