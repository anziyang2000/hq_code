/**
 * @Description: 查询gas余额
 * @param address: 查询账户的致信链地址
 * @return uint64: gas余额
 * @return error: 错误信息
 */
// GetBalance(address []byte) (uint64, error)

import { Result } from '../../web-sdk/grpc-web/common/result_pb';

import { Account, InvokeUserContract, UserContract } from '../utils/interface';
import chainStorageUtils from '../utils/storage';
import { getChainConfig, initChainSdkFromStorage } from '../utils/utils';
import { file2Uint8Array } from '../../web-sdk/glue';

export const getBalanceGas = async ({ account, chainId }: { account: Account; chainId: string }) => {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  try {
    const result = (await chainClient.callSystemContract.gasAccountGas(account.address)) as Result.AsObject;
    const txResults = result.contractResult;
    const balanceOfResult = typeof txResults.result === 'string' ? atob(txResults.result) : txResults.result;
    if (result.code === 0) {
      return +balanceOfResult;
    }
    throw new Error(`查询余额失败${balanceOfResult}`);
  } catch (e) {
    console.error(e);
    // message.error({
    //   content: '查询余额失败' + e.toString(),
    // });
  }
};
/* @description 上链
 */

export const queryForecastGas = async (
  chainId: string,
  account: Account,
  userContract: UserContract | InvokeUserContract,
  type: 'init' | 'invoke',
) => {
  try {
    if (type === 'init') {
      const contractParams = userContract as UserContract;

      // INVALID = 0,
      // NATIVE = 1,
      // WASMER = 2,
      // WXVM = 3,
      // GASM = 4,
      // EVM = 5,
      // DOCKER_GO = 6,
      // JAVA = 7,
      // GO
      if (contractParams.runtimeType === 'DOCKER_GO') {
        // DOCKER_GO 合约安装本地预估gas
        const chain = await chainStorageUtils.getChain(chainId);
        const [userSignKeyFile, userSignCrtFile, userPublicKeyFile] = await chainStorageUtils.getUploadFiles([
          account.userSignKeyFile,
          account.userSignCrtFile,
          account.userPublicKeyFile,
        ]);
        const { accountConfig } = await getChainConfig(chain, {
          ...account,
          userSignKeyFile,
          userSignCrtFile,
          userPublicKeyFile,
        });
        const { installBaseGas, installGasPrice } = accountConfig || {};
        if (installBaseGas && installGasPrice) {
          // 预估 gas = install_base_gas + install_gas_price * [len(contractName) + len(contractVersion)，len(bytecode) + len(runtime-type) + len(TxId)] * 1.4
          const userContractFile = await chainStorageUtils.getUploadFile(contractParams.contractFile);
          const txIdLen = 64;
          const gasUsed =
            installBaseGas +
            installGasPrice *
              (contractParams.contractName.length +
                contractParams.contractVersion.length +
                contractParams.runtimeType.length +
                (userContractFile?.size || 0) + // 格式不同，大小会发生改变
                txIdLen) *
              1.3;
          console.debug('gasUsed', gasUsed);
          return { gasUsed: Math.ceil(gasUsed) };
        }
      }
      // 兼容版本
      return await initContract(chainId, account, contractParams);
    }
    return await invokeContract(chainId, account, userContract as InvokeUserContract);
  } catch (e) {
    console.error(e);
    // message.error({
    //   content: `发起上链查询失败${e.message || e.toString()}`,
    // });
    throw e;
    // 18 + 107
  }
};
/* @description 上链
 */

async function initContract(chainId: string, account: Account, userContract: UserContract) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 10000 });
  const userContractFile = await chainStorageUtils.getUploadFile(userContract.contractFile);

  const result = (await chainClient.userContractMgr.createUserContract({
    ...userContract,
    contractName: userContract.contractName,
    contractVersion: userContract.contractVersion,
    contractFilePath: await file2Uint8Array(userContractFile),
    runtimeType: userContract.runtimeType,
    params: {
      ...userContract.params,
      _QUERY_CONTRACT: true,
    },
    userInfoList: [chainClient.userInfo],
    withSyncResult: false,
  })) as Result.AsObject;

  if (result.code !== 0) {
    throw new Error(result.message);
  }
  // gas合约订阅单独执行，无论成败
  return result.contractResult;
}

async function invokeContract(chainId: string, account: Account, userContract: InvokeUserContract) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account, { timeout: 10000 });

  const queryParameters: Record<string, any> = {
    ...userContract.params,
    _QUERY_CONTRACT: true,
  };
  // 对执行合约时的合约文件进行转换
  if (userContract.params.CONTRACT_BYTECODE) {
    const userContractFile = await chainStorageUtils.getUploadFile(userContract.params.CONTRACT_BYTECODE as string);
    queryParameters.CONTRACT_BYTECODE = await file2Uint8Array(userContractFile);
  }

  const result = (await chainClient.callUserContract.invokeUserContract({
    contractName: userContract.contractName,
    params: queryParameters,
    method: userContract.method,
    withSyncResult: false,
  })) as Result.AsObject;
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.contractResult;
}

// 连接链的时候，从chainconfig里，获取

// # gas account config
// account_config:
// enable_gas: false

// 如果enable_gas是true，则样式如左侧，如果为false则样式为右侧。

// 如果enable_gas是true则默认订阅GAS合约，合约名称：ACCOUNT_MANAGER

// 其中获取GAS余额的方法如下：

// 方法名：GetBalance

// 入参：address

// gas 最大值：  推荐=>query预估+10%, 最小=>query预估, 最大=>余额

// code
// :
// 4
// contractEventList
// :
// []
// gasUsed
// :
// 99999
// message
// :
// "gas limit is not enough, [limit:99999]/[gasUsed:12598920]"
// result
// :
// ""
