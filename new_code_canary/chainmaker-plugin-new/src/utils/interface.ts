/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

/**
 * 区块链网络
 */

export type ChainProtocol = 'GRPC' | 'HTTP';
export interface Chain {
  // 区块链网络名称
  chainName: string;
  // 区块链ID
  chainId: string;

  // 节点IP包含端口信息
  nodeIp: string;
  /**
   * @description 是否开启TLS
   */
  tlsEnable: boolean;

  /**
   * @description TLS模式开启下需要传
   */
  userTLSKeyFile: string;

  userTLSCrtFile: string;

  /**
   * @description TLS文件本地存储路径(由于修改回显需求，本地需要存储)
   */
  userTLSKeyFilePath?: string;

  userTLSCrtFilePath?: string;

  /**
   * @description 节点TLS证书,当前该证书不需要上传
   */
  nodeTLSCrtFile: string;

  /**
   * CA模式下，需要上传CA文件，私钥文件，当前只支持CA模式，PUBLIC_KEY模式一定不支持TLS
   * 公钥账户模式下，需要上传私钥，对于链版本要求是2.1.0
   */
  accountMode: 'permissionedWithCert' | 'permissionedWithKey' | 'public';

  /**
   * @description sslTargetNameOverride 服务于tls模式 缺省是chainmaker.org
   */
  hostName: string;

  /**
   * @description 链版本
   */
  version: string;

  /**
   * 记录TLS证书托管代理所在服务地址
   */
  proxyURL?: string;

  /**
   * @description  是否支持http协议
   */
  httpSupport?: boolean;

  /**
   * @description 选择协议
   */
  protocol?: ChainProtocol;
  /**
   * @description  证书的颁发组织
   */
  TLS_Host_Name?: string;
  /**
   * @description  浏览器链接
   */
  browserLink?: string;
  /**
   * @description  是否启用gas
   */
  enableGas?: boolean;

  /**
   * @description  默认订阅合约
   */
  default_contract?: { contractName: string; contractType: ContractType; remark?: string }[];
  /**
   * @description  多节点连rpc地址列表
   */
  rpcs?: { url: string }[];
  /**
   * @description  是否官方链
   */
  isOfficial?: boolean;
}

export type Account = {
  /**
   * 账户名称，默认为userCrtFile文件名
   */
  name: string;

  /**
   * @description 读取crt文件中的名称,公钥模式则显示公钥地址
   */
  //crtName: string;

  /**
   * @description 用户签名私钥文件
   */
  userSignKeyFile: string;
  /**
   * @description 用户签名证书文件,如果是PUBLIC_KEY模式，不需要传该文件
   */
  userSignCrtFile?: string;

  /**
   * 用户公钥文件，当前不对外开放用户上传，调试模式下开放
   */
  userPublicKeyFile?: string;

  /**
   * 公钥模式没有组织ID
   */
  orgId?: string;

  /**
   * 用户地址
   */
  address?: string;

  /**
   * 是否为登录账户
   */
  isCurrent?: boolean;

  /**
   * 用户颜色，用于头像颜色和其他方面计算颜色使用
   */
  color?: string;

  /**
   * 授权过的的hosts
   */
  authHosts?: string[];

  /**
   *公钥模式确定性钱包创建的账户，属于哪个助记词
   */
  walletId?: string;

  /**
   * 公钥模式确定性钱包创建的账户，对应助记词的哪个的索引值
   */
  walletIndex?: number;
};

export type AccountRequireOnlyAddress = Partial<Account>;

export type AccountOption = Account & { selected: boolean };

export type ChainForm = Chain & {
  userTLSKeyFile: File;

  userTLSCrtFile: File;

  nodeTLSCrtFile: File;
};

export type AccountForm = Account & {
  userSignKeyFile: File;
  //userSignCrtFile: File; // ?
  userPublicKeyFile: File; // ?
  // userTLSKeyFile: File; // ?
  // userTLSCrtFile: File; // ?
};

/**
 * 用户合约
 */
export interface UserContract {
  /**
   * 合约名称
   */
  contractName: string;
  /**
   * 合约版本号
   */
  contractVersion: string;
  /**
   * 合约文件,网站接入需要传File类型，字符串类型作用为缓存文件ID
   */
  contractFile: string;

  runtimeType: string;

  /**
   * 合约参数
   */
  params: {
    [index: string]: string | number;
  };
  /**
   * 是否使用多签投票部署
   */
  MULTI_SIGN_REQ?: boolean;
  /**
   * 开启gas的链合约执行需要limit
   */
  limit?: {
    gasLimit: number;
  };
}

export type InvokeUserContract = Pick<UserContract, 'contractName' | 'params' | 'limit'> & {
  method: string;
};

/**
 * 交易记录
 */
export interface TxLog {
  txId: string;
  chainId: Chain['chainId'];
  accountName: Account['name'];
  // 交易时间，使用链交易返回的时间
  /**
   * @see TransactionInfo.AsObject.blockTimestamp
   */
  timestamp: number;
  code: number;
  // 上链日志状态
  // status: 'pending' | 'done';
  status: 'pending' | 'done' | 'failed';
  // 上链操作用户位于地址
  accountId: string;
  // 以下上链合约信息（同步交易记录时必须）
  contractName?: string;
  params?: Record<string, any>;
  method?: string;
  contractType?: 'CMNFA' | 'CMDFA' | 'ERC20' | 'ERC721' | 'ERC1155' | 'ERC404' | 'GAS' | '';

  // 新增字段
  fromAddress?: string;
  toAddress?: string;
  amount?: string;
  gasLimit?: string;
  chainName?: string;
  blockNumber?: number;
  isLoading?: boolean;
  nonce?: number;
  nodeIp?: string
}

/**
 * @description 插件设置
 */
export interface PluginSetting {
  proxyHostname: string;
  proxyHostnameTls: string;
  /**
   * @description 锁屏周期，单位分钟
   */
  lockLife: number;
}

/**
 * 钱包
 */
export interface Wallet {
  id: string;
  name: string;
  mnemonic: string;
  isCurrent?: boolean;
}
