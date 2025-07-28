/* eslint-disable @typescript-eslint/no-require-imports */
const rs = require('jsrsasign');

// 添加sm2扩展
const SM2_BIT_SIZE = 256;
export const SM2_CURVE_NAME = 'sm2p256v1';
const SM2_CURVE_PARAM_P = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF';
const SM2_CURVE_PARAM_A = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC';
const SM2_CURVE_PARAM_B = '28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93';
const SM2_CURVE_PARAM_N = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123';
const SM2_CURVE_PARAM_GX = '32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7';
const SM2_CURVE_PARAM_GY = 'BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0';

rs.crypto.ECParameterDB.regist(
  SM2_CURVE_NAME, // name / p = 2**256 - 2**224 - 2**96 + 2**64 - 1
  SM2_BIT_SIZE,
  SM2_CURVE_PARAM_P, // p
  SM2_CURVE_PARAM_A, // a
  SM2_CURVE_PARAM_B, // b
  SM2_CURVE_PARAM_N, // n
  '1', // h
  SM2_CURVE_PARAM_GX, // gx
  SM2_CURVE_PARAM_GY, // gy
  [],
); // alias

const getNameFunc = rs.ECDSA.getName;
console.log(rs.KJUR.crypto, rs.CryptoJS);
rs.ECDSA.getName = function (s) {
  // {1, 2, 156, 10197, 1, 301}
  if (s === '2a811ccf5501822d') {
    return SM2_CURVE_NAME;
  }
  return getNameFunc(s);
};

const sm = require('./sm2.js');
const { KJUR } = sm;
const sm2 = new KJUR.crypto.SM3withSM2({ curve: 'sm2' });

export const sm2SignWithPriKey = (hexData, prviey) => {
  const keyObj = rs.KEYUTIL.getKey(prviey);
  const pubHex = keyObj.pubKeyHex;
  const hash = pubHex.slice(2, 130);
  const dgst = sm2.getSM3Digest(hexData, hash);
  return sm2.signHex(dgst, keyObj.prvKeyHex);
};
export const verifyWithPubKey = (pubKey, hexData, sig) => {
  const { pubKeyHex } = rs.KEYUTIL.getKey(pubKey);
  const hash = pubKeyHex.slice(2, 130);
  const dgst = sm2.getSM3Digest(hexData, hash);
  return sm2.verifyHex(dgst, sig, pubKeyHex);
};
