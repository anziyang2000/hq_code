// https://git.chainmaker.org.cn/contracts/contracts-go/-/tree/master/standard-identity
// echo "执行合约 identity.IdentityOf(address string)，获取身份信息"
// ./cmc client contract user get \
// --contract-name=identity \
// --method=IdentityOf \
// --sdk-conf-path=./testdata/sdk_config.yml \
// --params="{\"address\":\"5fa92a33364dd5ce26a9814a6aceb240bd6bf083\"}" \
// --result-to-string=true

import { Result } from '../../web-sdk/grpc-web/common/result_pb';
import { base64decode, formatDate, initChainSdkFromStorage } from '../utils/utils';

const IDENTITY_LEVEL_MAP = {
  0: '未认证',
  1: '官方实名认证',
  2: '官方企业认证',
  3: '应用方个人实名认证',
};
export enum IdentityLevel {
  UN_AUTH,
  OFFICIAL_AUTH,
  OFFICIAL_COMPANY_AUTH,
  PERSON_AUTH,
}
export interface IdentityData {
  level: IdentityLevel;
  text: string;
  orgId: string;
  time: string;
}
export async function getiIdentityData({ account, chainId, contractName }) {
  const { chainClient } = await initChainSdkFromStorage(chainId, account);
  const queryMetaData = {
    contractName,
    params: {
      address: account.address, // selectedAccountId
      time: Math.round(Date.now() / 1000),
    },
    method: 'IdentityOf',
    withSyncResult: true,
  };
  try {
    const queryResult = (await chainClient.callUserContract.queryContract(queryMetaData)) as Result.AsObject;
    const contractResults = queryResult.contractResult;
    const identityResult = JSON.parse(base64decode(String(contractResults.result)));
    const metaData = JSON.parse(base64decode(String(identityResult.metadata)));
    const results: IdentityData = {
      level: identityResult.level,
      text: IDENTITY_LEVEL_MAP[identityResult.level],
      orgId: metaData.orgId,
      time: formatDate(new Date(metaData.timestamp * 1000), 'YYYY-MM-DD HH:mm:ss'),
    };
    return results;
  } catch (error) {
    // 不弹窗提示，视图层兼容展示
    console.error(error);
    return null;
  }
}
// echo
// echo "执行合约 identity.LevelOf(address string)，获取身份类型编号"
// ./cmc client contract user get \
// --contract-name=identity \
// --method=LevelOf \
// --sdk-conf-path=./testdata/sdk_config.yml \
// --params="{\"address\":\"5fa92a33364dd5ce26a9814a6aceb240bd6bf083\"}" \
// --result-to-string=true

// 查询链账户地址认证信息接口

// // IdentityOf 获取认证信息

// //@param address 地址

// //@return int 返回当前认证类型编号

// //@return identity 认证信息

// //@return err 返回错误信息

// IdentityOf(address string) (identity Identity, err error)

// 方法名IdentityOf，入参address

// 返回值信息
// {
// "address":"0x546654e4654a654f654d",
// "pkPem":"",
// "level":"1",
// "metadata":"{"orgId":"微芯","timestamp":"465465432154"}"
// }

// 其中level：0未认证，1、官方实名认证，2、官方企业认证，3、应用方个人实名认证

// 如果传入的地址查询不到，则当做未认证处理
