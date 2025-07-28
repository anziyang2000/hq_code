import React from 'react';
import { Button, Form, Input, message } from 'tea-component';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useChainStore } from '../../../popup/popup';
import { DetailPage } from '../../../utils/common';
import ERC404ABI from '../../contract-abi/ERC404.json';
import { ERC404_CONTRACT_ADDRESS } from '@src/config/contract';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { addImportedNFTContract, getImportedNFTContracts } from '@utils/persist';
import './add.less';

function AddNft() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedChain } = useChainStore();

  // 接收当前账户地址
  const routeState = location.state as { currentAccount?: { address: string } } | undefined;
  const currentAccount = routeState?.currentAccount?.address;

  const { control, handleSubmit, formState: { errors } } = useForm<{ contractAddress: string }>();

  const onCancel = () => {
    navigate('/', { state: { activeTab: 2 } });
  };

  const onConfirm = async (data: { contractAddress: string }) => {
    const { contractAddress } = data;

    if (!ethers.utils.isAddress(contractAddress)) {
        message.error({ content: '请输入有效的合约地址' });
        return;
    }
    if (!selectedChain?.nodeIp) {
        message.error({ content: '无法获取当前链信息' });
        return;
    }
    if (!currentAccount) {
        message.error({ content: '无法获取当前账户信息' });
        return;
    }

    // 检查是否已存在
    const existingContracts = getImportedNFTContracts(); // 取本地已导入地址数组
    const DEFAULT_CONTRACT_ADDRESS = ERC404_CONTRACT_ADDRESS.toLowerCase();

    const alreadyExists = existingContracts.some(
        addr => addr.toLowerCase() === contractAddress.toLowerCase()
    ) || contractAddress.toLowerCase() === DEFAULT_CONTRACT_ADDRESS;

    if (alreadyExists) {
        message.warning({ content: '该NFT已导入，无需重复添加' });
        return;
    }

    try {
        // console.log('Selected RPC:', selectedChain.nodeIp);
        // console.log('Current Account:', currentAccount);

        const rpcUrl = selectedChain.chainName === '数科链主网' ? DEFAULT_MAINNET_RPC : selectedChain.nodeIp;
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

        const code = await provider.getCode(contractAddress);
        if (code === '0x' || code === '0x0') {
            message.error({ content: '该地址在当前链上不存在合约' });
            return;
        }

        let isNFT = false;
        let isERC404 = false;

        // 1、检查是否支持 ERC721 或 ERC1155
        try {
            const iface = new ethers.utils.Interface(['function supportsInterface(bytes4) returns (bool)']);
            const data721 = iface.encodeFunctionData('supportsInterface', ['0x80ac58cd']); // ERC721
            const data1155 = iface.encodeFunctionData('supportsInterface', ['0xd9b67a26']); // ERC1155

            const res721 = await provider.call({ to: contractAddress, data: data721 });
            const res1155 = await provider.call({ to: contractAddress, data: data1155 });

            const [supports721] = iface.decodeFunctionResult('supportsInterface', res721);
            const [supports1155] = iface.decodeFunctionResult('supportsInterface', res1155);

            // console.log(`ERC721 supported: ${supports721}, ERC1155 supported: ${supports1155}`);

            if (supports721 || supports1155) {
                isNFT = true;
            }
        } catch (e) {
            console.log('supportsInterface 检测失败:', e);
        }

        // 2、检查 ERC404
        if (!isNFT) {
            try {
                const nftContract = new ethers.Contract(contractAddress, ERC404ABI, provider);
                const balance721 = await nftContract.erc721BalanceOf(currentAccount);
                console.log('ERC404 erc721BalanceOf 返回:', balance721.toString());
                const balance20 = await nftContract.erc20BalanceOf(currentAccount);
                console.log('ERC404 erc20BalanceOf 返回:', balance20.toString());
                isERC404 = true;
            } catch (e) {
                console.log('ERC404 检测失败:', e);
            }
        }

        if (!isNFT && !isERC404) {
            message.error({ content: '该合约不是受支持的 NFT 类型（ERC721 / ERC1155 / ERC404）' });
            return;
        }

        // 确认导入
        addImportedNFTContract(contractAddress);
        message.success({ content: 'NFT 合约导入成功' });

        // 导入后再跳转回首页激活 NFT 页并传递合约地址
        navigate('/', {
            state: {
                activeTab: 1,
                newContractAddress: contractAddress,
            },
        });

    } catch (err) {
        console.error('验证合约地址失败:', err);
        message.error({ content: '验证合约地址失败' });
    }
};

  return (
    <DetailPage title="导入NFT" backUrl="/" backState={{ activeTab: 1 }}>
      <Form layout="vertical" className="mt-8n">
        <Form.Item
          label="合约地址"
          status={errors.contractAddress ? 'error' : undefined}
          message={errors.contractAddress?.message}
        >
          <Controller
            name="contractAddress"
            control={control}
            rules={{ required: '请输入合约地址' }}
            render={({ field }) => (
              <Input {...field} size="full" placeholder="请输入合约地址" />
            )}
          />
        </Form.Item>
        <footer className="mt-12n btn-group">
          <Button type="weak" onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" onClick={handleSubmit(onConfirm)}>确认添加</Button>
        </footer>
      </Form>
    </DetailPage>
  );
}

export default AddNft;
