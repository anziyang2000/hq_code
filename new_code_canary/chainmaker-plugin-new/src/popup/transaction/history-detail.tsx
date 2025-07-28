import React from 'react';
import { useLocation } from 'react-router-dom';
import { CONTRACT_TYPE } from '../../config/contract';
import { SubscribeContractItem } from '../../utils/storage';

import { DfaDetailPage } from './cmdfa-history-detail';
import { NfaDetailPage } from './cmnfa-history-detail';
import { Erc1155DetailPage } from './nft-history-detail';
import { Erc20DetailPage } from './token-history-detail';
import { EthDetailPage } from './erc-history-detail';

export function TransactionHistoryDetailPage(props) {
  const location = useLocation();
  const { contractInfo } = location.state as { contractInfo: SubscribeContractItem; txInfo: any };
  const { contractType } = contractInfo;
  switch (contractType) {
    case CONTRACT_TYPE.CMDFA:
      return <DfaDetailPage {...props} />;
    case CONTRACT_TYPE.CMNFA:
      return <NfaDetailPage {...props} />;
    case CONTRACT_TYPE.GAS:
      return <EthDetailPage {...props} />;
    case CONTRACT_TYPE.ERC404:
    case CONTRACT_TYPE.ERC1155:
    case CONTRACT_TYPE.Proof:
    case CONTRACT_TYPE.Exchange:
    case CONTRACT_TYPE.MarketPlace:
    case CONTRACT_TYPE.Logic:
    case CONTRACT_TYPE.Loan:
      return <Erc1155DetailPage {...props} />;
    case CONTRACT_TYPE.ERC20:
      return <Erc20DetailPage {...props} />;
    default:
      return <>交易历史</>;
  }
}
