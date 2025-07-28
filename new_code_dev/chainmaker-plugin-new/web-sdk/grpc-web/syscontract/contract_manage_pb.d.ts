import * as jspb from 'google-protobuf'

import * as common_contract_pb from '../common/contract_pb';


export class InitContract extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitContract.AsObject;
  static toObject(includeInstance: boolean, msg: InitContract): InitContract.AsObject;
  static serializeBinaryToWriter(message: InitContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitContract;
  static deserializeBinaryFromReader(message: InitContract, reader: jspb.BinaryReader): InitContract;
}

export namespace InitContract {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
    CONTRACT_RUNTIME_TYPE = 1,
    CONTRACT_VERSION = 2,
    CONTRACT_BYTECODE = 3,
  }
}

export class UpgradeContract extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpgradeContract.AsObject;
  static toObject(includeInstance: boolean, msg: UpgradeContract): UpgradeContract.AsObject;
  static serializeBinaryToWriter(message: UpgradeContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpgradeContract;
  static deserializeBinaryFromReader(message: UpgradeContract, reader: jspb.BinaryReader): UpgradeContract;
}

export namespace UpgradeContract {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
    CONTRACT_RUNTIME_TYPE = 1,
    CONTRACT_VERSION = 2,
    CONTRACT_BYTECODE = 3,
  }
}

export class FreezeContract extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FreezeContract.AsObject;
  static toObject(includeInstance: boolean, msg: FreezeContract): FreezeContract.AsObject;
  static serializeBinaryToWriter(message: FreezeContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FreezeContract;
  static deserializeBinaryFromReader(message: FreezeContract, reader: jspb.BinaryReader): FreezeContract;
}

export namespace FreezeContract {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
  }
}

export class UnfreezeContract extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnfreezeContract.AsObject;
  static toObject(includeInstance: boolean, msg: UnfreezeContract): UnfreezeContract.AsObject;
  static serializeBinaryToWriter(message: UnfreezeContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnfreezeContract;
  static deserializeBinaryFromReader(message: UnfreezeContract, reader: jspb.BinaryReader): UnfreezeContract;
}

export namespace UnfreezeContract {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
  }
}

export class RevokeContract extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeContract.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeContract): RevokeContract.AsObject;
  static serializeBinaryToWriter(message: RevokeContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeContract;
  static deserializeBinaryFromReader(message: RevokeContract, reader: jspb.BinaryReader): RevokeContract;
}

export namespace RevokeContract {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
  }
}

export class GetContractInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetContractInfo.AsObject;
  static toObject(includeInstance: boolean, msg: GetContractInfo): GetContractInfo.AsObject;
  static serializeBinaryToWriter(message: GetContractInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetContractInfo;
  static deserializeBinaryFromReader(message: GetContractInfo, reader: jspb.BinaryReader): GetContractInfo;
}

export namespace GetContractInfo {
  export type AsObject = {
  }

  export enum Parameter { 
    CONTRACT_NAME = 0,
  }
}

export class ContractAccess extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractAccess.AsObject;
  static toObject(includeInstance: boolean, msg: ContractAccess): ContractAccess.AsObject;
  static serializeBinaryToWriter(message: ContractAccess, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractAccess;
  static deserializeBinaryFromReader(message: ContractAccess, reader: jspb.BinaryReader): ContractAccess;
}

export namespace ContractAccess {
  export type AsObject = {
  }

  export enum Parameter { 
    NATIVE_CONTRACT_NAME = 0,
  }
}

export class ContractInfo extends jspb.Message {
  getContractTransactionList(): Array<ContractTransaction>;
  setContractTransactionList(value: Array<ContractTransaction>): ContractInfo;
  clearContractTransactionList(): ContractInfo;
  addContractTransaction(value?: ContractTransaction, index?: number): ContractTransaction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ContractInfo): ContractInfo.AsObject;
  static serializeBinaryToWriter(message: ContractInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractInfo;
  static deserializeBinaryFromReader(message: ContractInfo, reader: jspb.BinaryReader): ContractInfo;
}

export namespace ContractInfo {
  export type AsObject = {
    contractTransactionList: Array<ContractTransaction.AsObject>,
  }
}

export class ContractTransaction extends jspb.Message {
  getContract(): common_contract_pb.Contract | undefined;
  setContract(value?: common_contract_pb.Contract): ContractTransaction;
  hasContract(): boolean;
  clearContract(): ContractTransaction;

  getTxId(): string;
  setTxId(value: string): ContractTransaction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractTransaction.AsObject;
  static toObject(includeInstance: boolean, msg: ContractTransaction): ContractTransaction.AsObject;
  static serializeBinaryToWriter(message: ContractTransaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractTransaction;
  static deserializeBinaryFromReader(message: ContractTransaction, reader: jspb.BinaryReader): ContractTransaction;
}

export namespace ContractTransaction {
  export type AsObject = {
    contract?: common_contract_pb.Contract.AsObject,
    txId: string,
  }
}

export enum ContractManageFunction { 
  INIT_CONTRACT = 0,
  UPGRADE_CONTRACT = 1,
  FREEZE_CONTRACT = 2,
  UNFREEZE_CONTRACT = 3,
  REVOKE_CONTRACT = 4,
  GRANT_CONTRACT_ACCESS = 5,
  REVOKE_CONTRACT_ACCESS = 6,
  VERIFY_CONTRACT_ACCESS = 7,
  INIT_NEW_NATIVE_CONTRACT = 8,
}
export enum ContractQueryFunction { 
  GET_CONTRACT_INFO = 0,
  GET_CONTRACT_BYTECODE = 1,
  GET_CONTRACT_LIST = 2,
  GET_DISABLED_CONTRACT_LIST = 3,
}
