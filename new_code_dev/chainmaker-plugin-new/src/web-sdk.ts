import { ExtensionResponse } from './event-page';

class CallSystemContract {
  chainId: string;
  accountAddress: string;
  constructor(chainId?: string, accountAddress?: string) {
    this.chainId = chainId;
    this.accountAddress = accountAddress;
  }
  getTxByTxId(txId: string) {
    return new Promise((resolve, reject) => {
      window.chainMaker.sendRequest(
        'callSDK',
        {
          body: {
            module: 'callSystemContract',
            method: 'getTxByTxId',
            paramList: [txId],
          },
          chainId: this.chainId,
          accountAddress: this.accountAddress,
          ticket: Date.now().toString(),
        },
        (res: ExtensionResponse['data']) => {
          if (res.info.code === 0) {
            resolve(res.info.result);
          } else {
            reject(res.info.message);
          }
        },
      );
    });
  }
}
class CallUserContract {
  chainId: string;
  accountAddress: string;
  constructor(chainId?: string, accountAddress?: string) {
    this.chainId = chainId;
    this.accountAddress = accountAddress;
  }
  queryContract(params: { contractName: string; method: string; params: Record<string, any> }) {
    return new Promise((resolve, reject) => {
      window.chainMaker.sendRequest(
        'callSDK',
        {
          body: {
            module: 'callUserContract',
            method: 'queryContract',
            paramList: [params],
          },
          chainId: this.chainId,
          accountAddress: this.accountAddress,
          ticket: Date.now().toString(),
        },
        (res: ExtensionResponse['data']) => {
          if (res.info.code === 0) {
            resolve(res.info.result);
          } else {
            reject(res.info.message);
          }
        },
      );
    });
  }
}
class ChainConfig {
  chainId: string;
  accountAddress: string;
  constructor(chainId?: string, accountAddress?: string) {
    this.chainId = chainId;
    this.accountAddress = accountAddress;
  }
  getChainConfig() {
    return new Promise((resolve, reject) => {
      window.chainMaker.sendRequest(
        'callSDK',
        {
          body: {
            module: 'chainConfig',
            method: 'getChainConfig',
            paramList: [],
          },
          chainId: this.chainId,
          accountAddress: this.accountAddress,
          ticket: Date.now().toString(),
        },
        (res: ExtensionResponse['data']) => {
          if (res.info.code === 0) {
            resolve(res.info.result);
          } else {
            reject(res.info.message);
          }
        },
      );
    });
  }
}

export class WebSDK {
  chainId: string;
  accountAddress: string;
  callSystemContract: CallSystemContract;
  callUserContract: CallUserContract;
  chainConfig: ChainConfig;
  constructor(chainId?: string, accountAddress?: string) {
    this.chainId = chainId;
    this.accountAddress = accountAddress;

    this.callSystemContract = new CallSystemContract(chainId, accountAddress);
    this.callUserContract = new CallUserContract(chainId, accountAddress);
    this.chainConfig = new ChainConfig(chainId, accountAddress);
  }
}
