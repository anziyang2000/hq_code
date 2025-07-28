import * as jspb from 'google-protobuf'

import * as common_block_pb from '../common/block_pb';


export class SyncMsg extends jspb.Message {
  getType(): SyncMsg.MsgType;
  setType(value: SyncMsg.MsgType): SyncMsg;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): SyncMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SyncMsg.AsObject;
  static toObject(includeInstance: boolean, msg: SyncMsg): SyncMsg.AsObject;
  static serializeBinaryToWriter(message: SyncMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SyncMsg;
  static deserializeBinaryFromReader(message: SyncMsg, reader: jspb.BinaryReader): SyncMsg;
}

export namespace SyncMsg {
  export type AsObject = {
    type: SyncMsg.MsgType,
    payload: Uint8Array | string,
  }

  export enum MsgType { 
    NODE_STATUS_REQ = 0,
    NODE_STATUS_RESP = 1,
    BLOCK_SYNC_REQ = 2,
    BLOCK_SYNC_RESP = 3,
  }
}

export class BlockHeightBCM extends jspb.Message {
  getBlockHeight(): number;
  setBlockHeight(value: number): BlockHeightBCM;

  getArchivedHeight(): number;
  setArchivedHeight(value: number): BlockHeightBCM;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockHeightBCM.AsObject;
  static toObject(includeInstance: boolean, msg: BlockHeightBCM): BlockHeightBCM.AsObject;
  static serializeBinaryToWriter(message: BlockHeightBCM, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockHeightBCM;
  static deserializeBinaryFromReader(message: BlockHeightBCM, reader: jspb.BinaryReader): BlockHeightBCM;
}

export namespace BlockHeightBCM {
  export type AsObject = {
    blockHeight: number,
    archivedHeight: number,
  }
}

export class BlockSyncReq extends jspb.Message {
  getBlockHeight(): number;
  setBlockHeight(value: number): BlockSyncReq;

  getBatchSize(): number;
  setBatchSize(value: number): BlockSyncReq;

  getWithRwset(): boolean;
  setWithRwset(value: boolean): BlockSyncReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockSyncReq.AsObject;
  static toObject(includeInstance: boolean, msg: BlockSyncReq): BlockSyncReq.AsObject;
  static serializeBinaryToWriter(message: BlockSyncReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockSyncReq;
  static deserializeBinaryFromReader(message: BlockSyncReq, reader: jspb.BinaryReader): BlockSyncReq;
}

export namespace BlockSyncReq {
  export type AsObject = {
    blockHeight: number,
    batchSize: number,
    withRwset: boolean,
  }
}

export class BlockBatch extends jspb.Message {
  getBatchesList(): Array<common_block_pb.Block>;
  setBatchesList(value: Array<common_block_pb.Block>): BlockBatch;
  clearBatchesList(): BlockBatch;
  addBatches(value?: common_block_pb.Block, index?: number): common_block_pb.Block;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockBatch.AsObject;
  static toObject(includeInstance: boolean, msg: BlockBatch): BlockBatch.AsObject;
  static serializeBinaryToWriter(message: BlockBatch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockBatch;
  static deserializeBinaryFromReader(message: BlockBatch, reader: jspb.BinaryReader): BlockBatch;
}

export namespace BlockBatch {
  export type AsObject = {
    batchesList: Array<common_block_pb.Block.AsObject>,
  }
}

export class BlockInfoBatch extends jspb.Message {
  getBatchList(): Array<common_block_pb.BlockInfo>;
  setBatchList(value: Array<common_block_pb.BlockInfo>): BlockInfoBatch;
  clearBatchList(): BlockInfoBatch;
  addBatch(value?: common_block_pb.BlockInfo, index?: number): common_block_pb.BlockInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockInfoBatch.AsObject;
  static toObject(includeInstance: boolean, msg: BlockInfoBatch): BlockInfoBatch.AsObject;
  static serializeBinaryToWriter(message: BlockInfoBatch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockInfoBatch;
  static deserializeBinaryFromReader(message: BlockInfoBatch, reader: jspb.BinaryReader): BlockInfoBatch;
}

export namespace BlockInfoBatch {
  export type AsObject = {
    batchList: Array<common_block_pb.BlockInfo.AsObject>,
  }
}

export class SyncBlockBatch extends jspb.Message {
  getBlockBatch(): BlockBatch | undefined;
  setBlockBatch(value?: BlockBatch): SyncBlockBatch;
  hasBlockBatch(): boolean;
  clearBlockBatch(): SyncBlockBatch;

  getBlockinfoBatch(): BlockInfoBatch | undefined;
  setBlockinfoBatch(value?: BlockInfoBatch): SyncBlockBatch;
  hasBlockinfoBatch(): boolean;
  clearBlockinfoBatch(): SyncBlockBatch;

  getWithRwset(): boolean;
  setWithRwset(value: boolean): SyncBlockBatch;

  getDataCase(): SyncBlockBatch.DataCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SyncBlockBatch.AsObject;
  static toObject(includeInstance: boolean, msg: SyncBlockBatch): SyncBlockBatch.AsObject;
  static serializeBinaryToWriter(message: SyncBlockBatch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SyncBlockBatch;
  static deserializeBinaryFromReader(message: SyncBlockBatch, reader: jspb.BinaryReader): SyncBlockBatch;
}

export namespace SyncBlockBatch {
  export type AsObject = {
    blockBatch?: BlockBatch.AsObject,
    blockinfoBatch?: BlockInfoBatch.AsObject,
    withRwset: boolean,
  }

  export enum DataCase { 
    DATA_NOT_SET = 0,
    BLOCK_BATCH = 1,
    BLOCKINFO_BATCH = 2,
  }
}

