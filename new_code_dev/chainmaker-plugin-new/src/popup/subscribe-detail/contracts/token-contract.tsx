import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailPage, CancelSubscribe } from '../../../utils/common';
import { Status, Text } from 'tea-component';
import MoreOutlined from '@ant-design/icons/MoreOutlined';

import { ContractNFTItem, SubscribeContractItem } from '../../../utils/storage';
import { useChainStore } from '../../popup';
import { NFTImage } from '../../../components/nft-image';
import { ethers } from 'ethers';
import ERC20ABI from '../../contract-abi/ERC20.json';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { ERC20_CONTRACT_ADDRESS } from '@src/config/contract';
import { getImportedERC20Tokens } from '@utils/persist';

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
  return (
    <div
      className="tea-mb-5n nft-item-wrap"
      onClick={() => {
        const tokenDetail = {
          contractType: contractInfo.contractType,
          currentAccount: contractInfo.currentAccount.address,
          balance: item.balance,
          contractAddress: item.contractAddress,
        };
      
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

export function TokenContractPage(props: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { contractInfo?: SubscribeContractItem } | undefined;
  const contractInfo = props.contractInfo || routeState?.contractInfo;

  const [showDropdown, setShowDropdown] = useState(false);
  const [NFTList, setNFTList] = useState<ContractNFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedChain } = useChainStore();

  const browserLink = selectedChain?.browserLink;

  console.log('1. erc20选项页面');
  
  useEffect(() => {
    const fetchTokens = async () => {
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
        const account = contractInfo.currentAccount.address;
        const fetched: ContractNFTItem[] = [];
  
        // === 查询默认 ERC20 Token
        try {
          const defaultContract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, ERC20ABI, provider);
          const defaultBalance = await defaultContract.balanceOf(account);
    
          fetched.push({
            name: '人民币',
            image: "http://img1.xixik.com/cimg/148/xixik_f4c45a93e0f974c4.jpeg",
            balance: defaultBalance.toString(),
            contractAddress: ERC20_CONTRACT_ADDRESS,
            tokenId: ''
          });
        } catch (err) {
          console.error(`查询默认 ERC20(${ERC20_CONTRACT_ADDRESS}) 失败，可能该链未部署：`, err);
          // 不执行 push
        }
        
        // === 查询用户已导入的 ERC20 Token
        const importedTokens = getImportedERC20Tokens(); // [{ address, symbol, decimals }]
        // console.log('已导入 ERC20 列表:', importedTokens);
  
        for (let i = 0; i < importedTokens.length; i++) {
          const token = importedTokens[i];
        
          if (token.address.toLowerCase() === ERC20_CONTRACT_ADDRESS.toLowerCase()) {
            // console.log('跳过默认 ERC20');
            continue;
          }
        
          try {
            const dynamicContract = new ethers.Contract(token.address, ERC20ABI, provider);
            const dynamicBalanceRaw = await dynamicContract.balanceOf(account);
        
            // 排序号名称 fallback
            const tokenName = `代币 #${i + 1} `;

            fetched.push({
              name: tokenName,
              // image: "https://ledger-wp-website-s3-prd.ledger.com/uploads/2021/11/cover-11.png",
              image: "http://img1.xixik.com/cimg/148/xixik_f4c45a93e0f974c4.jpeg",
              // image: "https://p16-official-plugin-sign-va.ibyteimg.com/tos-maliva-i-rjxq75k7vb-us/948557cabac34c08b4c8f1f01443df01~tplv-rjxq75k7vb-image.png?lk3s=8c875d0b&x-expires=1782868879&x-signature=ZlGrSs8ymwerX4SCqR7T6W42Pqk%3D",
              balance: dynamicBalanceRaw.toString(),
              contractAddress: token.address,
              tokenId: ''
            });

          } catch (err) {
            console.error(`查询合约 ${token.address} 出错:`, err);
          }
        }
        
        // console.log('最终 ERC20 展示列表:', fetched);
        setNFTList(fetched);
      } catch (error) {
        console.error('查询 ERC20 失败：', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTokens();
  }, [contractInfo?.currentAccount, selectedChain?.nodeIp]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };
 
  const handleImportERc20 = () => {
    setShowDropdown(false);
    navigate('/subscribe-contract/add-erc20', {
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
                onClick={handleImportERc20}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                + 添加代币
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
      {/* <CancelSubscribe chainId={chainId} contractName={contractName} /> */}
    </>
  );
}
