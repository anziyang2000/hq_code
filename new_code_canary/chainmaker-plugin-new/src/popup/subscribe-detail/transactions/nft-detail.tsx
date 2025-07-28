/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { formatDate, queryNFTNewestTxs } from '../../../utils/utils';
import { ContractNFTItem, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { NFTImage } from '../../../components/nft-image';
import { TextInfo, TextInfoItem } from '../../../components/text-info';
import { getBrowserTransactionLink } from '../../../config/chain';
import { Button } from 'tea-component';
import { CONTRACT_TYPE } from '../../../config/contract';

export function NftDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { metadata, contractInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    metadata: ContractNFTItem;
    browserLink?: string;
  };
  const [NFTTxsInfo, setNFTTxsInfo] = useState({});
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;

  const { author, orgName, name, description, image, seriesHash, tokenId, contractAddress } = metadata;
  const { From: from, To: to, TxId: txId, BlockHeight: height, Timestamp: timestamp } = NFTTxsInfo as any;
  console.log('2. nft详情页面');
  useEffect(() => {
    if (!accountId) return;
    queryNFTNewestTxs({
      chainId: selectedChain.chainId,
      account: currentAccount,
      contractName: contractInfo.contractName,
      tokenId,
    }).then((txsInfo) => {
      setNFTTxsInfo(txsInfo);
    });
  }, [tokenId]);

  const detailInfo: TextInfoItem[] = [
    {
      label: '名称',
      value: name,
    },
    {
      label: '合约类型',
      value: contractInfo.contractType || CONTRACT_TYPE.CMNFA, // 使用配置的常量
      copyable: true
    },

    // contractType: contractInfo.contractType,
    // currentAccount: contractInfo.currentAccount.address,
    // tokenId: item.tokenId,
    // balance: item.balance,
    // contractAddress: ERC1155ContractAddress,
    {
      label: '合约地址',
      value: contractAddress,
      copyable: true,
    },
    {
      label: '持有数量',
      value: contractInfo.balance ? `${contractInfo.balance}` : '',
    },
    {
      label: '作者名',
      value: author,
    },
    {
      label: '发行组织',
      value: orgName,
    },
    {
      label: '作品URL',
      value: image,
    },
    {
      label: '作品描述',
      value: description,
    },
    {
      label: '作品hash',
      value: seriesHash,
    },
    {
      label: '发起用户',
      value: from,
    },
    {
      label: '接收用户',
      value: to,
    },
    {
      label: '交易id',
      value: txId,
      copyable: true,
      href: browserLink && getBrowserTransactionLink({ browserLink, txId, chainId: selectedChain.chainId }),
    },
    {
      label: '区块',
      value: height,
    },
    {
      label: '交易时间',
      value: timestamp && formatDate(new Date(timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    },
  ];
  return (
    // <DetailPage title="详情" backUrl={'/subscribe-contract/contract-detail'} backState={contractInfo}>
    <DetailPage title="详情" backUrl="/" backState={{ activeTab: 1 }}>
      <div>
        <NFTImage url={image} />
        <TextInfo sourceData={detailInfo} />
        <footer className={'mt-6n'}>
          <Button
            type={'primary'}
            className={'btn-lg'}
            onClick={() => {
              navigate(`/transaction/transfer1155`, {
                state: {
                  contractName: contractInfo.contractName,
                  contractType: contractInfo.contractType,
                  tokenId,
                  metadata,
                  prevPath: '/subscribe-contract/transaction-detail',
                  prevState: location.state,
                },
              });
            }}
          >
            转让
          </Button>
        </footer>
      </div>
    </DetailPage>
  );
}
