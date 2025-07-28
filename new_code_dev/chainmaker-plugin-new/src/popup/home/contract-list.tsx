import React, { CSSProperties, memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChainStore } from '../popup';
import { ContractLogo } from '../../components/contract-logo';
import { contractStoreUtils, SubscribeContractItem } from '../../utils/storage';
import { List, Status } from 'tea-component';
import '../../iconsvg/index';
import { balanceOf } from '../../utils/utils';
import { FixedSizeList } from 'react-window';
import { CONTRACT_TYPE } from '../../config/contract';

// 声明 RowProps 类型
interface RowProps {
  index: number;
  style: CSSProperties;
  data: {
    contractList: SubscribeContractItem[];
    gasBalance: number | string;
  };
}

// Row 子项组件
const Row: React.FC<RowProps> = memo(({ index, style, data }) => {
  const { contractList, gasBalance } = data;
  const contract = contractList[index];
  const navigate = useNavigate();

  return (
    <div key={index} style={style}>
      <List.Item
        className="flex-space-between contract-list-item"
        onClick={() => {
          navigate(`/subscribe-contract/contract-detail`, {
            state: { ...contract, gasBalance },
          });
        }}
      >
        <div className="flex">
          <ContractLogo logoToken={contract.contractIcon} size={28} />
          <div className="txs-h3 contract-item-name">
            {contract.contractType === CONTRACT_TYPE.CMDFA
              ? contract.FTPerName
              : contract.remark || contract.contractName}
          </div>
        </div>
        <div className="contract-item-right">
          {contract.contractType === CONTRACT_TYPE.CMDFA && (
            <span className="text-normal contract-item-desc">
              {Number(contract.balance || 0).toFixed(contract.FTMinPrecision)}
            </span>
          )}
          {contract.contractType === CONTRACT_TYPE.GAS && (
            <span className="text-normal contract-item-desc">{gasBalance}</span>
          )}
          <svg className="tea-ml-2n" width="6px" height="12px" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="0,0 6,6 0,12"
              style={{ fill: 'transparent', stroke: '#666', strokeWidth: '1' }}
            />
          </svg>
        </div>
      </List.Item>
    </div>
  );
});

export function ContractList({ gasBalance, ...props }: { gasBalance: number }) {
  const [contractList, setContractList] = useState<SubscribeContractItem[]>([]);
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;

  useEffect(() => {
    if (!chainId) return;

    contractStoreUtils.getSubscribe(chainId).then((contracts) => {
      setContractList(contracts);

      contracts.forEach((ele, index) => {
        const { contractType, contractName } = ele;
        if (!accountId) return;

        if (contractType === CONTRACT_TYPE.CMDFA) {
          contractStoreUtils.getContractBalance({ accountId, chainId, contractName }).then((value) => {
            setContractList((prev) => {
              const updated = [...prev];
              updated[index] = { ...ele, balance: value };
              return updated;
            });
          });

          balanceOf({ contractName, account: currentAccount, chainId })
            .then((res) => {
              if (res !== ele.balance) {
                setContractList((prev) => {
                  const updated = [...prev];
                  updated[index] = { ...ele, balance: res };
                  return updated;
                });

                contractStoreUtils.setContractBalance({
                  accountId,
                  chainId,
                  contractName,
                  balance: res,
                });
              }
            })
            .catch(console.error);
        }
      });
    });
  }, [chainId, accountId]);

  const rowData = {
    contractList,
    gasBalance: accountId ? gasBalance : '--',
  };

  return (
    <List {...props}>
      {!contractList.length ? (
        <Status icon="blank" size="l" title="暂无数据" className="cancel-bold" />
      ) : (
        // 使用类型断言绕过 JSX 检查
        (FixedSizeList as any as React.FC<{
          height: number;
          itemCount: number;
          itemSize: number;
          width: string | number;
          itemData: typeof rowData;
          className?: string;
          children: React.ComponentType<RowProps>;
        }>)( {
          height: 245,
          itemCount: contractList.length,
          itemSize: 57,
          width: '100%',
          itemData: rowData,
          className: 'txlogs-vtable',
          children: Row,
        })
      )}
    </List>
  );
}
