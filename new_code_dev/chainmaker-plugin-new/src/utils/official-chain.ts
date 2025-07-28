import {
  ACCOUNT_MODE,
  DEFAULT_PK_CHAIN_BROWSER_LINK,
  expiredProxyServerURL,
  expiredProxyServerURL2,
} from '../config/chain';
import { OFFICIAL_CHAIN_MAP } from '../config/official-chain';
import { AccountForm, Chain } from '../utils/interface';
import chainStorageUtils, { settingStoreUtils } from './storage';
import { getChainConfig } from './utils';

/**
 * 官方内置链,ChainId需保持一致
 */

// node1.chainmaker.org.cn 152.136.217.46
// node2.chainmaker.org.cn 49.232.86.161
// node3.chainmaker.org.cn 82.157.120.56
// node4.chainmaker.org.cn 152.136.210.129

export async function retryOfficialChain(values: AccountForm, chain: Chain) {
  let chainConfig = null;
  let okChain: Chain;
  // TODO: 改为通过chainid获取 chainList

  for (const rpc of chain.rpcs) {
    try {
      const currentConfig = {
        ...chain,
        nodeIp: rpc.url,
      };
      chainConfig = await getChainConfig(
        {
          ...chain,
          nodeIp: rpc.url,
        },
        {
          userSignKeyFile: values.userSignKeyFile,
          //userSignCrtFile: values.userSignCrtFile,
          userPublicKeyFile: values.userPublicKeyFile,
          orgId: values.orgId,
        },
      );
      okChain = currentConfig;
      break;
    } catch (e) {
      console.error(e);
    }
  }
  if (chainConfig !== null) {
    return await chainStorageUtils.updateChain(okChain.chainId, {
      ...okChain,
      version: chainConfig.version,
      enableGas: chainConfig.accountConfig?.enableGas,
    });
  }
}

export const isOfficialChain = (chain: Chain) => {
  if (settingStoreUtils.getDebug()) {
    return false;
  }
  return chain.chainId in OFFICIAL_CHAIN_MAP;
};

const checkUpdateVersion = '1.6.0';
export const checkUpdateExpiredOfficialChainData = async ({
  chains,
  selectedChain,
}: {
  chains: Chain[];
  selectedChain: Chain;
}) => {
  // 如果插件检测更新版本 与 当前保存的信息一致，则不检查更新
  const currentCheckUpdateVersion = await chainStorageUtils.getData('CHECK_UPDATE_VERSION');
  console.debug('checkUpdateExpiredOfficialChainData', currentCheckUpdateVersion, checkUpdateVersion);
  if (currentCheckUpdateVersion === checkUpdateVersion) {
    return {
      correctChains: chains,
      correctSelectedChain: selectedChain,
    };
  }

  const setting = await chainStorageUtils.getSetting();
  // 如果有过期代理配置
  if (setting.proxyHostname === expiredProxyServerURL || setting.proxyHostnameTls === expiredProxyServerURL2) {
    await chainStorageUtils.setSetting({
      ...setting,
      proxyHostname: CHAIN_MAKER.proxyServerURL,
      proxyHostnameTls: CHAIN_MAKER.proxyServerURL2,
    });
  }
  // 如果有个过期测试链更新，
  let selectedChainExpired = false;
  let hasExpiredOfficialChain = false;
  let correctSelectedChain = selectedChain;
  const correctChains: Chain[] = chains.map((ele) => {
    // 目前测试链只有cert，项目未进行可扩展设计。 添加pk链时需要注意扩展
    if (isOfficialChain(ele)) {
      // 当前存储官方链
      const officialChain = { ...ele };
      // 当前配置官方链
      const officialChainConfig = OFFICIAL_CHAIN_MAP[ele.chainId as OfficialChainId];

      // 如果node不在onlien配置中=>过期，赋值[0]nodeIp (节点更新后需要更新历史数据)
      const hasExpiredNode = !officialChainConfig.rpcs.some((config) => config.url === ele.nodeIp);
      // 代理过期
      const hasExpiredProxy = officialChain.proxyURL === expiredProxyServerURL2;

      const hasExpired = hasExpiredProxy || hasExpiredNode;
      if (hasExpired) {
        hasExpiredOfficialChain = true;
      }

      // 代理过去更新
      if (hasExpiredProxy) {
        officialChain.proxyURL = CHAIN_MAKER.proxyServerURL2;
      }
      // TODO: 节点过期更新（是否重新获取版本, 或在切换链时自动获取链配置更新）
      if (hasExpiredNode) {
        officialChain.nodeIp = officialChainConfig.nodeIp;
        officialChain.rpcs = officialChainConfig.rpcs;
        officialChain.default_contract = officialChainConfig.default_contract;
        // 如果是pk链需要更新浏览器地址地址
        if (officialChain.accountMode === ACCOUNT_MODE.PK) {
          officialChain.browserLink = DEFAULT_PK_CHAIN_BROWSER_LINK;
        }
      }

      // 选中链纠正
      if (hasExpired && correctSelectedChain.chainId === officialChain.chainId) {
        correctSelectedChain = officialChain;
        selectedChainExpired = true;
      }

      return officialChain;
    }
    return ele;
  });

  if (hasExpiredOfficialChain) {
    // 更新链列表
    await chainStorageUtils.setChains(correctChains);
    // 如果选中链是测试链，更新选中链
    if (selectedChainExpired) {
      await chainStorageUtils.setSelectedChain(correctSelectedChain);
    }
  }
  chainStorageUtils.setData('CHECK_UPDATE_VERSION', checkUpdateVersion, false);
  return { correctChains, correctSelectedChain };
};
