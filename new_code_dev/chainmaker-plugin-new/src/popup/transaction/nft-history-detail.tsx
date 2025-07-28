import React from 'react';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '@utils/common';
import { formatDate, shortStr } from '@utils/utils';
import { ContractTxItem, SubscribeContractItem } from '@utils/storage';
import { useChainStore } from '@popup/popup';
import { NFTImage } from '@components/nft-image';
import { TextInfoItem, TextListInfo } from '@components/text-info';
import { getBrowserTransactionLink } from '@config/chain';
import { message } from 'tea-component';

export function Erc1155DetailPage() {
  const location = useLocation();
  const { contractInfo, txInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    txInfo: ContractTxItem;
    browserLink?: string;
  };

  // console.log('交易详情页面--------location.state:', location.state);

  const { selectedChain, currentAccount } = useChainStore();

  const { txId, timestamp, height, nftName, nftImage, gasLimit, success, fromAddress, toAddress, nonce, contractName, blockNumber, amount, contractType } = txInfo;
  const { remark } = contractInfo;

  const personInfo: TextInfoItem[] = [
    {
      label: '发起用户',
      value: shortStr(fromAddress),
      copyValue: fromAddress,
      copyable: true,
    },
    {
      label: '接收用户',
      value: shortStr(toAddress),
      copyValue: toAddress,
      copyable: true,
    },
  ];

  const detailInfo: Array<TextInfoItem | null> = [
    {
      label: '状态',
      value: selectedChain?.browserLink ? (
        <a
          href={`${selectedChain.browserLink.replace(/\/$/, '')}/tx/${txId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#3a7bef', textDecoration: 'none' }}
        >
          在区块链浏览器中查看
        </a>
      ) : (
        <span
          style={{ color: '#999', cursor: 'pointer', userSelect: 'none' }}
          onClick={() => message.warning({ content: '当前节点未配置区块链浏览器' })}
        >
          区块链浏览器未配置
        </span>
      ),
    },
    
    {
      label: 'Nonce',
      value: nonce?.toString(),
    },
    {
      label: '数额',
      value: amount,
    },
    {
      label: '时间',
      value: timestamp && formatDate(new Date(timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    },
    // {
    //   label: '合约名',
    //   value: shortStr(contractName, 5, 5),
    //   copyValue: contractName,
    //   copyable: true,
    // },
    {
      label: '类型',
      value: contractType,
    },
    {
      label: '燃料',//传入的gasLImit实际上是gas
      value: gasLimit?.toString(),
    },
    {
      label: '交易id',
      value: shortStr(txId, 5, 5),
      copyValue: txId,
      copyable: true,
      href: browserLink && getBrowserTransactionLink({ browserLink, txId, chainId: selectedChain.chainId }),
    },
    blockNumber != null && blockNumber !== undefined && {
      label: '区块高度',
      value: blockNumber.toString(),
    }
    // {
    //   label: '交易结果',
    //   value: success === false ? '失败' : '成功',
    // },
  ];
  return (
    // <DetailPage title="交易历史详情" backUrl={'/transaction/history'}>
    <DetailPage title="交易历史详情" backUrl="/" backState={{ activeTab: 2 }}>
      <div>
        {nftImage && <NFTImage url={nftImage} />}
        <h2 className="split-line-bottom padding-v5">{nftName}</h2>
        <TextListInfo lineBreak sourceData={personInfo} className="split-line-bottom padding-v5" />
        <TextListInfo sourceData={detailInfo} className="padding-v5" />
      </div>
    </DetailPage>
  );
}
