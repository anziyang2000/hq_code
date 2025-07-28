// source: syscontract/cert_manage.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = (function() { return this || window || global || self || Function('return this')(); }).call(null);

goog.exportSymbol('proto.syscontract.CertManageFunction', null, global);
/**
 * @enum {number}
 */
proto.syscontract.CertManageFunction = {
  CERT_ADD: 0,
  CERTS_DELETE: 1,
  CERTS_QUERY: 2,
  CERTS_FREEZE: 3,
  CERTS_UNFREEZE: 4,
  CERTS_REVOKE: 5,
  CERT_ALIAS_ADD: 6,
  CERT_ALIAS_UPDATE: 7,
  CERTS_ALIAS_DELETE: 8,
  CERTS_ALIAS_QUERY: 9
};

goog.object.extend(exports, proto.syscontract);
