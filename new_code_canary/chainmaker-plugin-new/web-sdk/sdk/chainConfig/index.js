/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";

import * as cv from "../../utils/constValue";

class ChainConfig {
  constructor(chainID, userInfo, node) {
    this.chainID = chainID;
    this.userInfo = userInfo;
    this.node = node;
    this.commonObj = {
      chainId: this.chainID,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.CHAIN_CONFIG),
    };
  }

  // return promise
  async getChainConfig() {
    const payload = utils.buildPayload({
      ...this.commonObj,
      txType: utils.common.TxType.QUERY_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.GET_CHAIN_CONFIG,),
      sequence: cv.DEFAULT_SEQUENCE,
    });
    let response = await this.sendPayload(payload, [], cv.NEED_SRC_RESPONSE,);
    response = utils.config.ChainConfig.deserializeBinary(response).toObject();
    return response;
  }

  // return promise
  async getChainConfigSequence() {
    const response = await this.getChainConfig();
    return response.sequence;
  }

  // return promise
  async getChainConfigByBlockHeight(blockHeight) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractBlockHeight] = blockHeight;
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.QUERY_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.GET_CHAIN_CONFIG_AT,),
      sequence: cv.DEFAULT_SEQUENCE,
    });
    let response = await this.sendPayload(payload, [], cv.NEED_SRC_RESPONSE,);
    response = utils.config.ChainConfig.deserializeBinary(response).toObject();
    return response;
  }

  async createChainConfigBlockUpdatePayload({
    txTimestampVerify, txTimeout = -1, blockTxCapacity = -1, blockSize = -1, blockInterval = -1,
  }) {
    const parameters = {};
    if (txTimeout !== -1 && txTimeout < 600) {
      throw new Error('[tx_timeout] should be [600, +∞)');
    } else {
      parameters[cv.keys.KeyTxTimeOut] = `${txTimeout}`;
    }

    if (txTimestampVerify !== undefined) {
      parameters[cv.keys.KeyTxTimestampVerify] = txTimestampVerify;
    }

    if (blockTxCapacity !== -1 && blockTxCapacity < 1) {
      throw new Error('[block_tx_capacity] should be (0, +∞]');
    } else {
      parameters[cv.keys.KeyBlockTxCapacity] = `${blockTxCapacity}`;
    }

    if (blockSize !== -1 && blockSize < 1) {
      throw new Error('[block_size] should be (0, +∞]');
    } else {
      parameters[cv.keys.KeyBlockSize] = `${blockSize}`;
    }

    if (blockInterval !== -1 && blockInterval < 10) {
      throw new Error('[block_interval] should be [10, +∞]');
    } else {
      parameters[cv.keys.KeyBlockInterval] = `${blockInterval}`;
    }

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.BLOCK_UPDATE),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  // return promise
  async chainConfigBlockUpdate({
    txTimestampVerify, txTimeout = -1, blockTxCapacity = -1, blockSize = -1, blockInterval = -1, userInfoList,
  }) {
    const payload = await this.createChainConfigBlockUpdatePayload({
      txTimestampVerify, txTimeout, blockTxCapacity, blockSize, blockInterval,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async ceateChainConfigCoreUpdatePayload({
    txSchedulerTimeout = -1, txSchedulerValidateTimeout = -1,
  }) {
    const parameters = {};
    if (txSchedulerTimeout !== -1 && txSchedulerTimeout > 0 && txSchedulerTimeout <= 60) {
      parameters[cv.keys.KeyTxSchedulerTimeout] = `${txSchedulerTimeout}`;
    } else {
      throw new Error('[tx_scheduler_timeout] should be [0, 60]');
    }

    if (txSchedulerValidateTimeout !== -1 && txSchedulerValidateTimeout > 0 && txSchedulerValidateTimeout <= 60) {
      parameters[cv.keys.KeyTxSchedulerValidateTimeout] = `${txSchedulerValidateTimeout}`;
    } else {
      throw new Error('[tx_scheduler_validate_timeout] should be [0, 60]');
    }

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.CORE_UPDATE),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  // return Promise
  async chainConfigCoreUpdate({
    txSchedulerTimeout = -1, txSchedulerValidateTimeout = -1, userInfoList,
  }) {
    const payload = await this.ceateChainConfigCoreUpdatePayload({
      txSchedulerTimeout, txSchedulerValidateTimeout,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigTrustRootAddPayload({orgId, roots}) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractRoot] = roots.join(',');
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.TRUST_ROOT_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigTrustRootAdd({
    orgId, roots, userInfoList,
  }) {
    const payload = await this.createChainConfigTrustRootAddPayload({
      orgId, roots,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigTrustRootUpdatePayload({orgId, roots}) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractRoot] = roots.join(',');
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.TRUST_ROOT_UPDATE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigTrustRootUpdate({
    orgId, roots, userInfoList,
  }) {
    const payload = await this.createChainConfigTrustRootUpdatePayload({
      orgId, roots,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigTrustMemberAddPayload({
    trustMemberOrgId, trustMemberNodeId, trustMemberRole, trustMemberInfo,
  }) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractTrustMemberOrgId] = trustMemberOrgId;
    parameters[cv.keys.KeyChainConfigContractTrustMemberNodeId] = trustMemberNodeId;
    parameters[cv.keys.KeyChainConfigContractTrustMemberRole] = trustMemberRole;
    parameters[cv.keys.KeyChainConfigContractTrustMemberInfo] = trustMemberInfo;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.TRUST_MEMBER_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigTrustMemberAdd({
    trustMemberOrgId, trustMemberNodeId, trustMemberRole, trustMemberInfo, userInfoList = [],
  }) {
    const payload = await this.createChainConfigTrustMemberAddPayload({
      trustMemberOrgId, trustMemberNodeId, trustMemberRole, trustMemberInfo,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigTrustMemberDeletePayload(trustMemberInfo) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractTrustMemberInfo] = trustMemberInfo;
    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.TRUST_MEMBER_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigTrustMemberDelete({
    trustMemberInfo, userInfoList = [],
  }) {
    const payload = await this.createChainConfigTrustMemberAddPayload({
      trustMemberInfo,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigTrustRootDeletePayload({orgId}) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.TRUST_ROOT_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigTrustRootDelete({orgId, userInfoList}) {
    const payload = await this.createChainConfigTrustRootDeletePayload({
      orgId,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  // policyConfig: {rule: "", orgList: [""], roleList: [""]}
  async createChainConfigPermissionAddPayload({permissionResourceName, rule, orgList = [], roleList = []}) {
    const policy = new utils.accesscontrol.Policy();
    policy.setRule(rule);
    if (orgList.length) policy.setOrgListList(orgList);
    if (roleList.length) policy.setRoleListList(roleList);
    const parameters = {};
    parameters[permissionResourceName] = policy.serializeBinary();

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.PERMISSION_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigPermissionAdd({permissionResourceName, rule, orgList, roleList, userInfoList}) {
    const payload = await this.createChainConfigPermissionAddPayload({
      permissionResourceName, rule, orgList, roleList,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  // policyConfig: {rule: "", orgList: [""], roleList: [""]}
  async createChainConfigPermissionUpdatePayload({permissionResourceName, rule, orgList, roleList}) {
    const policy = new utils.accesscontrol.Policy();
    policy.setRule(rule);
    if (orgList.length) policy.setOrgListList(orgList);
    if (roleList.length) policy.setRoleListList(roleList);
    const parameters = {};
    parameters[permissionResourceName] = policy.serializeBinary();

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.PERMISSION_UPDATE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigPermissionUpdate({permissionResourceName, rule, orgList, roleList, userInfoList}) {
    const payload = await this.createChainConfigPermissionUpdatePayload({
      permissionResourceName, rule, orgList, roleList,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigPermissionDeletePayload({permissionResourceName}) {
    const policy = new utils.accesscontrol.Policy();
    const parameters = {};
    parameters[permissionResourceName] = policy.serializeBinary();

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.PERMISSION_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigPermissionDelete({permissionResourceName, userInfoList}) {
    const payload = await this.createChainConfigPermissionDeletePayload({
      permissionResourceName,
    });
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  // nodeIds: ['']
  async createChainConfigConsensusNodeIdAddPayload(orgId, nodeIds) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;
    parameters[cv.keys.KeyChainConfigContractNodeIds] = nodeIds;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ID_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeIdAdd(orgId, nodeIds, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeIdAddPayload(orgId, nodeIds);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusNodeIdUpdatePayload(orgId, nodeId, newNodeId) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;
    parameters[cv.keys.KeyChainConfigContractNodeId] = nodeId;
    parameters[cv.keys.KeyChainConfigContractNewNodeId] = newNodeId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ID_UPDATE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeIdUpdate(orgId, nodeId, newNodeId, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeIdUpdatePayload(orgId, nodeId, newNodeId);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusNodeIdDeletePayload(orgId, nodeId) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;
    parameters[cv.keys.KeyChainConfigContractNodeId] = nodeId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ID_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeIdDelete(orgId, nodeId, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeIdDeletePayload(orgId, nodeId);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  // nodeIds: ['']
  async createChainConfigConsensusNodeOrgAddPayload(orgId, nodeIds) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;
    parameters[cv.keys.KeyChainConfigContractNodeIds] = nodeIds;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ORG_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeOrgAdd(orgId, nodeIds, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeOrgAddPayload(orgId, nodeIds);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusNodeOrgUpdatePayload(orgId, nodeIds) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;
    parameters[cv.keys.KeyChainConfigContractNodeIds] = nodeIds;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ORG_UPDATE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeOrgUpdate(orgId, nodeIds, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeOrgUpdatePayload(orgId, nodeIds);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusNodeOrgDeletePayload(orgId) {
    const parameters = {};
    parameters[cv.keys.KeyChainConfigContractOrgId] = orgId;

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.NODE_ORG_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusNodeOrgDelete(orgId, userInfoList) {
    const payload = await this.createChainConfigConsensusNodeOrgDeletePayload(orgId);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusExtAddPayload(kvs) {
    return utils.buildPayload({
      ...this.commonObj,
      parameters: kvs,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.CONSENSUS_EXT_ADD,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusExtAdd(kvs, userInfoList) {
    const payload = await this.createChainConfigConsensusExtAddPayload(kvs);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  // obj: {} key:src key value: new key
  async createChainConfigConsensusExtUpdatePayload(kvs) {
    return utils.buildPayload({
      ...this.commonObj,
      parameters: kvs,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.CONSENSUS_EXT_UPDATE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusExtUpdate(kvs, userInfoList) {
    const payload = await this.createChainConfigConsensusExtUpdatePayload(kvs);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  async createChainConfigConsensusExtDeletePayload(keys) {
    const parameters = {};
    for (let i = 0; i < keys.length; i++) {
      parameters[keys[i]] = '';
    }

    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.ChainConfigFunction, utils.sysContract.ChainConfigFunction.CONSENSUS_EXT_DELETE,),
      sequence: await this.getChainConfigSequence() + 1,
    });
  }

  async chainConfigConsensusExtDelete(keys, userInfoList) {
    const payload = await this.createChainConfigConsensusExtDeletePayload(keys);
    const response = this.signAndSendRequest(payload, userInfoList);
    return response;
  }

  signChainConfigPayload(payload, userInfo) {
    return utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,);
  }

  // userInfoList: class orgInfo list
  signSystemContractPayload(payload, userInfoList) {
    const endorsers = [];
    userInfoList.forEach((userInfo) => {
      endorsers.push(utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,));
    });
    return endorsers;
  }

  // return promise
  async sendPayload(payload, endorsers, srcRes = false) {
    return this.node.sendPayload(this.userInfo, payload, srcRes, endorsers);
  }

  sendChainConfigUpdateRequest(payload, endorsers) {
    return this.sendPayload(payload, endorsers,);
  }

  signAndSendRequest(payload, userInfoList) {
    const endorsers = this.signSystemContractPayload(payload, userInfoList);
    return this.sendPayload(payload, endorsers,);
  }
}

export default ChainConfig;
