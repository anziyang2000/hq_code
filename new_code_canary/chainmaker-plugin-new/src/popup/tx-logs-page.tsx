import React, { CSSProperties, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTxLogs } from '../utils/hooks';
import { Icon, Text, Status, message } from 'tea-component';
import { useChainStore } from './popup';
import { DetailPage } from '../utils/common';
import { formatDate, getSyncLogResult } from '../utils/utils';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { TxLog } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { getBrowserTransactionLink } from '../config/chain';
import { useNavigate, useLocation  } from 'react-router-dom';
import { CONTRACT_TYPE } from '@src/config/contract';
import eventBus from '../utils/eventBus'; // 确保路径正确
import { extractBaseNodeIp } from '@utils/extractBase';
import { ethers } from 'ethers';
import { DEFAULT_MAINNET_RPC } from '@src/config/chain';

type RowData = {
  logs: TxLog[];
  refreshLog: (log: TxLog & { index: number }) => void;
  browserLink?: string;
  setLogs: React.Dispatch<React.SetStateAction<TxLog[]>>;
  onRequestRefreshBalance?: () => void;
};

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { logs, refreshLog, browserLink, setLogs, onRequestRefreshBalance } = data;
  const item = logs[index] as TxLog & { isLoading: boolean };

  console.log('历史交易页面---item:', item);
  
  const [checkedOnce, setCheckedOnce] = useState(false);
  const navigate = useNavigate();
  const { currentAccount, selectedChain } = useChainStore();
  // const hasCheckedRef = useRef(false);

  // useEffect(() => {
  //   if (item.status === 'pending' && !checkedOnce) {
  //     handleCheckPendingStatusNOMESS(item);
  //     setCheckedOnce(true);
  //   }
  // }, [item.txId, item.status, checkedOnce]);

  // 可是我需要每个status是pending的item都去重试哦,别搞得就一个去重试了,其它的都没重试

  // useEffect(() => {
  //   if (item.status === 'pending' && !hasCheckedRef.current) {
  //     hasCheckedRef.current = true;
  //     handleCheckPendingStatusNOMESS(item);
  //   }
  // }, [item.status, item.txId]);

  const handleClick = () => {
    navigate('/transaction/history-detail', {
      state: {
        txInfo: item,
        contractInfo: {
          contractType: item.contractType || 'CMNFA',
          contractName: item.contractName || '未知合约',
        },
      },
    });
  };

  // 历史记录重试机制
  const handleCheckPendingStatus = async (log: TxLog) => {
    try {
      message.loading({ content: '正在检查交易状态，请稍候...' });

      const rpcUrl =
        selectedChain?.chainName === '数科链主网'
          ? DEFAULT_MAINNET_RPC
          : selectedChain?.nodeIp;
  
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const receipt = await provider.getTransactionReceipt(log.txId);
  
      console.log('重试机制------log.txId', log.txId, receipt);
  
      if (!receipt) {
        message.warning({ content: '交易尚未上链，请稍后重试' });
        return;
      }
  
      const status = (receipt.status === 1 ? 'done' : 'failed') as 'done' | 'failed';
      const code = receipt.status === 1 ? 0 : -1;
  
      // 找到该交易在 logs 中的下标
      const index = logs.findIndex((item) => item.txId === log.txId);
      if (index === -1) return;
  
      const updatedLog = {
        ...logs[index],
        status,
        code,
        isLoading: false,
      };
  
      const newLogs = [...logs];
      newLogs.splice(index, 1, updatedLog);
      setLogs(newLogs);
  
      // 同步缓存（可选）
      localStorage.setItem(
        `tx_result_${log.txId}`,
        JSON.stringify({ status, code })
      );
  
      // 触发余额刷新（如果需要）
      onRequestRefreshBalance?.();

      // 状态反馈
      if (status === 'done') {
        message.success({ content: '交易已成功上链!' });
      } else {
        message.warning({ content: '交易失败，建议查看详情' });
      }
    } catch (error) {
      console.error('检查交易状态失败', error);
      message.error({ content: '检查失败，请稍后重试' });
    }
  };

  const pendingStatus = (
    <div onClick={handleClick}>
      <Text theme="warning">
        上链中 
        {item.isLoading ? (
          <Icon
            type="loading"
            onClick={(e) => {
              e.stopPropagation(); // 阻止冒泡，防止跳详情
              handleCheckPendingStatus(item);
            }}
          />
        ) : (
          <Icon
            type="refresh"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckPendingStatus(item);
            }}
          />
        )}
      </Text>
    </div>
  
  );

  return (
    <div key={index} style={style} onClick={handleClick}>
      <div className="txlogs-item">
        <div className="flex meta-layout">
          <div className="status">
            {item.status === 'pending' ? (
              pendingStatus
            ) : (
              <Text theme={item.code === 0 ? 'success' : 'danger'}>
                {item.code === 0 ? '上链成功' : '上链失败'}
              </Text>
            )}
          </div>
          <div className="datetime">{formatDate(new Date(item.timestamp * 1000))}</div>
        </div>
        <div className="flex meta-layout">
          <div>{item.contractType === CONTRACT_TYPE.GAS ? 'ETH' : item.contractType}</div>
          {item.amount && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {item.amount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

type TxLogsPageProps = {
  showDetailPage?: boolean;
  extraLog?: TxLog;
  onRequestRefreshBalance?: () => void;
};

function TxLogsPage({ showDetailPage = true, onRequestRefreshBalance }: TxLogsPageProps) {
  const location = useLocation();
  const [extraLog, setExtraLog] = useState<TxLog | null>(null);
  const { currentAccount, selectedChain } = useChainStore();

  const chainSelected = useChainStore((state) => state.selectedChain);
  const [acconts, setAccounts] = useState([]);
  const chainId = chainSelected?.chainId;
  const browserLink = chainSelected?.browserLink;
  const isUpdate = useRef(false);
  const { logs, setLogs } = useTxLogs(chainId);

  const currentBaseNodeIp = extractBaseNodeIp(selectedChain?.nodeIp);

  useEffect(() => {
    const updateAllPending = async () => {
      const updated = [...logs]; // 拷贝原始 logs
      let hasChanged = false;
  
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log.status === 'pending') {
          const receipt = await checkReceipt(log);
          if (receipt) {
            const status = receipt.status === 1 ? 'done' : 'failed';
            const code = receipt.status === 1 ? 0 : -1;
  
            updated[i] = {
              ...log,
              status,
              code,
              isLoading: false,
            };
  
            // 本地缓存
            localStorage.setItem(
              `tx_result_${log.txId}`,
              JSON.stringify({ status, code })
            );
  
            hasChanged = true;
          }
        }
      }
  
      if (hasChanged) {
        setLogs(updated); // 只触发一次渲染
        onRequestRefreshBalance?.();
      }
    };
  
    updateAllPending();
  }, [logs]);

  const checkReceipt = async (log: TxLog) => {
    try {
      const rpcUrl =
        chainSelected?.chainName === '数科链主网'
          ? DEFAULT_MAINNET_RPC
          : chainSelected?.nodeIp;
  
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const receipt = await provider.getTransactionReceipt(log.txId);
  
      return receipt || null;
    } catch (error) {
      console.error('获取交易状态失败:', error);
      return null;
    }
  };
 
  useEffect(() => {
    // 防止重复执行
    if (isUpdate.current) return;

    const raw = localStorage.getItem('new_pending_tx');
    let newLogs: TxLog[] = [];
    if (raw) {
      try {
        newLogs = JSON.parse(raw);
      } catch (e) {
        console.error('解析 new_pending_tx 失败', e);
      }
    }

    if (extraLog) {
      newLogs.push(extraLog);
    }

    let updated = false;
    const mergedLogs = [...logs];
  
    // 合并 newLogs 中不重复的项
    newLogs.forEach((log) => {
      const exists = logs.some((item) => item.txId === log.txId);
      if (!exists) {
        console.log('💡 新增交易 log:', log.txId);
        mergedLogs.push(log);
        updated = true;
      } else {
        console.log('🟡 已存在 log 跳过:', log.txId);
      }
    });
  
    // 尝试补全每个 pending 的状态
    const finalLogs = mergedLogs
    .filter(
      log =>
          log.nodeIp === currentBaseNodeIp &&
          log.fromAddress?.toLowerCase() === currentAccount?.address?.toLowerCase()
    )
    .map((log) => {
      if (log.status === 'pending') {
        const resultRaw = localStorage.getItem(`tx_result_${log.txId}`);
        if (resultRaw) {
          try {
            const { status, code } = JSON.parse(resultRaw);
            updated = true;
            return {
              ...log,
              status,
              code,
              isLoading: false,
            };
          } catch {
            return log;
          }
        }
      }
      return log;
    });
  
    // 如果日志有更新，设置状态
    if (
      updated ||
      finalLogs.length !== logs.length ||
      finalLogs.some((l, i) => l !== logs[i])
    ) {
      console.log('✅ setLogs 更新数据:', finalLogs.map((l) => l.txId));
      setLogs(finalLogs);
    } else {
      console.log('❌ 最终未触发 setLogs');
    }
  
    // 执行 pending 状态下的账户匹配和轮询检查逻辑
    if (acconts.length) {
      let count = 0;
      finalLogs.forEach((log, index) => {
        if (log.status === 'pending') {
          const account = acconts.find((a) => a.address === log.accountId);
          if (account && count < 10) {
            updateTxLog({ account, index, txId: log.txId });
            count++;
          } else if (!account) {
            console.warn('未匹配到账户', log);
          }
  
          // 同时进行状态轮询
          handleCheckPendingStatuss(log);
        }
      });
    }
  
    isUpdate.current = true;
  }, [extraLog, logs, acconts, currentAccount?.address, currentBaseNodeIp]);

  useEffect(() => {
    // 当账户或节点改变时，允许重新执行初始化逻辑
    console.log("变化了");
    isUpdate.current = false;
  }, [acconts, currentAccount?.address, selectedChain?.nodeIp]);
  
  const updateTxLog = useCallback(
    ({ index, account }) => {
      getSyncLogResult({ chainId, account, log: logs[index] })
        .then((result) => {
          const newEle = Object.assign({}, logs[index], {
            code: result.code,
            status: 'done',
            isLoading: false,
          });
          delete newEle.contractName;
          delete newEle.params;
          delete newEle.method;

          const newLogs = [...logs];
          newLogs.splice(index, 1, newEle);
          setLogs(newLogs);
        })
        .catch(() => {
          const newEle = Object.assign({}, logs[index], { isLoading: false });
          const newLogs = [...logs];
          newLogs.splice(index, 1, newEle);
          setLogs(newLogs);
        });
    },
    [logs, setLogs, chainId]
  );

  useEffect(() => {
    chainStorageUtils.getChainAccounts(chainSelected.chainId).then((res) => {
      setAccounts(res);
    });
  }, [chainSelected.chainId]);

  const refreshLog = useCallback(
    ({ txId, accountId, index }: TxLog & { index: number }) => {
      let matched = false;
      acconts.forEach((ele) => {
        if (ele.address === accountId) {
          matched = true;
          const newEle = Object.assign({}, logs[index], { isLoading: true });
          const newLogs = [...logs];
          newLogs.splice(index, 1, newEle);
          setLogs(newLogs);
          updateTxLog({ account: ele, index, txId });
        }
      });
      if (!matched) {
        console.warn('未匹配到上链日志发起账户');
      }
    },
    [logs, acconts, updateTxLog, setLogs]
  );

  useEffect(() => {
    const handler = (data: { txId: string; status: 'done' | 'failed'; code: number }) => {
      const { txId, status, code } = data;
      const index = logs.findIndex((log) => log.txId === txId);
      if (index !== -1 && logs[index].status === 'pending') {
        const updatedLog = {
          ...logs[index],
          status,
          code,
          isLoading: false,
        };
        const newLogs = [...logs];
        newLogs.splice(index, 1, updatedLog);
        setLogs(newLogs);
        onRequestRefreshBalance?.();
      }
    };
  
    eventBus.on('tx_status_update', handler);
    return () => {
      eventBus.off('tx_status_update', handler);
    };
  }, [logs, setLogs, onRequestRefreshBalance]);
  
  const handleCheckPendingStatuss = useCallback(async (log: TxLog) => {
    try {
      console.log('进入到handleCheckPendingStatuss重试机制了!');
      
      const rpcUrl =
        chainSelected?.chainName === '数科链主网'
          ? DEFAULT_MAINNET_RPC
          : chainSelected?.nodeIp;
  
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const receipt = await provider.getTransactionReceipt(log.txId);
  
      if (!receipt) return;
  
      const status = (receipt.status === 1 ? 'done' : 'failed') as 'done' | 'failed';
      const code = receipt.status === 1 ? 0 : -1;
  
      const index = logs.findIndex((item) => item.txId === log.txId);
      if (index === -1) return;
  
      const updatedLog = {
        ...logs[index],
        status,
        code,
        isLoading: false,
      };
  
      const newLogs = [...logs];
      newLogs.splice(index, 1, updatedLog);
      setLogs(newLogs);
  
      localStorage.setItem(`tx_result_${log.txId}`, JSON.stringify({ status, code }));
      onRequestRefreshBalance?.();
  
      if (status === 'done') {
        message.success({ content: `交易 ${log.txId.slice(0, 8)}... 成功上链`, duration: 2 });
      } else {
        message.warning({ content: `交易 ${log.txId.slice(0, 8)}... 上链失败`, duration: 2 });
      }
    } catch (err) {
      console.error('自动检查交易状态失败:', err);
    }
  },[logs, setLogs, chainSelected, onRequestRefreshBalance]);

  const rowData: RowData = {
    logs,
    refreshLog,
    browserLink,
    setLogs,
    onRequestRefreshBalance,
  };

  const TypedFixedSizeList = FixedSizeList as unknown as React.ComponentType<any>;

  const listComponent =
  logs.length === 0 ? (
    <Status icon="blank" size="l" title="暂无上链记录" className="cancel-bold" />
  ) : (
    <TypedFixedSizeList
      height={430}
      itemCount={logs.length}
      itemSize={65}
      width="100%"
      itemData={rowData}
      className="txlogs-vtable"
    >
      {Row}
    </TypedFixedSizeList>
  );

  return showDetailPage ? (
    <DetailPage title="上链记录" backUrl="/">
      {listComponent}
    </DetailPage>
  ) : (
    <>{listComponent}</>
  );
}

export default TxLogsPage;
