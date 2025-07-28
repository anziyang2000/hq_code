import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Text, message } from 'tea-component';
import { DetailPage } from '@utils/common';
import { file2Txt } from '../../web-sdk/glue';
import chainStorageUtils from '@utils/storage';
import { useChainStore } from './popup';
import Web3 from 'web3';
import './sign-page.less';
import { extractBaseNodeIp } from '@utils/extractBase';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';
import { ABI_REGISTRY } from '@utils/abi-registry';

const SignPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<any>(null);
  const [requestId, setRequestId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const isMounted = useRef(true);
  const [contractName, setContractName] = useState<string | null>(null);
  const { selectedChain } = useChainStore();

  useEffect(() => {
    isMounted.current = true;
  
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    if (!requestId) {
      console.error('[SignPage] 缺少 requestId 参数');
      return;
    }
  
    setRequestId(requestId);
  
    const port = chrome.runtime.connect({ name: requestId });
  
    port.onMessage.addListener((msg) => {
      if (!isMounted.current) return;
  
      console.log('[SignPage] 接收到来自 background 的数据:', msg);
      const { tx, contractName } = msg;
  
      if (tx) {
        setTx(tx);
        setContractName(contractName || null);
      } else {
        setError('未能正确解析交易信息');
      }
    });
  
    return () => {
      isMounted.current = false;
      port.disconnect();
    };
  }, []);
  
  useEffect(() => {
    isMounted.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    if (!requestId) {
      console.error('[SignPage] 缺少 requestId 参数');
      return;
    }

    const port = chrome.runtime.connect({ name: requestId });

    port.onMessage.addListener((message) => {
      if (!isMounted.current) return;

      if (message?.tx && message?.requestId) {
        setTx(message.tx);
        setRequestId(message.requestId);
      } else {
        setError('未能正确解析交易信息');
      }
    });

    return () => {
      isMounted.current = false;
      port.disconnect();
    };
  }, []);

  function getAmountFromData(contractName: string, data: string): string | null {
    const entry = Object.values(ABI_REGISTRY).find(entry => entry.name === contractName);
    if (!entry || !data) return null;
  
    const web3 = new Web3();
    const { abi } = entry;
    const methodSig = data.slice(0, 10); // 0x+前4字节
    const encodedParams = '0x' + data.slice(10);
  
    for (const item of abi) {
      if (item.type === 'function') {
        const sig = web3.eth.abi.encodeFunctionSignature(item);
        if (sig === methodSig) {
          try {
            const decoded = web3.eth.abi.decodeParameters(item.inputs, encodedParams);
            const amountLikeKeys = ['amount', 'value', 'mintAmount'];
            for (const key in decoded) {
              if (amountLikeKeys.some(like => key.toLowerCase().includes(like))) {
                const raw = String(decoded[key]);
  
                // 判断：大于 1e12 的就认为是 wei，转换成人类可读值
                if (!isNaN(Number(raw)) && Number(raw) > 1e12) {
                  return web3.utils.fromWei(raw, 'ether');
                } else {
                  return raw;
                }
              }
            }
          } catch (e) {
            console.warn('参数解析失败:', e);
            return null;
          }
        }
      }
    }
  
    return null;
  }

  // const handleCancel = () => {
  //   chrome.runtime.sendMessage({
  //     type: 'sign-tx-response',
  //     requestId,
  //     error: '用户取消签名'
  //   });
  //   window.close();
  // };

  const handleCancel = () => {
    chrome.runtime.sendMessage({
      type: 'sign-tx-response',
      requestId,
      // error: '用户取消签名',
      error: '签名失败',
      result: null, // 保持结构一致
    });
    window.close();
  };

  const safeStringify = (data: any) =>
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
  );

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (selectedChain?.chainName !== '数科链主网') {
        // 非数科链主网直接暗失败处理
        const errorMessage = '当前网络不支持签名发送，仅支持数科链主网';
        console.warn(errorMessage);
  
        chrome.runtime.sendMessage({
          type: 'sign-tx-response',
          requestId,
          error: errorMessage
        });
        window.close();
        return; // 直接退出
      }
      const rpcUrl = DEFAULT_MAINNET_RPC;
      // console.log('1签名页面----rpcUrl:', rpcUrl);
      const web3 = new Web3(rpcUrl);
      const signKeyFile = await chainStorageUtils.getUploadFile(tx.from.userSignKeyFile);
      const privateKey = await file2Txt(signKeyFile);
      const prefixedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      // const rawTx = await signTx(tx, prefixedPrivateKey);
      // 把 selectedChain 传递给子组件函数使用
      const rawTx = await signTx(tx, prefixedPrivateKey, selectedChain);
      const account = web3.eth.accounts.privateKeyToAccount(prefixedPrivateKey);
      const txHash = web3.utils.keccak256(rawTx);

      let amountFromData: string | null = null;
      if (contractName && contractName.startsWith('ERC')) {
        amountFromData = getAmountFromData(contractName, tx.data);
        // console.log('从 ABI 解码得到的数量:', amountFromData);
      }

      // 判断优先级：tx.value 优先，其次尝试 amountFromData
      const finalAmount = tx.value
      ? web3.utils.fromWei(tx.value, 'ether') // 优先使用 tx.value
      : amountFromData || '0';
      
      const pendingLog = {
        txId: txHash,
        accountName: tx.from?.userName || '',
        accountId: account.address,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'pending',
        code: 0,
        chainId: await web3.eth.getChainId(),
        contractType: contractName,
        contractName: contractName,
        fromAddress: account.address,
        toAddress: tx.to,
        amount: finalAmount,
        gasLimit: tx.gas || await web3.eth.estimateGas({ ...tx, from: account.address }),
        chainName: '数科链主网',
        // blockNumber,
        nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
        nodeIp: extractBaseNodeIp(selectedChain?.nodeIp), // ✅ 存储去端口后的 nodeIp
      };      

      // 存交易
      const existing = JSON.parse(localStorage.getItem('new_pending_tx') || '[]');
      existing.unshift(pendingLog); // 把当前交易加进去
      localStorage.setItem('new_pending_tx', safeStringify(existing));

      localStorage.setItem(
        `tx_result_${txHash}`,
        JSON.stringify({ status: 'pending', code: 0 })
      );

      chrome.runtime.sendMessage({
        type: 'sign-tx-response',
        requestId,
        rawTransaction: rawTx
      });
      window.close(); // 如果不需要调试可取消注释

      message.success({ content: '交易已发送！' });

  } catch (err: any) {
      console.error('签名失败:', err);
      chrome.runtime.sendMessage({
        type: 'sign-tx-response',
        requestId,
        error: err.message || '签名失败'
      });
      window.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <DetailPage title="确认签名信息" backUrl="/">
      <div className="content">
        {error ? (
          <Text theme="danger">{error}</Text>
        ) : tx ? (
          <>
            <div className="info-item">
              <div className="info-label">发送方</div>
              <div className="info-value">{tx.from?.address || tx.from}</div>
            </div>
            <div className="info-item">
              <div className="info-label">接收方</div>
              <div className="info-value">{tx.to}</div>
            </div>
            <div className="info-item">
              <div className="info-label">金额</div>
              <div className="info-value">{parseInt(tx.value || '0')} wei</div>
            </div>
            <div className="info-item">
              <div className="info-label">数据</div>
              <div className="info-value">{tx.data || '(无)'}</div>
            </div>
          </>
        ) : (
          <Text>加载中...</Text>
        )}
      </div>

      <footer className="guide-footer-btn-group">
        <Button type="weak" onClick={handleCancel} disabled={loading}>
          取消
        </Button>
        <Button type="primary" onClick={handleConfirm} loading={loading}>
          签名并发送
        </Button>
      </footer>
    </DetailPage>
  );
};

async function signTx(tx: any, privateKey: string, selectedChain: any): Promise<string> {
  const rpcUrl =
        selectedChain?.chainName === '数科链主网'
          ? DEFAULT_MAINNET_RPC
          : selectedChain?.nodeIp;
  // console.log('2签名页面----rpcUrl:', rpcUrl);
  const web3 = new Web3(rpcUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  const txWithDefaults = {
    ...tx,
    gas: tx.gas || await web3.eth.estimateGas({ ...tx, from: account.address }),
    nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
    chainId: await web3.eth.getChainId(),
  };

  const signed = await web3.eth.accounts.signTransaction(txWithDefaults, privateKey);
  return signed.rawTransaction!;
}

export default SignPage;
