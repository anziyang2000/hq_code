import * as jspb from 'google-protobuf'



export class TxResponse extends jspb.Message {
  getCode(): TxStatusCode;
  setCode(value: TxStatusCode): TxResponse;

  getMessage(): string;
  setMessage(value: string): TxResponse;

  getContractResult(): ContractResult | undefined;
  setContractResult(value?: ContractResult): TxResponse;
  hasContractResult(): boolean;
  clearContractResult(): TxResponse;

  getTxId(): string;
  setTxId(value: string): TxResponse;

  getTxTimestamp(): number;
  setTxTimestamp(value: number): TxResponse;

  getTxBlockHeight(): number;
  setTxBlockHeight(value: number): TxResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TxResponse): TxResponse.AsObject;
  static serializeBinaryToWriter(message: TxResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxResponse;
  static deserializeBinaryFromReader(message: TxResponse, reader: jspb.BinaryReader): TxResponse;
}

export namespace TxResponse {
  export type AsObject = {
    code: TxStatusCode,
    message: string,
    contractResult?: ContractResult.AsObject,
    txId: string,
    txTimestamp: number,
    txBlockHeight: number,
  }
}

export class SubscribeResult extends jspb.Message {
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): SubscribeResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeResult.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeResult): SubscribeResult.AsObject;
  static serializeBinaryToWriter(message: SubscribeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeResult;
  static deserializeBinaryFromReader(message: SubscribeResult, reader: jspb.BinaryReader): SubscribeResult;
}

export namespace SubscribeResult {
  export type AsObject = {
    data: Uint8Array | string,
  }
}

export class Result extends jspb.Message {
  getCode(): TxStatusCode;
  setCode(value: TxStatusCode): Result;

  getContractResult(): ContractResult | undefined;
  setContractResult(value?: ContractResult): Result;
  hasContractResult(): boolean;
  clearContractResult(): Result;

  getRwSetHash(): Uint8Array | string;
  getRwSetHash_asU8(): Uint8Array;
  getRwSetHash_asB64(): string;
  setRwSetHash(value: Uint8Array | string): Result;

  getMessage(): string;
  setMessage(value: string): Result;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Result.AsObject;
  static toObject(includeInstance: boolean, msg: Result): Result.AsObject;
  static serializeBinaryToWriter(message: Result, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Result;
  static deserializeBinaryFromReader(message: Result, reader: jspb.BinaryReader): Result;
}

export namespace Result {
  export type AsObject = {
    code: TxStatusCode,
    contractResult?: ContractResult.AsObject,
    rwSetHash: Uint8Array | string,
    message: string,
  }
}

export class ContractResult extends jspb.Message {
  getCode(): number;
  setCode(value: number): ContractResult;

  getResult(): Uint8Array | string;
  getResult_asU8(): Uint8Array;
  getResult_asB64(): string;
  setResult(value: Uint8Array | string): ContractResult;

  getMessage(): string;
  setMessage(value: string): ContractResult;

  getGasUsed(): number;
  setGasUsed(value: number): ContractResult;

  getContractEventList(): Array<ContractEvent>;
  setContractEventList(value: Array<ContractEvent>): ContractResult;
  clearContractEventList(): ContractResult;
  addContractEvent(value?: ContractEvent, index?: number): ContractEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractResult.AsObject;
  static toObject(includeInstance: boolean, msg: ContractResult): ContractResult.AsObject;
  static serializeBinaryToWriter(message: ContractResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractResult;
  static deserializeBinaryFromReader(message: ContractResult, reader: jspb.BinaryReader): ContractResult;
}

export namespace ContractResult {
  export type AsObject = {
    code: number,
    result: Uint8Array | string,
    message: string,
    gasUsed: number,
    contractEventList: Array<ContractEvent.AsObject>,
  }
}

export class PrivateGetContract extends jspb.Message {
  getContractCode(): Uint8Array | string;
  getContractCode_asU8(): Uint8Array;
  getContractCode_asB64(): string;
  setContractCode(value: Uint8Array | string): PrivateGetContract;

  getVersion(): string;
  setVersion(value: string): PrivateGetContract;

  getGasLimit(): number;
  setGasLimit(value: number): PrivateGetContract;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateGetContract.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateGetContract): PrivateGetContract.AsObject;
  static serializeBinaryToWriter(message: PrivateGetContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateGetContract;
  static deserializeBinaryFromReader(message: PrivateGetContract, reader: jspb.BinaryReader): PrivateGetContract;
}

export namespace PrivateGetContract {
  export type AsObject = {
    contractCode: Uint8Array | string,
    version: string,
    gasLimit: number,
  }
}

export class StrSlice extends jspb.Message {
  getStrArrList(): Array<string>;
  setStrArrList(value: Array<string>): StrSlice;
  clearStrArrList(): StrSlice;
  addStrArr(value: string, index?: number): StrSlice;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StrSlice.AsObject;
  static toObject(includeInstance: boolean, msg: StrSlice): StrSlice.AsObject;
  static serializeBinaryToWriter(message: StrSlice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StrSlice;
  static deserializeBinaryFromReader(message: StrSlice, reader: jspb.BinaryReader): StrSlice;
}

export namespace StrSlice {
  export type AsObject = {
    strArrList: Array<string>,
  }
}

export class CertInfos extends jspb.Message {
  getCertInfosList(): Array<CertInfo>;
  setCertInfosList(value: Array<CertInfo>): CertInfos;
  clearCertInfosList(): CertInfos;
  addCertInfos(value?: CertInfo, index?: number): CertInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CertInfos.AsObject;
  static toObject(includeInstance: boolean, msg: CertInfos): CertInfos.AsObject;
  static serializeBinaryToWriter(message: CertInfos, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CertInfos;
  static deserializeBinaryFromReader(message: CertInfos, reader: jspb.BinaryReader): CertInfos;
}

export namespace CertInfos {
  export type AsObject = {
    certInfosList: Array<CertInfo.AsObject>,
  }
}

export class CertInfo extends jspb.Message {
  getHash(): string;
  setHash(value: string): CertInfo;

  getCert(): Uint8Array | string;
  getCert_asU8(): Uint8Array;
  getCert_asB64(): string;
  setCert(value: Uint8Array | string): CertInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CertInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CertInfo): CertInfo.AsObject;
  static serializeBinaryToWriter(message: CertInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CertInfo;
  static deserializeBinaryFromReader(message: CertInfo, reader: jspb.BinaryReader): CertInfo;
}

export namespace CertInfo {
  export type AsObject = {
    hash: string,
    cert: Uint8Array | string,
  }
}

export class ContractEvent extends jspb.Message {
  getTopic(): string;
  setTopic(value: string): ContractEvent;

  getTxId(): string;
  setTxId(value: string): ContractEvent;

  getContractName(): string;
  setContractName(value: string): ContractEvent;

  getContractVersion(): string;
  setContractVersion(value: string): ContractEvent;

  getEventDataList(): Array<string>;
  setEventDataList(value: Array<string>): ContractEvent;
  clearEventDataList(): ContractEvent;
  addEventData(value: string, index?: number): ContractEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ContractEvent): ContractEvent.AsObject;
  static serializeBinaryToWriter(message: ContractEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractEvent;
  static deserializeBinaryFromReader(message: ContractEvent, reader: jspb.BinaryReader): ContractEvent;
}

export namespace ContractEvent {
  export type AsObject = {
    topic: string,
    txId: string,
    contractName: string,
    contractVersion: string,
    eventDataList: Array<string>,
  }
}

export class ContractEventInfo extends jspb.Message {
  getBlockHeight(): number;
  setBlockHeight(value: number): ContractEventInfo;

  getChainId(): string;
  setChainId(value: string): ContractEventInfo;

  getTopic(): string;
  setTopic(value: string): ContractEventInfo;

  getTxId(): string;
  setTxId(value: string): ContractEventInfo;

  getEventIndex(): number;
  setEventIndex(value: number): ContractEventInfo;

  getContractName(): string;
  setContractName(value: string): ContractEventInfo;

  getContractVersion(): string;
  setContractVersion(value: string): ContractEventInfo;

  getEventDataList(): Array<string>;
  setEventDataList(value: Array<string>): ContractEventInfo;
  clearEventDataList(): ContractEventInfo;
  addEventData(value: string, index?: number): ContractEventInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractEventInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ContractEventInfo): ContractEventInfo.AsObject;
  static serializeBinaryToWriter(message: ContractEventInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractEventInfo;
  static deserializeBinaryFromReader(message: ContractEventInfo, reader: jspb.BinaryReader): ContractEventInfo;
}

export namespace ContractEventInfo {
  export type AsObject = {
    blockHeight: number,
    chainId: string,
    topic: string,
    txId: string,
    eventIndex: number,
    contractName: string,
    contractVersion: string,
    eventDataList: Array<string>,
  }
}

export class ContractEventInfoList extends jspb.Message {
  getContractEventsList(): Array<ContractEventInfo>;
  setContractEventsList(value: Array<ContractEventInfo>): ContractEventInfoList;
  clearContractEventsList(): ContractEventInfoList;
  addContractEvents(value?: ContractEventInfo, index?: number): ContractEventInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractEventInfoList.AsObject;
  static toObject(includeInstance: boolean, msg: ContractEventInfoList): ContractEventInfoList.AsObject;
  static serializeBinaryToWriter(message: ContractEventInfoList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractEventInfoList;
  static deserializeBinaryFromReader(message: ContractEventInfoList, reader: jspb.BinaryReader): ContractEventInfoList;
}

export namespace ContractEventInfoList {
  export type AsObject = {
    contractEventsList: Array<ContractEventInfo.AsObject>,
  }
}

export class AliasInfo extends jspb.Message {
  getAlias(): string;
  setAlias(value: string): AliasInfo;

  getNowCert(): AliasCertInfo | undefined;
  setNowCert(value?: AliasCertInfo): AliasInfo;
  hasNowCert(): boolean;
  clearNowCert(): AliasInfo;

  getHisCertsList(): Array<AliasCertInfo>;
  setHisCertsList(value: Array<AliasCertInfo>): AliasInfo;
  clearHisCertsList(): AliasInfo;
  addHisCerts(value?: AliasCertInfo, index?: number): AliasCertInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AliasInfo.AsObject;
  static toObject(includeInstance: boolean, msg: AliasInfo): AliasInfo.AsObject;
  static serializeBinaryToWriter(message: AliasInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AliasInfo;
  static deserializeBinaryFromReader(message: AliasInfo, reader: jspb.BinaryReader): AliasInfo;
}

export namespace AliasInfo {
  export type AsObject = {
    alias: string,
    nowCert?: AliasCertInfo.AsObject,
    hisCertsList: Array<AliasCertInfo.AsObject>,
  }
}

export class AliasInfos extends jspb.Message {
  getAliasInfosList(): Array<AliasInfo>;
  setAliasInfosList(value: Array<AliasInfo>): AliasInfos;
  clearAliasInfosList(): AliasInfos;
  addAliasInfos(value?: AliasInfo, index?: number): AliasInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AliasInfos.AsObject;
  static toObject(includeInstance: boolean, msg: AliasInfos): AliasInfos.AsObject;
  static serializeBinaryToWriter(message: AliasInfos, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AliasInfos;
  static deserializeBinaryFromReader(message: AliasInfos, reader: jspb.BinaryReader): AliasInfos;
}

export namespace AliasInfos {
  export type AsObject = {
    aliasInfosList: Array<AliasInfo.AsObject>,
  }
}

export class AliasCertInfo extends jspb.Message {
  getHash(): string;
  setHash(value: string): AliasCertInfo;

  getCert(): Uint8Array | string;
  getCert_asU8(): Uint8Array;
  getCert_asB64(): string;
  setCert(value: Uint8Array | string): AliasCertInfo;

  getBlockHeight(): number;
  setBlockHeight(value: number): AliasCertInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AliasCertInfo.AsObject;
  static toObject(includeInstance: boolean, msg: AliasCertInfo): AliasCertInfo.AsObject;
  static serializeBinaryToWriter(message: AliasCertInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AliasCertInfo;
  static deserializeBinaryFromReader(message: AliasCertInfo, reader: jspb.BinaryReader): AliasCertInfo;
}

export namespace AliasCertInfo {
  export type AsObject = {
    hash: string,
    cert: Uint8Array | string,
    blockHeight: number,
  }
}

export enum TxStatusCode { 
  SUCCESS = 0,
  TIMEOUT = 1,
  INVALID_PARAMETER = 2,
  NO_PERMISSION = 3,
  CONTRACT_FAIL = 4,
  INTERNAL_ERROR = 5,
  INVALID_CONTRACT_TRANSACTION_TYPE = 10,
  INVALID_CONTRACT_PARAMETER_CONTRACT_NAME = 11,
  INVALID_CONTRACT_PARAMETER_METHOD = 12,
  INVALID_CONTRACT_PARAMETER_INIT_METHOD = 13,
  INVALID_CONTRACT_PARAMETER_UPGRADE_METHOD = 14,
  INVALID_CONTRACT_PARAMETER_BYTE_CODE = 15,
  INVALID_CONTRACT_PARAMETER_RUNTIME_TYPE = 16,
  INVALID_CONTRACT_PARAMETER_VERSION = 17,
  GET_FROM_TX_CONTEXT_FAILED = 20,
  PUT_INTO_TX_CONTEXT_FAILED = 21,
  CONTRACT_VERSION_EXIST_FAILED = 22,
  CONTRACT_VERSION_NOT_EXIST_FAILED = 23,
  CONTRACT_BYTE_CODE_NOT_EXIST_FAILED = 24,
  MARSHAL_SENDER_FAILED = 25,
  INVOKE_INIT_METHOD_FAILED = 26,
  INVOKE_UPGRADE_METHOD_FAILED = 27,
  CREATE_RUNTIME_INSTANCE_FAILED = 28,
  UNMARSHAL_CREATOR_FAILED = 29,
  UNMARSHAL_SENDER_FAILED = 30,
  GET_SENDER_PK_FAILED = 31,
  GET_CREATOR_PK_FAILED = 32,
  GET_CREATOR_FAILED = 33,
  GET_CREATOR_CERT_FAILED = 34,
  GET_SENDER_CERT_FAILED = 35,
  CONTRACT_FREEZE_FAILED = 36,
  CONTRACT_TOO_DEEP_FAILED = 37,
  CONTRACT_REVOKE_FAILED = 38,
  CONTRACT_INVOKE_METHOD_FAILED = 39,
  ARCHIVED_TX = 40,
  ARCHIVED_BLOCK = 41,
  GAS_BALANCE_NOT_ENOUGH_FAILED = 42,
  GAS_LIMIT_NOT_SET = 43,
  GAS_LIMIT_TOO_SMALL = 44,
  GET_ACCOUNT_BALANCE_FAILED = 45,
  PARSE_ACCOUNT_BALANCE_FAILED = 46,
  GET_ACCOUNT_STATUS_FAILED = 47,
  ACCOUNT_STATUS_FROZEN = 48,
}
