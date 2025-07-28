import React, { CSSProperties, forwardRef, memo, useEffect, useMemo, useState } from 'react';
import { Select, Text, Status } from 'tea-component';
import { DetailPage } from '@utils/common';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { zhCN } from 'date-fns/locale';

import 'react-datepicker/dist/react-datepicker.css';
import { contractStoreUtils, ContractTxItem, SubscribeContractItem } from '../../utils/storage';
import { CONTRACT_TYPE } from '../../config/contract';
import { useChainStore } from '../popup';
import SvgIcon from '../../components/svg-icon';
import { TxsItem } from '../../components/txs-item';
import { FixedSizeList } from 'react-window';

const DAY_TIMESTAMP = 24 * 60 * 60 * 1000;

const ExampleCustomInput = forwardRef(
  ({ value, onClick, placeholder }: { value: string; placeholder: string; onClick: () => void }) => (
    <div className="flex cursor-pointer" onClick={onClick}>
      <Text style={{ fontSize: '12px', lineHeight: '30px' }}>{value.replace(/\/\d{4}/g, '') || placeholder}</Text>
      <SvgIcon width={16} height={16} name="arrow-down" style={{ marginTop: '7px' }} />
    </div>
  ),
);

enum TxType {
  ALL,
  ROLL_IN,
  ROLL_OUT,
}

const txTypeOptions = [
  {
    value: String(TxType.ALL),
    text: '全部交易',
  },
  {
    value: String(TxType.ROLL_IN),
    text: '转入交易',
  },
  {
    value: String(TxType.ROLL_OUT),
    text: '转出交易',
  },
];

// 1. 定义 Row 组件，接收固定的 props 格式（index, style, data）
interface RowData {
  list: ContractTxData[];
  browserLink?: string;
}

const Row: React.FC<{ index: number; style: CSSProperties; data: RowData }> = memo(({ index, style, data }) => {
  const { list, browserLink } = data;
  const item = list[index];
  const navigate = useNavigate();

  return (
    <div style={style} key={item.txId || index}>
      <TxsItem
        {...item}
        {...item.contractInfo}
        copyable={false}
        onClick={() =>
          navigate('/transaction/history-detail', {
            state: {
              txInfo: item,
              contractInfo: item.contractInfo,
              browserLink,
            },
          })
        }
      />
    </div>
  );
});

const ALL_CONTRACT_VALUE = '__ALL__';

interface ContractTxData extends ContractTxItem {
  contractInfo: SubscribeContractItem;
}

function HistoryPage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;
  const chainId = selectedChain?.chainId;
  const [contractList, setContractList] = useState<SubscribeContractItem[]>([]);
  const [contractName, setContractName] = useState<string>(ALL_CONTRACT_VALUE);
  const [txType, setTxType] = useState<string>(txTypeOptions[0].value);
  const [txList, setTxList] = useState<ContractTxData[]>([]);
  const browserLink = selectedChain?.browserLink;

  useEffect(() => {
    if (txType && contractName) {
      let startT: number;
      let endT: number;
      if (!startDate && !endDate) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const tmpDate = new Date(currentDate.getTime() + DAY_TIMESTAMP);
        endT = tmpDate.getTime();
        tmpDate.setMonth(tmpDate.getMonth() - 6);
        startT = tmpDate.getTime();
      } else if (startDate && endDate) {
        startT = new Date(startDate).getTime();
        const tmpDate = new Date(endDate);
        tmpDate.setDate(tmpDate.getDate() + 1);
        endT = tmpDate.getTime();
      } else {
        return;
      }

      if (contractName !== ALL_CONTRACT_VALUE) {
        contractStoreUtils
          .getContractTxs<ContractTxData>({
            chainId,
            contractName,
            accountId,
            withContractInfo: true,
            filters: {
              status: 'all',
              startTime: startT / 1000,
              endTime: endT / 1000,
            },
          })
          .then((res) => setTxList(res));
      } else {
        (async () => {
          let results: ContractTxData[] = [];
          for (const item of contractList) {
            const res = await contractStoreUtils.getContractTxs<ContractTxData>({
              chainId,
              contractName: item.contractName,
              accountId,
              withContractInfo: true,
              filters: {
                status: 'all',
                startTime: startT / 1000,
                endTime: endT / 1000,
              },
            });
            results = results.concat(res);
          }
          results.sort((a, b) => b.timestamp - a.timestamp);
          setTxList(results);
        })();
      }
    }
  }, [startDate, endDate, txType, contractName, contractList, chainId, accountId]);

  const contractOptions = useMemo(() => {
    const opts = contractList.map((ele) => ({
      value: ele.contractName,
      text: ele.remark || ele.FTPerName || ele.contractName,
    }));
    opts.unshift({
      value: ALL_CONTRACT_VALUE,
      text: '全部合约',
    });
    return opts;
  }, [contractList]);

  useEffect(() => {
    contractStoreUtils
      .getSubscribe(chainId, null, [CONTRACT_TYPE.CMDFA, CONTRACT_TYPE.CMNFA])
      .then((contractList) => setContractList(contractList));
  }, [chainId]);

  const viewList = useMemo(
    () =>
      txList.filter(({ to, from }) => {
        const rollInMatch = txType === String(TxType.ROLL_IN) ? to === accountId && from !== accountId : true;
        const rollOutMatch = txType === String(TxType.ROLL_OUT) ? from === accountId : true;
        return rollInMatch && rollOutMatch;
      }),
    [txList, txType, accountId],
  );

  // 2. 组装给 FixedSizeList 的 data
  const rowData: RowData = {
    list: viewList,
    browserLink,
  };

  return (
    <DetailPage title="交易历史" backUrl={'/'}>
      <div className={'transaction-history-header flex-items-center'}>
        <SvgIcon width={16} height={16} name="net" />
        <Select
          style={{ maxWidth: '120px' }}
          value={contractName}
          onChange={(val) => setContractName(val)}
          options={contractOptions}
        />
        <Select style={{ width: '70px' }} value={txType} onChange={setTxType} options={txTypeOptions} />
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          placeholderText="选择时间"
          locale={zhCN}
          customInput={<ExampleCustomInput value={''} placeholder={''} onClick={() => {}} />}
        />
      </div>
      <div className="txs-list">
        {viewList.length === 0 ? (
          <Status icon={'blank'} size={'l'} className="cancel-bold" title={'暂无转账记录'} />
        ) : (
          // 3. 使用类型断言，确保FixedSizeList的类型正确，传入Row组件和data
          (FixedSizeList as unknown as React.FC<{
            height: number;
            itemCount: number;
            itemSize: number;
            width: string | number;
            className?: string;
            itemData: RowData;
            children: React.ComponentType<{ index: number; style: CSSProperties; data: RowData }>;
          }>)({
            height: 410,
            itemCount: viewList.length,
            itemSize: 77,
            width: '100%',
            className: 'txlogs-vtable',
            itemData: rowData,
            children: Row,
          })
        )}
      </div>
    </DetailPage>
  );
}

export default HistoryPage;
