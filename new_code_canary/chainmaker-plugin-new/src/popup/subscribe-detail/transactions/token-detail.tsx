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
import { ethers } from 'ethers';

export function TokenDetailPage() {
  console.log('跳转erc20详情页面');
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('2. erc20详情页面');

  const { metadata, contractInfo, browserLink } = location.state as {
    contractInfo: SubscribeContractItem;
    metadata: ContractNFTItem;
    browserLink?: string;
  };
  const [NFTTxsInfo, setNFTTxsInfo] = useState({});
  const { selectedChain, currentAccount } = useChainStore();
  const accountId = currentAccount?.address;

  const { author, orgName, name, description, image, seriesHash, tokenId } = metadata;
  const { From: from, To: to, TxId: txId, BlockHeight: height, Timestamp: timestamp } = NFTTxsInfo as any;

  // useEffect(() => {
  //   if (!accountId) return;
  //   queryNFTNewestTxs({
  //     chainId: selectedChain.chainId,
  //     account: currentAccount,
  //     contractName: contractInfo.contractName,
  //     tokenId,
  //   }).then((txsInfo) => {
  //     setNFTTxsInfo(txsInfo);
  //   });
  // }, [tokenId]);

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
      value: contractInfo.contractAddress,
      copyable: true,
    },
    {
      label: '持有数量',
      value: contractInfo.balance ? ethers.utils.formatEther(contractInfo.balance) : '',
    }
  ];
  return (
    // <DetailPage title="详情" backUrl={'/subscribe-contract/contract-detail'} backState={contractInfo}>
    <DetailPage title="详情" backUrl="/" backState={{ activeTab: 0 }}>
      <div>
        <TextInfo sourceData={detailInfo} />
        <footer className={'mt-6n'}>
          <Button
            type={'primary'}
            className={'btn-lg'}
            onClick={() => {
              navigate(`/transaction/transferErc20`, {
                state: {
                  contractName: contractInfo.contractName,
                  contractType: CONTRACT_TYPE.ERC20,
                  metadata,
                  prevPath: '/subscribe-contract/transaction-detail',
                  prevState: location.state,
                },
              });
            }}
          >
            转账
          </Button>
        </footer>
      </div>
    </DetailPage>
  );
}
