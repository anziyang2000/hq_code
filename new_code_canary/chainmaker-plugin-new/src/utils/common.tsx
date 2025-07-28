/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Copy, Dropdown, Form, Input, List, message, Modal, Select, Status } from 'tea-component';
import chainStorageUtils, { contractStoreUtils } from './storage';
import { Controller, useForm } from 'react-hook-form';
import md5 from 'md5';
import { useChainStore } from '../popup/popup';
import GlossaryGuide from './glossary-guide';
import { Chain } from './interface';
import { pullRemoteChainConfig } from '../services/chain';
import { BEACON_EVENTS, beacon } from '../beacon';
import './common.less';
import { DEFAULT_BROWSER_LINK } from '@src/config/chain';

type Page = {
  children: React.ReactNode;
  isLoggedIn: boolean;
  className?: string;
};

const disableChangeChainList = [
  '/transaction/transfer',
  '/transaction/history',
  '/transaction/history-detail',
  '/subscribe-contract/new',
  '/subscribe-contract/contract-detail',
  '/subscribe-contract/transaction-detail',
  '/accounts/import-by-mnemonic',
];

/**
 * @description 显示链选择器
 */
export function ChainPage({ ...props }: Page) {
  const chains = useChainStore((state) => state.chains);

  const { setSelectedChain, selectedChain, setCurrentAccount } = useChainStore();

  const options = useMemo(
    () =>
      chains.map((item) => ({
        value: item.chainId,
        text: item.chainName,
      })),
    [chains],
  );

//   const options = useMemo(() => {
//     const mapped = chains.map((item) => {
//         console.log('💡 链信息 item:', item);
//         return {
//             text: item.chainName,
//             value: item.chainId,
//         };
//     });
//     return mapped;
// }, [chains]);

  const navigate = useNavigate();

  const menus = useMemo<{ id: string; title: string; icon: string }[]>(
    () => [
      {
        id: 'chains',
        title: '区块链管理',
        icon: 'icon-menu-chain.png',
      },
      {
        id: 'accounts',
        title: '链账户管理',
        icon: 'icon-menu-account.png',
      },
      {
        id: 'explorer',
        title: '在 Explorer 上查看',
        icon: 'icon-menu-explorer.png',
      },
      // {
      //   id: 'tx-logs',
      //   title: '上链记录',
      //   icon: 'icon-menu-log.png',
      // },
      {
        id: 'help',
        title: '帮助文档',
        icon: 'icon-menu-help.png',
      },
      {
        id: 'setting',
        title: '系统设置',
        icon: 'icon-menu-setting.png',
      },
      {
        id: 'about-us',
        title: '关于我们',
        icon: 'icon-menu-about.png',
      },
      {
        id: 'lock-wallet',
        title: '锁定钱包',
        icon: 'icon-lock.png',
      },
    ],
    [],
  );

  const onMenuClick = useCallback((e, close) => {
    const { id } = e.target.dataset;
    switch (id) {
      case 'help':
        window.open('http://www.hqsk.cn/', '_blank');
        break;
      case 'explorer':
        // console.log('selectedChain:', selectedChain);
        if (selectedChain?.chainName === '数科链主网') {
          window.open(DEFAULT_BROWSER_LINK, '_blank');
        } else if (selectedChain?.browserLink) {
          window.open(selectedChain.browserLink, '_blank');
        } else {
          message.warning({ content: '当前节点未设置区块链浏览器地址' });
        }
        break;
      case 'chains':
        beacon.onUserAction(BEACON_EVENTS.BLOCKCHAIN_MANAGE);
        navigate(`/${id}`);
        break;
      case 'accounts':
        beacon.onUserAction(BEACON_EVENTS.ACCOUNT_MANAGE);
        navigate(`/${id}`);
        break;
      case 'lock-wallet':
        navigate('/login-lock');
        break;
      default:
        navigate(`/${id}`);
        break;
    }
    close();
  }, []);

  const goSignature = useCallback(() => {
    navigate('/'); // signature
  }, []);

  const handleChainChange = useCallback(
    (chainId: string) => {
      const chain = chains.find((item) => item.chainId === chainId) as Chain;
      chainStorageUtils.setSelectedChain(chain).then(async () => {
        const { updatedChain } = (await pullRemoteChainConfig()) || {};
        setSelectedChain(updatedChain || chain);
      });
      // goSignature();
    },
    [chains],
  );

  // const handleChainChange = useCallback(
  //   (chainId: string) => {
  //     const chain = chains.find((item) => item.chainId === chainId) as Chain;
  
  //     // ✅ 1. 本地存储以兼容 event-page.ts 获取 nodeIp
  //     chrome.storage.local.set({ selectedChain: chain }, () => {
  //       console.log('[popup] 已存储 selectedChain 到 chrome.storage.local:', chain);
  //     });
  
  //     // ✅ 2. 保留原有持久化和拉取远程更新逻辑
  //     chainStorageUtils.setSelectedChain(chain).then(async () => {
  //       const { updatedChain } = (await pullRemoteChainConfig()) || {};
  //       setSelectedChain(updatedChain || chain);
  
  //       // ✅ 如果需要在拉取更新后再次同步，可解开以下注释：
  //       // chrome.storage.local.set({ selectedChain: updatedChain || chain }, () => {
  //       //   console.log('[popup] 更新后重新存储 selectedChain:', updatedChain || chain);
  //       // });
  //     });
  
  //     // goSignature(); // 若需要，继续保留
  //   },
  //   [chains],
  // );

  useEffect(() => {
    (async function () {
      const { updatedChain } = (await pullRemoteChainConfig()) || {};
      if (updatedChain) {
        setSelectedChain(updatedChain);
      }
    })();
  }, []);

  const location = useLocation();
  const disableChangeChain = useMemo(() => disableChangeChainList.includes(location.pathname), [location.pathname]);
  if (!props.isLoggedIn) {
    return <>{props.children}</>;
  }
  return (
    <>
      <div className={`toolbar no-border`}>
        <div>
          {/* <img src={'/img/icon48.png'} alt={''} id={'logo'} onClick={goSignature} /> */}
          <img src={'/img/hq.png'} alt={''} id={'logo'} onClick={goSignature} />
        </div>
        <div>
          {options.length === 0 ? (
            <span className={'title'}>SmartPlugin</span>
          ) : (
            <Select
              disabled={disableChangeChain}
              appearance="button"
              options={options}
              placeholder="请选择区块链网络"
              className={'chain-selector'}
              onChange={handleChainChange}
              value={selectedChain?.chainId}
              overlayClassName={'chain-selector-overlay-box'}
            />
          )}
        </div>
        <div>
          <Dropdown
            button={<img src={'/img/icon-menu.png'} className={'menu-icon'} />}
            appearance="pure"
            clickClose={false}
          >
            {(close) => (
              <List type="option" className={'menu-list'}>
                {menus.map((m) => (
                  // <List.Item data-id={m.id} onClick={(e) => onMenuClick(e, close)} key={m.title}>
                  //   <img src={`/img/${m.icon}`} className={'tea-mr-2n'} />
                  //   {m.title}
                  // </List.Item>
                  <List.Item data-id={m.id} onClick={(e) => onMenuClick(e, close)} key={m.title}>
                  <img
                    src={`/img/${m.icon}`}
                    className={'tea-mr-2n menu-icon-img' + (m.id === 'lock-wallet' ? ' lock-icon' : '') + (m.id === 'explorer' ? ' explorer-icon' : '')}
                    alt=""
                  />
                  {m.title}
                  </List.Item>
                ))}
              </List>
            )}
          </Dropdown>
        </div>
      </div>
      <main className={props.className}>{props.children}</main>
    </>
  );
}

/**
 * @description 确认弹窗
 */
function ConfirmModalComponent(
  {
    title,
    children,
    ...props
  }: {
    title: string;
    children: React.ReactNode;
    confirmBtnText?: string;
    cancelBtnText?: string;
    isHideConfirmBtn?: boolean;
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>();
  const [conf, setConf] = useState<{
    close?: () => void;
    confirm?: () => Promise<any>;
  }>({});
  useImperativeHandle(ref, () => ({
    show: (p: { close?: () => void; confirm?: () => Promise<any> }) => {
      setConf(p);
      setVisible(true);
    },
  }));

  const onConfirm = useCallback(() => {
    setLoading(true);
    if (conf.confirm) {
      const confirmPromise = conf.confirm();
      // @ts-ignore
      confirmPromise
        ?.then((res) => {
          setVisible(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setVisible(false);
    }
  }, [conf]);

  const onCancel = useCallback(() => {
    conf?.close?.();
    setVisible(false);
  }, [conf]);

  return (
    <Modal className="confirm-model" visible={visible} caption={title} onClose={onCancel} disableCloseIcon>
      <Modal.Body>{children} </Modal.Body>
      <Modal.Footer>
        <Button type="weak" onClick={onCancel}>
          {props.cancelBtnText || '我再想想'}
        </Button>
        {!props.isHideConfirmBtn && (
          <Button type="primary" onClick={onConfirm} loading={loading}>
            {props.confirmBtnText || '确定'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export const ConfirmModal = React.forwardRef(ConfirmModalComponent);

/**
 * 签名确认组件，用户输入密码正确后可以继续执行
 */
export const SignatureConfirmModalContainer = ({}, ref) => {
  const signatureConfirmRef = useRef();

  const { control, reset, getValues } = useForm({
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    show: (p: { close?: () => void; confirm?: () => void }) => {
      // @ts-ignore
      signatureConfirmRef.current.show({
        confirm: async () => {
          const realPass = await chainStorageUtils.getLogin();
          const inputPass = md5(getValues().password);
          if (inputPass !== realPass) {
            message.error({
              content: '密码错误',
            });
            throw 'password error';
          }
          return p.confirm();
        },
        close: () => {
          reset({
            password: null,
          });
        },
      });
    },
  }));
  return (
    <ConfirmModal ref={signatureConfirmRef} title={'确认上链'}>
      <Form layout={'vertical'} className={'mt-2n signature-confirm-form'}>
        <Controller
          control={control}
          rules={{
            required: '请输入',
            validate: (password: string) => {
              if (!password?.length) {
                return '请输入密码';
              }
            },
          }}
          name="password"
          render={({ field, fieldState }) => (
            <Form.Item label={<GlossaryGuide title={'交易密码'} />} message={fieldState.error?.message}>
              <Input type={'password'} size={'full'} {...field} />
            </Form.Item>
          )}
        />
      </Form>
    </ConfirmModal>
  );
};
export const SignatureConfirmModal = React.forwardRef(SignatureConfirmModalContainer);

export function DetailPageContainer(
  {
    ...props
  }: {
    children: React.ReactNode;
    title: string;
    backUrl: string;
    backState?: any;
    className?: string;
  },
  ref,
) {
  const scrollViewRef = useRef();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (props.backUrl) {
      navigate(props.backUrl, { state: props.backState });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (scrollViewRef.current) {
        // @ts-ignore
        const top = scrollViewRef.current.scrollHeight;
        // @ts-ignore
        scrollViewRef.current.scrollTo({ top, behavior: 'smooth' });
      }
    },
    scrollToTop: () => {
      if (scrollViewRef.current) {
        // @ts-ignore
        scrollViewRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  }));

  return (
    <div className={`chain-content ${props.className ?? ''}`} ref={scrollViewRef}>
      <h3 className={'flex'}>
        <div className={'flex-item-1'}>{props.title}</div>
        <img src={'/img/icon-back.png'} className={'back-icon'} onClick={handleBack} />
      </h3>
      <div className={'inner-content'}>{props.children}</div>
    </div>
  );
}
export const DetailPage = React.forwardRef(DetailPageContainer);

/**
 * @description 产品使用说明，外链
 */
export function ProductGuideLink() {
  return (
    <div className={'tea-mt-3n text-blue product-guide'}>
      <a href={CHAIN_MAKER.userGuideURL} target={'_blank'} rel="noreferrer">
        产品使用说明
      </a>
    </div>
  );
}

export function ListContainer<T>(props: { items: T[]; notFound: string; children: React.ReactNode }) {
  if (props.items.length === 0)
    return <Status icon={'blank'} size={'l'} className="cancel-bold" title={props.notFound} />;
  return <>{props.children}</>;
}

export function ReadonlyFormItem({
  label,
  text,
  theme,
  copyable = true,
  href,
}: {
  /**
   * @description 账户/交易页面需要是透明背景色
   */
  theme?: 'transparent' | 'gray';
  text: string;
  copyable?: boolean;
  label?: React.ReactNode;
  href?: string;
}) {
  if (!text) {
    return null;
  }
  return (
    <Form.Item label={label} className={theme === 'transparent' ? 'bg-transparent' : ''}>
      <Form.Text>
        <span className={'tea-mr-1n'}>
          {href ? (
            <a className="text-blue" href={href} target="_blank" rel="noreferrer">
              {text}
            </a>
          ) : (
            text
          )}
        </span>
        {copyable && text && <Copy text={text} />}
      </Form.Text>
    </Form.Item>
  );
}

/**
 * @description 取消订阅
 */

export function CancelSubscribe({ chainId, contractName }: { chainId: string; contractName: string }) {
  const navigate = useNavigate();

  // 取消订阅
  const cancelSubscribeHandle = () => {
    contractStoreUtils
      .abortSubscribe(chainId, contractName)
      .then(() => {
        message.success({ content: '取消订阅成功' });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      })
      .catch((err) => {
        message.error({ content: `取消订阅失败:${err}` });
      });
  };

  return (
    <Button type="primary" className="contract-cancel-subscribe" onClick={cancelSubscribeHandle}>
      取消订阅
    </Button>
  );
}
/**
 * 确认安全码
 * @param props
 * @param ref
 */
export const VerifyPasswordModalContainer = (props, ref) => {
  const verifyPaaswordRef = useRef();
  const { control, reset, getValues } = useForm({
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    show: (p: { close?: () => void; confirm?: () => void }) => {
      // @ts-ignore
      verifyPaaswordRef.current.show({
        confirm: async () => {
          const realPass = await chainStorageUtils.getLogin();
          const inputPass = md5(getValues().password);
          if (inputPass !== realPass) {
            message.error({
              content: '安全码错误',
            });
            throw 'password error';
          }
          return p.confirm();
        },
        close: () => {
          reset({
            password: null,
          });
        },
      });
    },
  }));
  return (
    <ConfirmModal ref={verifyPaaswordRef} title={'确认安全码'} cancelBtnText="取消">
      <Form layout={'vertical'} className={'mt-2n signature-confirm-form'}>
        <Controller
          control={control}
          rules={{
            required: '请输入',
            validate: (password: string) => {
              if (!password?.length) {
                return '请输入安全码';
              }
            },
          }}
          name="password"
          render={({ field, fieldState }) => (
            <Form.Item label={<GlossaryGuide title={'安全码'} />} message={fieldState.error?.message}>
              <Input type={'password'} size={'full'} {...field} />
            </Form.Item>
          )}
        />
      </Form>
    </ConfirmModal>
  );
  return <></>;
};
export const VerifyPasswordModal = React.forwardRef(VerifyPasswordModalContainer);