/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { hexStringToUint8Array, isEC, isRSA, stringToUint8Array, uint8Array2hex } from '../glue';
import grpc_web from '../grpc-web/common/block_pb';

import { v4 as uuidv4 } from 'uuid';

import { AUTH_TYPE, PAYLOAD_KEY, PAYLOAD_KEY_METHOD } from './constValue';

import grpc_web0 from '../grpc-web/common/contract_pb';

import grpc_web01, { Limit } from '../grpc-web/common/request_pb';

import grpc_web012 from '../grpc-web/common/result_pb';

import grpc_web0123 from '../grpc-web/common/rwset_pb';

import grpc_web01234 from '../grpc-web/common/transaction_pb';

import grpc_web012345 from '../grpc-web/syscontract/system_contract_pb';

import grpc_web0123456 from '../grpc-web/syscontract/chain_config_pb';

import grpc_web01234567 from '../grpc-web/syscontract/chain_query_pb';

import grpc_web012345678 from '../grpc-web/syscontract/contract_manage_pb';

import grpc_web0123456789 from '../grpc-web/syscontract/cert_manage_pb';

import grpc_web012345678910 from '../grpc-web/syscontract/subscribe_pb';

import grpc_web01234567891011 from '../grpc-web/syscontract/archive_pb';

import grpc_web0123456789101112 from '../grpc-web/accesscontrol/member_pb';

import grpc_web012345678910111213 from '../grpc-web/accesscontrol/policy_pb';

import grpc_web01234567891011121314 from '../grpc-web/api/rpc_node_grpc_web_pb';

import grpc_web0123456789101112131415 from '../grpc-web/config/chain_config_pb';

import grpc_web012345678910111213141516 from '../grpc-web/config/chainmaker_server_pb';

import grpc_web01234567891011121314151617 from '../grpc-web/config/local_config_pb';

import grpc_web0123456789101112131415161718 from '../grpc-web/config/log_config_pb';

import grpc_web012345678910111213141516171819 from '../grpc-web/discovery/discovery_pb';

import grpc_web01234567891011121314151617181920 from '../grpc-web/store/store_pb';

// import { sm2SignWithPriKey, SM2_CURVE_NAME } from './sm2Sign';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sm2SignWithPriKey, SM2_CURVE_NAME } = require('./sm3Sm2.js');

// const sig = sm2SignWithPriKey(toHex('emmansun'), privateKey);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { KJUR, KEYUTIL } = require('jsrsasign');

const createLogger = () => console;

const logger = createLogger('util');

const common = {
  ...grpc_web,
  ...grpc_web0,
  ...grpc_web01,
  ...grpc_web012,
  ...grpc_web0123,
  ...grpc_web01234,
};

const sysContract = {
  ...grpc_web0123456,
  ...grpc_web012345,
  ...grpc_web01234567,
  ...grpc_web012345678,
  ...grpc_web0123456789,
  ...grpc_web012345678910,
  ...grpc_web01234567891011,
};

const accesscontrol = {
  ...grpc_web0123456789101112,
  ...grpc_web012345678910111213,
};

const api = {
  ...grpc_web01234567891011121314,
};

const config = {
  ...grpc_web0123456789101112131415,
  ...grpc_web012345678910111213141516,
  ...grpc_web01234567891011121314151617,
  ...grpc_web0123456789101112131415161718,
};

const discovery = {
  ...grpc_web012345678910111213141516171819,
};

const store = {
  ...grpc_web01234567891011121314151617181920,
};

const newTxID = () => {
  let id = `${uuidv4()}${uuidv4()}`;
  id = id.replace(/-/g, '');
  return id.replace(/-/g, '');
};

/**
 * 将Uint8Array数据进行私钥签名
 * 数字签名类型有 RSA,ECDSA,DSA，算法类型（{MD5,SHA1,SHA224,SHA256,SHA384,SHA512,RIPEMD160})
 * 支持SHA256withRSA， SHA256withECDSA， sm2
 * @param data
 * @param privateKey 私钥字符串
 * @param format，支持值raw/hex
 * @returns {string | false}
 */
const signDataSha256 = async (data, privateKey, format = 'raw') => {
  if (!isRSA(privateKey) && !isEC(privateKey)) {
    throw new Error('不支持该算法');
  }
  let res;
  const privateKeyObj = KEYUTIL.getKey(privateKey);
  console.debug('privateKeyObj.curveName', privateKeyObj.curveName, privateKeyObj);
  if (privateKeyObj.curveName === SM2_CURVE_NAME) {
    res = sm2SignWithPriKey(uint8Array2hex(data), privateKey);
  } else {
    const signature = new KJUR.crypto.Signature({
      alg: isRSA(privateKey) ? 'SHA256withRSA' : 'SHA256withECDSA',
    });
    signature.init(privateKeyObj);
    signature.updateHex(uint8Array2hex(data));
    res = signature.sign();
  }
  return format === 'raw' ? hexStringToUint8Array(res) : res;
};

const newEndorsement = async (orgID, isFullCert, authType, userCertBytes, payload, userPrivateKey, pkByte) => {
  const payloadBytes = payload.serializeBinary();
  const signedData = await signDataSha256(payloadBytes, userPrivateKey);
  const member = new accesscontrol.Member();
  member.setOrgId(orgID);
  if (authType === AUTH_TYPE.PermissionedWithCert) {
    member.setMemberType(isFullCert ? accesscontrol.MemberType.CERT : accesscontrol.MemberType.CERT_HASH);
    member.setMemberInfo(userCertBytes);
  } else {
    member.setMemberType(accesscontrol.MemberType.PUBLIC_KEY);
    member.setMemberInfo(pkByte);
  }
  const entry = new common.EndorsementEntry();
  entry.setSigner(member);
  entry.setSignature(signedData);
  return entry;
};

const newRequest = async (
  orgID,
  userCertBytes,
  isFullCert,
  authType,
  payload,
  userPrivateKey,
  pkByte,
  endorsements = [],
) => {
  const request = new common.TxRequest();
  request.setPayload(payload);
  if (endorsements.length) {
    endorsements.forEach((endorsememt) => {
      request.addEndorsers(endorsememt);
    });
  }
  const sender = await newEndorsement(orgID, isFullCert, authType, userCertBytes, payload, userPrivateKey, pkByte);
  request.setSender(sender);
  // 添加背书
  request.addEndorsers(sender);
  return request;
};

const enum2str = (enumType, enumValue) => {
  let result;
  Object.keys(enumType).forEach((key) => {
    if (enumType[key] === enumValue) result = key;
  });
  return result;
};

// TODO 需要调整
const getCertHash = (certbytes, _hashType) => certbytes.toString('hex');

const sleep = (second) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });

const buildPayload = (config) => {
  const kv = Object.assign({}, config);
  if (!kv.txId) {
    if (kv.parameters?._TX_ID) {
      kv.txId = kv.parameters._TX_ID;
      delete kv.parameters._TX_ID;
    } else {
      kv.txId = newTxID();
    }
  }
  kv.timestamp = (Date.now() / 1000) | 0;
  kv.expirationTime = 0;
  let payload = new common.Payload();

  if (kv.parameters) {
    // 从params中提取 gasLimit
    const gasLimit = kv.parameters._GAS_LIMIT;
    if (typeof gasLimit === 'number') {
      const limit = new Limit().setGasLimit(gasLimit);
      payload.setLimit(limit);
    }
    // 从params中提取 gasLimit
    const isQuery = kv.parameters._QUERY_CONTRACT;

    if (isQuery) {
      payload.setTxType(common.TxType.QUERY_CONTRACT);
      delete kv.txType;
    }
    delete kv.parameters._GAS_LIMIT;
    delete kv.parameters._QUERY_CONTRACT;

    payload = buildKeyValuePair(payload, kv.parameters);
    delete kv.parameters;
  }
  Object.keys(kv).forEach((key) => {
    if (PAYLOAD_KEY.includes(key)) {
      logger.debug(PAYLOAD_KEY_METHOD[key], kv[key]);
      payload[PAYLOAD_KEY_METHOD[key]](kv[key]);
    }
  });
  return payload;
};

const buildKeyValuePair = (payload, kv) => {
  Object.keys(kv).forEach((key) => {
    const param = new common.KeyValuePair();
    param.setKey(key);
    if (kv[key] !== '') {
      if (kv[key].constructor === Uint8Array) {
        param.setValue(kv[key]);
      } else {
        param.setValue(stringToUint8Array(`${kv[key]}`));
      }
    }
    payload.addParameters(param);
  });
  return payload;
};

export default {
  common,
  sysContract,
  accesscontrol,
  api,
  config,
  discovery,
  store,
  createLogger,
  signDataSha256,
  newRequest,
  enum2str,
  newTxID,
  getCertHash,
  sleep,
  buildPayload,
  buildKeyValuePair,
  newEndorsement,
};
