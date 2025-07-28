/**
 * @Description: 查询gas余额
 * @param address: 查询账户的致信链地址
 * @return uint64: gas余额
 * @return error: 错误信息
 */
// GetBalance(address []byte) (uint64, error)

import { sendMessageToContentScript } from '@src/utils/tools';

import { Account } from '../utils/interface';

import { initChainSdkFromStorage } from '../utils/utils';
import { MessageInfoCode } from '@src/event-page';
import { message } from 'tea-component';

export const callSDK = async ({
  account,
  chainId,
  module,
  method,
  paramList,
  ticket,
}: {
  account: Account;
  chainId: string;
  module: string;
  method: string;
  paramList: any[];
  ticket: string;
}) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = await chainClient[module][method](...paramList);
    sendMessageToContentScript({
      operation: 'callSDK',
      data: {
        status: 'done',
        timestamp: Date.now() / 1000,
        info: {
          code: MessageInfoCode.success,
          message: 'success',
          result,
        },
      },
      ticket,
    });
    message.success({
      content: '执行成功',
    });
    return true;
  } catch (e) {
    const msg = e.message || e.toString();
    console.error('调用sdk方法错误：', e);
    message.error({
      content: `执行失败：${msg}`,
    });
    sendMessageToContentScript({
      operation: 'callSDK',
      data: {
        status: 'error',
        timestamp: Date.now() / 1000,
        info: {
          code: MessageInfoCode.error,
          message: msg,
        },
      },
      ticket,
    });
  }
};
