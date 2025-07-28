/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
import UserContractMgr from "./userContractMgr";
import CallUserContract from "./callUserContract";
import CallSystemContract from "./callSystemContract";
import ChainConfig from "./chainConfig";
import UserInfo from "./userInfo";
import CertMgr from "./certMgr";
import CertCompression from "./certCompression";
import Node from "../node";
import Subscribe from "./subscribe";

class Sdk {
  // 后续要加参数校验
  constructor(
    chainID,
    orgID,
    userSignKeyPath,
    userSignCertPath,
    nodeConfigArray,
    timeout,
    authType,
    additionalSetting
  ) {
    if (typeof (chainID) !== 'string') throw new Error(`[chainID] must be string: ${chainID}`);
    this.chainID = chainID;

    /* nodeList 是node类的数组 */
    this.node = new Node(nodeConfigArray, timeout, additionalSetting);

    this.userInfo = new UserInfo(orgID, userSignKeyPath, userSignCertPath, authType, additionalSetting.userPublicKeyFile);

    this.callSystemContract = new CallSystemContract(chainID, this.userInfo, this.node);

    this.chainConfig = new ChainConfig(chainID, this.userInfo, this.node);

    this.certMgr = new CertMgr(this.chainConfig, this.callSystemContract, chainID, this.userInfo, this.node);

    this.subscribe = new Subscribe(chainID, this.userInfo, this.node);

    this.userContractMgr = new UserContractMgr(chainID, this.userInfo, this.node, this.callSystemContract);

    this.callUserContract = new CallUserContract(chainID, this.userInfo, this.node, this.callSystemContract);

    this.certCompression = new CertCompression(this.userInfo, this.certMgr);

    // this.easyCodec = easyCodec;
  }

  getChainMakerServerVersion() {
    return this.node.getChainMakerServerVersion();
  }

  stop() {
    this.node.close();
  }
}

export default Sdk;
