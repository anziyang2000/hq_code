/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { default as localforage } from 'localforage';
import { Account, AccountRequireOnlyAddress, Chain, PluginSetting, TxLog, Wallet } from './interface';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserContractRequest, InvokeUserContractRequest, SendRequestParam } from '../event-page';
import md5 from 'md5';
import { CONTRACT_TYPE_REPLACE_MAP } from '../config/contract';

function binaryStringToFile(fileStr: string) {
  const array = new Uint8Array(fileStr.length);
  for (let i = 0; i < fileStr.length; i++) {
    array[i] = fileStr.charCodeAt(i);
  }
  return new File([new Blob([array], { type: 'application/octet-stream' })], 'contract');
}

const chainStore = localforage.createInstance({
  name: 'chain',
  version: 1.0,
  driver: localforage.INDEXEDDB,
});
/**
 * setting用于非跟链有直接关系，不考虑存储周期的数据，比如窗体ID缓存
 */
const settingStore = localforage.createInstance({
  name: 'setting',
  version: 1.0,
  driver: localforage.INDEXEDDB,
});

/**
 * setting用于非跟链有直接关系，不考虑存储周期的数据，比如窗体ID缓存
 */
const contractStore = localforage.createInstance({
  name: 'contract',
  version: 1.0,
  driver: localforage.INDEXEDDB,
});

const headColors = [
  '#7F669D&#FBFACD',
  '#65647C&#F1D3B3',
  '#852999&#F5D5AE',
  '#3A8891&#F2DEBA',
  '#E97777&#FCDDB0',
  '#EA9518&#A5F1E9',
  '#BF760A&#F4EA2A',
  '#344D67&#F3ECB0',
  '#FF577F&#FFD384',
  '#905E96&#FFD372',
  '#874C62&#A7D2CB',
  '#AC4425&#F0F2B6',
];

export const getColor = async () => {
  const color = await settingStoreUtils.getColor();
  // let newColor;
  // if (!color) {
  //   const colorNumber1 = Math.floor(Math.random() * 255);
  //   const colorNumber2 = Math.floor(Math.random() * 255);
  //   const colorNumber3 = Math.floor(Math.random() * 255);
  //   newColor = Color.rgb(colorNumber1, colorNumber2, colorNumber3).hex();
  // } else {
  //   const arr = Color(color).rgb().array()
  //   newColor = Color.rgb((arr[0] + 135) % 255, (arr[1] + 141) % 255, (arr[2] + 147) % 255).hex();
  // }
  let index = headColors.indexOf(color);
  if (index > -1 && index < 11) {
    index += 1;
  } else {
    index = 0;
  }
  const newColor = headColors[index];
  settingStoreUtils.setColor(newColor);
  return newColor;
};
/**
 * 默认配置
 */
export const initSettingValues: PluginSetting = {
  proxyHostname: CHAIN_MAKER.proxyServerURL,
  proxyHostnameTls: CHAIN_MAKER.proxyServerURL2,
  /**
   * @description 分钟
   */
  lockLife: 30,
};

const localForgeUtils = {
  /**
   * @param expire 单位是秒
   */
  setData: async <T>(store: LocalForage, key: string, data: T, expire: number | false) => {
    await store.setItem(key, {
      expire: typeof expire === 'number' ? Date.now() + expire * 1000 : expire,
      data,
    });
  },

  getData: async <T>(store: LocalForage, key: string): Promise<any> => {
    const expireData: {
      expire: number;
      data: T;
    } = await store.getItem(key);
    if (expireData) {
      if (typeof expireData.expire === 'number' && expireData.expire < Date.now()) {
        await store.removeItem(key);
        return null;
      }
      return expireData.data;
    }
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeData: <T>(store: LocalForage, key: string) => {
    store.removeItem(key);
  },
};

export default class chainStorageUtils {
  /**
   * @param expire 单位是秒
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async setData<T>(key: string, data: T, expire: number | false) {
    await localForgeUtils.setData(chainStore, key, data, expire);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getData<T>(key: string) {
    return await localForgeUtils.getData(chainStore, key);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async removeData<T>(key: string) {
    await localForgeUtils.removeData(chainStore, key);
  }

  /**
   * 添加链
   * @param chain
   */
  // static async addChain(chain: Chain): Promise<Chain[]> {
  //   const chains = ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];
  //   const newChains = [chain, ...chains];
  //   await chainStorageUtils.setData('chain_list', newChains, false);
  //   return newChains;
  // }

  /**
   * 添加链
   * 并在添加时将已存在的账户同步到此新链
   * @param chain
   */
  static async addChain(chain: Chain): Promise<Chain[]> {
    const chains = ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];

    // 检查是否已存在同 chainId 链
    // const exist = chains.find(c => c.chainId === chain.chainId);
    // if (exist) {
    //     console.warn(`链 ${chain.chainName} 已存在，无需重复添加。`);
    //     return chains;
    // }

    // 在最前插入新链
    const newChains = [chain, ...chains];
    await chainStorageUtils.setData('chain_list', newChains, false);

    // 同步账户到新链
    const allAccountsMap = new Map<string, Account>();
    for (const c of chains) {
        const accs = await this.getChainAccounts(c.chainId);
        for (const ac of accs) {
            allAccountsMap.set(ac.address, ac);
        }
    }

    const allAccounts = Array.from(allAccountsMap.values());
    if (allAccounts.length > 0) {
        await chainStorageUtils.setData(`chain_account_${chain.chainId}`, allAccounts, false);
        console.info(`已将 ${allAccounts.length} 个账户同步到新链 ${chain.chainName} (${chain.chainId})`);
    } else {
        console.info(`无可同步账户到新链 ${chain.chainName} (${chain.chainId})`);
    }

    return newChains;
  }


  /**
   * 获取链列表
   */
  static async getChains() {
    return ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];
  }
  /**
   * 根据chainId获取chain详情
   * @param chainId
   * @returns
   */
  static async getChain(chainId: Chain['chainId']): Promise<Chain | undefined> {
    const chains = ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];
    if (chains.length) {
      return chains.find((item) => item.chainId === chainId);
    }
  }

  static async setChains(chains: Chain[]) {
    return await chainStorageUtils.setData('chain_list', chains, false);
  }

  static async deleteChain(index: number) {
    const chains = ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];
    const chainsDeleted = chains.splice(index, 1);
    await chainStorageUtils.setData('chain_list', chains, false);
    chainsDeleted.forEach((item) => {
      Promise.all([
        contractStoreUtils.abortSubscribe(item.chainId),
        chainStorageUtils.emptyChainAccount(item.chainId),
        chainStorageUtils.removeData(`chain_did_${item.chainId}`),
      ]);
    });
    return chains;
  }

  static async updateChain(chainId: Chain['chainId'], p: Partial<Chain>) {
    const chains = ((await chainStorageUtils.getData('chain_list')) as Chain[]) ?? [];
    let updatedChain: Chain;
    chains.forEach((item) => {
      if (item.chainId === chainId) {
        Object.keys(p).forEach((k) => {
          item[k] = p[k];
        });
        updatedChain = item;
      }
    });
    await chainStorageUtils.setChains(chains);
    return { updatedChain, chains };
  }

  static async uploadFile(item: File): Promise<string> {
    if (!(item instanceof File)) {
      return null;
    }
    const id = uuidv4();
    await chainStore.setItem(`file_${id}`, item);
    return id;
  }
  static async deleteFile(id: string) {
    if (!id) {
      return;
    }
    await chainStore.removeItem(`file_${id}`);
  }
  static async deleteFiles(ids: string[]) {
    const idArr = ids.filter((id) => !!id);
    if (!idArr.length) {
      return;
    }
    await Promise.all(idArr.map((id) => this.deleteFile(id)));
  }

  static async uploadFiles(items: File[]): Promise<string[]> {
    const ids = await Promise.all(items.map((item) => chainStorageUtils.uploadFile(item)));
    return ids;
  }

  static async getUploadFile(id: string | undefined): Promise<File | undefined> {
    return (await chainStore.getItem(`file_${id}`)) || undefined;
  }

  static async getUploadFiles(ids: Array<string | undefined>): Promise<(File | undefined)[]> {
    return await Promise.all(ids.map((item) => chainStorageUtils.getUploadFile(item)));
  }

  /**
   * 登录信息
   */
  static async setLogin(password): Promise<void> {
    await chainStorageUtils.setData('login_token', md5(password), false);
    return;
  }

  static async getLogin(): Promise<string | null> {
    return chainStorageUtils.getData('login_token');
  }

  /**
   * 用户关闭插件时，记录该时间，重新唤起插件，来判断是否过期， 如果重新输入密码激活
   */
  static async setLoginLife(): Promise<void> {
    const setting = await chainStorageUtils.getSetting();
    await chainStorageUtils.setData('login_life', true, setting.lockLife * 60);
    return;
  }

  static async getLoginLife(): Promise<string> {
    return await chainStorageUtils.getData<string>('login_life');
  }

  /**
   * @description true表示锁屏
   */
  static async setLoginLock() {
    await chainStorageUtils.setData('login_lock', true, false);
    return;
  }

  static async removeLoginLock() {
    await chainStorageUtils.removeData('login_lock');
    return;
  }

  static async getLoginLock() {
    return await chainStorageUtils.getData<boolean>('login_lock');
  }

  /**
   * 记录签名记录时间
   */
  static async setLastTransTime() {
    const setting = await chainStorageUtils.getSetting();
    await chainStorageUtils.setData('last_signature_time', Date.now(), setting.lockLife * 60);
  }

  static async getLastTransTime() {
    return await chainStorageUtils.getData('last_signature_time');
  }

  static async checkChainAccountExist(chainId: string, account: AccountRequireOnlyAddress) {
    const accounts = await chainStorageUtils.getChainAccounts(chainId);
    return accounts.find((ac) => ac.address === account.address);
  }

  // static async addChainAccount(chainId: string, account: Account) {
  //   const accounts = await this.getChainAccounts(chainId);
  //   const exist = await this.checkChainAccountExist(chainId, account);
  //   if (!exist) {
  //     account.color = await getColor();
  //     const newAccounts = [account, ...accounts];
  //     await chainStorageUtils.setData(`chain_account_${chainId}`, newAccounts, false);
  //     return newAccounts;
  //   }
  //   return accounts;
  // }

  static async addChainAccount(chainId: string, account: Account) {
    const chains = await this.getChains();

    // 获取所有链上的账户并去重
    const allAccountsMap = new Map<string, Account>();
    for (const chain of chains) {
        const chainAccounts = await this.getChainAccounts(chain.chainId);
        for (const ac of chainAccounts) {
            allAccountsMap.set(ac.address, ac);
        }
    }

    // 加入新的账户
    if (!allAccountsMap.has(account.address)) {
        account.color = await getColor();
        allAccountsMap.set(account.address, account);
    }

    const allAccounts = Array.from(allAccountsMap.values());

    // 将完整账户列表写入每条链
    for (const chain of chains) {
        await chainStorageUtils.setData(`chain_account_${chain.chainId}`, allAccounts, false);
    }

    console.info(`已同步账户到所有 ${chains.length} 条链，账户总数：${allAccounts.length}`);

    return allAccounts;
  }

  // 新增：改成不以链的维度存储账户地址，而是把账户地址做到共享使用
  static async getGlobalAccounts(): Promise<AccountRequireOnlyAddress[]> {
    const data = await localforage.getItem<AccountRequireOnlyAddress[]>('global_accounts');
    return data || [];
  }
  
  static async checkGlobalAccountExist(account: AccountRequireOnlyAddress) {
    const accounts = await chainStorageUtils.getGlobalAccounts();
    return accounts.find((ac) => ac.address === account.address);
  }
  
  static async saveGlobalAccount(account: AccountRequireOnlyAddress) {
    const accounts = await chainStorageUtils.getGlobalAccounts();
    const exist = accounts.find((ac) => ac.address === account.address);
    if (!exist) {
      accounts.push(account);
      await localforage.setItem('global_accounts', accounts);
    }
  }

  ///////////////////////////////////////////////////////////////
  
  static async emptyChainAccount(chainId: string) {
    // TODO: 账户文件怎么清除？
    await chainStorageUtils.removeData(`chain_account_${chainId}`);
  }

  /**
   * 删除指定链账户
   * @param chainId
   * @param account
   * @returns
   */
  static async getChainAccountByAddress(chainId: string, address: string) {
    const accounts = await this.getChainAccounts(chainId);
    return accounts.find((ac) => ac.address === address);
  }
  /**
   * 删除指定链账户
   * @param chainId
   * @param account
   * @returns
   */
  // static async deleteChainAccount(chainId: string, account: Account) {
  //   const accounts = await this.getChainAccounts(chainId);
  //   const index = accounts.findIndex((ac) => ac.address === account.address);
  //   await this.deleteFiles([account.userPublicKeyFile, account.userSignCrtFile, account.userSignKeyFile]);

  //   if (index > -1) {
  //     accounts.splice(index, 1);
  //     await this.setChainAccount(chainId, accounts);
  //   }
  //   chainStorageUtils.clearAccountDidDocument({ chainId, accountAddress: account.address });

  //   return accounts;
  // }

  /**
   * 删除账户（在所有链上同步删除）
   * @param account 需要删除的账户
   * @returns 删除后剩余的去重账户列表
   */
  static async deleteChainAccount(chainId: string, account: Account) {
    const chains = await this.getChains();

    // 为避免重复删除文件，仅删除一次
    const deletedFiles: Set<string> = new Set();

    for (const chain of chains) {
        const chainId = chain.chainId;
        const accounts = await this.getChainAccounts(chainId);
        const index = accounts.findIndex((ac) => ac.address === account.address);

        if (index > -1) {
            // 收集要删除的文件（只添加一次）
            [account.userPublicKeyFile, account.userSignCrtFile, account.userSignKeyFile].forEach((file) => {
                if (file) {
                    deletedFiles.add(file);
                }
            });

            // 删除账户
            accounts.splice(index, 1);
            await this.setChainAccount(chainId, accounts);

            // 删除 DID Document（只针对当前链删除）
            await chainStorageUtils.clearAccountDidDocument({
                chainId,
                accountAddress: account.address
            });

            console.info(`已从链 ${chain.chainName} (${chainId}) 删除账户 ${account.address}`);
        }
    }

    // 删除收集到的文件（只执行一次）
    if (deletedFiles.size > 0) {
        await this.deleteFiles(Array.from(deletedFiles));
    }

    // 返回剩余的去重账户列表（便于更新 UI）
    const allAccountsMap = new Map<string, Account>();
    for (const chain of chains) {
        const accs = await this.getChainAccounts(chain.chainId);
        accs.forEach((ac) => {
            allAccountsMap.set(ac.address, ac);
        });
    }
    const remainingAccounts = Array.from(allAccountsMap.values());
    console.info(`删除账户完成，当前剩余账户数: ${remainingAccounts.length}`);
    return remainingAccounts;
  }

  /**
   * 获取链下所有账号
   * @param chainId
   * @param type 'all' 'hd' 'jbok', all全部链账户 hd特定钱包walletId下的链账户 jbok未分类的链账户
   * @returns
   */
  static async getChainAccounts(chainId: string, type: 'all' | 'hd' | 'jbok' = 'all', walletId?: string) {
    const allAccounts = ((await chainStorageUtils.getData(`chain_account_${chainId}`)) as Account[]) ?? [];
    if (type === 'all') {
      // 全部
      return allAccounts;
    }
    if (type === 'hd') {
      // 分类的钱包（确定性钱包）
      if (walletId) {
        return allAccounts.filter((ac) => ac.walletId === walletId).sort((a, b) => a.walletIndex - b.walletIndex);
      }
      return allAccounts.filter((ac) => !!ac.walletId);
    }
    if (type === 'jbok') {
      // 未分类的钱包（非确定性钱包）
      return allAccounts.filter((ac) => !ac.walletId);
    }
  }

  static async setChainAccount(chainId: string, accounts: Account[]) {
    await chainStorageUtils.setData(`chain_account_${chainId}`, accounts, false);
    return accounts;
  }

  static async getCurrentChainAccounts(type: 'all' | 'hd' | 'jbok' = 'all', walletId?: string) {
    const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (!chain?.chainId) {
      return [];
    }
    return this.getChainAccounts(chain.chainId, type, walletId);
  }

  static async setCurrentChainAccount(accounts: Account[]) {
    const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (!chain?.chainId) {
      return false;
    }
    await chainStorageUtils.setData(`chain_account_${chain?.chainId}`, accounts, false);
  }

  /**
   * 获取当前登录的账号，默认为链的第一个
   * @returns
   */
  static async getCurrentAccount() {
    const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (!chain?.chainId) {
      return undefined;
    }
    const { chainId } = chain;
    const accounts = ((await chainStorageUtils.getData(`chain_account_${chainId}`)) as Account[]) ?? [];
    const account = accounts.find((ac) => ac.isCurrent);
    if (account) {
      return account;
    }
    if (accounts[0]) {
      accounts[0].isCurrent = true;
      await chainStorageUtils.setData(`chain_account_${chainId}`, accounts, false);
      return accounts[0];
    }
    return undefined;
  }

  // 根据addr设置当前链帐号
  // static async setCurrentAccount(address: string) {
  //   const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
  //   if (!chain?.chainId) {
  //     return undefined;
  //   }
  //   const { chainId } = chain;
  //   const accounts = ((await chainStorageUtils.getData(`chain_account_${chainId}`)) as Account[]) ?? [];
  //   let resAccount;
  //   accounts.forEach((ac) => {
  //     ac.isCurrent = ac.address === address;
  //   });
  //   const account = accounts.find((ac) => ac.isCurrent);
  //   if (account) {
  //     // await chainStorageUtils.setData('log_account',account[0],false);
  //     resAccount = account;
  //   } else {
  //     accounts[0].isCurrent = true;
  //     console.error('当前链不存在这个用户！');
  //     resAccount = accounts[0];
  //   }
  //   await chainStorageUtils.setData(`chain_account_${chainId}`, accounts, false);
  //   return resAccount;
  // }

  // 根据 addr 设置全链当前账户（每条链都同步设置 isCurrent）
  static async setCurrentAccount(address: string) {
    const chains = (await chainStorageUtils.getData('chain_list')) as Chain[] ?? [];

    let resAccount: Account | undefined;

    const activeChain = await chainStorageUtils.getData(`active_chain`) as Chain;

    for (const chain of chains) {
        const { chainId } = chain;
        const accounts = ((await chainStorageUtils.getData(`chain_account_${chainId}`)) as Account[]) ?? [];

        let found = false;
        for (const ac of accounts) {
            if (ac.address === address) {
                ac.isCurrent = true;
                found = true;
                // 如果是当前激活链则返回该账户
                if (activeChain?.chainId === chainId) {
                    resAccount = ac;
                }
            } else {
                ac.isCurrent = false;
            }
        }

        await chainStorageUtils.setData(`chain_account_${chainId}`, accounts, false);
    }

    if (!resAccount) {
        console.error('当前链不存在这个用户！已自动选中当前链的第一个账户作为当前账户。');
        if (activeChain?.chainId) {
            const accounts = ((await chainStorageUtils.getData(`chain_account_${activeChain.chainId}`)) as Account[]) ?? [];
            if (accounts.length > 0) {
                accounts[0].isCurrent = true;
                await chainStorageUtils.setData(`chain_account_${activeChain.chainId}`, accounts, false);
                resAccount = accounts[0];
            }
        }
    }

    return resAccount;
  }

  static async getTxLogs(chainId: Chain['chainId']) {
    return ((await chainStorageUtils.getData(`tx_logs_${chainId}`)) as TxLog[]) ?? [];
  }

  static async updateTxLogs(chainId: Chain['chainId'], logs: TxLog[]) {
    return await chainStorageUtils.setData(`tx_logs_${chainId}`, logs, false);
  }

  /**
   * DB中存储顺序为倒序
   * @param log
   */
  static async addTxLog(log: TxLog) {
    const logs = await chainStorageUtils.getTxLogs(log.chainId);
    await chainStorageUtils.setData(`tx_logs_${log.chainId}`, [log, ...logs], false);
  }

  /**
   * @description 针对创建合约，需要将文件临时存储
   * @param log
   */
  static async setTempOperation(log: SendRequestParam) {
    if (log.body?.contractFile) {
      log.body.contractFile = await chainStorageUtils.uploadFile(binaryStringToFile(log.body.contractFile));
    }
    // 将参数中的特殊文件内容进行转存
    if (log.body?.params?.CONTRACT_BYTECODE) {
      log.body.params.CONTRACT_BYTECODE = await chainStorageUtils.uploadFile(
        binaryStringToFile(log.body?.params?.CONTRACT_BYTECODE),
      );
    }
    await chainStorageUtils.setData(`temp_operation`, log, false);
  }

  /**
   * @description 拿出来之后就删除DB存储，只能消费一次
   */
  static async getTempOperation() {
    const item = (await chainStorageUtils.getData(`temp_operation`)) as unknown as
      | CreateUserContractRequest
      | InvokeUserContractRequest
      | SendRequestParam;
    if (item) {
      await chainStorageUtils.removeData('temp_operation');
    }
    return item;
  }

  static async setActiveTabId(tabId: number) {
    await chainStorageUtils.setData(`active_tab_id`, tabId, false);
  }

  static async getActiveTabId() {
    return (await chainStorageUtils.getData(`active_tab_id`)) as number;
  }

  static async getSetting(): Promise<PluginSetting> {
    const setting = await chainStorageUtils.getData<PluginSetting>('setting');
    if (setting === null) {
      await chainStorageUtils.setSetting(initSettingValues);
      return initSettingValues;
    }
    return setting;
  }

  static async setSetting(setting: PluginSetting) {
    return await chainStorageUtils.setData('setting', setting, false);
  }

  static clearData() {
    return chainStore.clear();
  }

  static async setSelectedChain(chainId: Chain) {
    await chainStorageUtils.setData(`active_chain`, chainId, false);
  }

  static async getSelectedChain() {
    const chain = (await await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (chain) {
      return chain;
    }
    const chains = await chainStorageUtils.getChains();
    return chains[0];
  }
  // 获取指定链下所有的钱包列表
  static async getChainWallets(chainId: string) {
    return ((await chainStorageUtils.getData(`chain_wallet_${chainId}`)) as Wallet[]) ?? [];
  }
  // 更新指定的链的钱包列表
  static async setChainWallets(chainId: string, wallets: Wallet[]) {
    await chainStorageUtils.setData(`chain_wallet_${chainId}`, wallets, false);
    return wallets;
  }
  // 添加单个钱包到指定链的钱包列表中
  static async addChainWallet(chainId: string, wallet: Wallet) {
    const wallets = await chainStorageUtils.getChainWallets(chainId);
    const newWallets = [wallet, ...wallets];
    await chainStorageUtils.setData(`chain_wallet_${chainId}`, newWallets, false);
    return newWallets;
  }
  // 获取指定链下，指定的钱包
  static async getWalletByWalletId(chainId: string, id: string) {
    const wallets = await this.getChainWallets(chainId);
    return wallets.find((wallet) => wallet.id === id);
  }
  // 获取当前链下当前的钱包，默认为链的第一个
  static async getCurrentWallet() {
    const wallets = await this.getCurrentChainWallets();
    const wallet = wallets.find((ac) => ac.isCurrent);
    if (wallet) {
      return wallet;
    }
    if (wallets[0]) {
      wallets[0].isCurrent = true;
      await this.setCurrentChainWallets(wallets);
      return wallets[0];
    }
    return undefined;
  }
  // 获取当前链下钱包列表
  static async getCurrentChainWallets() {
    const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (!chain?.chainId) {
      return [];
    }
    return await this.getChainWallets(chain.chainId);
  }
  // 设置当前链的钱包列表
  static async setCurrentChainWallets(wallets: Wallet[]) {
    const chain = (await chainStorageUtils.getData(`active_chain`)) as Chain;
    if (!chain?.chainId) {
      return false;
    }
    this.setChainWallets(chain.chainId, wallets);
  }

  // 根据助记词id 设置当前激活的钱包
  static async setCurrentWallet(id: string) {
    let wallets = await this.getCurrentChainWallets();

    wallets = wallets.map((wallet) => ({
      ...wallet,
      isCurrent: wallet.id === id,
    }));
    let currentWallet = wallets.find((wallet) => wallet.isCurrent);
    if (!currentWallet) {
      wallets[0].isCurrent = true;
      currentWallet = wallets[0] ?? undefined;
    }
    await this.setCurrentChainWallets(wallets);
    return currentWallet;
  }

  static async getDidVCList({ did, chainId }: { chainId: string; did?: string }): Promise<VcItem[]> {
    const list = ((await chainStorageUtils.getData(`did_vc_${chainId}_${did}`)) as VcItem[]) ?? [];
    return list;
  }
  static async setDidVCList({ did, chainId, vcList }: { chainId: string; did: string; vcList: VcItem[] }) {
    await chainStorageUtils.setData(`did_vc_${chainId}_${did}`, vcList, false);
  }
  static async clearAccountDidDocument({ chainId, accountAddress }: { chainId: string; accountAddress: string }) {
    const didList = await chainStorageUtils.getDidDocumentList({ chainId, full: true });
    const nextList = [...didList];
    let notFound = true;
    nextList.forEach((item, index) => {
      const j = item.accounts.findIndex((ele) => ele.address === accountAddress);
      if (j !== -1) {
        notFound = false;
        item.accounts.splice(j, 1);
        if (!item.accounts.length) {
          nextList.splice(index, 1);
          // TODO 后期考虑空空账号的did，vp是否删除
          // chainStorageUtils.setDidVCList({ did: item.id, chainId, vcList: [] });
        }
      }
    });
    if (notFound) return;
    await chainStorageUtils.setData(`chain_did_${chainId}`, nextList, false);
  }
  static async getDidDocument({
    did,
    chainId,
    accountAddress,
  }: {
    chainId: string;
    did?: string;
    accountAddress?: string;
  }): Promise<DidItem> {
    if (!did && !accountAddress) return null;
    const list = ((await chainStorageUtils.getData(`chain_did_${chainId}`)) as DidItem[]) ?? [];
    // 根据did查找，或者 accountAddress在did的accounts中
    return list.find((item) => (did ? item.id === did : item.accounts.some((ele) => ele.address === accountAddress)));
  }
  static async getDidDocumentList({ chainId, full }: { chainId: string; full?: boolean }): Promise<DidItem[]> {
    const list = ((await chainStorageUtils.getData(`chain_did_${chainId}`)) as DidItem[]) ?? [];
    if (full) return list;
    // 过滤有效账户数据
    const accounts = await this.getChainAccounts(chainId);
    const usefulList = list.filter((doc) =>
      doc.accounts.some(({ address }) => accounts.some((ac) => ac.address === address)),
    );
    return usefulList;
  }
  // 更新指定的链的钱包列表
  static async saveDidDocument({ didItem, chainId }: { chainId: string; didItem?: DidItem }) {
    const didList = await chainStorageUtils.getDidDocumentList({ chainId, full: true });
    const nextList = [...didList];
    const current = nextList.find((item, index) => {
      if (item.id === didItem.id) {
        nextList[index] = didItem;
        return true;
      }
      return false;
    });
    if (!current) {
      nextList.push(didItem);
    }
    await chainStorageUtils.setData(`chain_did_${chainId}`, nextList, false);
  }
}

export interface DidItem {
  id: string;
  accounts: {
    address: string;
    name: string;
    color: string;
    id: string;
  }[];
  createTime: string;
  updateTime: string;
  // 是否停用
  deactivated: boolean;
}
// 证书名称：json scheam中name
// 证书类型：json scheam中vcType
export interface VcItem {
  id: string;
  type: string[];
  issuer: string;
  status: string;
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: {
    id: string;
    certificateName: string;
    name: string;
    identityCardNumber: string;
    phone: string;
    issuerName: string;
  };
  template: {
    id: string;
    name: string;
    version: string;
  };
  proof: Record<string, any>[];
}

export const settingStoreUtils = {
  getWindowId: () => localForgeUtils.getData(settingStore, `window_id`),
  setWindowId: (id: number) => localForgeUtils.setData(settingStore, `window_id`, id, false),

  setDebug: (debug: boolean) => {
    localStorage.setItem('debug', String(debug));
  },
  getDebug: () => localStorage.getItem('debug') === 'true',
  getColor: () => localForgeUtils.getData(settingStore, `account-color`),
  setColor: (color: string) => localForgeUtils.setData(settingStore, `account-color`, color, false),
};

export interface SubscribeContractItem {
  accountId?: string;
  contractName?: string;
  contractIcon?: string;
  contractType?: ContractType;
  FTPerName?: string;
  FTMinPrecision?: number;
  balance?: string;
  remark?: string;

  // 新增字段
  currentAccount?: Account;
  contractAddress?: Account;
}

export interface ContractTxItem {
  txId: string;
  method: string;
  timestamp?: number;
  from?: string;
  to?: string;
  amount?: string;
  height?: number;
  params?: string;
  operator?: string;
  contractName?: string;
  contractType?: ContractType;
  // 存证合约需要
  eviId?: string;
  eviHash?: string;
  //
  gasUsed?: number;
  nftImage?: string;
  nftName?: string;
  // 成功状态
  success?: boolean;


  // 新增字段
  fromAddress?: string;
  toAddress?: string;
  nonce?: string;
  gasLimit?: string;
  blockNumber?: string;
}

export interface NFTMetaData {
  /**
   * @description 作者名称
   */
  author?: string;
  /**
   * @description 发行机构
   */
  orgName?: string;
  /**
   * @description 发行品类型， 支持图片，视频，音频
   * @default 'image'
   */
  seriesType?: 'image' | 'video' | 'audio';
  /**
   * @description 发行品名称
   */
  name?: string;
  /**
   * @description 发行品描述
   */
  description?: string;
  /**
   * @description 发行品地址
   */
  image: string;
  /**
   * @description 发行品hash
   */
  seriesHash?: string;
  /**
   * @description 发行品hash
   */
  [key: string]: string;
}

export interface ContractNFTItem extends NFTMetaData {
  tokenId: string;
}

// 删除用户、删除链，添加订阅数据时发现账户不存在， 则取消当前账号下的订阅
// 取消订阅时 keys
const txMaxLength = 1000;
export const contractStoreUtils = {
  async getSubscribe(chainId: string, contractName?: string, contractTypes?: ContractType[]) {
    const subscribeList: SubscribeContractItem[] = (await contractStore.getItem(`${chainId}_subscribe_list`)) || [];
    if (contractName) {
      return subscribeList.filter((ele) => {
        if (ele.contractName === contractName) {
          // 类型转换，兼容历史类型 FT,NFT
          if (CONTRACT_TYPE_REPLACE_MAP[ele.contractType]) {
            // eslint-disable-next-line no-param-reassign
            ele.contractType = CONTRACT_TYPE_REPLACE_MAP[ele.contractType];
          }
          return true;
        }
        return false;
      });
    }
    // 支持通过合约类型过滤
    if (contractTypes) {
      return subscribeList.filter((ele) => contractTypes.indexOf(ele.contractType) !== -1);
    }

    return subscribeList;
  },
  async setSubscribe(chainId: string, contractInfo: SubscribeContractItem) {
    // {contractName,contractType,FTPerName,FTMinPrecision}
    const subscribeList = await this.getSubscribe(chainId);
    let repeat = '';
    subscribeList.forEach((ele) => {
      if (ele.contractName === contractInfo.contractName) {
        console.warn('合约名称重复: contractName', contractInfo.contractName);
        repeat = contractInfo.contractName;
      }
    });
    if (repeat) {
      return new Error(`合约名称重复,contractName:${repeat}`);
    }
    console.debug('setSubscribe', contractInfo);
    subscribeList.push(contractInfo);
    contractStore.setItem(`${chainId}_subscribe_list`, subscribeList);
  },
  async abortSubscribe(chainId: string, contractName?: string) {
    // 取消合约订阅
    if (contractName) {
      const subscribeList = await this.getSubscribe(chainId);
      let has;
      let index;
      subscribeList.forEach((ele, i) => {
        if (ele.contractName === contractName) {
          has = true;
          index = i;
        }
      });
      if (!has) {
        return console.warn('合不存在: contractName', contractName);
      }
      subscribeList.splice(index, 1);
      // 清除链合约数据
      const keys = await contractStore.keys();
      for (const key of keys) {
        if (new RegExp(`^${chainId}_${contractName}_`).test(key)) {
          await contractStore.removeItem(key);
        }
      }
      // 更新订阅列表
      return contractStore.setItem(`${chainId}_subscribe_list`, subscribeList);
    }
    // 清除账号，订阅数据， 所有合约数据
    const keys = await contractStore.keys();
    for (const key of keys) {
      if (new RegExp(`^${chainId}_`).test(key)) {
        await contractStore.removeItem(key);
      }
    }
  },
  // 账户
  async getContractTxs<T extends ContractTxItem>({
    chainId,
    contractName,
    accountId,
    pageSize = 10,
    pageIndex,
    withContractInfo,
    filters = {
      status: 'success',
    },
  }: {
    chainId: string;
    contractName: string;
    accountId?: string;
    pageSize?: number;
    pageIndex?: number;
    withContractInfo?: boolean;
    filters?: {
      status?: 'success' | 'fail' | 'all';
      startTime?: number;
      endTime?: number;
    };
  }) {
    let result: T[] = (await contractStore.getItem(`${chainId}_${contractName}_txs`)) || [];
    let contractInfo = null;
    if (withContractInfo) {
      const list = await this.getSubscribe(chainId, contractName);
      contractInfo = list[0];
    }
    console.log(contractInfo);

    if (accountId) {
      result = result
        .filter(({ operator, from, to, success, timestamp }) => {
          const matchMine = operator === accountId || from === accountId || to === accountId;
          // eslint-disable-next-line no-nested-ternary
          const matchSuccess = filters.status === 'success' ? success !== false : true;
          const matchFail = filters.status === 'fail' ? !success : true;
          const matchStartT = filters.startTime ? filters.startTime <= timestamp : true;
          const matchEndT = filters.endTime ? filters.endTime >= timestamp : true;
          return matchMine && matchSuccess && matchFail && matchStartT && matchEndT;
        })
        .map((ele) => ({
          ...ele,
          contractInfo,
        }));
      // 类型转换，兼容历史类型 FT,NFT
      result.forEach((ele) => {
        if (CONTRACT_TYPE_REPLACE_MAP[ele.contractType]) {
          // eslint-disable-next-line no-param-reassign
          ele.contractType = CONTRACT_TYPE_REPLACE_MAP[ele.contractType];
        }
      });
    }
    if (pageIndex === undefined) {
      return result;
    }
    return result.splice(pageSize * pageIndex, pageSize);
  },
  async addContractTxs({
    chainId,
    contractName,
    txList,
  }: {
    chainId: string;
    contractName: string;
    txList: ContractTxItem[];
  }) {
    // 判断是否已经订阅
    const subscribeList = await this.getSubscribe(chainId, contractName);
    if (!subscribeList.length) {
      console.debug(`addContractTx 合约${contractName} 未订阅`);
      return;
    }
    const txSourceList: ContractTxItem[] = await this.getContractTxs({ contractName, chainId });
    txList.forEach((ele) => {
      const repeat = txSourceList.some((item) => item.txId === ele.txId);
      if (!repeat) {
        txSourceList.unshift(ele);
        if (txSourceList.length > txMaxLength) txSourceList.pop();
      }
    });
    return contractStore.setItem(`${chainId}_${contractName}_txs`, txSourceList);
  },

  async getContractBalance({ accountId, chainId, contractName }) {
    const results: string = (await contractStore.getItem(`${chainId}_${contractName}_${accountId}_balance`)) || '';
    return results;
  },
  async setContractBalance({ accountId, chainId, contractName, balance }) {
    const results: ContractNFTItem[] = await contractStore.setItem(
      `${chainId}_${contractName}_${accountId}_balance`,
      balance,
    );
    return results;
  },
  async getContractNFT({ accountId, chainId, contractName }) {
    const results: ContractNFTItem[] =
      (await contractStore.getItem(`${chainId}_${contractName}_${accountId}_nft`)) || [];
    return results;
  },
  async setContractNFT({
    accountId,
    chainId,
    contractName,
    NFTList,
  }: {
    chainId: string;
    accountId: string;
    contractName: string;
    NFTList: ContractNFTItem[];
  }) {
    return await contractStore.setItem(`${chainId}_${contractName}_${accountId}_nft`, NFTList);
  },
  clearData() {
    return contractStore.clear();
  },
};
