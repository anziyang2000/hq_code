/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";

import * as cv from "../../utils/constValue";
import {delay} from "../../glue";
import {GasAccountFunction} from "../../grpc-web/syscontract/account_manager_pb"
class CallSystemContract {
  constructor(chainID, userInfo, node) {
    this.node = node;
    this.userInfo = userInfo;
    this.chainID = chainID;
    this.commonObj = {
      chainId: this.chainID,
      txType: utils.common.TxType.QUERY_CONTRACT,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.CHAIN_QUERY),
      sequence: cv.DEFAULT_SEQUENCE,
    };
  }
  
  // 系统合约查询

  // return promise
  async getTxByTxId(txId) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractTxId] = txId;
    const payload = utils.buildPayload({
      parameters:{
        ...parameters,
        "truncateValueLen":"10000",
        "truncateModel":"truncate"
      }, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_TX_BY_TX_ID,),
    });
    let response = await this.sendSystemContractPayload(payload, true);
    response = utils.common.TransactionInfo.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getBlockByHeight(blockHeight, withRWSet) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractBlockHeight] = blockHeight;
    parameters[cv.keys.KeyBlockContractWithRWSet] = withRWSet;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_BY_HEIGHT,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getFullBlockByHeight(blockHeight) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractBlockHeight] = blockHeight;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_FULL_BLOCK_BY_HEIGHT,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getBlockByHash(blockHash, withRWSet) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractBlockHash] = Uint8Array.from(blockHash).toString('hex');
    parameters[cv.keys.KeyBlockContractWithRWSet] = withRWSet;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_BY_HASH,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  async getLastBlock(withRWSet) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractWithRWSet] = withRWSet;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_LAST_BLOCK,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  async getBlockHeaderByHeight(blockHeight) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractBlockHeight] = blockHeight;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_HEADER_BY_HEIGHT,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockHeader.deserializeBinary(response).toObject();
    return response;
  }

  async getCurrentBlockHeight() {
    const block = await this.getLastBlock(false);
    return block.block.header.blockHeight;
  }

  getArchivedBlockHeight() {
    return this.getBlockHeight({});
  }

  getBlockHeightByTxId(txId) {
    return this.getBlockHeight({txId});
  }

  getBlockHeightByHash(blockHash) {
    const convertBlockHash = Uint8Array.from(blockHash).toString('hex');
    return this.getBlockHeight({blockHash: convertBlockHash});
  }

  async getBlockHeight({txId, blockHash}) {
    let method;
    const parameters = {};
    if (txId) {
      method = utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_HEIGHT_BY_TX_ID,);
      parameters[cv.keys.KeyBlockContractTxId] = txId;
    } else if (blockHash) {
      method = utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_HEIGHT_BY_HASH,);
      parameters[cv.keys.KeyBlockContractBlockHash] = blockHash;
    } else {
      method = utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_ARCHIVED_BLOCK_HEIGHT,);
    }
    const payload = utils.buildPayload({
      parameters, method, ...this.commonObj,
    });
    const response = await this.sendSystemContractPayload(payload);
    return response;
  }

  // return promise
  async getBlockByTxId(txId, withRWSet) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractTxId] = txId;
    parameters[cv.keys.KeyBlockContractWithRWSet] = withRWSet;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_BLOCK_BY_TX_ID,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getLastConfigBlock(withRWSet) {
    const parameters = {};
    parameters[cv.keys.KeyBlockContractWithRWSet] = withRWSet;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_LAST_CONFIG_BLOCK,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.common.BlockInfo.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getNodeChainList(nodeAddr) {
    if (this.node.client[nodeAddr]) {
      const payload = utils.buildPayload({ 
        parameters: {}, ...this.commonObj,
        method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_NODE_CHAIN_LIST,),
      });
      let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE, nodeAddr);
      response = utils.discovery.ChainList.deserializeBinary(response).toObject();
      return response;
    }
    throw new Error(`no such node: ${nodeAddr}`);
  }

  // return promise
  async getChainInfo() {
    const payload = utils.buildPayload({
      parameters: {}, ...this.commonObj,
      method: utils.enum2str(utils.sysContract.ChainQueryFunction, utils.sysContract.ChainQueryFunction.GET_CHAIN_INFO,),
    });
    let response = await this.sendSystemContractPayload(payload, cv.NEED_SRC_RESPONSE);
    response = utils.discovery.ChainInfo.deserializeBinary(response).toObject();
    return response;
  }


  async gasAccountGas(address) {
    const payload = utils.buildPayload({
      parameters: {
        address_key:address
      },
      ...this.commonObj,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.ACCOUNT_MANAGER),
      method: utils.enum2str(GasAccountFunction, GasAccountFunction.GET_BALANCE),
    });
    return await this.sendSystemContractPayload(payload);
  }

  //GasAccountFunction

  // return promise
  async sendSystemContractPayload(payload, srcRes = false, nodeAddr) {
    return await this.node.sendPayload(this.userInfo, payload, srcRes, [], nodeAddr,);
  }

  // async getSyncResult(txId) {
      //return await new Promise(async (resolve) => {
      // const {requestTimeout} = this.node;
      // let count = requestTimeout / 100;
      // const interval = setInterval(async () => {
      //   let tx;
      //   try {
      //     tx = await this.getTxByTxId(txId);
      //   } catch {
      //   } 
      //   if (tx && tx.transaction && tx.transaction.result && tx.transaction.result.contractResult) {
      //     console.log(`getSyncResult success，txId：${txId}，tx：`, tx);
      //     clearInterval(interval);
      //     resolve(tx);
      //   }
      //   if (count === 0) {
      //     clearInterval(interval);
      //     console.log(`getSyncResult timeout,txId:${txId}，tx：`, tx);
      //     resolve('error');
      //   }
      //   count -= 1;
      // }, 500);
   // });
  //}
  async getSyncResult(txId, options={}){
    
    const {outTime, minInterval, startTime, tryNumber} = Object.assign({
      minInterval:2000, 
      startTime: Date.now(),
      outTime: this.node.requestTimeout || 10000,
      tryNumber:1
    }, options)
 
    try {
      const  tx = await this.getTxByTxId(txId);
      if (tx?.transaction?.result?.contractResult) {
        console.debug(`getSyncResult success，txId：${txId}，tx：`, tx);
        return tx
      }else {
        throw new Error("交易未完成")
      }
    } catch (e) {
      const useTime = Date.now()-startTime
      if(useTime>=outTime) {
        // 超时
        console.warn(`getSyncResult timeout,txId:${txId}，err：`, e);
        return "TIME_OUT"
      }
      if(useTime<minInterval*tryNumber){
        await new Promise((res) => setTimeout(res, minInterval*tryNumber-useTime))
      }
      return await this.getSyncResult(txId, {startTime, outTime, minInterval, tryNumber:tryNumber+1})
    }

  }
}



export default CallSystemContract;
