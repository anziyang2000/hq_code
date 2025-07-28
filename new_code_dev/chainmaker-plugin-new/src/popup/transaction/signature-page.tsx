/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Input, Select, Icon } from 'tea-component';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { SignatureConfirmModal } from '@utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { SendRequestParam } from '@src/event-page';
import { createContract, invokeContract, preCheckForSignature } from '@utils/utils';
import { useChainStore } from '@popup/popup';
import GlossaryGuide from '@utils/glossary-guide';
import chainStorageUtils from '@utils/storage';
import { getBalanceGas, queryForecastGas } from '@services/gas';
import { Account } from '@utils/interface';
import formUtils from '@utils/form-utils';

const QUERY_STATUS = {
  NULL: 'null',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

function SignaturePage() {
  const location = useLocation();
  const [contractRequest, setContractRequest] = useState<SendRequestParam>();
  const navigate = useNavigate();
  const {
    control,
    setValue,
    formState: { isValid, isValidating, isSubmitted },
    resetField,
  } = useForm({
    mode: 'onBlur',
  });
  const selectedChainId: string = useWatch({ name: 'chainId', control });
  const selectedAccountId: string = useWatch({ name: 'accountId', control });
  const gasLimit: string = useWatch({ name: 'gasLimit', control });
  const { currentTab, selectedChain, currentAccount, chains, updateSelectData } = useChainStore();
  const [disableSelectChain, setDisableSelectChain] = useState(false);
  const [chainOptions, setChainOptions] = useState([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // const accounts = useAccounts(selectedChain?.chainId);
  const [loading, setLoading] = useState(false);
  const [queryGasStatus, setQueryGasStatus] = useState(QUERY_STATUS.NULL);
  const [forecastGas, setForecastGas] = useState(null); // 兼容系统合约不返回gasuse
  const [gasBalance, setGasBalance] = useState(0);

  const curChain = useMemo(() => chains.find((chain) => chain.chainId === selectedChainId), [selectedChainId]);
  const curAccount = useMemo(
    () => accounts.find((account) => account.address === selectedAccountId),
    [selectedAccountId, accounts],
  );
  const accountOptions = useMemo(
    () =>
      accounts.map((item) => ({
        value: item.address,
        text: item.name,
      })),
    [accounts],
  );

  const signatureConfirmRef = useRef();

  // 当区块链与账户已选择，且支持gas时，进行query
  useEffect(() => {
    (async function () {
      resetField('gasLimit');
      if (curAccount?.userPublicKeyFile && curChain?.enableGas) {
        setQueryGasStatus(QUERY_STATUS.LOADING);
        setGasBalance(0);
        setForecastGas(null);
        try {
          // 查余额
          const balance = await getBalanceGas({ chainId: curChain.chainId, account: curAccount });
          setGasBalance(balance);
          // TODO: 防止DOCKER_GO合约太大签名同步阻塞ui， 待优化
          if (contractRequest.body.runtimeType === 'DOCKER_GO') {
            await new Promise((res) => setTimeout(res, 300));
          }
          // 查预计消耗
          const { gasUsed = 0 } = await queryForecastGas(
            curChain.chainId,
            curAccount,
            contractRequest.body,
            contractRequest.operation === 'createUserContract' ? 'init' : 'invoke',
          );
          setForecastGas(gasUsed);
          if (gasUsed > balance) {
            // 余额不足，无法交易
            // message.warning({ content: '账号gas余额不足，无法进行交易' });
          } else if (gasUsed * 1.1 > balance) {
            // 余额不充足
            setValue('gasLimit', balance, { shouldValidate: true });
          } else {
            setValue('gasLimit', Math.ceil(gasUsed * 1.1), { shouldValidate: true });
          }
          setQueryGasStatus(QUERY_STATUS.SUCCESS);
        } catch (e) {
          setQueryGasStatus(QUERY_STATUS.ERROR);
        }
      }
    })();
  }, [curAccount]);

  const requestContract = useCallback(async () => {
    try {
      setLoading(true);
      if (!(await preCheckForSignature(curChain))) {
        return;
      }
      if (curChain.enableGas) {
        Object.assign(contractRequest.body, { limit: { gasLimit: Number(gasLimit) } });
      }
      // _GAS_LIMIT: userContract.limit?.gasLimit || 20000000,
      if (contractRequest.operation === 'createUserContract') {
        await createContract(curChain.chainId, curAccount, contractRequest.body, contractRequest.ticket);
      } else {
        await invokeContract(curChain.chainId, curAccount, contractRequest.body, contractRequest.ticket);
      }
      // 更新选中链，账户
      await updateSelectData({ chain: curChain, account: curAccount });
      // 检查加入订阅
      navigate('/tx-logs');
      chainStorageUtils.setLastTransTime();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [curAccount, gasLimit]);

  const onSubmit = useCallback(async () => {
    if (await chainStorageUtils.getLastTransTime()) {
      await requestContract();
    } else {
      // @ts-ignore
      signatureConfirmRef.current.show({
        confirm: requestContract,
      });
    }
  }, [requestContract]);

  useEffect(() => {
    if (!selectedChainId) return;
    const state = location.state as SendRequestParam;
    const defaultAddress = state?.accountAddress || currentAccount?.address;
    chainStorageUtils.getChainAccounts(selectedChainId).then((accounts) => {
      setAccounts(accounts);
      let curAddress = defaultAddress;
      if (!accounts.some((ac) => ac.address === defaultAddress)) {
        curAddress = accounts[0]?.address;
      }
      setValue('accountId', curAddress, { shouldValidate: true });
    });
  }, [selectedChainId]);

  const backToHome = useCallback(() => {
    navigate('/');
  }, []);

  useEffect(() => {
    const state = location.state as SendRequestParam;
    setContractRequest(state);
    setChainOptions(
      chains.map((chain) => ({
        value: chain.chainId,
        text: chain.chainName,
      })),
    );
    const validChainId = chains.some((chain) => chain.chainId === state?.chainId);
    const chainId = validChainId ? state?.chainId : selectedChain.chainId || chains[0].chainId;
    setValue('chainId', chainId, { shouldValidate: true });
    setDisableSelectChain(validChainId);
  }, []);

  // 启动gas的链， 预估消耗gas不小于余额， gas上限不小于预估消耗gas
  const disableGas =
    curChain?.enableGas && (forecastGas === null || forecastGas > gasBalance || +gasLimit < forecastGas);

  return (
    <div className="transaction-wrapper">
      <div className={'signature'}>
        <div className="page-title">请求发起交易</div>
        <div className="current-web-info">
          <img src={currentTab?.favIconUrl} />
          <div className="current-web-addr">{currentTab?.host}</div>
        </div>
        <Form layout={'vertical'}>
          <Form.Item label={<GlossaryGuide title={'待上链信息'} />}>
            <Input size={'full'} readOnly multiline value={JSON.stringify(contractRequest?.body)} />
          </Form.Item>
          <Controller
            control={control}
            rules={{
              required: '请输入',
            }}
            name="chainId"
            render={({ field }) => (
              <Form.Item label={<GlossaryGuide title={'选择签名账户'} />}>
                <Select
                  disabled={disableSelectChain}
                  size={'full'}
                  matchButtonWidth
                  appearance="button"
                  options={chainOptions}
                  placeholder="区块链网络名称"
                  {...field}
                />
              </Form.Item>
            )}
          />
          <Controller
            control={control}
            rules={{
              required: '请输入',
            }}
            name="accountId"
            render={({ field }) => (
              <Form.Item>
                <Select
                  size={'full'}
                  appearance="button"
                  matchButtonWidth
                  options={accountOptions}
                  placeholder="请选择账户"
                  {...field}
                />
              </Form.Item>
            )}
          />

          {curChain?.enableGas && (
            <Controller
              control={control}
              rules={{
                required: '请输入',
                min: forecastGas,
                max: gasBalance,
              }}
              name="gasLimit"
              render={({ field, fieldState }) => (
                <Form.Item
                  label={<GlossaryGuide title={'GAS消耗最大值限制'} />}
                  status={
                    queryGasStatus === QUERY_STATUS.ERROR
                      ? 'error'
                      : formUtils.getStatus({
                          fieldState,
                          isValidating,
                          isSubmitted,
                        })
                  }
                  message={
                    queryGasStatus === QUERY_STATUS.ERROR
                      ? '预估GAS消耗量失败，请检查交易信息是否有误'
                      : fieldState.error && 'GAS消耗最大值限制不能小于预计消耗，不能大于账户余额'
                  }
                  extra={
                    <div className="flex-space-between">
                      <p>账户余额: {gasBalance}</p>
                      <p className="flex">
                        <span>预计该交易GAS消耗: </span>
                        {queryGasStatus === QUERY_STATUS.LOADING ? (
                          <i className="ss-icon">
                            <Icon size="s" type="loading" />
                          </i>
                        ) : (
                          forecastGas || 0
                        )}
                      </p>
                    </div>
                  }
                >
                  <Input size={'full'} placeholder="GAS消耗最大值限制" {...field} />
                </Form.Item>
              )}
            />
          )}
        </Form>
        <div className={'flex-grow'} />
        <div className="signature-options">
          <div className="connect-concel connect-bt" onClick={backToHome}>
            取消
          </div>
          <Button
            type={'primary'}
            className="connect-sub connect-bt"
            disabled={!isValid || !Boolean(contractRequest) || disableGas}
            onClick={() => {
              onSubmit();
            }}
            loading={loading}
          >
            确定发起
          </Button>
        </div>
        <SignatureConfirmModal ref={signatureConfirmRef} />
      </div>
    </div>
  );
}

export default SignaturePage;
