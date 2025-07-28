/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

const fs = require('fs');
const crypto = require('crypto');
const dest = `/var/www/ssl`;

/**
 * 上传TLS证书/私钥到指定目录，用于gRPCs服务代理
 */
function main(r) {
  if (r.method === 'DELETE') {
    deleteUpload(r);
  }
  if (r.method === 'POST') {
    upload(r);
  }
}

function writeFile(fileContent, fileSuffix) {
  let fileName = `${crypto.createHash('md5').update(fileContent).digest("hex")}.${fileSuffix || 'crt'}`;
  fs.writeFileSync(`${dest}/${fileName}`, fileContent);
  return fileName;
}

function deleteFile(fileName) {
  fs.unlinkSync(`${dest}/${fileName}`);
}

function upload(r) {
  let body = JSON.parse(r.requestBody);
  r.return(200, JSON.stringify({
    crtFileName: writeFile(body.crtFile), keyFileName: writeFile(body.keyFile, 'key'),
  }));
}

function deleteUpload(r) {
  let body = JSON.parse(r.requestBody);
  deleteFile(body.crtFileName);
  deleteFile(body.keyFileName);
  r.return(200);
}

export default {resolve: main}

