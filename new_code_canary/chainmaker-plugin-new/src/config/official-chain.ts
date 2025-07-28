import { Chain } from '../utils/interface';
import { ACCOUNT_MODE, DEFAULT_BROWSER_LINK, DEFAULT_HOSTNAME, PROTOCOL_MODE } from './chain';
import { CONTRACT_TYPE } from './contract';

/**
 * 官方内置链,ChainId需保持一致
 */

// node1.chainmaker.org.cn 152.136.217.46
// node2.chainmaker.org.cn 49.232.86.161
// node3.chainmaker.org.cn 82.157.120.56
// node4.chainmaker.org.cn 152.136.210.129

// export const OFFICIAL_TEST_CHAIN_CERT: Chain = {
//   isOfficial: true,
//   accountMode: ACCOUNT_MODE.CERT,
//   chainId: 'chainmaker_testnet_chain',
//   chainName: '长安链测试网络（Cert）',
//   hostName: DEFAULT_HOSTNAME,
//   nodeTLSCrtFile: null,
//   tlsEnable: true,
//   userTLSCrtFile: '_official_chain_tls.crt',
//   userTLSKeyFile: '_official_chain_tls.key',
//   /**
//    * 官方链版本信息会在添加用户时进行确定
//    */
//   version: null,
//   proxyURL: CHAIN_MAKER.proxyServerURL2,
//   browserLink: DEFAULT_BROWSER_LINK,
//   // nodeIp会在添加用户检查，确定
//   nodeIp: 'certnode1.chainmaker.org.cn:13301',
//   rpcs: [
//     {
//       url: 'certnode1.chainmaker.org.cn:13301',
//     },
//     {
//       url: 'certnode2.chainmaker.org.cn:13302',
//     },
//     {
//       url: 'certnode3.chainmaker.org.cn:13303',
//     },
//     {
//       url: 'certnode4.chainmaker.org.cn:13304',
//     },
//   ],
// };

// export const OFFICIAL_TEST_CHAIN_PK: Chain = {
//   isOfficial: true,
//   accountMode: ACCOUNT_MODE.PK,
//   chainId: 'chainmaker_testnet_pk',
//   chainName: '国家区块链网络测试链',
//   hostName: DEFAULT_HOSTNAME,
//   nodeIp: 'testnode.chainmakernet.com:17301',
//   nodeTLSCrtFile: null,
//   tlsEnable: false,
//   userTLSCrtFile: '',
//   userTLSKeyFile: '',
//   /**
//    * 官方链版本信息会在添加用户时进行确定
//    */
//   protocol: PROTOCOL_MODE.http,
//   httpSupport: true,
//   version: null,
//   proxyURL: CHAIN_MAKER.proxyServerURL2,
//   browserLink: 'https://scan-testnetpk.cnbn.org.cn/chainmaker_testnet_pk/',
//   rpcs: [
//     {
//       url: 'testnode.cnbn.org.cn:17301',
//     },
//     {
//       url: 'testnode.cnbn.org.cn:17302',
//     },
//     {
//       url: 'testnode.cnbn.org.cn:17303',
//     },
//     {
//       url: 'testnode.cnbn.org.cn:17304',
//     },
//   ],
//   default_contract: [
//     {
//       contractType: CONTRACT_TYPE.CMID,
//       contractName: 'identity',
//       remark: '身份认证合约（官方）',
//     },
//     {
//       contractType: CONTRACT_TYPE.GAS,
//       contractName: 'GAS',
//       remark: 'GAS合约（官方）',
//     },
//   ],
// };

export const CHAINMAKER_PK_TEST: Chain = {
  isOfficial: true,
  accountMode: ACCOUNT_MODE.PK,
  chainId: '32849',
  chainName: '数科链主网',
  hostName: DEFAULT_HOSTNAME,
  nodeIp: 'http://192.168.10.128:32769',
  nodeTLSCrtFile: null,
  tlsEnable: false,
  userTLSCrtFile: '',
  userTLSKeyFile: '',
  /**
   * 官方链版本信息会在添加用户时进行确定
   */
  protocol: PROTOCOL_MODE.http,
  httpSupport: true,
  version: null,
  // proxyURL: CHAIN_MAKER.proxyServerURL2,
  // browserLink: 'http://pre-explorer-main.cnbn.org.cn/chainmaker_pk/',
  browserLink: DEFAULT_BROWSER_LINK,
  rpcs: [
    {
      url: 'http://192.168.10.128:32769',
    },
    {
      url: '36.110.223.23:12392',
    },
    {
      url: '36.110.223.23:12393',
    },
    {
      url: '36.110.223.23:12394',
    },
  ],
  default_contract: [
    {
      contractType: CONTRACT_TYPE.CMID,
      contractName: 'identity',
      remark: '身份认证合约（官方）',
    },
    {
      contractType: CONTRACT_TYPE.GAS,
      contractName: 'GAS',
      remark: 'GAS合约（官方）',
    },
  ],
};

export const OFFICIAL_CHAIN_MAP: Record<OfficialChainId, Chain> = {
  // chainmaker_testnet_chain: OFFICIAL_TEST_CHAIN_CERT,
  // chainmaker_testnet_pk: OFFICIAL_TEST_CHAIN_PK,
  32849: CHAINMAKER_PK_TEST,
};

// export const DEFAULT_CHAIN = CHAINMAKER_PK_TEST; // OFFICIAL_TEST_CHAIN_PK; // CHAINMAKER_PK_TEST;
export const DEFAULT_CHAIN = CHAINMAKER_PK_TEST;
