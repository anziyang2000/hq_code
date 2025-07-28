/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import utils from "../../utils";

import * as cv from "../../utils/constValue";

class CertMgr {
  constructor(chainConfig, callSystemContract, chainID, userInfo, node) {
    this.chainConfig = chainConfig;
    this.node = node;
    this.userInfo = userInfo;
    this.chainID = chainID;
    this.callSystemContract = callSystemContract;
    this.commonObj = {
      chainId: this.chainID,
      contractName: utils.enum2str(utils.sysContract.SystemContract, utils.sysContract.SystemContract.CERT_MANAGE),
      sequence: cv.DEFAULT_SEQUENCE,
    };
  }

  async getCertHash() {
    const chainConfig = await this.chainConfig.getChainConfig();
    const hashType = chainConfig.crypto.hash;

    return utils.getCertHash(this.userInfo.userSignCertBytes, hashType);
  }

  async addCert(withSyncResult) {
    const certHash = await this.getCertHash();
    const payload = await this.createCertManagePayload(utils.sysContract.CertManageFunction.CERT_ADD, {},);
    const response = await this.sendPayload(payload, false, withSyncResult);
    response.ContractResult = {
      Code: cv.SUCCESS, Message: `${cv.SUCCESS}`, Result: certHash,
    };
    return response;
  }

  async queryCert(certHashes) {
    if (!Array.isArray(certHashes)) throw new Error('[certHashes] mast be array');
    const parameters = {};
    parameters[cv.keys.KeyCertHashes] = certHashes.join(',');
    const payload = utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.QUERY_CONTRACT,
      method: utils.enum2str(utils.sysContract.CertManageFunction, utils.sysContract.CertManageFunction.CERTS_QUERY,),
    });
    let response = await this.sendPayload(payload, true);
    response = utils.common.CertInfos.deserializeBinary(response).toObject();
    return response;
  }

  async deleteCert(certHashes, userInfoList, withSyncResult = false) {
    if (!Array.isArray(certHashes)) throw new Error('[certHashes] mast be array');
    const parameters = {};
    parameters[cv.keys.KeyCertHashes] = certHashes.join(',');
    const payload = await this.createCertManagePayload(utils.sysContract.CertManageFunction.CERTS_DELETE, parameters,);
    const endorsers = [];
    userInfoList.forEach((userInfo) => {
      endorsers.push(utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,));
    });
    const response = await this.sendPayload(payload, false, withSyncResult, endorsers);

    response.ContractResult = {
      Code: cv.SUCCESS, Message: `${cv.SUCCESS}`,
    };
    return response;
  }

  async createCertManagePayload(method, parameters) {
    return utils.buildPayload({
      parameters, ...this.commonObj,
      txType: utils.common.TxType.INVOKE_CONTRACT,
      method: utils.enum2str(utils.sysContract.CertManageFunction, method,),
    });
  }

  createCertManageFrozenPayload(certs) {
    const param = {};
    param[cv.keys.KeyCerts] = certs.join(',');
    return this.createCertManagePayload(utils.sysContract.CertManageFunction.CERTS_FREEZE, param,);
  }

  async certManageFrozen(certs, userInfoList, withSyncResult = false) {
    const payload = await this.createCertManageFrozenPayload(certs);
    const endorsers = [];
    userInfoList.forEach((userInfo) => {
      endorsers.push(utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,));
    });
    return this.sendCertManageRequest(payload, false, withSyncResult, endorsers);
  }

  createCertManageUnfrozenPayload(certs) {
    const param = {};
    param[cv.keys.KeyCerts] = certs.join(',');
    return this.createCertManagePayload(utils.sysContract.CertManageFunction.CERTS_UNFREEZE, param,);
  }

  async certManageUnfrozen(certs, userInfoList, withSyncResult = false) {
    const payload = await this.createCertManageUnfrozenPayload(certs);
    const endorsers = [];
    userInfoList.forEach((userInfo) => {
      endorsers.push(utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,));
    });
    return this.sendCertManageRequest(payload, false, withSyncResult, endorsers);
  }

  createCertManageRevocationPayload(certCrl) {
    const param = {};
    param[cv.keys.KeyCertCrl] = certCrl;
    return this.createCertManagePayload(utils.sysContract.CertManageFunction.CERTS_REVOKE, param,);
  }

  async certManageRevoke(certCrl, userInfoList, withSyncResult = false) {
    const payload = await this.createCertManageRevocationPayload(certCrl);
    const endorsers = [];
    userInfoList.forEach((userInfo) => {
      endorsers.push(utils.newEndorsement(userInfo.orgID, userInfo.isFullCert, userInfo.userSignCertBytes, payload, userInfo.userSignKeyBytes,));
    });
    return this.sendCertManageRequest(payload, false, withSyncResult, endorsers);
  }

  // userInfoList: class orgInfo list
  signCertManagePayload(payload) {
    return utils.newEndorsement(this.userInfo.orgID, this.userInfo.isFullCert, this.userInfo.userSignCertBytes, payload, this.userInfo.userSignKeyBytes,);
  }

  sendCertManageRequest(payload, srcRes = false, withSyncResult = false, endorsers = []) {
    return this.sendPayload(payload, srcRes, withSyncResult, endorsers);
  }

  // return promise
  async sendPayload(payload, srcRes = false, withSyncResult = false, endorsers = []) {
    const result = await this.node.sendPayload(this.userInfo, payload, srcRes, endorsers,);
    if (withSyncResult) {
      const res = await this.callSystemContract.getSyncResult(result.txId);
      result.contractResult = res;
      return result;
    }
    return result;
  }
}

export default CertMgr;
