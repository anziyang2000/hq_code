import React, { useMemo } from 'react';
import { Copy, StyledProps, Text, Tag } from 'tea-component';
import { CONTRACT_TYPE } from '../config/contract';
import { useChainStore } from '../popup/popup';
import { ContractTxItem, SubscribeContractItem } from '../utils/storage';
import { formatDate, showHeadandTail } from '../utils/utils';
export interface TsxItemProps extends ContractTxItem, SubscribeContractItem, StyledProps {
  onClick?: () => void;
  href?: string;
  copyable?: boolean;
}

const FtTxHeader = (props: TsxItemProps) => {
  const { from, FTPerName, amount, FTMinPrecision, success } = props;
  const num = isNaN(Number(amount)) ? 1 : Number(amount);
  const { currentAccount } = useChainStore();
  const txType = from === currentAccount.address ? '-' : '+';
  return (
    <div className={'flex-space-between'}>
      <div className={'flex'}>
        <div className={'txs-h3'}>
          {txType === '+' ? <Text theme={'success'}>转入</Text> : <Text theme={'danger'}>转出</Text>}
        </div>
        {success === false && (
          <Tag className="fail-tag" size="sm" theme="error" variant="outlined">
            失败
          </Tag>
        )}
      </div>
      <div className={'txs-h2'}>
        <Text theme={txType === '+' ? 'success' : 'danger'}>
          {`${txType} ${num.toFixed(FTMinPrecision)} ${FTPerName}`}
        </Text>
      </div>
    </div>
  );
};

const NFATxHeader = (props: TsxItemProps) => {
  const { from, contractName, remark, success } = props;
  const { currentAccount } = useChainStore();
  const txType = from === currentAccount.address ? '-' : '+';
  return (
    <div className={'flex'}>
      <div className={'txs-h3'}>
        {txType === '+' ? <Text theme={'success'}>转入</Text> : <Text theme={'danger'}>转出</Text>}
        <Text className="ml-2n font-min" theme="text">
          {remark || contractName}
        </Text>
      </div>

      {success === false && (
        <Tag className="fail-tag" size="sm" theme="error" variant="outlined">
          失败
        </Tag>
      )}
    </div>
  );
};

const GASTxHeader = (props: TsxItemProps) => {
  const { to, amount } = props;
  const { currentAccount } = useChainStore();
  const txType = to === currentAccount.address ? '+' : '-';
  return (
    <div className={'flex-space-between'}>
      <div className={'txs-h3'}>{txType === '+' ? '增加' : '消耗'}</div>
      <div className={'txs-h2'}>
        <Text theme={txType === '+' ? 'success' : 'danger'}>{`${txType} ${amount}`}</Text>
      </div>
    </div>
  );
};

const txHeaderMap = {
  [CONTRACT_TYPE.GAS]: GASTxHeader,
  [CONTRACT_TYPE.CMDFA]: FtTxHeader,
  [CONTRACT_TYPE.CMNFA]: NFATxHeader,
  [CONTRACT_TYPE.OTHER]: ({ method }: TsxItemProps) => <div className="txs-h3">{method}</div>,
};

export function TxsItem(props: TsxItemProps) {
  const { txId, contractType, timestamp, className, onClick, copyable = true, href } = props;

  const txIdText = `${txId.substring(0, 10)}...${txId.substring(txId.length - 10)}`;
  const TxHeader = useMemo(() => txHeaderMap[contractType], [contractType]);
  return (
    <div className={`txs-item ${className || ''}`} onClick={onClick}>
      <TxHeader {...props} />
      <div className="flex-space-between tea-mt-2n">
        <div>
          {href ? (
            <a className="text-blue" href={href} target="_blank" rel="noreferrer">
              {txIdText}
            </a>
          ) : (
            <span>{txIdText} </span>
          )}
          {copyable && <Copy text={txId} onCopy={() => false} />}
        </div>
        <div>{formatDate(new Date(timestamp * 1000))}</div>
      </div>
    </div>
  );
}

export function EviTxsItem(props: TsxItemProps) {
  const { eviId, onClick, eviHash, timestamp, className } = props;

  return (
    <div className={`txs-item ${className}`} onClick={onClick}>
      <div className={'flex-space-between'}>
        <div className={'txs-h3'}>ID: {eviId}</div>
        <div>{formatDate(new Date(timestamp * 1000))}</div>
      </div>
      <div className="flex-space-between tea-mt-2n">
        <div>Hash: {showHeadandTail(eviHash, 12)}</div>
      </div>
    </div>
  );
}
