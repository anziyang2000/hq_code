/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Icon, Select } from 'tea-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChainMakerRequest, MessageInfoCode, VcAuthorityParams } from '../../event-page';
import { useChainStore } from '../popup';
import chainStorageUtils, { DidItem, VcItem } from '../../utils/storage';
import { getNowSeconds, sendMessageToContentScript } from '../../utils/tools';
import { createVPParems, getAuthVc, verifyNonce } from '../../services/did';
import HeaderIcon from '../../components/heaederIcon';
import './did.less';
import SvgIcon from '../../components/svg-icon';
const DidItemView = ({ item, isSelector, isBox }: { item?: any; isSelector?: boolean; isBox?: boolean }) => {
  const { data } = (item as { data: DidItem }) || {};
  return (
    <div className={`auth-select-box ${!isSelector && !isBox ? 'border-none' : ''}`}>
      {item ? (
        <div className="flex">
          <HeaderIcon color={data.accounts[0].color} width={40} height={40} />
          <div className="did-item-content ml-2n">
            <p className="did-item-name " style={{ maxWidth: '100%' }}>
              {data.accounts[0].name}
            </p>
            <p className="did-item-id">{data.id}</p>
          </div>
        </div>
      ) : (
        <p className="text-center">请选择DID</p>
      )}
      {isSelector && <Icon type="arrowdown" />}
    </div>
  );
};

const VcItem = ({ item, isSelector }: { item?: any; isSelector?: boolean }) => {
  const { data } = (item as { data: VcItem }) || {};
  return (
    <div className={`auth-select-box ${!isSelector ? 'border-none' : ''}`}>
      <div className="flex">
        <SvgIcon width={40} height={40} name="identityCert" />
        <div className="did-item-content vc-item-name ml-2n">
          {item ? (
            <p className="overflow-ellipsis">{data.credentialSubject.certificateName}</p>
          ) : (
            <p>请选择（可选项）</p>
          )}
        </div>
      </div>

      {isSelector && <Icon type="arrowdown" />}
    </div>
  );
};

function DidAuthority() {
  const location = useLocation();
  const authRequest = location.state as ChainMakerRequest<VcAuthorityParams, 'openDidAuthority'>;
  const navigate = useNavigate();

  const { chainId, vp, did, templateId, verifier, accountAddress } = authRequest?.body || {
    chainId: 'chainmaker_pk',
    appId: '123',
    vp: '123123',
  };
  const { currentTab, chains } = useChainStore();

  const [loading, setLoading] = useState(false);
  const [didDocList, setDidDocList] = useState<DidItem[]>([]);
  const [selectedDid, setSelectedDid] = useState(did || '');
  const [vcList, setVcList] = useState<VcItem[]>([]);
  const [selectedVcId, setSelectedVcId] = useState('');

  useEffect(() => {
    if (!selectedDid) return;
    (async () => {
      const vcList = await chainStorageUtils.getDidVCList({ did: selectedDid, chainId });
      setVcList(vcList);
      setSelectedVcId('');
    })();
  }, [selectedDid]);

  useEffect(() => {
    // chainStorageUtils.getChainAccounts(chainId);
    let errMsg: string;
    if (!chainId || !vp) {
      errMsg = `缺少参数,chainId:${chainId},vp:${vp},`;
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
      if (accountAddress || did) {
        const doc = await chainStorageUtils.getDidDocument({ chainId, accountAddress, did });
        if (doc) {
          // accountDid = doc.id;
          setDidDocList([doc]);
        } else {
          errMsg = `插件未记录指定的did信息,accountAddress:${accountAddress},did:${did}`;
        }
      } else {
        const docList = await chainStorageUtils.getDidDocumentList({ chainId });
        if (docList?.length) {
          setDidDocList(docList);
          if (!selectedDid) {
            setSelectedDid(docList[0].id);
          }
        } else {
          errMsg = `指定的区块链网络未找到did信息,chainId:${chainId}`;
        }
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
      }
      // 是否实时同步数据？
      // const didList = getChainsDidList({ chainId });
    })();
  }, [chainId, did, vp, accountAddress]);

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
    if (selectedDid && selectedVcId) {
      const selectedVc = vcList.find((vc) => vc.id === selectedVcId);
      (async () => {
        try {
          setLoading(true);
          const accounts = await chainStorageUtils.getChainAccounts(chainId);
          const currentDoc = didDocList.find((doc) => doc.id === selectedDid);
          let verificationMethod;
          const currentAccount = accounts.find((account) =>
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
          const vcParams = { ...selectedVc };
          delete vcParams.status;
          // 兼容老版本
          sendMessage({
            code: MessageInfoCode.success,
            res: {
              vp: await createVPParems({
                verifier,
                did: selectedDid,
                account: currentAccount,
                verificationMethod,
                vc: [vcParams],
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
  }, [authRequest, selectedDid, selectedVcId]);

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

  const didOptions = useMemo(
    () =>
      didDocList.map((doc) => ({
        text: <DidItemView item={{ data: doc }} />,
        data: doc,
        value: doc.id,
      })),
    [didDocList],
  );
  const vcOptions = useMemo(() => {
    const options = vcList
      .filter((vc) => (templateId ? templateId === vc.template.id : true))
      .map((vc) => ({
        text: <VcItem item={{ data: vc }} />,
        data: vc,
        value: vc.id,
      }));
    if (did && templateId && !options.length) {
      const msg = `插件没有其指定的VC模版ID`;
      navigate('/', {
        state: {
          alert: msg,
        },
      });
      sendMessage({
        code: MessageInfoCode.error,
        res: msg,
      });
    }
    return options;
  }, [vcList]);
  console.log('selectedDid', selectedDid);
  return (
    <div className="signature">
      <div className="authority-vc-page">
        <div className="page-title">请求授权DID的VC</div>

        <div className="current-web-info">
          <img src={currentTab?.favIconUrl} />
          <div className="current-web-addr">{currentTab?.host}</div>
        </div>
        <p className="mt-3n">
          申请使用您的“<strong>DID数字身份</strong>”和“<strong>数字证书</strong>”信息，请确定是否授权。
        </p>
        <div className="mt-3n">
          {did || accountAddress ? (
            <DidItemView item={didOptions.find((ele) => ele.value === did)} isBox />
          ) : (
            <Select
              boxClassName="vc-selector"
              appearance="pure"
              matchButtonWidth
              size="full"
              value={selectedDid}
              disabled={!!did}
              onChange={(value) => setSelectedDid(value)}
              options={didOptions}
              button={(item) => <DidItemView item={item} isSelector />}
            />
          )}
          <Select
            className="mt-3n"
            boxClassName="vc-selector"
            size="full"
            appearance="pure"
            matchButtonWidth
            value={selectedVcId}
            onChange={(value) => setSelectedVcId(value)}
            options={vcOptions}
            button={(item) => <VcItem item={item} isSelector />}
          />
        </div>
        <div className={'flex-grow'} />
        <footer className="page-options">
          <div className="connect-concel connect-bt" onClick={onCancel}>
            拒绝
          </div>
          <Button
            type={'primary'}
            className="connect-sub connect-bt"
            disabled={!selectedDid || !selectedVcId}
            onClick={onSubmit}
            loading={loading}
          >
            确认授权
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default DidAuthority;
