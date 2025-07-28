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
import { CMIDContractPage } from './contracts/cmid-contract';

import { CMDFAContractPage } from './contracts/ft-contract';
import { GASContractPage } from './contracts/gas-contract';
import { CMNFAContractPage } from './contracts/nft-contract';
import { OtherContractPage } from './contracts/other-contract';
import { CMEVIContractPage } from './contracts/cmevi-contract';
import { TokenContractPage } from './contracts/token-contract';

export function ContractDetailPage(props) {
  const location = useLocation();
  const contractInfo = location.state as SubscribeContractItem;
  const { contractType } = contractInfo;
  console.log('* 合约细节');
  switch (contractType) {
    case CONTRACT_TYPE.CMDFA:
      return <CMDFAContractPage {...props} />;
    case CONTRACT_TYPE.CMNFA:
      return <CMNFAContractPage {...props} />;
    case CONTRACT_TYPE.CMID:
      return <CMIDContractPage {...props} />;
    case CONTRACT_TYPE.GAS:
      return <GASContractPage {...props} />;
    case CONTRACT_TYPE.CMEVI:
      return <CMEVIContractPage {...props} />;
    default:
      return <OtherContractPage {...props} />;
  }
}
