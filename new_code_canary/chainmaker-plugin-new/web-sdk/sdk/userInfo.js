/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import {AUTH_TYPE} from "../utils/constValue";
import {loadPublicKeyFromPrivateKey, stringToUint8Array} from "../glue";

export default class UserInfo {
  /**
   *
   * @param orgID
   * @param userSignKeyPath 私钥文本
   * @param userSignCertPath
   * @param authType
   * @param userPublicKeyFile 公钥文本
   */
  constructor(orgID = '', userSignKeyPath = '', userSignCertPath = '', authType = AUTH_TYPE.PermissionedWithCert, userPublicKeyFile) {
    // if (typeof (userSignKeyPath) !== 'string') throw new Error(`[userSignKeyPath] must be a string: ${userSignKeyPath}`);
    // if (typeof (userSignCertPath) !== 'string') throw new Error(`[userSignCertPath] must be a string: ${userSignCertPath}`);
    this.orgID = orgID;
    this.userSignCertBytes = userSignCertPath;
    this.userSignKeyBytes = userSignKeyPath;
    this.isFullCert = true;
    this.tmpUserSignCertBytes = '';
    this.certHash = null;
    this.authType = authType;
    this.pkByte = null;
    if (authType === AUTH_TYPE.PermissionedWithKey || authType === AUTH_TYPE.Public) {
      this.pkByte = stringToUint8Array(userPublicKeyFile) || loadPublicKeyFromPrivateKey(userSignKeyPath);
    }
  }
}
