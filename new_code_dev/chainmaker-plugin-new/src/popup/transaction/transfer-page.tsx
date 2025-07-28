import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Input } from 'tea-component';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { DetailPage, SignatureConfirmModal } from '../../utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChainStore } from '../popup';
import { isETHAccountAddress } from '@src/utils/tools';
import { ethers } from 'ethers';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { CONTRACT_TYPE } from '@src/config/contract';
import './transfer-page.less';

function TransferPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ethBalance } = location.state || {};

  const { selectedChain, currentAccount } = useChainStore();

  const {
    control,
    setValue,
    formState: { isValid },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const toAccount: string = useWatch({ name: 'toAccount', control });
  const amount: string = useWatch({ name: 'amount', control });

  const [toAddress, setToAddress] = useState('');
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const signatureConfirmRef = useRef();

  useEffect(() => {
    setToAddress('');
    setIsInvalidAddress(false);
  }, []);

  const validateToAddress = useCallback((value: string) => {
    if (!value) return '请输入接收方地址';
    if (!isETHAccountAddress(value)) {
      setIsInvalidAddress(true);
      return '地址格式不正确';
    }
    if (value === currentAccount.address) {
      setIsInvalidAddress(true);
      return '不可以转账给自己';
    }
    setToAddress(value);
    setIsInvalidAddress(false);
    return true;
  }, [currentAccount]);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const rpcUrl = selectedChain?.chainName === '数科链主网' ? DEFAULT_MAINNET_RPC : selectedChain?.nodeIp;
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const estimatedGas = await provider.estimateGas({
        from: currentAccount.address,
        to: toAddress,
        value: ethers.utils.parseEther(amount),
      });

      navigate('/transferConfirm', {
        state: {
          type: CONTRACT_TYPE.GAS,
          from: currentAccount.address,
          to: toAddress,
          amount,
          gasLimit: estimatedGas.toNumber(),
          chainId: selectedChain.chainName,
        },
      });
    } catch (err) {
      console.error('估算 gas 出错:', err);
    } finally {
      setLoading(false);
    }
  }, [toAddress, amount, currentAccount, selectedChain]);

  return (
    <DetailPage title="转账" backUrl="/">
      <div className="signature">
        <Form layout="vertical">
          {/* 接收方地址输入 */}
          <Controller
            control={control}
            name="toAccount"
            rules={{ validate: validateToAddress }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="接收方地址"
                status={isInvalidAddress ? 'error' : undefined}
                message={fieldState.error?.message}
              >
                <Input {...field} placeholder="请输入接收方地址" size="full" />
              </Form.Item>
            )}
          />

          {/* 转账金额输入 + MAX 按钮 + ETH 单位 */}
          <Controller
            control={control}
            name="amount"
            rules={{
              required: '请输入金额',
              validate: (val) => {
                if (Number(val) <= 0) return '金额必须大于 0';
                if (Number(val) > ethBalance) return '金额超过当前余额';
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="转账金额"
                status={fieldState.error ? 'error' : undefined}
                message={fieldState.error?.message}
                extra={`当前余额：${ethBalance} ETH`}
              >
                <div className="position-relative">
                  <Input
                    {...field}
                    placeholder="请输入转账金额"
                    size="full"
                    className="transfer-input"
                  />
                  <div className="flex-center transfer-input__addon">
                    <Button
                      type="link"
                      onClick={() => {
                        setValue('amount', ethBalance, { shouldValidate: true });
                      }}
                    >
                      MAX
                    </Button>
                    <span className="cross-line" />
                    <span>ETH</span>
                  </div>
                </div>
              </Form.Item>
            )}
          />
        </Form>

        <div className="flex-grow" />
        <div>
          <Button
            type="primary"
            className="btn-lg"
            disabled={!isValid || isInvalidAddress}
            onClick={handleSubmit}
            loading={loading}
          >
            确认
          </Button>
        </div>
        <SignatureConfirmModal ref={signatureConfirmRef} />
      </div>
    </DetailPage>
  );
}

export default TransferPage;
