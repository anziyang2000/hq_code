import * as jspb from 'google-protobuf'

import * as common_transaction_pb from '../common/transaction_pb';
import * as common_request_pb from '../common/request_pb';


export class TxPoolSignal extends jspb.Message {
  getSignalType(): SignalType;
  setSignalType(value: SignalType): TxPoolSignal;

  getChainId(): string;
  setChainId(value: string): TxPoolSignal;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxPoolSignal.AsObject;
  static toObject(includeInstance: boolean, msg: TxPoolSignal): TxPoolSignal.AsObject;
  static serializeBinaryToWriter(message: TxPoolSignal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxPoolSignal;
  static deserializeBinaryFromReader(message: TxPoolSignal, reader: jspb.BinaryReader): TxPoolSignal;
}

export namespace TxPoolSignal {
  export type AsObject = {
    signalType: SignalType,
    chainId: string,
  }
}

export class TxPoolStatus extends jspb.Message {
  getConfigTxPoolSize(): number;
  setConfigTxPoolSize(value: number): TxPoolStatus;

  getCommonTxPoolSize(): number;
  setCommonTxPoolSize(value: number): TxPoolStatus;

  getConfigTxNumInQueue(): number;
  setConfigTxNumInQueue(value: number): TxPoolStatus;

  getConfigTxNumInPending(): number;
  setConfigTxNumInPending(value: number): TxPoolStatus;

  getCommonTxNumInQueue(): number;
  setCommonTxNumInQueue(value: number): TxPoolStatus;

  getCommonTxNumInPending(): number;
  setCommonTxNumInPending(value: number): TxPoolStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxPoolStatus.AsObject;
  static toObject(includeInstance: boolean, msg: TxPoolStatus): TxPoolStatus.AsObject;
  static serializeBinaryToWriter(message: TxPoolStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxPoolStatus;
  static deserializeBinaryFromReader(message: TxPoolStatus, reader: jspb.BinaryReader): TxPoolStatus;
}

export namespace TxPoolStatus {
  export type AsObject = {
    configTxPoolSize: number,
    commonTxPoolSize: number,
    configTxNumInQueue: number,
    configTxNumInPending: number,
    commonTxNumInQueue: number,
    commonTxNumInPending: number,
  }
}

export class TxPoolMsg extends jspb.Message {
  getType(): TxPoolMsgType;
  setType(value: TxPoolMsgType): TxPoolMsg;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): TxPoolMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxPoolMsg.AsObject;
  static toObject(includeInstance: boolean, msg: TxPoolMsg): TxPoolMsg.AsObject;
  static serializeBinaryToWriter(message: TxPoolMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxPoolMsg;
  static deserializeBinaryFromReader(message: TxPoolMsg, reader: jspb.BinaryReader): TxPoolMsg;
}

export namespace TxPoolMsg {
  export type AsObject = {
    type: TxPoolMsgType,
    payload: Uint8Array | string,
  }
}

export class TxBatch extends jspb.Message {
  getBatchId(): string;
  setBatchId(value: string): TxBatch;

  getSize(): number;
  setSize(value: number): TxBatch;

  getTxsList(): Array<common_transaction_pb.Transaction>;
  setTxsList(value: Array<common_transaction_pb.Transaction>): TxBatch;
  clearTxsList(): TxBatch;
  addTxs(value?: common_transaction_pb.Transaction, index?: number): common_transaction_pb.Transaction;

  getTxIdsMapMap(): jspb.Map<string, number>;
  clearTxIdsMapMap(): TxBatch;

  getEndorsement(): common_request_pb.EndorsementEntry | undefined;
  setEndorsement(value?: common_request_pb.EndorsementEntry): TxBatch;
  hasEndorsement(): boolean;
  clearEndorsement(): TxBatch;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxBatch.AsObject;
  static toObject(includeInstance: boolean, msg: TxBatch): TxBatch.AsObject;
  static serializeBinaryToWriter(message: TxBatch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxBatch;
  static deserializeBinaryFromReader(message: TxBatch, reader: jspb.BinaryReader): TxBatch;
}

export namespace TxBatch {
  export type AsObject = {
    batchId: string,
    size: number,
    txsList: Array<common_transaction_pb.Transaction.AsObject>,
    txIdsMapMap: Array<[string, number]>,
    endorsement?: common_request_pb.EndorsementEntry.AsObject,
  }
}

export class TxRecoverRequest extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): TxRecoverRequest;

  getHeight(): number;
  setHeight(value: number): TxRecoverRequest;

  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): TxRecoverRequest;
  clearTxIdsList(): TxRecoverRequest;
  addTxIds(value: string, index?: number): TxRecoverRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxRecoverRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TxRecoverRequest): TxRecoverRequest.AsObject;
  static serializeBinaryToWriter(message: TxRecoverRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxRecoverRequest;
  static deserializeBinaryFromReader(message: TxRecoverRequest, reader: jspb.BinaryReader): TxRecoverRequest;
}

export namespace TxRecoverRequest {
  export type AsObject = {
    nodeId: string,
    height: number,
    txIdsList: Array<string>,
  }
}

export class TxRecoverResponse extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): TxRecoverResponse;

  getHeight(): number;
  setHeight(value: number): TxRecoverResponse;

  getTxsList(): Array<common_transaction_pb.Transaction>;
  setTxsList(value: Array<common_transaction_pb.Transaction>): TxRecoverResponse;
  clearTxsList(): TxRecoverResponse;
  addTxs(value?: common_transaction_pb.Transaction, index?: number): common_transaction_pb.Transaction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxRecoverResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TxRecoverResponse): TxRecoverResponse.AsObject;
  static serializeBinaryToWriter(message: TxRecoverResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxRecoverResponse;
  static deserializeBinaryFromReader(message: TxRecoverResponse, reader: jspb.BinaryReader): TxRecoverResponse;
}

export namespace TxRecoverResponse {
  export type AsObject = {
    nodeId: string,
    height: number,
    txsList: Array<common_transaction_pb.Transaction.AsObject>,
  }
}

export class TxBatchRecoverRequest extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): TxBatchRecoverRequest;

  getHeight(): number;
  setHeight(value: number): TxBatchRecoverRequest;

  getBatchIdsList(): Array<string>;
  setBatchIdsList(value: Array<string>): TxBatchRecoverRequest;
  clearBatchIdsList(): TxBatchRecoverRequest;
  addBatchIds(value: string, index?: number): TxBatchRecoverRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxBatchRecoverRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TxBatchRecoverRequest): TxBatchRecoverRequest.AsObject;
  static serializeBinaryToWriter(message: TxBatchRecoverRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxBatchRecoverRequest;
  static deserializeBinaryFromReader(message: TxBatchRecoverRequest, reader: jspb.BinaryReader): TxBatchRecoverRequest;
}

export namespace TxBatchRecoverRequest {
  export type AsObject = {
    nodeId: string,
    height: number,
    batchIdsList: Array<string>,
  }
}

export class TxBatchRecoverResponse extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): TxBatchRecoverResponse;

  getHeight(): number;
  setHeight(value: number): TxBatchRecoverResponse;

  getTxBatchesList(): Array<TxBatch>;
  setTxBatchesList(value: Array<TxBatch>): TxBatchRecoverResponse;
  clearTxBatchesList(): TxBatchRecoverResponse;
  addTxBatches(value?: TxBatch, index?: number): TxBatch;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxBatchRecoverResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TxBatchRecoverResponse): TxBatchRecoverResponse.AsObject;
  static serializeBinaryToWriter(message: TxBatchRecoverResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxBatchRecoverResponse;
  static deserializeBinaryFromReader(message: TxBatchRecoverResponse, reader: jspb.BinaryReader): TxBatchRecoverResponse;
}

export namespace TxBatchRecoverResponse {
  export type AsObject = {
    nodeId: string,
    height: number,
    txBatchesList: Array<TxBatch.AsObject>,
  }
}

export class GetPoolStatusRequest extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): GetPoolStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPoolStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPoolStatusRequest): GetPoolStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetPoolStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPoolStatusRequest;
  static deserializeBinaryFromReader(message: GetPoolStatusRequest, reader: jspb.BinaryReader): GetPoolStatusRequest;
}

export namespace GetPoolStatusRequest {
  export type AsObject = {
    chainId: string,
  }
}

export class GetTxIdsByTypeAndStageRequest extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): GetTxIdsByTypeAndStageRequest;

  getTxType(): TxType;
  setTxType(value: TxType): GetTxIdsByTypeAndStageRequest;

  getTxStage(): TxStage;
  setTxStage(value: TxStage): GetTxIdsByTypeAndStageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTxIdsByTypeAndStageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTxIdsByTypeAndStageRequest): GetTxIdsByTypeAndStageRequest.AsObject;
  static serializeBinaryToWriter(message: GetTxIdsByTypeAndStageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTxIdsByTypeAndStageRequest;
  static deserializeBinaryFromReader(message: GetTxIdsByTypeAndStageRequest, reader: jspb.BinaryReader): GetTxIdsByTypeAndStageRequest;
}

export namespace GetTxIdsByTypeAndStageRequest {
  export type AsObject = {
    chainId: string,
    txType: TxType,
    txStage: TxStage,
  }
}

export class GetTxIdsByTypeAndStageResponse extends jspb.Message {
  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): GetTxIdsByTypeAndStageResponse;
  clearTxIdsList(): GetTxIdsByTypeAndStageResponse;
  addTxIds(value: string, index?: number): GetTxIdsByTypeAndStageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTxIdsByTypeAndStageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTxIdsByTypeAndStageResponse): GetTxIdsByTypeAndStageResponse.AsObject;
  static serializeBinaryToWriter(message: GetTxIdsByTypeAndStageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTxIdsByTypeAndStageResponse;
  static deserializeBinaryFromReader(message: GetTxIdsByTypeAndStageResponse, reader: jspb.BinaryReader): GetTxIdsByTypeAndStageResponse;
}

export namespace GetTxIdsByTypeAndStageResponse {
  export type AsObject = {
    txIdsList: Array<string>,
  }
}

export class GetTxsInPoolByTxIdsRequest extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): GetTxsInPoolByTxIdsRequest;

  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): GetTxsInPoolByTxIdsRequest;
  clearTxIdsList(): GetTxsInPoolByTxIdsRequest;
  addTxIds(value: string, index?: number): GetTxsInPoolByTxIdsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTxsInPoolByTxIdsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTxsInPoolByTxIdsRequest): GetTxsInPoolByTxIdsRequest.AsObject;
  static serializeBinaryToWriter(message: GetTxsInPoolByTxIdsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTxsInPoolByTxIdsRequest;
  static deserializeBinaryFromReader(message: GetTxsInPoolByTxIdsRequest, reader: jspb.BinaryReader): GetTxsInPoolByTxIdsRequest;
}

export namespace GetTxsInPoolByTxIdsRequest {
  export type AsObject = {
    chainId: string,
    txIdsList: Array<string>,
  }
}

export class GetTxsInPoolByTxIdsResponse extends jspb.Message {
  getTxsList(): Array<common_transaction_pb.Transaction>;
  setTxsList(value: Array<common_transaction_pb.Transaction>): GetTxsInPoolByTxIdsResponse;
  clearTxsList(): GetTxsInPoolByTxIdsResponse;
  addTxs(value?: common_transaction_pb.Transaction, index?: number): common_transaction_pb.Transaction;

  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): GetTxsInPoolByTxIdsResponse;
  clearTxIdsList(): GetTxsInPoolByTxIdsResponse;
  addTxIds(value: string, index?: number): GetTxsInPoolByTxIdsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTxsInPoolByTxIdsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTxsInPoolByTxIdsResponse): GetTxsInPoolByTxIdsResponse.AsObject;
  static serializeBinaryToWriter(message: GetTxsInPoolByTxIdsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTxsInPoolByTxIdsResponse;
  static deserializeBinaryFromReader(message: GetTxsInPoolByTxIdsResponse, reader: jspb.BinaryReader): GetTxsInPoolByTxIdsResponse;
}

export namespace GetTxsInPoolByTxIdsResponse {
  export type AsObject = {
    txsList: Array<common_transaction_pb.Transaction.AsObject>,
    txIdsList: Array<string>,
  }
}

export enum SignalType { 
  NO_EVENT = 0,
  TRANSACTION_INCOME = 1,
  BLOCK_PROPOSE = 2,
}
export enum TxType { 
  UNKNOWN_TYPE = 0,
  CONFIG_TX = 1,
  COMMON_TX = 2,
  ALL_TYPE = 3,
}
export enum TxStage { 
  UNKNOWN_STAGE = 0,
  IN_QUEUE = 1,
  IN_PENDING = 2,
  ALL_STAGE = 3,
}
export enum TxPoolMsgType { 
  SINGLE_TX = 0,
  BATCH_TX = 1,
  RECOVER_REQ = 2,
  RECOVER_RESP = 3,
}
