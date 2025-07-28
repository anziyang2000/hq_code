import { createIconToken } from '../components/contract-logo';
import { CONTRACT_TYPE } from '../config/contract';
import { Account, Chain } from '../utils/interface';
import chainStorageUtils, { contractStoreUtils } from '../utils/storage';
import { getChainConfig } from '../utils/utils';

export async function subscribeDefaultContract(chain: Chain) {
  // 订阅链默认合约
  if (!chain.default_contract?.length) return;
  try {
    for (const contract of chain.default_contract) {
      await contractStoreUtils.setSubscribe(chain.chainId, {
        ...contract,
        contractIcon: createIconToken(),
      });
    }
  } catch (error) {
    // 静默操作可以不提示
    console.warn('订阅链默认合约失败', error);
  }
}

export async function initChainSubscribe(chain: Chain) {
  const hasGas = (await contractStoreUtils.getSubscribe(chain.chainId, 'GAS')).length;
  if (chain.enableGas) {
    // 开启gass则订阅gass合约
    if (!hasGas) {
      await contractStoreUtils.setSubscribe(chain.chainId, {
        contractType: CONTRACT_TYPE.GAS,
        contractIcon: createIconToken(),
        contractName: 'GAS',
      });
    }
  } else if (hasGas) {
    await contractStoreUtils.abortSubscribe(chain.chainId, 'GAS');
  }
  // 订阅链默认合约
}

export async function pullRemoteChainConfig(currentChain?: Chain, currentAccount?: Account) {
  const chain = currentChain || (await chainStorageUtils.getSelectedChain());
  const account = currentAccount || (await chainStorageUtils.getCurrentAccount());
  if (chain && account) {
    try {
      const chainConfig = { ...chain };
      const [userSignKeyFile, userSignCrtFile, userPublicKeyFile] = await chainStorageUtils.getUploadFiles([
        account.userSignKeyFile,
        account.userSignCrtFile,
        account.userPublicKeyFile,
      ]);
      console.log('chainConfig', chainConfig);
      const nextConfig = await getChainConfig(chainConfig, {
        userSignKeyFile,
        userSignCrtFile,
        userPublicKeyFile,
        orgId: account.orgId,
      });

      if (
        !currentChain &&
        chainConfig.version === nextConfig.version &&
        chainConfig.enableGas === nextConfig.accountConfig?.enableGas
      ) {
        // 没有指定链，且远端参数未更新时，返回空
        return;
      }
      chainConfig.version = nextConfig.version;
      chainConfig.enableGas = nextConfig.accountConfig?.enableGas;
      await initChainSubscribe(chainConfig);
      return await chainStorageUtils.updateChain(chain.chainId, chainConfig);
    } catch (error) {
      console.warn('pullRemoteChainConfig error', error);
    }
    // 自动选链
  }
}
