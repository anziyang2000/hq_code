/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { CreateUserContractRequest, InvokeUserContractRequest } from './event-page';
import { WebSDK } from './web-sdk';

interface SDKRequestParams {
  module: string;
  method: string;
  paramList: any[];
  callback?: () => void;
}

interface SDKResponse {
  module: string;
  method: string;
}
declare global {
  /**
   * 注入网页的插件SDK，使用window.chainMakerSdk进行调用
   * 注意：所有交易方法都不没有返回信息，需要使用window.addEventListener("message")进行消息监听
   */

  interface Window {
    chainMaker: {
      version: string;
      createUserContract: (req: CreateUserContractRequest) => void;
      invokeUserContract: (req: InvokeUserContractRequest) => void;
      sendRequest: (operation: string, body?: any, callback?: (res: unknown) => void) => void;
      getWebSDK: (chainId?: string, accountAddress?: string) => WebSDK;
      /**
       * 开启debug功能，比如解锁测试链不可删除功能
       * @param debug
       */
      debug: boolean;
      onLoad?: () => void;
      on?: (event: string, cb: (data: any) => void) => void;
      once?: (event: string, cb: (data: any) => void) => void;
      off?: (event: string, cb: (data: any) => void) => void;
      event_list: any;
      emit: (event: string, data?: any) => void;
    };
  }

  /**
   * @description 具体配置值见Package.json
   */
  const CHAIN_MAKER: {
    /**
     * 产品使用说明
     */
    userGuideURL: string;
    /**
     * 帮助文档
     */
    helpMeURL: string;
    proxyRepoURL: string;
    proxyServerURL: string;
    /**
     * TLS节点代理地址
     */
    proxyServerURL2: string;
  };

  /**
   * 是否是生产打包
   */
  const PROD: boolean;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const BeaconAction: any;
}
