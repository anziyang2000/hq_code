/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from '../utils';
import { sendHttpsRequest } from './httpRequest';
const logger = utils.createLogger('node');
export default class Node {
  constructor(nodeConfigArray, requestTimeout, additionalSetting) {
    logger.debug(`Create node pool: ${JSON.stringify(nodeConfigArray, null, 4)}`);
    // 单次请求如果超过requestTimeout，则前端提示超时
    if (!requestTimeout) this.requestTimeout = 30000;
    else this.requestTimeout = requestTimeout;
    this.client = {};
    nodeConfigArray.forEach((config) => {
      const { nodeAddr, tlsEnable, options } = config; // 49.232.86.161:12302
      if (typeof nodeAddr !== 'string') throw new Error('[nodeAddr] must be a string');

      const grpcOption = {
        'grpc.max_send_message_length': -1,
        'grpc.max_receive_message_length': -1,
        'grpc.max_reconnect_backoff_ms': 1024,
      };
      if (tlsEnable) {
        const { ['hostName']: sslTargetNameOverride } = options;
        if (sslTargetNameOverride) {
          grpcOption['grpc.ssl_target_name_override'] = sslTargetNameOverride;
          grpcOption['grpc.default_authority'] = sslTargetNameOverride;
        }
      }
      this.client[nodeAddr] = new utils.api.RpcNodePromiseClient(nodeAddr, null, grpcOption);
    });
    this.clientArray = Object.values(this.client);
    this.addrArray = Object.keys(this.client);
    this.clientNum = this.addrArray.length;
    this.clientIndex = 0;
    this.nodeConfigArray = nodeConfigArray;
    this.proxy_hostname = additionalSetting.proxyHostname;
    this.proxy_hostname_tls = additionalSetting.proxyHostnameTls;
  }

  // 暂时先轮着用
  getClient(nodeAddr) {
    if (nodeAddr) return this.client[nodeAddr];
    const client = this.clientArray[this.clientIndex];
    if (this.clientIndex + 1 >= this.clientNum) this.clientIndex = 0;
    else this.clientIndex += 1;
    return client;
  }

  /**
   * code为0代表成功
   * 请求地址切换到代理服务器
   */
  async sendRequest(request, srcRes = false, nodeAddr) {
    logger.debug(`sendRequest: `, request.toObject());
    const nodeConfig = this.nodeConfigArray[this.clientIndex];
    const client = this.getClient(nodeAddr);
    const meta = {
      'X-Grpc-node': nodeConfig.nodeAddr,
      ...(nodeConfig.tlsEnable
        ? {
            'X-Grpc-ssl-cert': nodeConfig.certFileName,
            'X-Grpc-ssl-cert-key': nodeConfig.certKeyFileName,
            'X-Grpc-ssl_target_name_override': nodeConfig.options.hostName,
            'X-Grpc-ssl-target-name': nodeConfig.options.hostName,
          }
        : {}),
    };
    let sendRequest;
    const { httpSupport } = nodeConfig;
    if (httpSupport) {
      meta.url = `http${nodeConfig.tlsEnable ? 's' : ''}://${nodeConfig.nodeAddr}/v1/sendrequest`;
      sendRequest = sendHttpsRequest;
    } else {
      client.hostname_ = nodeConfig.tlsEnable ? this.proxy_hostname_tls : this.proxy_hostname;
      sendRequest = client.sendRequest.bind(client);
    }
    return new Promise((resolve, reject) => {
      const sendTimeout = setTimeout(() => {
        clearTimeout(sendTimeout);
        return reject(new Error('REQUEST_TIMEOUT'));
      }, this.requestTimeout);

      sendRequest(request, meta)
        .then((response) => {
          clearTimeout(sendTimeout);
          if (httpSupport) {
            logger.debug('debug get sendRequest response:', response);
            if (response.code !== 0) {
              reject(response);
              return;
            }
            if (srcRes && response.contractResult && response.contractResult.result) {
              resolve(response.contractResult.result);
            } else {
              resolve(response);
            }
          } else {
            const res = response.toObject();
            logger.debug('debug get sendRequest response:', res);

            if (response.getCode() !== 0) {
              reject(response);
              return;
            }
            if (srcRes) {
              if (response.getContractResult() && response.getContractResult().getResult()) {
                resolve(response.getContractResult().getResult());
                // result.txId
                return;
              }
            }
            resolve(res);
          }
        })
        .catch((err) => {
          const errorInfo = `call sendRequest error: ${err}`;
          reject(errorInfo);
        });
    });
  }

  async sendPayload(userInfo, payload, srcRes = false, endorsements = [], nodeAddr) {
    const request = await utils.newRequest(
      userInfo.orgID,
      userInfo.userSignCertBytes,
      userInfo.isFullCert,
      userInfo.authType,
      payload,
      userInfo.userSignKeyBytes,
      userInfo.pkByte,
      endorsements,
    );
    return await this.sendRequest(request, srcRes, nodeAddr);
  }

  subscribe(request) {
    logger.debug(`subscribe: ${request}`);
    const response = this.getClient().subscribe(request);
    return response;
  }

  close() {
    this.clientArray.forEach((client) => {
      client.close();
    });
  }
}
