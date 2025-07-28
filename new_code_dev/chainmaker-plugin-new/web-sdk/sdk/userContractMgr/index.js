/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";
import * as cv from "../../utils/constValue";

export default class UserContract {
  constructor(chainID, userInfo, node, callSystemContract) {
    this.chainID = chainID;
    this.userInfo = userInfo;
    this.node = node;
    this.callSystemContract = callSystemContract;
    this.commonObj = {
      chainId: this.chainID,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.CONTRACT_MANAGE),
    };
  }

  checkParam(method, contractName, contractVersion, runtimeType, contractFilePath, params) {
    switch (method) {
      case utils.sysContract.ContractManageFunction.INIT_CONTRACT:
      case utils.sysContract.ContractManageFunction.UPGRADE_CONTRACT:
        // 先做个简单的验证，后续再进行更加严格的验证
        if (method === undefined || !contractName || !contractVersion || runtimeType === undefined || !contractFilePath || params === undefined) {
          throw new Error('createUserContract: Parameter error');
        }
        if (!cv.runtimeType.includes(runtimeType)) {
          throw new Error(`runTimeType: Unsupported value: ${runtimeType}`);
        }
        if (!cv.userContractMgrMethod.includes(method)) {
          throw new Error(`method: Unsupported value: ${method}`);
        }
        break;
      case utils.sysContract.ContractManageFunction.FREEZE_CONTRACT:
      case utils.sysContract.ContractManageFunction.UNFREEZE_CONTRACT:
      case utils.sysContract.ContractManageFunction.REVOKE_CONTRACT:
        // 先做个简单的验证，后续再进行更加严格的验证
        if (method === undefined || !contractName) {
          throw new Error('createUserContract: Parameter error');
        }
        break;
      default:
        throw new Error('createUserContract: Parameter error');
    }
  }

  createContractCreatePayload({contractName, contractVersion, runtimeType, contractFilePath, params}) {
    const method = utils.sysContract.ContractManageFunction.INIT_CONTRACT;
    // this.checkParam(method, contractName, contractVersion, runtimeType, contractFilePath, params);
    return this.createUserContractPayload({
      method, contractName, contractVersion, runtimeType, contractFilePath, params,
    });
  }

  // return promise
  async createUserContract({
    contractName, contractVersion, runtimeType, contractFilePath, params, userInfoList, withSyncResult = false
  }) {
    const payload = this.createContractCreatePayload({
      contractName, contractVersion, runtimeType, contractFilePath, params,
    });
    const endorsers = await this.getEndorsements(payload, userInfoList);
    try {
      const res = await this.sendContractManageRequest(payload, endorsers, withSyncResult);
      return res;
    } catch (error) {
      // 如果创建合约请求超时，需要跳转至交易列表页面，不按照请求错误处理
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

  createContractUpgradePayload({contractName, contractVersion, runtimeType, contractFilePath, params}) {
    const method = utils.sysContract.ContractManageFunction.UPGRADE_CONTRACT;
    this.checkParam(method, contractName, contractVersion, runtimeType, contractFilePath, params);
    return this.createUserContractPayload({
      method, contractName, contractVersion, runtimeType, contractFilePath, params,
    });
  }

  // return promise
  upgradeUserContract({
    contractName, contractVersion, runtimeType, contractFilePath, params, userInfoList, withSyncResult = false,
  }) {
    const payload = this.createContractUpgradePayload({
      contractName, contractVersion, runtimeType, contractFilePath, params,
    });
    const endorsers = this.getEndorsements(payload, userInfoList);
    return this.sendContractManageRequest(payload, endorsers, withSyncResult);
  }

  createContractFreezePayload({contractName}) {
    const method = utils.sysContract.ContractManageFunction.FREEZE_CONTRACT;
    this.checkParam(method, contractName);
    return this.createUserContractPayload({
      method, contractName,
    });
  }

  // return promise
  freezeUserContract({contractName, userInfoList, withSyncResult = false}) {
    const payload = this.createContractFreezePayload({
      contractName,
    });
    const endorsers = this.getEndorsements(payload, userInfoList);
    return this.sendContractManageRequest(payload, endorsers, withSyncResult);
  }

  createContractUnfreezePayload({contractName}) {
    const method = utils.sysContract.ContractManageFunction.UNFREEZE_CONTRACT;
    this.checkParam(method, contractName);
    return this.createUserContractPayload({
      method, contractName,
    });
  }

  // return promise
  unFreezeUserContract({contractName, userInfoList, withSyncResult = false}) {
    const payload = this.createContractUnfreezePayload({
      contractName,
    });
    const endorsers = this.getEndorsements(payload, userInfoList);
    return this.sendContractManageRequest(payload, endorsers, withSyncResult);
  }

  createContractRevokePayload({contractName}) {
    const method = utils.sysContract.ContractManageFunction.REVOKE_CONTRACT;
    this.checkParam(method, contractName);
    return this.createUserContractPayload({
      method, contractName,
    });
  }

  // return promise
  revokeUserContract({contractName, userInfoList, withSyncResult = false}) {
    const payload = this.createContractRevokePayload({
      contractName,
    });
    const endorsers = this.getEndorsements(payload, userInfoList);
    return this.sendContractManageRequest(payload, endorsers, withSyncResult);
  }

  /* user contract ...
   * params: k-v
   */
  createUserContractPayload({method, contractName, contractVersion, runtimeType, contractFilePath, params}) {
    // this.checkParam(method, contractName, contractVersion, runtimeType, contractFilePath, params);

    // ContractMgmtPayload
    let contractBytesRaw;
    const parameters = Object.assign({}, params);

    parameters[cv.keys.KeyInitContractName] = contractName;
    switch (method) {
      case utils.sysContract.ContractManageFunction.INIT_CONTRACT:
      case utils.sysContract.ContractManageFunction.UPGRADE_CONTRACT:
        contractBytesRaw = contractFilePath;
        parameters[cv.keys.KeyInitContractVersion] = contractVersion;
        parameters[cv.keys.KeyInitContractRuntimeType] = runtimeType;
        parameters[cv.keys.KeyInitContractBytecode] = contractBytesRaw;
        break;
      case utils.sysContract.ContractManageFunction.FREEZE_CONTRACT:
      case utils.sysContract.ContractManageFunction.UNFREEZE_CONTRACT:
      case utils.sysContract.ContractManageFunction.REVOKE_CONTRACT:
        // Do nothing
        break;
      default:
        // Do nothing
        break;
    }
    const payload = utils.buildPayload({
      parameters, ...this.commonObj, method: utils.enum2str(utils.sysContract.ContractManageFunction, method,),
    });
    return payload;
  }

  signContractManagePayload(payload) {
    utils.newEndorsement(this.userInfo.orgID, this.userInfo.isFullCert, this.userInfo.userSignCertBytes, payload, this.userInfo.userSignKeyBytes,);
  }

  async getEndorsements(payload, userInfoList) {
    return Promise.all(userInfoList.map(userInfo => utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.authType, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes, userInfo.pkByte)));
  }

  async sendContractManageRequest(payload, endorsers, withSyncResult = false) {
    // 发送txid，等待
    try {
      const result = await this.node.sendPayload(this.userInfo, payload, false, endorsers);
      if (withSyncResult) {
        const res = await this.callSystemContract.getSyncResult(result.txId);
        result.contractResult = res;
      }
      return result;
    } catch (e) {
      throw e;
    }
  }
}
