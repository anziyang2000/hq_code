import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chain, Wallet } from '../../../utils/interface';
import { useLocation } from 'react-router-dom';
import { DetailPage } from '../../../utils/common';
import { copyToClipboard } from '../../../utils/utils';
import { MnemonicContainer } from '../../../components/mnemonic-container';
import './index.less';
// 确定性钱包-助记词详情
// 接收参数：wallet chain
function HdWalletMnemonicDetail() {
  const location = useLocation();
  const { wallet, chain } = location.state as {
    wallet: Wallet;
    chain: Chain;
  };
  const back = useMemo(
    () => ({
      url: '/wallet/hd-wallet-detail',
      state: { wallet, chain },
    }),
    [wallet, chain],
  );
  const [mnemonicArr, setMnemonicArr] = useState<{ word: string; index: number }[]>([]);
  useEffect(() => {
    if (wallet) {
      setMnemonicArr(wallet.mnemonic.split(' ').map((word, index) => ({ word, index })));
    }
  }, [wallet]);
  return (
    <DetailPage title={'助记词详情'} backUrl={back.url} backState={back.state} className="hd-wallet-mnemonic-detail">
      <div className="mnemonic-area">
        <div className="tips">平台不托管助记词，请按顺序将助记词妥善保管在安全的环境内，避免遗失。</div>
        <MnemonicContainer orginArr={mnemonicArr} copy />
      </div>
    </DetailPage>
  );
}
export default HdWalletMnemonicDetail;
