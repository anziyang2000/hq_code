/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { useCallback, useEffect, useState } from 'react';
import { Account, Chain, TxLog } from './interface';
import chainStorageUtils, { contractStoreUtils } from './storage';
import { message } from 'tea-component';
import { useNavigate } from 'react-router-dom';

export function useAccounts(chainId: Chain['chainId']) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    chainId &&
      chainStorageUtils.getChainAccounts(chainId).then((res) => {
        setAccounts(res);
      });
  }, [chainId]);
  return accounts;
}

// export function useTxLogs(chainSelected: Chain['chainId']) {
//   const [logs, setLogs] = useState<TxLog[]>([]);
//   useEffect(() => {
//     chainSelected &&
//       chainStorageUtils.getTxLogs(chainSelected).then((res) => {
//         // const map = new Array(30).fill(null).map((item, index) => ({
//         //   ...res[0],
//         //   txId: String(index),
//         // }));
//         setLogs(res);
//       });
//   }, [chainSelected]);

//   return {
//     logs,
//     setLogs: (logs: TxLog[]) => {
//       chainStorageUtils.updateTxLogs(chainSelected, logs).then((res) => {
//         setLogs(logs);
//       });
//     },
//   };
// }

export function useTxLogs(chainSelected: Chain['chainId']) {
  const [logs, setLogs] = useState<TxLog[]>([]);

  useEffect(() => {
    if (!chainSelected) return;
    chainStorageUtils.getTxLogs(chainSelected).then((res) => {
      setLogs(res);
    });
  }, [chainSelected]);

  // 新的 setLogs，支持函数式更新
  const updateLogs = (newLogs: TxLog[] | ((prevLogs: TxLog[]) => TxLog[])) => {
    if (typeof newLogs === 'function') {
      setLogs((prevLogs) => {
        const updatedLogs = newLogs(prevLogs);
        // 异步更新缓存
        chainStorageUtils.updateTxLogs(chainSelected, updatedLogs);
        return updatedLogs;
      });
    } else {
      setLogs(newLogs);
      chainStorageUtils.updateTxLogs(chainSelected, newLogs);
    }
  };

  return {
    logs,
    setLogs: updateLogs,
  };
}

export const useCancelSubscribe = () => {
  const navigate = useNavigate();
  return useCallback(
    (chainId, contractName) =>
      contractStoreUtils
        .abortSubscribe(chainId, contractName)
        .then(() => {
          message.success({ content: '取消订阅成功' });
          setTimeout(() => {
            navigate('/');
          }, 1000);
        })
        .catch((err) => {
          message.error({ content: `取消订阅失败:${err}` });
        }),
    [],
  );
};
