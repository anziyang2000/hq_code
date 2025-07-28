import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'tea-component';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useChainStore } from '../../../popup/popup';
import { DetailPage } from '../../../utils/common';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { addImportedERC20Token, getImportedERC20Tokens } from '@utils/persist';
import ERC20ABI from '../../contract-abi/ERC20.json';
import { ERC20_CONTRACT_ADDRESS } from '@src/config/contract';
import './add.less';

function AddERC20() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedChain } = useChainStore();

  const routeState = location.state as { currentAccount?: { address: string } } | undefined;
  const currentAccount = routeState?.currentAccount?.address;

  const { control, handleSubmit, formState: { errors }, setValue, watch, clearErrors } = useForm<{
    contractAddress: string;
    symbol: string;
    decimals: string;
  }>();

  const [isFetching, setIsFetching] = useState(false);
  const [showTokenFields, setShowTokenFields] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const contractAddress = watch('contractAddress');

  // 检测合约地址变动，进行自动拉取 symbol 和 decimals
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!contractAddress || !ethers.utils.isAddress(contractAddress) || !selectedChain?.nodeIp || !currentAccount) {
        setShowTokenFields(false);
        setIsAutoFilled(false);
        return;
      }

      const existingContracts = getImportedERC20Tokens();
      const DEFAULT_ERC20_CONTRACT_ADDRESS = ERC20_CONTRACT_ADDRESS.toLowerCase();

      const alreadyExists = existingContracts.some(
        token => token.address.toLowerCase() === contractAddress.toLowerCase()
      ) || contractAddress.toLowerCase() === DEFAULT_ERC20_CONTRACT_ADDRESS;

      if (alreadyExists) {
        message.warning({ content: '该Token已导入，无需重复添加' });
        setShowTokenFields(false);
        return;
      }

      setIsFetching(true);
      try {
        const rpcUrl = selectedChain.chainName === '数科链主网' ? DEFAULT_MAINNET_RPC : selectedChain.nodeIp;
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

        const code = await provider.getCode(contractAddress);
        if (code === '0x' || code === '0x0') {
          message.error({ content: '该地址在当前链上不存在合约' });
          setShowTokenFields(false);
          return;
        }

        const contract = new ethers.Contract(contractAddress, ERC20ABI, provider);

        let fetchedSymbol = '';
        let fetchedDecimals: string | null = null;

        try {
          fetchedSymbol = await contract.symbol();
        } catch {
          fetchedSymbol = '';
        }

        try {
          const dec = await contract.decimals();
          fetchedDecimals = dec?.toString() ?? null;
        } catch {
          fetchedDecimals = null;
        }

        if (fetchedSymbol && fetchedDecimals !== null) {
          setValue('symbol', fetchedSymbol);
          setValue('decimals', fetchedDecimals);
          setIsAutoFilled(true);
        } else {
          setValue('symbol', '');
          setValue('decimals', '');
          setIsAutoFilled(false);
        }

        setShowTokenFields(true);

      } catch (error) {
        console.error('获取 ERC20 信息失败:', error);
        setShowTokenFields(false);
        message.error({ content: '检测 ERC20 合约失败' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchTokenInfo();
  }, [contractAddress, selectedChain?.nodeIp, currentAccount, setValue]);

  const onCancel = () => {
    navigate('/', { state: { activeTab: 0 } });
  };

  const onConfirm = async (data: { contractAddress: string; symbol: string; decimals: string }) => {
    const decimalsNum = Number(data.decimals);
    if (
      !data.contractAddress ||
      !ethers.utils.isAddress(data.contractAddress) ||
      !data.symbol ||
      data.decimals === '' ||
      !/^\d+$/.test(data.decimals) ||
      decimalsNum < 0
    ) {
      message.error({ content: '请填写完整且有效的信息后再添加' });
      return;
    }
  
    try {
      const rpcUrl = selectedChain?.chainName === '数科链主网' ? DEFAULT_MAINNET_RPC : selectedChain?.nodeIp;
      if (!rpcUrl || !currentAccount) {
        message.error({ content: '无法获取链信息或当前账户信息' });
        return;
      }
  
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(data.contractAddress, ERC20ABI, provider);
  
      // 校验是否存在 balanceOf 方法
      try {
        const balance = await contract.balanceOf(currentAccount);
        // console.log(`ERC20 balanceOf 返回: ${balance.toString()}`);
      } catch (error) {
        console.error('balanceOf 校验失败:', error);
        message.error({ content: '该合约不符合 ERC20 标准，无法添加' });
        return;
      }
    } catch (error) {
      console.error('验证 ERC20 过程中出错:', error);
      message.error({ content: '验证 ERC20 合约时发生错误' });
      return;
    }
  
    // 校验通过后再添加
    addImportedERC20Token({
      address: data.contractAddress,
      symbol: data.symbol,
      decimals: decimalsNum,
    });
    message.success({ content: '代币添加成功' });
    navigate('/', { state: { activeTab: 0 } });
  };

  return (
    <DetailPage title="添加代币" backUrl="/" backState={{ activeTab: 0 }}>
      <Form layout="vertical" className="mt-8n">
        <Form.Item
          label="合约地址"
          status={errors.contractAddress ? 'error' : undefined}
          message={errors.contractAddress?.message}
        >
          <Controller
            name="contractAddress"
            control={control}
            rules={{
              required: '请输入合约地址',
              validate: value => ethers.utils.isAddress(value) || '请输入有效的合约地址',
            }}
            render={({ field }) => (
              <Input {...field} size="full" placeholder="请输入ERC20合约地址" />
            )}
          />
        </Form.Item>

        {showTokenFields && (
          <>
            <Form.Item
              label="代币符号"
              status={errors.symbol ? 'error' : undefined}
              message={errors.symbol?.message}
            >
              <Controller
                name="symbol"
                control={control}
                rules={{ required: '请输入代币符号' }}
                render={({ field }) => (
                  <Input {...field} size="full" placeholder="请输入代币符号" disabled={isAutoFilled} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="代币小数"
              status={errors.decimals ? 'error' : undefined}
              message={errors.decimals?.message}
            >
              <Controller
                name="decimals"
                control={control}
                rules={{
                  required: '请输入代币小数',
                  validate: value => /^\d+$/.test(value) || '代币小数必须是0或正整数',
                }}
                render={({ field }) => (
                  <Input {...field} size="full" placeholder="请输入代币小数" disabled={isAutoFilled} />
                )}
              />
            </Form.Item>
          </>
        )}

        <footer className="mt-12n btn-group">
          <Button type="weak" onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit(onConfirm)}
            disabled={isFetching || !showTokenFields}
          >
            {isFetching ? '检测中...' : '确认添加'}
          </Button>
        </footer>
      </Form>
    </DetailPage>
  );
}

export default AddERC20;
