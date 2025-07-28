import { ExtensionResponse } from '../event-page';
import chainStorageUtils from './storage';
import { ethers } from 'ethers';

/**
 * 发布消息到网页的contentScript
 * @see https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage
 */

// TODO: 会触发window.addEventListener('message',... )
export function sendMessageToContentScript(message: ExtensionResponse) {
  chainStorageUtils.getActiveTabId().then((tabId) => {
    if (!tabId) {
      return;
    }
    chrome.tabs.sendMessage(tabId, {
      ...message,
      from: 'chainmaker-plugin',
    });
  });
}

export const getNowSeconds = () => Math.ceil(Date.now() / 1000);

const accountAddressReg = /^([a-fA-F\d]{40})$/;
export const isAccountAddress = (str) => accountAddressReg.test(str);

export const isETHAccountAddress =(address) => {
  try {
    // ethers 会自动检查地址格式是否符合（包括 0x 开头，长度，checksum）
    ethers.utils.getAddress(address);
    return true;
  } catch {
    return false;
  }
}
