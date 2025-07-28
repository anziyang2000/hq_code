// source: syscontract/chain_query.proto
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

goog.exportSymbol('proto.syscontract.ChainQueryFunction', null, global);
/**
 * @enum {number}
 */
proto.syscontract.ChainQueryFunction = {
  GET_BLOCK_BY_TX_ID: 0,
  GET_TX_BY_TX_ID: 1,
  GET_BLOCK_BY_HEIGHT: 2,
  GET_CHAIN_INFO: 3,
  GET_LAST_CONFIG_BLOCK: 4,
  GET_BLOCK_BY_HASH: 5,
  GET_NODE_CHAIN_LIST: 6,
  GET_GOVERNANCE_CONTRACT: 7,
  GET_BLOCK_WITH_TXRWSETS_BY_HEIGHT: 8,
  GET_BLOCK_WITH_TXRWSETS_BY_HASH: 9,
  GET_LAST_BLOCK: 10,
  GET_FULL_BLOCK_BY_HEIGHT: 11,
  GET_BLOCK_HEIGHT_BY_TX_ID: 12,
  GET_BLOCK_HEIGHT_BY_HASH: 13,
  GET_BLOCK_HEADER_BY_HEIGHT: 14,
  GET_ARCHIVED_BLOCK_HEIGHT: 15,
  GET_ALL_CONTRACTS: 16,
  GET_MERKLE_PATH_BY_TX_ID: 17
};

goog.object.extend(exports, proto.syscontract);
