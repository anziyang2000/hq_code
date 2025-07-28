/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";
import * as cv from "../../utils/constValue";

export default class Subscribe {
  constructor(chainID, userInfo, node) {
    this.node = node;
    this.userInfo = userInfo;
    this.chainID = chainID;
    this.commonObj = {
      chainId: this.chainID,
      txType: utils.common.TxType.SUBSCRIBE,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.SUBSCRIBE_MANAGE),
      sequence: cv.DEFAULT_SEQUENCE,
    };
  }

  subscribeBlock(startBlock, endBlock, withRwSet, onlyHeader, callBack) {
    const payload = this.constructSubscribeBlockPayload(startBlock, endBlock, withRwSet, onlyHeader);
    const response = this.subscribe(payload, utils.sysContract.SubscribeFunction.SUBSCRIBE_BLOCK, onlyHeader, callBack);
    return response;
  }

  subscribeContractEvent(topic, contractName, callBack) {
    const payloadBytes = this.constructSubscribeContractEventPayload(topic, contractName);
    const response = this.subscribe(
      payloadBytes,
      utils.sysContract.SubscribeFunction.SUBSCRIBE_CONTRACT_EVENT,
      false,
      callBack,
    );
    return response;
  }

  subscribeTx(startBlock, endBlock, contractName, txIds, callBack) {
    const payload = this.constructSubscribeTxPayload(startBlock, endBlock, contractName, txIds);
    const response = this.subscribe(payload, utils.sysContract.SubscribeFunction.SUBSCRIBE_TX, false, callBack);
    return response;
  }

  subscribe(payload, method, onlyHeader, callBack) {
    const response = this.sendSubscribe(payload);
    response.on('data', (block) => {
      switch (method) {
        case utils.sysContract.SubscribeFunction.SUBSCRIBE_BLOCK:
          if (onlyHeader) callBack(utils.common.BlockHeader.deserializeBinary(block.getData()).toObject(), null);
          else callBack(utils.common.BlockInfo.deserializeBinary(block.getData()).toObject(), null);
          break;
        case utils.sysContract.SubscribeFunction.SUBSCRIBE_CONTRACT_EVENT:
          callBack(utils.common.ContractEventInfoList.deserializeBinary(block.getData()).toObject(), null);
          break;
        case utils.sysContract.SubscribeFunction.SUBSCRIBE_TX:
          callBack(utils.common.ContractEventInfo.deserializeBinary(block.getData()).toObject(), null);
          break;
        default:
          throw new Error(`[txType] ${method} unsupported`);
      }
    });
    response.on('error', (error) => {
      callBack(null, error);
    });
    response.on('end', () => {
      console.log('connection end');
    });
    return response;
  }

  constructSubscribeBlockPayload(startBlock, endBlock, withRwSet, onlyHeader) {
    const parameters = {};
    parameters[cv.keys.KeySubStrartBlock] = utils.uint64ToBuffer(startBlock);
    parameters[cv.keys.KeySubEndBlock] = utils.uint64ToBuffer(endBlock);
    parameters[cv.keys.KeySubWithRwset] = withRwSet;
    parameters[cv.keys.KeySubOnlyHeader] = onlyHeader;

    return utils.buildPayload({
      parameters,
      ...this.commonObj,
      method: utils.enum2str(
        utils.sysContract.SubscribeFunction,
        utils.sysContract.SubscribeFunction.SUBSCRIBE_BLOCK,
      ),
    });
  }

  constructSubscribeContractEventPayload(topic, contractName) {
    const parameters = {};
    parameters[cv.keys.KeySubContractName] = contractName;
    parameters[cv.keys.KeySubTopic] = topic;

    return utils.buildPayload({
      parameters,
      ...this.commonObj,
      method: utils.enum2str(
        utils.sysContract.SubscribeFunction,
        utils.sysContract.SubscribeFunction.SUBSCRIBE_CONTRACT_EVENT,
      ),
    });
  }

  constructSubscribeTxPayload(startBlock, endBlock, contractName, txIds) {
    const parameters = {};
    parameters[cv.keys.KeySubStrartBlock] = utils.uint64ToBuffer(startBlock);
    parameters[cv.keys.KeySubEndBlock] = utils.uint64ToBuffer(endBlock);
    parameters[cv.keys.KeySubContractName] = contractName ? contractName : '';
    parameters[cv.keys.KeySubTxIds] = txIds ? txIds : '';

    return utils.buildPayload({
      parameters,
      ...this.commonObj,
      method: utils.enum2str(
        utils.sysContract.SubscribeFunction,
        utils.sysContract.SubscribeFunction.SUBSCRIBE_TX,
      ),
    });
  }

  sendSubscribe(payload) {
    const request = utils.newRequest(
      this.userInfo.orgID,
      this.userInfo.userSignCertBytes,
      this.userInfo.isFullCert,
      payload,
      this.userInfo.userSignKeyBytes,
    );
    return this.node.subscribe(request);
  }
}
