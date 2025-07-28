/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

const forge = require('node-forge');
const {Base64} = require('js-base64')
import {KJUR,X509,KEYUTIL,hextoArrayBuffer,b64toBA} from "jsrsasign";
import {keccak256} from 'js-sha3';

/**
 * 胶水文件，抹平nodejs/js差异，使得SDK本身支持WEB使用
 * 同时文本文件读取后，返回文本内容，而node版返回的是buffer
 */

export function file2Txt(file) {
  return new Promise(function (resolve) {
    const reader = new FileReader();
    const readFile = function () {
      resolve(reader.result);
    };

    reader.addEventListener('load', readFile);
    reader.readAsText(file);
  });
}


export function file2Uint8Array(file) {
  return new Promise(function (resolve) {
    const reader = new FileReader();
    const readFile = function () {
      resolve(new Uint8Array(reader.result));
    };

    reader.addEventListener('load', readFile);
    reader.readAsArrayBuffer(file);
  });
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


export function str2Binary(str) {
  return new TextEncoder().encode(str)
}

export function arrayBufferToUint8Array(arrayBuffer) {
  return new Uint8Array(arrayBuffer);
}


export function isRSA(privateKey) {
  return Boolean(privateKey.match(/BEGIN\s(RSA\s)?PRIVATE\sKEY/))
}

export function isEC(privateKey) {
  return Boolean(privateKey.match(/BEGIN\sEC\sPRIVATE\sKEY/))
}


export function Uint8ArrayToString(fileData) {
  let dataString = "";
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }

  return dataString
}


export function stringToUint8Array(str) {
  var result = new Array();

  var k = 0;
  for (var i = 0; i < str.length; i++) {
      var j = encodeURI(str[i]);
      if (j.length==1) {
          // 未转换的字符
          result[k++] = j.charCodeAt(0);
      } else {
          // 转换成%XX形式的字符
          var bytes = j.split("%");
          for (var l = 1; l < bytes.length; l++) {
              result[k++] = parseInt("0x" + bytes[l]);
          }
      }
  }

  const res = new Uint8Array(result);
  return res;
}

export const hexStringToUint8Array = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


export function toHex(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}


export function uint8Array2hex(arr) {
  return [...arr]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}


export async function delay(milliSeconds) {
  return new Promise((resolve => {
    window.setTimeout(resolve, milliSeconds)
  }));
}

/**
 *
 * @param privateKey 文本私钥-pem格式
 * @param format，支持二进制或文本
 * @returns {Uint8Array|string}
 */
export const loadPublicKeyFromPrivateKey = (privateKey, format = 'raw') => {
  const forgePriKey = forge.pki.privateKeyFromPem(privateKey);
  const forgePubKey = forge.pki.setRsaPublicKey(forgePriKey.n, forgePriKey.e);
  const publicKeyPem = forge.pki.publicKeyToPem(forgePubKey);
  if (format === 'raw') {
    return stringToUint8Array(publicKeyPem);
  }
  return publicKeyPem;
}
export const getPemBody = (pem) => {
  return pem.match(/(?<=KEY-----(\r?\n))((.|\n|\r)+)(?=-----END)/g)[0];
}

/**
 * 计算出钱包地址
 * @param publicKey
 */
export function getAddressFromPublicKey(publicKey) {
  const body = getPemBody(publicKey);
  const pemStrDecoded = Base64.decode(body);
  const md = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "sjcl"});
  md.updateString(pemStrDecoded);
  const mdHex = md.digest();
  return mdHex.substring(mdHex.length - 20, mdHex.length);
}
/**
 * 通过证计算公钥
 * @param {*} cert 
 * @returns 
 */
export function getPbKeyFromCertPem(cert){
  var c = new X509();
  c.readCertPEM(cert);
  const pubHex = c.getPublicKeyHex();
  const pub64 = hex2b64(pubHex);
  return `-----BEGIN PUBLIC KEY-----
${pub64}
-----END PUBLIC KEY-----`
}
/**
 * 通过证书计算用户地址
 * @param {} cert 
 */
export function getAddressFromCertPem(cert){
  var c = new X509();
  c.readCertPEM(cert);
  const pub = c.getPublicKey();
  const bf = hextoArrayBuffer(pub.pubKeyHex);
  const bf2 = bf.slice(1);
  const add = keccak256(bf2);
  return add.slice(-40);
}

/**
 * 通过公私钥获取用户地址
 * @param {} key 
 * @returns 
 */
export function getAddressFromKeyPem(key){
  const keyObj = KEYUTIL.getKey(key);
  const bf = hextoArrayBuffer(keyObj.pubKeyHex);
  const bf2 = bf.slice(1);
  const add = keccak256(bf2);
  return add.slice(-40);
}

export const getAddressFromKeyPemFile = async function(file){
    if(!file){
      return;
    }
    const cert = await file2Txt(file);
    return getAddressFromKeyPem(cert);
}