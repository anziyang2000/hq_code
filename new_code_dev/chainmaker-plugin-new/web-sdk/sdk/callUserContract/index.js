/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";

class CallUserContract {
  constructor(chainID, userInfo, node, callSystemContract) {
    this.chainID = chainID;
    this.userInfo = userInfo;
    this.node = node;
    this.callSystemContract = callSystemContract;
    this.commonObj = {
      chainId: this.chainID,
    };
  }

  // return promise
  async invokeUserContract({contractName, method, params, withSyncResult = false}) {
    const payload = utils.buildPayload({
      contractName,
      method,
      ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      parameters: params,
    });
    try {
       return await this.sendContractRequest(payload, [], withSyncResult);
    } catch (error) {
      console.debug("invokeUserContract error", error)
      // 如果执行合约请求超时，需要跳转至交易列表页面，不按照请求错误处理
      if(error.message==="REQUEST_TIMEOUT"){
        return {
          txId:payload.getTxId(),
          contractResult:"REQUEST_TIMEOUT"
        }
      } else {
        throw error;
      }
    }
  }

  // return promise
  queryContract({contractName, method, params}) {
    const payload = utils.buildPayload({
      contractName,
      method,
      ...this.commonObj,
      txType: utils.common.TxType.QUERY_CONTRACT,
      parameters: params,
    });
    return this.sendContractRequest(payload);
  }

  // return promise
  async sendContractRequest(payload, endorsers = [], withSyncResult = false) {
    const result = await this.node.sendPayload(
      this.userInfo,
      payload,
      false,
      endorsers,
    );
    if (withSyncResult) {
      const res = await this.callSystemContract.getSyncResult(result.txId);
      result.contractResult = res;
      return result;
    }
    return result;
  }

  getTxRequest(contractName, method, params, endorsers = []) {
    const payload = utils.buildPayload({
      contractName,
      method,
      ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      parameters: params,
    });
    const request = utils.newRequest(
      this.userInfo.orgID,
      this.userInfo.userSignCertBytes,
      this.userInfo.isFullCert,
      this.userInfo.authType,
      payload,
      this.userInfo.userSignKeyBytes,
      this.userInfo.pkByte,
      endorsers,
    );
    return {request, txId: payload.getTxId()};
  }

  async sendTxRequest(request, txId, withSyncResult = false) {
    const result = await this.node.sendRequest(request);
    if (withSyncResult) {
      const res = await this.callSystemContract.getSyncResult(txId);
      result.contractResult = res;
      return result;
    }
    return result;
  }
}

export default CallUserContract;
