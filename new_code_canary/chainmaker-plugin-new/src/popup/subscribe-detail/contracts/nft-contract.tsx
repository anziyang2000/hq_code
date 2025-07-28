import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage, CancelSubscribe } from '../../../utils/common';
import { Status, Text } from 'tea-component';
import MoreOutlined from '@ant-design/icons/MoreOutlined';

import { ContractNFTItem, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { NFTImage } from '../../../components/nft-image';
import { ethers } from 'ethers';
// import ERC1155ABI from '../../contract-abi/ERC1155.json';
import ERC404ABI from '../../contract-abi/ERC404.json';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { ERC1155_CONTRACT_ADDRESS } from '@src/config/contract';
import { ERC404_CONTRACT_ADDRESS } from '@src/config/contract';

import { getImportedNFTContracts  } from '@utils/persist';

const Row = ({
  item,
  contractInfo,
  browserLink,
}: {
  item: ContractNFTItem;
  contractInfo: SubscribeContractItem;
  browserLink: string;
}) => {
  const navigate = useNavigate();
  const is404Ticket = item.seriesName === '404系列' || item.tokenId === '';
  return (
    <div
      className="tea-mb-5n nft-item-wrap"
      // onClick={() =>
      //   navigate('/subscribe-contract/transaction-detail', {
      //     state: {
      //       metadata: item,
      //       contractInfo,
      //       browserLink,
      //     },
      //   })
      // }
      onClick={() => {
        const tokenDetail = {
          contractType: !is404Ticket ? contractInfo.contractType : 'ERC404',
          currentAccount: contractInfo.currentAccount.address,
          tokenId: item.tokenId,
          balance: item.balance,
          contractAddress: is404Ticket ? ERC404_CONTRACT_ADDRESS : ERC1155_CONTRACT_ADDRESS,
        };
        // console.log('NFT页面---tokenDetail:', tokenDetail);
      
        navigate('/subscribe-contract/transaction-detail', {
          state: {
            metadata: item,
            contractInfo: tokenDetail,
            browserLink,
          },
        });
      }}
      
    >
      <div className="flex meta-layout">
        <NFTImage url={item.image} />
      </div>
      <div className="flex meta-layout tea-mt-2n">
        <Text theme="strong">
          <b>{item.name || item.seriesName}</b>
        </Text>
      </div>
    </div>
  );
};

type Props = {
  contractInfo?: SubscribeContractItem;
};

export function CMNFAContractPage(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const routeState = location.state as { contractInfo?: SubscribeContractItem } | undefined;
  const contractInfo = props.contractInfo || routeState?.contractInfo;

  const [NFTList, setNFTList] = useState<ContractNFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedChain } = useChainStore();

  const chainId = selectedChain?.chainId;
  const browserLink = selectedChain?.browserLink;
  console.log('1. nft选项页面');
  // 定义特殊tokenId的映射关系
  const SPECIAL_TOKENS = {
    1: {
      name: "九寨沟门票",
      seriesName: "四川系列",
      image: 'https://cdn.pixabay.com/photo/2016/02/13/12/26/aurora-1197753_1280.jpg'
    },
    2: {
      name: "长白山门票",
      seriesName: "东北系列",
      image: 'https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg'
    },
    // 可以继续添加其他特殊tokenId
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contractInfo?.currentAccount || !selectedChain?.nodeIp) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const rpcUrl =
          selectedChain?.chainName === '数科链主网'
            ? DEFAULT_MAINNET_RPC
            : selectedChain?.nodeIp;

        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const fetchedNFTs: ContractNFTItem[] = [];
        const account = contractInfo.currentAccount.address;

        try {
          const contract404 = new ethers.Contract(ERC404_CONTRACT_ADDRESS, ERC404ABI, provider);
          const balance404 = await contract404.balanceOf(account);
          const formattedBalance = Math.floor(Number(ethers.utils.formatEther(balance404)));
          // 固定 404
          if (formattedBalance > 0) {
            fetchedNFTs.push({
              tokenId: '',
              name: SPECIAL_TOKENS[2].name,
              seriesName: SPECIAL_TOKENS[2].seriesName,
              image: SPECIAL_TOKENS[2].image || '',
              balance: formattedBalance.toString(),
              contractAddress: ERC404_CONTRACT_ADDRESS,
            });
          }
        } catch (err) {
          console.error(`查询默认 ERC20(${ERC404_CONTRACT_ADDRESS}) 失败，可能该链未部署：`, err);
          // 不执行 push
        }

        // === 查询已持久化的所有动态导入 NFT 合约地址 ===
        const importedContracts = getImportedNFTContracts();
        // console.log('当前存储的所有NFT:', importedContracts);
        for (const addr of importedContracts) {
          try {
              const dynamicContract = new ethers.Contract(addr, ERC404ABI, provider);
              const dynamicBalanceRaw = await dynamicContract.balanceOf(account);
              const dynamicBalance = Math.floor(Number(ethers.utils.formatEther(dynamicBalanceRaw)));
      
              // === 移除大于0判断，余额=0也展示 ===
              const serialNumber = fetchedNFTs.length + 1;
              fetchedNFTs.push({
                  tokenId: '',
                  name: `NFT #${serialNumber}`,
                  seriesName: '用户导入',
                  image: 'https://cdn.pixabay.com/photo/2016/02/13/12/26/aurora-1197753_1280.jpg',
                  balance: dynamicBalance.toString(),
                  contractAddress: addr,
              });
          } catch (err) {
              console.error(`查询导入合约 ${addr} 出错:`, err);
          }
        }

        setNFTList(fetchedNFTs);
      } catch (error) {
        console.error('查询 NFT 失败：', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
}, [contractInfo?.currentAccount, selectedChain?.nodeIp]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };
 
  const handleImportNFT = () => {
    setShowDropdown(false);
    navigate('/subscribe-contract/add-nft', {
      state: {
        currentAccount: contractInfo?.currentAccount,
      },
    });
  };
  
  if (!contractInfo) {
    return (
      <DetailPage title="合约详情" backUrl="/">
        <Status
          icon="network"
          size="l"
          title="无法获取合约信息"
          description="请从合约列表页面重新进入。"
        />
      </DetailPage>
    );
  }

  const { contractName } = contractInfo;

  return (
    <>
    <div
      className="nft-page-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 5,
        position: 'relative',
      }}
    >
      <h2></h2>
      <div style={{ position: 'relative' }}>
        <MoreOutlined style={{ fontSize: 20, cursor: 'pointer' }} onClick={toggleDropdown} />
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 28,
              backgroundColor: '#fff',
              border: '1px solid #eee',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              padding: '4px 0',
              minWidth: 120,
            }}
          >
            <div
              onClick={handleImportNFT}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              + 导入NFT
            </div>
          </div>
        )}
      </div>
    </div>

    {!NFTList || NFTList.length === 0 ? (
      <Status
        icon={loading ? 'loading' : 'blank'}
        size="l"
        className="cancel-bold"
        title={loading ? '加载中...' : '暂无相关记录'}
      />
    ) : (
      <div className="nft-list">
        {NFTList.map((item, index) => (
          <Row key={index} item={item} contractInfo={contractInfo} browserLink={browserLink} />
        ))}
      </div>
    )}
  </>
  );
}

