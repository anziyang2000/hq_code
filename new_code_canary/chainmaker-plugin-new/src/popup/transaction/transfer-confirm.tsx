import React, { useRef, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message } from 'tea-component';
import { DetailPage, SignatureConfirmModal } from '@utils/common';
import { extractBaseNodeIp } from '@utils/extractBase';
import { ethers } from 'ethers';
import { useChainStore } from '../popup';
import { file2Txt } from '../../../web-sdk/glue';
import chainStorageUtils from '@utils/storage';
import { TxLog } from '../../utils/interface';
import './transfer-confirm.less';
import ERC1155ABI from '../contract-abi/ERC1155.json';
import ERC404ABI from '../contract-abi/ERC404.json';
import ERC20ABI from '../contract-abi/ERC20.json';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { CONTRACT_TYPE, ERC1155_CONTRACT_ADDRESS } from '@src/config/contract';
import Web3 from 'web3';

import eventBus from '@utils/eventBus';
function TransferConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const transferInfo = location.state;

  const { currentAccount, selectedChain } = useChainStore();
  const [loading, setLoading] = useState(false);

  const signatureConfirmRef = useRef<{ show: (options: { confirm: () => void }) => void }>(null);

  console.log('4. 交易确认页面---transferInfo:', transferInfo);

  if (!transferInfo) {
    return (
      <div className="transfer-confirm-wrapper">
        <div className="content">
          <p>缺少转账信息</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  const { 
    type, 
    from, 
    to, 
    amount, 
    chainId, 
    gasLimit, 
    tokenId,
    contractType,
    contractAddress
  } = transferInfo;

  const handleSubmit = useCallback(() => {
    signatureConfirmRef.current?.show({
      confirm: async () => {
        try {
          setLoading(true);

          // 1. 获取 PEM 文件转私钥
          const signKeyFile = await chainStorageUtils.getUploadFile(currentAccount.userSignKeyFile);
          // console.log('signKeyFile:', signKeyFile, 'type:', typeof signKeyFile);
          const privateKey = await file2Txt(signKeyFile);
  
          const rpcUrl =
            selectedChain?.chainName === '数科链主网'
              ? DEFAULT_MAINNET_RPC
              : selectedChain?.nodeIp;
  
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(privateKey, provider);
          const blockNumber = await provider.getBlockNumber();
          const weiAmount = ethers.utils.parseEther(amount);
  
          // 2. 发起交易
          const tx = await wallet.sendTransaction({
            to,
            value: weiAmount,
            gasLimit,
          });
  
          // 3. 构造 pending 日志并跳转
          const pendingLog: TxLog = {
            txId: tx.hash,
            accountName: currentAccount.name,
            accountId: currentAccount.address,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'pending',
            code: 0,
            chainId: selectedChain?.chainId || '',
            contractType: type,
            contractName: '',
            fromAddress: from,
            toAddress: to,
            amount,
            gasLimit,
            chainName: selectedChain?.chainName || '',
            blockNumber,
            nonce: tx.nonce,
            nodeIp: extractBaseNodeIp(selectedChain?.nodeIp), // ✅ 存储去端口后的 nodeIp
          };

          // 存入 localStorage
          try {
            const existing = JSON.parse(localStorage.getItem('new_pending_tx') || '[]');
            const already = existing.find((l: TxLog) => l.txId === pendingLog.txId);
            if (!already) {
              existing.unshift(pendingLog);
              localStorage.setItem('new_pending_tx', JSON.stringify(existing));
            }
          } catch (e) {
            console.error('保存 new_pending_tx 失败', e);
          }
  
          navigate('/', {
            state: {
              activeTab: 2,
              // newTxLog: pendingLog,
              autoJumpToDetail: true,
              shouldRefreshBalance: true,
            },
          });
  
          message.success({ content: '交易已发送！' });
  
          // 4. 等待确认后广播事件和存储本地状态（不阻塞跳转）
          tx.wait()
            .then((receipt) => {
              // console.log('交易确认成功:', receipt);
  
              const newStatus: 'done' | 'failed' = receipt.status === 1 ? 'done' : 'failed';
  
              // 实时通知
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: newStatus,
                code: newStatus === 'done' ? 0 : 1,
              });
  
              // ✅ 存储本地状态（用于回到历史页面后恢复）
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: newStatus,
                  code: receipt.status === 1 ? 0 : 1,
                })
              );
  
              message.success({ content: '交易确认成功！' });
              // 通知首页刷新余额（新增）
              eventBus.emit('refresh_balance');
            })
            .catch((error) => {
              console.error('交易确认失败:', error);
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: 'failed',
                code: 1,
              });
  
              localStorage.setItem(`tx_result_${tx.hash}`, JSON.stringify({ status: 'failed' }));
  
              message.error({ content: '交易失败' });
            });
        } catch (err) {
          console.error('转账失败', err);
          message.error({ content: '转账失败' });
        } finally {
          setLoading(false);
        }
      },
    });
  }, [to, amount, gasLimit, selectedChain, currentAccount, navigate]);

  const handleSubmitERC20 = useCallback(() => {
    signatureConfirmRef.current?.show({
      confirm: async () => {
        try {
          setLoading(true);
  
          // 1. 获取 PEM 文件转私钥
          const signKeyFile = await chainStorageUtils.getUploadFile(currentAccount.userSignKeyFile);
          const privateKey = await file2Txt(signKeyFile);
  
          const rpcUrl =
            selectedChain?.chainName === '数科链主网'
              ? DEFAULT_MAINNET_RPC
              : selectedChain?.nodeIp;
  
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(privateKey, provider);
          const blockNumber = await provider.getBlockNumber();
  
          const contract = new ethers.Contract(contractAddress, ERC20ABI, wallet);
  
          // 2. 发起ERC20转账
          const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
  
          // 3. 构造 pending 日志并跳转
          const pendingLog: TxLog = {
            txId: tx.hash,
            accountName: currentAccount.name,
            accountId: currentAccount.address,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'pending',
            code: 0,
            chainId: selectedChain?.chainId || '',
            contractType: 'ERC20',
            contractName: contractAddress,
            fromAddress: currentAccount.address,
            toAddress: to,
            amount,
            gasLimit: tx.gasLimit.toString(),
            chainName: selectedChain?.chainName || '',
            blockNumber,
            nonce: tx.nonce,
            nodeIp: extractBaseNodeIp(selectedChain?.nodeIp), // ✅ 存储去端口后的 nodeIp
          };

          // 存入 localStorage
          try {
            const existing = JSON.parse(localStorage.getItem('new_pending_tx') || '[]');
            const already = existing.find((l: TxLog) => l.txId === pendingLog.txId);
            if (!already) {
              existing.unshift(pendingLog);
              localStorage.setItem('new_pending_tx', JSON.stringify(existing));
            }
          } catch (e) {
            console.error('保存 new_pending_tx 失败', e);
          }
  
          navigate('/', {
            state: {
              activeTab: 2,
              // newTxLog: pendingLog,
              autoJumpToDetail: true,
              shouldRefreshBalance: true,
            },
          });
  
          message.success({ content: 'ERC20 转账已发送！' });
  
          // 4. 等待确认后广播事件和本地存储
          tx.wait()
            .then((receipt) => {
              // console.log('ERC20 交易确认成功:', receipt);
  
              const newStatus: 'done' | 'failed' = receipt.status === 1 ? 'done' : 'failed';
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: newStatus,
                code: newStatus === 'done' ? 0 : 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: newStatus,
                  code: newStatus === 'done' ? 0 : 1,
                  tokenId, // 如果有 tokenId
                })
              );
  
              message.success({ content: 'ERC20 交易确认成功！' });
            })
            .catch((error) => {
              console.error('ERC20 交易确认失败:', error);
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: 'failed',
                code: 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: 'failed',
                  error: error.message,
                })
              );
  
              message.error({ content: 'ERC20 交易失败' });
            });
        } catch (err) {
          console.error('ERC20 转账失败', err);
          message.error({ content: 'ERC20 转账失败' });
        } finally {
          setLoading(false);
        }
      },
    });
  }, [to, amount, tokenId, selectedChain, currentAccount, navigate]);

  const handleSubmitNFT = useCallback(() => {
    signatureConfirmRef.current?.show({
      confirm: async () => {
        try {
          setLoading(true);
  
          // 1. 获取 PEM 文件转私钥
          const [signKeyFile] = await chainStorageUtils.getUploadFiles([
            currentAccount.userSignKeyFile,
            currentAccount.userPublicKeyFile,
          ]);
          const privateKey = await file2Txt(signKeyFile);
  
          const rpcUrl = selectedChain?.chainName === '数科链主网'
            ? DEFAULT_MAINNET_RPC
            : selectedChain?.nodeIp;
  
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(privateKey, provider);
          const contract = new ethers.Contract(
            ERC1155_CONTRACT_ADDRESS,
            ERC1155ABI,
            wallet
          );
  
          // 2. 发起1155转账
          const tx = await contract.safeTransferFrom(
            currentAccount.address,
            to,
            tokenId,
            amount,
            '0x'
          );
  
          const blockNumber = await provider.getBlockNumber();
  
          // 3. 构造 pending 交易日志并跳转
          const pendingLog: TxLog = {
            txId: tx.hash,
            accountName: currentAccount.name,
            accountId: currentAccount.address,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'pending',
            code: 0,
            chainId: selectedChain?.chainId || '',
            contractType: 'ERC1155',
            contractName: ERC1155_CONTRACT_ADDRESS,
            fromAddress: currentAccount.address,
            toAddress: to,
            amount,
            gasLimit: tx.gasLimit.toString(),
            chainName: selectedChain?.chainName || '',
            blockNumber,
            nonce: tx.nonce,
            nodeIp: extractBaseNodeIp(selectedChain?.nodeIp), // ✅ 存储去端口后的 nodeIp
          };

          // 存入 localStorage
          try {
            const existing = JSON.parse(localStorage.getItem('new_pending_tx') || '[]');
            const already = existing.find((l: TxLog) => l.txId === pendingLog.txId);
            if (!already) {
              existing.unshift(pendingLog);
              localStorage.setItem('new_pending_tx', JSON.stringify(existing));
            }
          } catch (e) {
            console.error('保存 new_pending_tx 失败', e);
          }
  
          navigate('/', {
            state: {
              activeTab: 2,
              // newTxLog: pendingLog,
              autoJumpToDetail: true,
              shouldRefreshBalance: true,
            },
          });
  
          message.success({ content: 'NFT转账已发送！' });
  
          // 4. 等待确认并处理状态
          tx.wait()
            .then((receipt) => {
              const newStatus: 'done' | 'failed' = receipt.status === 1 ? 'done' : 'failed';
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: newStatus,
                code: newStatus === 'done' ? 0 : 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: newStatus,
                  code: receipt.status === 1 ? 0 : 1,
                  tokenId,
                })
              );
  
              message.success({ content: 'NFT交易确认成功！' });
            })
            .catch((error) => {
              console.error('NFT交易确认失败:', error);
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: 'failed',
                code: 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: 'failed',
                  error: error.message,
                  tokenId,
                })
              );
  
              message.error({ content: 'NFT交易失败' });
            });
  
        } catch (err) {
          console.error('NFT转账失败', err);
          message.error({ content: 'NFT转账失败' });
        } finally {
          setLoading(false);
        }
      },
    });
  }, [to, amount, tokenId, selectedChain, currentAccount, navigate]);

  const handleSubmitERC404 = useCallback(() => {
    signatureConfirmRef.current?.show({
      confirm: async () => {
        try {
          setLoading(true);
  
          // 1. 获取私钥
          const signKeyFile = await chainStorageUtils.getUploadFile(currentAccount.userSignKeyFile);
          const privateKey = await file2Txt(signKeyFile);
  
          const rpcUrl = selectedChain?.chainName === '数科链主网'
            ? DEFAULT_MAINNET_RPC
            : selectedChain?.nodeIp;
  
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(privateKey, provider);
  
          const erc404Contract = new ethers.Contract(
            contractAddress,
            ERC404ABI,
            wallet
          );
  
          const tx = await erc404Contract.transfer(to, ethers.utils.parseEther(amount));
          const blockNumber = await provider.getBlockNumber();
  
          // 2. 构造 pending 日志
          const pendingLog: TxLog = {
            txId: tx.hash,
            accountName: currentAccount.name,
            accountId: currentAccount.address,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'pending',
            code: 0,
            chainId: selectedChain?.chainId || '',
            contractType: 'ERC404',
            contractName: contractAddress,
            fromAddress: currentAccount.address,
            toAddress: to,
            amount,
            gasLimit: tx.gasLimit.toString(),
            chainName: selectedChain?.chainName || '',
            blockNumber,
            nonce: tx.nonce,
            nodeIp: extractBaseNodeIp(selectedChain?.nodeIp), // ✅ 存储去端口后的 nodeIp
          };

          // 存入 localStorage
          try {
            const existing = JSON.parse(localStorage.getItem('new_pending_tx') || '[]');
            const already = existing.find((l: TxLog) => l.txId === pendingLog.txId);
            if (!already) {
              existing.unshift(pendingLog);
              localStorage.setItem('new_pending_tx', JSON.stringify(existing));
            }
          } catch (e) {
            console.error('保存 new_pending_tx 失败', e);
          }
  
          // 3. 跳转首页并传递pending日志
          navigate('/', {
            state: {
              activeTab: 2,
              // newTxLog: pendingLog,
              autoJumpToDetail: true,
              shouldRefreshBalance: true,
            },
          });
  
          message.success({ content: 'ERC404转账已发送！' });
  
          // 4. 等待确认并广播/记录
          tx.wait()
            .then((receipt) => {
              const newStatus: 'done' | 'failed' = receipt.status === 1 ? 'done' : 'failed';
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: newStatus,
                code: newStatus === 'done' ? 0 : 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: newStatus,
                  code: receipt.status === 1 ? 0 : 1,
                })
              );
  
              message.success({ content: 'ERC404交易确认成功！' });
            })
            .catch((error) => {
              console.error('ERC404交易确认失败:', error);
  
              eventBus.emit('tx_status_update', {
                txId: tx.hash,
                status: 'failed',
                code: 1,
              });
  
              localStorage.setItem(
                `tx_result_${tx.hash}`,
                JSON.stringify({
                  status: 'failed',
                  error: error.message,
                })
              );
  
              message.error({ content: 'ERC404交易失败' });
            });
  
        } catch (err) {
          console.error('ERC404转账失败', err);
          message.error({ content: 'ERC404转账失败' });
        } finally {
          setLoading(false);
        }
      },
    });
  }, [to, amount, selectedChain, currentAccount, navigate]);
  
  return (
    <DetailPage 
      title="确认转账信息"
      backUrl="/"
    >
      <div className="content">
        {/* 当tokenId存在时显示NFT相关信息 */}
        {tokenId && (
          <>
            <div className="info-item">
              <div className="info-label">tokenId</div>
              <div className="info-value">{tokenId}</div>
            </div>
            <div className="info-item">
              <div className="info-label">数量</div>
              <div className="info-value">{amount}</div>
            </div>
          </>
        )}
        
        {/* 常规转账信息 */}
        {!tokenId && (
          <div className="info-item">
            <div className="info-label">数量</div>
            <div className="info-value">{amount} </div>
          </div>
        )}
  
        <div className="info-item">
          <div className="info-label">发送方</div>
          <div className="info-value">{from}</div>
        </div>
  
        <div className="info-item">
          <div className="info-label">接收方</div>
          <div className="info-value">{to}</div>
        </div>
  
        <div className="info-item">
          <div className="info-label">网络</div>
          <div className="info-value">{chainId}</div>
        </div>
  
        <div className="info-item">
          <div className="info-label">Gas 费用</div>
          <div className="info-value">{gasLimit}</div>
        </div>
      </div>
  
      <footer className="guide-footer-btn-group">
        <Button type="weak" onClick={() => navigate('/')}>
          取消
        </Button>
        <Button 
          type="primary" 
          loading={loading} 
          onClick={
            contractType === 'ERC1155'
              ? handleSubmitNFT
              : contractType === 'ERC404'
              ? handleSubmitERC404
              : contractType === 'ERC20'
              ? handleSubmitERC20
              : handleSubmit
          }
        >
          确定发起
        </Button>
      </footer>
  
      <SignatureConfirmModal ref={signatureConfirmRef} />
    </DetailPage>
  );
}

export default TransferConfirmPage;
