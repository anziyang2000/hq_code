/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Input } from 'tea-component';
import { useForm } from 'react-hook-form';
import { SignatureConfirmModal } from '../utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageInfoCode, SendRequestAccountSignParams } from '../event-page';
import { accountSign } from '../utils/utils';
import { useChainStore } from './popup';
import GlossaryGuide from '../utils/glossary-guide';
import chainStorageUtils from '../utils/storage';
import { Account } from '../utils/interface';
import { getNowSeconds, sendMessageToContentScript } from '../utils/tools';
import { toHex, file2Txt } from '../../web-sdk/glue';

function AccountSignature() {
  const location = useLocation();
  const signRequest = location.state as SendRequestAccountSignParams;
  const navigate = useNavigate();
  const {
    formState: { isValid },
  } = useForm({
    mode: 'onBlur',
  });
  const { currentTab } = useChainStore();
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<Account>();
  const [loading, setLoading] = useState(false);

  const signatureConfirmRef = useRef();
  const sendMessage = useCallback(
    (info) => {
      sendMessageToContentScript({
        operation: signRequest.operation,
        ticket: signRequest.ticket,
        data: {
          status: 'done',
          timestamp: getNowSeconds(),
          info,
        },
      });
    },
    [signRequest],
  );
  const onSubmit = useCallback(async () => {
    const doConfirm = async () => {
      try {
        setLoading(true);
        if (typeof signRequest.body === 'object') {
          const { resCode, hexContent, alg } = signRequest.body;
          const signContent = await accountSign({ account, hexStr: hexContent, resCode, alg });
          const userPublicKeyFile = await chainStorageUtils.getUploadFile(account.userPublicKeyFile);
          const pubKey = await file2Txt(userPublicKeyFile);
          sendMessage({
            code: MessageInfoCode.success,
            signContent,
            pubKey,
          });
        } else {
          // 兼容老版本
          sendMessage({
            code: MessageInfoCode.success,
            // TODO: 中文签名，hex编码是否还有问题
            res: await accountSign({ account, hexStr: toHex(signRequest.body) }),
          });
        }

        chainStorageUtils.setLastTransTime();
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
    };
    if (await chainStorageUtils.getLastTransTime()) {
      doConfirm();
    } else {
      // @ts-ignore
      signatureConfirmRef.current.show({
        confirm: doConfirm,
      });
    }
  }, [signRequest, account]);

  const backToHome = useCallback(() => {
    navigate('/');
  }, []);

  const onCancel = useCallback(() => {
    sendMessage({
      code: MessageInfoCode.cancel,
      res: '插件取消验签',
    });
    backToHome();
  }, [signRequest]);
  useEffect(() => {
    const signRequest = location.state as SendRequestAccountSignParams;
    const { chainId, accountAddress, body } = signRequest;
    if (!chainId || !accountAddress) {
      navigate('/', {
        state: {
          alert: '缺少链ID或者用户地址',
        },
      });
      sendMessage({
        code: MessageInfoCode.error,
        res: '缺少链ID或者用户地址',
      });
      return;
    }
    if (!body) {
      navigate('/', {
        state: {
          alert: '缺少验签随机字符串',
        },
      });
      sendMessage({
        code: MessageInfoCode.error,
        res: '缺少待签名内容',
      });
      return;
    }
    chainStorageUtils.getChainAccounts(chainId).then((accounts) => {
      const account = accounts.find((ac) => ac.address === accountAddress);
      if (!account) {
        sendMessage({
          code: MessageInfoCode.error,
          res: '您指定的区块链网络或者链账户未添加到插件里，请检查信息后重试。',
        });
        navigate('/', {
          state: {
            alert: '您指定的区块链网络或者链账户未添加到插件里，请检查信息后重试。',
          },
        });
        return;
      }
      setChainId(chainId);
      setAccount(account);
    });
  }, []);

  return (
    <div className={'signature'}>
      <div className="page-title">请求签名</div>
      <div className="current-web-info">
        <img src={currentTab?.favIconUrl} />
        <div className="current-web-addr">{currentTab?.host}</div>
      </div>
      <Form layout={'vertical'}>
        <Form.Item label={<GlossaryGuide title={'待签名信息'} />}>
          <Input size={'full'} readOnly multiline value={signRequest?.body?.hexContent || String(signRequest?.body)} />
        </Form.Item>

        <Form.Item label={<GlossaryGuide title={'指定签名账户'} />}>
          <Input readOnly size={'full'} value={chainId} />
        </Form.Item>

        <Form.Item>
          <Input readOnly size={'full'} value={account?.name} />
        </Form.Item>
      </Form>
      <div className={'flex-grow'} />
      <div className="page-options">
        <div className="connect-concel connect-bt" onClick={onCancel}>
          取消
        </div>
        <Button
          type={'primary'}
          className="connect-sub connect-bt"
          disabled={!isValid || !Boolean(signRequest)}
          onClick={onSubmit}
          loading={loading}
        >
          确定签名
        </Button>
      </div>
      <SignatureConfirmModal ref={signatureConfirmRef} />
    </div>
  );
}

export default AccountSignature;
