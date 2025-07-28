/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { CONTRACT_TYPE } from '../../config/contract';
import { SubscribeContractItem } from '../../utils/storage';

import { FtDetailPage } from './transactions/ft-detail';
import { NftDetailPage } from './transactions/nft-detail';
import { CmeviDetailPage } from './transactions/cmevi-detail';
import { TokenDetailPage } from './transactions/token-detail';

export function TransactionDetailPage(props) {
  const location = useLocation();
  const { contractInfo } = location.state as { contractInfo: SubscribeContractItem; txInfo: any };
  const { contractType } = contractInfo;
  console.log('* 交易细节',props);
  console.log('* contractType',contractType);
  switch (contractType) {
    case CONTRACT_TYPE.CMDFA:
      return <FtDetailPage {...props} />;
    // case CONTRACT_TYPE.CMNFA:
    case CONTRACT_TYPE.ERC20:
      return <TokenDetailPage {...props} />;
    case CONTRACT_TYPE.ERC1155:
    case CONTRACT_TYPE.ERC404:
      return <NftDetailPage {...props} />;
    case CONTRACT_TYPE.CMEVI:
      return <CmeviDetailPage {...props} />;
    default:
      console.log('* 没有交易细节跳转',CONTRACT_TYPE.ERC20,CONTRACT_TYPE.ERC20 == contractType);
      //return <TokenDetailPage {...props} />;
      return null;
  }
}
