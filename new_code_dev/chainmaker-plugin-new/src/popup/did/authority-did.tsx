/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'tea-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChainMakerRequest, DidAuthorityParams, MessageInfoCode } from '../../event-page';
import { accountSign } from '../../utils/utils';
import { useChainStore } from '../popup';
import chainStorageUtils, { DidItem } from '../../utils/storage';
import { getNowSeconds, sendMessageToContentScript } from '../../utils/tools';
import { toHex } from '../../../web-sdk/glue';
import DidListComponent from './did-list';
import { createVPParems, verifyNonce } from '../../services/did';

function DidAuthority() {
  const location = useLocation();
  const authRequest = location.state as ChainMakerRequest<DidAuthorityParams, 'openDidAuthority'>;
  const navigate = useNavigate();

  const { chainId, vp, verifier } = authRequest?.body || {
    chainId: 'chainmaker_pk',
    appId: '123',
    nonce: '123123',
  };
  const { currentTab, currentAccount, chains } = useChainStore();

  const [loading, setLoading] = useState(false);
  const [didDocList, setDidDocList] = useState<DidItem[]>([]);
  const [activeDid, setActiveDid] = useState('');

  useEffect(() => {
    // chainStorageUtils.getChainAccounts(chainId);
    let errMsg: string;
    if (!chainId || !vp) {
      errMsg = `缺少参数,chainId:${chainId},vp:${vp}`;
    } else if (!chains.some((chain) => chain.chainId === chainId)) {
      errMsg = `指定的区块链网络未添加到插件,chainId:${chainId}`;
    }
    if (errMsg) {
      navigate('/', {
        state: {
          alert: errMsg,
        },
      });
      sendMessage({
        code: MessageInfoCode.error,
        res: errMsg,
      });
      return;
    }
    (async () => {
      const docList = await chainStorageUtils.getDidDocumentList({ chainId });
      if (docList?.length) {
        setDidDocList(docList);
      } else {
        errMsg = `指定的区块链网络未找到did信息,chainId:${chainId}`;
        navigate('/', {
          state: {
            alert: errMsg,
          },
        });
        sendMessage({
          code: MessageInfoCode.error,
          res: errMsg,
        });
      }
      // 是否实时同步数据？
      // const didList = getChainsDidList({ chainId });
    })();
  }, [chainId, verifier, vp]);

  const sendMessage = useCallback(
    (info) => {
      sendMessageToContentScript({
        operation: authRequest.operation,
        ticket: authRequest.ticket,
        data: {
          status: 'done',
          timestamp: getNowSeconds(),
          info,
        },
      });
    },
    [authRequest],
  );
  const onSubmit = useCallback(() => {
    if (activeDid) {
      (async () => {
        try {
          setLoading(true);
          const accounts = await chainStorageUtils.getChainAccounts(chainId);
          const currentDoc = didDocList.find((doc) => doc.id === activeDid);
          let verificationMethod;
          const selectedAccount = accounts.find((account) =>
            currentDoc.accounts.some(({ address, id }) => {
              if (address === account.address) {
                verificationMethod = id;
                return true;
              }
              return false;
            }),
          );

          const result = await verifyNonce({
            vp,
          });
          if (!result) {
            throw new Error('vp验证失败');
          }
          // 兼容老版本
          sendMessage({
            code: MessageInfoCode.success,
            res: {
              did: activeDid,
              vp: await createVPParems({
                verifier,
                did: activeDid,
                account: selectedAccount,
                verificationMethod,
              }),
            },
          });

          navigate('/');
        } catch (e) {
          console.warn('openAccountSignature error:', e);
          sendMessage({
            code: MessageInfoCode.error,
            res: `插件异常退出:${e.message}`,
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [authRequest, activeDid]);

  const backToHome = useCallback(() => {
    navigate('/');
  }, []);

  const onCancel = useCallback(() => {
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '插件取消授权',
    });
    backToHome();
  }, [authRequest]);

  return (
    <div className={'signature'}>
      <div className="page-title">请求授权DID登录</div>
      <div className="current-web-info">
        <img src={currentTab?.favIconUrl} />
        <div className="current-web-addr">{currentTab?.host}</div>
      </div>
      <p className="mt-3n">申请授权使用DID登录，授权后将使用所选定的账户登录该DAPP应用。</p>
      <DidListComponent
        didDocList={didDocList}
        activeDid={activeDid}
        setActiveDid={setActiveDid}
        currentAccount={currentAccount}
      />
      <div className={'flex-grow'} />
      <footer className="page-options">
        <div className="connect-concel connect-bt" onClick={onCancel}>
          拒绝
        </div>
        <Button
          type={'primary'}
          className="connect-sub connect-bt"
          disabled={!activeDid}
          onClick={onSubmit}
          loading={loading}
        >
          授权登录
        </Button>
      </footer>
    </div>
  );
}

export default DidAuthority;
