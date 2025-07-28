/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

// init contract
// INIT_CONTRACT = 0;
// upgrade contract
// UPGRADE_CONTRACT = 1;
// freeze  contract
// FREEZE_CONTRACT = 2;
// unfreezing contract
// UNFREEZE_CONTRACT = 3;
// Revocation of contract
// REVOKE_CONTRACT = 4;
export const userContractMgrMethod = [0, 1, 2, 3, 4];

// INVALID = 0;
// native implement in chainmaker-go
// NATIVE = 1;
// vm-wasmer, language-c++
// WASMER = 2;
// vm-wxvm, language-cpp
// WXVM = 3;
// wasm interpreter in go
// GASM = 4;
// vm-evm
// EVM = 5;
// vm-docker, language-golang
// DOCKER_GO = 6;
// vm-docker, language-java
// DOCKER_JAVA = 7;
export const runtimeType = [
  'INVALID',
  'NATIVE',
  'WASMER',
  'WXVM',
  'GASM',
  'EVM',
  'DOCKER_GO',
  'DOCKER_JAVA',
];

export const SUCCESS = 0;

export const NEED_SRC_RESPONSE = true;

export const DEFAULT_SEQUENCE = 0;

export const PAYLOAD_KEY_METHOD = {
  chainId: 'setChainId',
  txType: 'setTxType',
  txId: 'setTxId',
  timestamp: 'setTimestamp',
  expirationTime: 'setExpirationTime',
  contractName: 'setContractName',
  method: 'setMethod',
  parameters: 'setParametersList',
  sequence: 'setSequence',
  limit: 'setLimit',
};

export const PAYLOAD_KEY = Object.keys(PAYLOAD_KEY_METHOD);

export const keys = {
// System Block Contract keys
  KeyBlockContractWithRWSet: 'withRWSet',
  KeyBlockContractBlockHash: 'blockHash',
  KeyBlockContractBlockHeight: 'blockHeight',
  KeyBlockContractTxId: 'txId',

  // System Chain Config Contract keys
  KeyChainConfigContractRoot: 'root',
  KeyChainConfigContractOrgId: 'org_id',
  KeyChainConfigContractNodeId: 'node_id',
  KeyChainConfigContractNewNodeId: 'new_node_id',
  KeyChainConfigContractNodeIds: 'node_ids',
  KeyChainConfigContractBlockHeight: 'block_height',
  KeyChainConfigContractTrustMemberOrgId: 'org_id',
  KeyChainConfigContractTrustMemberInfo: 'member_info',
  KeyChainConfigContractTrustMemberNodeId: 'node_id',
  KeyChainConfigContractTrustMemberRole: 'role',

  // CoreConfig keys
  KeyTxSchedulerTimeout: 'tx_scheduler_timeout',
  KeyTxSchedulerValidateTimeout: 'tx_scheduler_validate_timeout',

  // BlockConfig keys
  KeyTxTimestampVerify: 'tx_timestamp_verify',
  KeyTxTimeOut: 'tx_timeout',
  KeyBlockTxCapacity: 'block_tx_capacity',
  KeyBlockSize: 'block_size',
  KeyBlockInterval: 'block_interval',

  // subscribe
  KeySubStrartBlock: 'START_BLOCK',
  KeySubEndBlock: 'END_BLOCK',
  KeySubWithRwset: 'WITH_RWSET',
  KeySubOnlyHeader: 'ONLY_HEADER',
  KeySubContractName: 'CONTRACT_NAME',
  KeySubTxIds: 'TX_IDS',
  KeySubTopic: 'TOPIC',

  KeyArchiveBlockHeight: 'BLOCK_HEIGHT',
  KeyArchiveFullBlock: 'FULL_BLOCK',

  // CertManage keys
  KeyCertHashes: 'cert_hashes',
  KeyCerts: 'certs',
  KeyCertCrl: 'cert_crl',
  KeyInitContractName: 'CONTRACT_NAME',
  KeyInitContractRuntimeType: 'CONTRACT_RUNTIME_TYPE',
  KeyInitContractVersion: 'CONTRACT_VERSION',
  KeyInitContractBytecode: 'CONTRACT_BYTECODE',

  // PrivateCompute keys
  KeyOrderId: 'order_id',
  KeyPrivateDir: 'private_dir',
  KeyContractName: 'contract_name',
  KeyCodeHash: 'code_hash',
  KeyResult: 'result',
  KeyCodeHeader: 'code_header',
  KeyVersion: 'version',
  KeyIsDeploy: 'is_deploy',
  KeyRWSet: 'rw_set',
  KeyEvents: 'events',
  KeyReportHash: 'report_hash',
  KeySign: 'sign',
  KeyKey: 'key',
  KeyPayload: 'payload',
  KeyOrgIds: 'org_ids',
  KeySignPairs: 'sign_pairs',
  KeyCaCert: 'ca_cert',
  KeyEnclaveId: 'enclave_id',
  KeyReport: 'report',
  KeyProof: 'proof',
  KeyDeployReq: 'deploy_req',
  KeyPrivateReq: 'private_req',
};

export const AUTH_TYPE = {
  PermissionedWithCert: 'permissionedWithCert',
  PermissionedWithKey: 'permissionedWithKey',
  Public: 'public',
};
