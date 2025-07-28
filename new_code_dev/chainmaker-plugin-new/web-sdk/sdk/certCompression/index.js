/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import _ from "lodash";
class CertCompression {
  constructor(userInfo, certMgr) {
    this.userInfo = userInfo;
    this.certMgr = certMgr;
  }

  async enableCertHash() {
    if (!this.userInfo.isFullCert) return true;
    if (!this.userInfo.certHash) this.userInfo.certHash = await this.certMgr.getCertHash();
    const existChainHash = await this.checkChainCertHash(this.userInfo.certHash);
    if (!existChainHash) {
      await this.certMgr.addCert();
      await this.checkChainCertHashReady(this.userInfo.certHash);
    }
    this.userInfo.tmpUserSignCertBytes = _.cloneDeep(this.userInfo.userSignCertBytes);
    this.userInfo.userSignCertBytes = Uint8Array.from(_.cloneDeep(this.userInfo.certHash));
    this.userInfo.isFullCert = false;
    return true;
  }

  async disableCertHash() {
    if (this.userInfo.isFullCert) return;

    this.userInfo.userSignCertBytes = _.cloneDeep(this.userInfo.tmpUserSignCertBytes);
    this.userInfo.tmpUserSignCertBytes = '';
    this.userInfo.certHash = null;
    this.userInfo.isFullCert = true;
    return true;
  }

  async checkChainCertHash(certHash) {
    const result = await this.certMgr.queryCert([certHash]);
    // 查询链上证书，有返回成功，没有继续处理
    if (result.certInfosList.length) {
      for (let i = 0; i < result.certInfosList.length; i++) {
        if (certHash === result.certInfosList[i].hash && result.certInfosList[i].cert.length > 10) {
          this.userInfo.isFullCert = false;
          return true;
        }
      }
    }
    return false;
  }

  checkChainCertHashReady(certHash) {
    return new Promise((resolve, reject) => {
      let count = 0;
      const interval = setInterval(async () => {
        const existChainHash = await this.checkChainCertHash(certHash);
        if (existChainHash) {
          clearInterval(interval);
          resolve(true);
        }
        count += 1;
        if (count > 20) reject('checkChainCertHashReady timeout');
      }, 500);
    });
  }
}

export default CertCompression;
