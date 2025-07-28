import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailPage } from '../../../utils/common';
import { useLocation } from 'react-router-dom';
import { Account, Chain, Wallet } from '../../../utils/interface';
import chainStorageUtils from '../../../utils/storage';
import { file2Txt } from '../../../../web-sdk/glue';
import { message } from 'tea-component';
import { downloadFile } from '../../../utils/utils';
import './index.less';
// 确定性非确定性共用-链账户详情页面
// 接收参数：account chain wallet?
function WalletAccountDetail() {
  const location = useLocation();
  const { account, chain, wallet } = location.state as {
    account: Account;
    chain: Chain;
    wallet?: Wallet;
  };
  const back = useMemo(() => {
    const url = wallet ? '/wallet/hd-wallet-detail' : '/wallet/jbok-wallet-detail';
    const state = wallet ? { wallet, chain } : { chain };
    return {
      url,
      state,
    };
  }, [wallet, chain]);

  const [keyPair, setKeyPair] = useState({
    pri: {
      pem: '',
      file: null,
      formatPem: '',
    },
    pub: {
      pem: '',
      file: null,
      formatPem: '',
    },
  });

  // 获取账户的 公私钥文本
  const getKeyPairByAccount = useCallback(async (account) => {
    try {
      const [signKeyFile, publicKeyFile] = await chainStorageUtils.getUploadFiles([
        account.userSignKeyFile,
        account.userPublicKeyFile,
      ]);
      const pri = await file2Txt(signKeyFile);
      const pub = await file2Txt(publicKeyFile);
      setKeyPair({
        pri: {
          pem: pri,
          file: signKeyFile,
          formatPem: pri.replace(/\n+/g, '<br>'),
        },
        pub: {
          pem: pub,
          file: publicKeyFile,
          formatPem: pub.replace(/\n+/g, '<br>'),
        },
      });
    } catch (error) {
      message.error({
        content: '链账户公私钥找不到',
      });
    }
  }, []);
  // 下载公私钥文件
  const downLoadPem = useCallback(
    (tag: 'pri' | 'pub') => {
      try {
        const pair = keyPair[tag];
        downloadFile(pair.file.name, pair.pem, pair.file.type);
        setTimeout(() => {
          message.success({ content: '下载成功' });
        }, 500);
      } catch (error) {
        message.error({ content: '下载失败' });
      }
    },
    [keyPair],
  );

  useEffect(() => {
    if (!account) return;
    getKeyPairByAccount(account);
  }, [account]);

  return (
    <DetailPage title={'链账户详情'} backUrl={back.url} backState={back.state} className="wallet-account-detail">
      <div className="key-container">
        <div className="key-header">
          <div className="key-name">私钥</div>
          <div
            className="key-download"
            onClick={() => {
              downLoadPem('pri');
            }}
          >
            <div className="download-icon">
              <img src="../../../img/icon-download.png" alt="" />
            </div>
            <div className="download-text">下载</div>
          </div>
        </div>
        <div className="key-content" dangerouslySetInnerHTML={{ __html: keyPair.pri.formatPem }}></div>
      </div>

      <div className="key-container">
        <div className="key-header">
          <div className="key-name">公钥</div>
          <div
            className="key-download"
            onClick={() => {
              downLoadPem('pub');
            }}
          >
            <div className="download-icon">
              <img src="../../../img/icon-download.png" alt="" />
            </div>
            <div className="download-text">下载</div>
          </div>
        </div>
        <div className="key-content" dangerouslySetInnerHTML={{ __html: keyPair.pub.formatPem }}></div>
      </div>
    </DetailPage>
  );
}
export default WalletAccountDetail;