/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useRef, useState } from 'react';
import { Button, Form, Input, message, Modal, ModalConfirm } from 'tea-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import chainStorageUtils, { contractStoreUtils } from '../utils/storage';
import md5 from 'md5';
import { ConfirmModal, ProductGuideLink } from '../utils/common';
import GlossaryGuide from '../utils/glossary-guide';
import { navByMessage, useChainStore } from './popup';
import { SendRequestParam } from '../event-page';

const { Password } = Input;

// function LoginLockPage(props: {
//   onClocked: () => void
//   onReset:()=> void
// }) {
function LoginLockPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tempOperationRes = location.state;
  const deleteConfirmRef = useRef<typeof ConfirmModal>();

  const resetStore = useChainStore((state) => state.reset);
  const resetClick = useCallback(() => {
    // @ts-ignore
    deleteConfirmRef.current.show({
      confirm: () => {
        Promise.all([chainStorageUtils.clearData(), contractStoreUtils.clearData()]).then(() => {
          // props.onReset();
          resetStore();
          navigate('/login');
        });
      },
    });
  }, []);
  const onClick = useCallback(async () => {
    const realPass = await chainStorageUtils.getLogin();
    if (md5(getValues().password) !== realPass) {
      message.error({
        content: '密码错误',
      });
      return;
    }
    chainStorageUtils.removeLoginLock();
    // props.onClocked();
    if (tempOperationRes) {
      return navByMessage(navigate, tempOperationRes as SendRequestParam);
    }
    navigate('/');
  }, []);

  const {
    control,
    formState: { isValid },
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  return (
    <div className={'login lock'}>
      <img className={'login-img'} src={'./img/hqsk.png'} alt={''} />
      <div className={'tip'}>欢迎使用环球链 - 环球数科官方插件</div>
      <Form layout={'vertical'} className={'pt-8n'}>
        <Controller
          control={control}
          rules={{
            required: '请输入',
            validate: (password: string) => {
              if (!password || !password.length) {
                return '请输入密码';
              }
            },
          }}
          name="password"
          render={({ field, fieldState }) => (
            <Form.Item label={<GlossaryGuide title={'登录密码'} />} message={fieldState.error?.message}>
              <Password rules={false} onPressEnter={onClick} size={'l'} {...field} />
            </Form.Item>
          )}
        />
      </Form>
      <div className={'flex-grow'} />
      <footer>
        <Button type={'primary'} className={'btn-lg'} onClick={onClick} disabled={!isValid}>
          解锁
        </Button>
        <div className="tea-mt-3n">
          忘记密码？
          <Button type="link" onClick={resetClick}>
            重置插件
          </Button>
        </div>
      </footer>
      <ConfirmModal title={'重置插件'} ref={deleteConfirmRef}>
        {'重置后，将复位到初始化状态，并清空已连接的区块链网络，以及链账户信息'}
      </ConfirmModal>
    </div>
  );
}

export default LoginLockPage;