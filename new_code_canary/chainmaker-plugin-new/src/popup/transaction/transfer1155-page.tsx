import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Input } from 'tea-component';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { DetailPage, SignatureConfirmModal } from '../../utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChainStore } from '../popup';
import { isETHAccountAddress } from '@src/utils/tools';
import { ethers } from 'ethers';
import chainStorageUtils from '@utils/storage';
import { file2Txt } from '../../../web-sdk/glue';
import ERC1155ABI from '../contract-abi/ERC1155.json';
import ERC404ABI from '../contract-abi/ERC404.json';

import { CONTRACT_TYPE, ERC1155_CONTRACT_ADDRESS } from '../../config/contract';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';


function Transfer1155Page() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 调试输出
  const { tokenId, contractType } = location.state || {};
  const { balance, contractAddress } = location.state.metadata || {};
  const { selectedChain, currentAccount } = useChainStore();
  console.log('3.1155转账页面---currentAccount:', currentAccount);
  
  const {
    control,
    setValue,
    formState: { isValid },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      toAccount: '',
      amount: '1', // 默认数量为1
    }
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
      // 获取 PEM 文件转私钥
      const signKeyFile = await chainStorageUtils.getUploadFile(currentAccount.userSignKeyFile);
      const privateKey = await file2Txt(signKeyFile);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      let contract;
      let gasLimit;

      // console.log('当前的合约类型contractType:', contractType);

      if (contractType === 'ERC404') {
        contract = new ethers.Contract(contractAddress, ERC404ABI, wallet);
        const estimatedGas = await contract.estimateGas.transfer(toAddress, amount);
        gasLimit = estimatedGas.toNumber();
      } else {
        contract = new ethers.Contract(ERC1155_CONTRACT_ADDRESS, ERC1155ABI, wallet);
  
        const estimatedGas = await contract.estimateGas.safeTransferFrom(
          currentAccount.address,
          toAddress,
          tokenId,
          amount,
          '0x'
        );
        gasLimit = estimatedGas.toNumber();
      }

      console.log('能到这里了!!!');
      
      navigate('/transferConfirm', {
        state: {
          from: currentAccount.address,
          to: toAddress,
          amount,
          tokenId,
          gasLimit,
          chainId: selectedChain.chainName,
          contractType,
          contractAddress
        },
      });
    } catch (err) {
      console.error('估算 gas 出错:', err);
    } finally {
      setLoading(false);
    }
  }, [toAddress, amount, currentAccount, selectedChain]);

  return (
    <DetailPage title="NFT转账" backUrl="/" backState={{ activeTab: 1 }}>
      <div className="signature">
        <Form layout="vertical">
          {/* 显示当前NFT信息 */}
          <Form.Item>
            <div>
              <p>Token ID: {tokenId}</p>
              <p>当前持有数量: {balance}</p>
            </div>
          </Form.Item>

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

          {/* 转账数量输入 */}
          <Controller
            control={control}
            name="amount"
            rules={{
              required: '请输入数量',
              validate: (val) => {
                const num = Number(val);
                if (num <= 0) return '数量必须大于 0';
                if (num > Number(balance)) return '数量超过当前持有量';
                if (!Number.isInteger(num)) return '数量必须为整数';
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <Form.Item
                label="转账数量"
                status={fieldState.error ? 'error' : undefined}
                message={fieldState.error?.message}
                extra={`当前持有数量：${balance}`}
              >
                <Input
                  {...field}
                  placeholder="请输入转账数量"
                  size="full"
                  className="transfer-input"
                />
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
            确认转账
          </Button>
        </div>
        <SignatureConfirmModal ref={signatureConfirmRef} />
      </div>
    </DetailPage>
  );
}

export default Transfer1155Page;
