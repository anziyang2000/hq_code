export const chainFieldsLableMap = {
  chainName: '区块链网络名称',
  chainId: '区块链ID',
  nodeIp: '节点RPC服务地址',
  // protocol: '链通信协议',
  // accountMode: '账户模式',
  // tlsEnable: '是否开启TLS',
  // hostName: 'TLS_Host_Name',
  browserLink: '区块链浏览器链接',
};

export const accountFieldsLableMap = {
  name: '账户备注名',
  orgId: '账户所在组织ID',
  address: '账户地址',
};

// export const accountModeShortMap = {
//     "permissionedWithCert":"Cert",
//     "permissionedWithKey":"PWK",
//     "public":"PK"
// }
// eslint-disable-next-line @typescript-eslint/naming-convention
export const expiredProxyServerURL = 'https://proxy.chainmaker.org.cn:9080';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const expiredProxyServerURL2 = 'https://proxy.chainmaker.org.cn:9081';

export const ACCOUNT_MODE: Record<string, 'permissionedWithCert' | 'public'> = {
  CERT: 'permissionedWithCert',
  PK: 'public',
  // 暂不支持pwk permissionedWithKey
};

export const PROTOCOL_MODE: Record<string, 'HTTP' | 'GRPC'> = {
  http: 'HTTP',
  Grpc: 'GRPC',
  // 暂不支持pwk permissionedWithKey
};

export const DEFAULT_MAINNET_RPC = 'http://192.168.10.128:32769';

export const DEFAULT_HOSTNAME = 'chainmaker.org';
export const DEFAULT_BROWSER_LINK = 'http://192.168.10.126:4000/';
export const DEFAULT_PK_CHAIN_BROWSER_LINK = 'http://scan-testnetpk.chainmakernet.com/';
export const getBrowserTransactionLink = ({
  browserLink,
  chainId,
  txId,
}: {
  chainId: string;
  txId: string;
  browserLink: string;
}) => {
  const arr = browserLink.split('/');
  const last = arr[arr.length - 1];
  if (last) {
    return last === chainId ? `${browserLink}/transaction/${txId}` : `${browserLink}/${chainId}/transaction/${txId}`;
  }
  return arr[arr.length - 2] === chainId
    ? `${browserLink}transaction/${txId}`
    : `${browserLink}${chainId}/transaction/${txId}`;
};
