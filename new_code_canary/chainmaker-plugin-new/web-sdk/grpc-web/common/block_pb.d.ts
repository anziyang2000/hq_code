import * as jspb from 'google-protobuf'

import * as accesscontrol_member_pb from '../accesscontrol/member_pb';
import * as common_rwset_pb from '../common/rwset_pb';
import * as common_transaction_pb from '../common/transaction_pb';


export class Block extends jspb.Message {
  getHeader(): BlockHeader | undefined;
  setHeader(value?: BlockHeader): Block;
  hasHeader(): boolean;
  clearHeader(): Block;

  getDag(): DAG | undefined;
  setDag(value?: DAG): Block;
  hasDag(): boolean;
  clearDag(): Block;

  getTxsList(): Array<common_transaction_pb.Transaction>;
  setTxsList(value: Array<common_transaction_pb.Transaction>): Block;
  clearTxsList(): Block;
  addTxs(value?: common_transaction_pb.Transaction, index?: number): common_transaction_pb.Transaction;

  getAdditionalData(): AdditionalData | undefined;
  setAdditionalData(value?: AdditionalData): Block;
  hasAdditionalData(): boolean;
  clearAdditionalData(): Block;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Block.AsObject;
  static toObject(includeInstance: boolean, msg: Block): Block.AsObject;
  static serializeBinaryToWriter(message: Block, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Block;
  static deserializeBinaryFromReader(message: Block, reader: jspb.BinaryReader): Block;
}

export namespace Block {
  export type AsObject = {
    header?: BlockHeader.AsObject,
    dag?: DAG.AsObject,
    txsList: Array<common_transaction_pb.Transaction.AsObject>,
    additionalData?: AdditionalData.AsObject,
  }
}

export class BlockInfo extends jspb.Message {
  getBlock(): Block | undefined;
  setBlock(value?: Block): BlockInfo;
  hasBlock(): boolean;
  clearBlock(): BlockInfo;

  getRwsetListList(): Array<common_rwset_pb.TxRWSet>;
  setRwsetListList(value: Array<common_rwset_pb.TxRWSet>): BlockInfo;
  clearRwsetListList(): BlockInfo;
  addRwsetList(value?: common_rwset_pb.TxRWSet, index?: number): common_rwset_pb.TxRWSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BlockInfo): BlockInfo.AsObject;
  static serializeBinaryToWriter(message: BlockInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockInfo;
  static deserializeBinaryFromReader(message: BlockInfo, reader: jspb.BinaryReader): BlockInfo;
}

export namespace BlockInfo {
  export type AsObject = {
    block?: Block.AsObject,
    rwsetListList: Array<common_rwset_pb.TxRWSet.AsObject>,
  }
}

export class AdditionalData extends jspb.Message {
  getExtraDataMap(): jspb.Map<string, Uint8Array | string>;
  clearExtraDataMap(): AdditionalData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdditionalData.AsObject;
  static toObject(includeInstance: boolean, msg: AdditionalData): AdditionalData.AsObject;
  static serializeBinaryToWriter(message: AdditionalData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdditionalData;
  static deserializeBinaryFromReader(message: AdditionalData, reader: jspb.BinaryReader): AdditionalData;
}

export namespace AdditionalData {
  export type AsObject = {
    extraDataMap: Array<[string, Uint8Array | string]>,
  }
}

export class TxBatchInfo extends jspb.Message {
  getBatchIdsList(): Array<string>;
  setBatchIdsList(value: Array<string>): TxBatchInfo;
  clearBatchIdsList(): TxBatchInfo;
  addBatchIds(value: string, index?: number): TxBatchInfo;

  getIndexList(): Array<number>;
  setIndexList(value: Array<number>): TxBatchInfo;
  clearIndexList(): TxBatchInfo;
  addIndex(value: number, index?: number): TxBatchInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxBatchInfo.AsObject;
  static toObject(includeInstance: boolean, msg: TxBatchInfo): TxBatchInfo.AsObject;
  static serializeBinaryToWriter(message: TxBatchInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxBatchInfo;
  static deserializeBinaryFromReader(message: TxBatchInfo, reader: jspb.BinaryReader): TxBatchInfo;
}

export namespace TxBatchInfo {
  export type AsObject = {
    batchIdsList: Array<string>,
    indexList: Array<number>,
  }
}

export class BlockHeader extends jspb.Message {
  getBlockVersion(): number;
  setBlockVersion(value: number): BlockHeader;

  getBlockType(): BlockType;
  setBlockType(value: BlockType): BlockHeader;

  getChainId(): string;
  setChainId(value: string): BlockHeader;

  getBlockHeight(): number;
  setBlockHeight(value: number): BlockHeader;

  getBlockHash(): Uint8Array | string;
  getBlockHash_asU8(): Uint8Array;
  getBlockHash_asB64(): string;
  setBlockHash(value: Uint8Array | string): BlockHeader;

  getPreBlockHash(): Uint8Array | string;
  getPreBlockHash_asU8(): Uint8Array;
  getPreBlockHash_asB64(): string;
  setPreBlockHash(value: Uint8Array | string): BlockHeader;

  getPreConfHeight(): number;
  setPreConfHeight(value: number): BlockHeader;

  getTxCount(): number;
  setTxCount(value: number): BlockHeader;

  getTxRoot(): Uint8Array | string;
  getTxRoot_asU8(): Uint8Array;
  getTxRoot_asB64(): string;
  setTxRoot(value: Uint8Array | string): BlockHeader;

  getDagHash(): Uint8Array | string;
  getDagHash_asU8(): Uint8Array;
  getDagHash_asB64(): string;
  setDagHash(value: Uint8Array | string): BlockHeader;

  getRwSetRoot(): Uint8Array | string;
  getRwSetRoot_asU8(): Uint8Array;
  getRwSetRoot_asB64(): string;
  setRwSetRoot(value: Uint8Array | string): BlockHeader;

  getBlockTimestamp(): number;
  setBlockTimestamp(value: number): BlockHeader;

  getConsensusArgs(): Uint8Array | string;
  getConsensusArgs_asU8(): Uint8Array;
  getConsensusArgs_asB64(): string;
  setConsensusArgs(value: Uint8Array | string): BlockHeader;

  getProposer(): accesscontrol_member_pb.Member | undefined;
  setProposer(value?: accesscontrol_member_pb.Member): BlockHeader;
  hasProposer(): boolean;
  clearProposer(): BlockHeader;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): BlockHeader;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockHeader.AsObject;
  static toObject(includeInstance: boolean, msg: BlockHeader): BlockHeader.AsObject;
  static serializeBinaryToWriter(message: BlockHeader, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockHeader;
  static deserializeBinaryFromReader(message: BlockHeader, reader: jspb.BinaryReader): BlockHeader;
}

export namespace BlockHeader {
  export type AsObject = {
    blockVersion: number,
    blockType: BlockType,
    chainId: string,
    blockHeight: number,
    blockHash: Uint8Array | string,
    preBlockHash: Uint8Array | string,
    preConfHeight: number,
    txCount: number,
    txRoot: Uint8Array | string,
    dagHash: Uint8Array | string,
    rwSetRoot: Uint8Array | string,
    blockTimestamp: number,
    consensusArgs: Uint8Array | string,
    proposer?: accesscontrol_member_pb.Member.AsObject,
    signature: Uint8Array | string,
  }
}

export class DAG extends jspb.Message {
  getVertexesList(): Array<DAG.Neighbor>;
  setVertexesList(value: Array<DAG.Neighbor>): DAG;
  clearVertexesList(): DAG;
  addVertexes(value?: DAG.Neighbor, index?: number): DAG.Neighbor;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DAG.AsObject;
  static toObject(includeInstance: boolean, msg: DAG): DAG.AsObject;
  static serializeBinaryToWriter(message: DAG, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DAG;
  static deserializeBinaryFromReader(message: DAG, reader: jspb.BinaryReader): DAG;
}

export namespace DAG {
  export type AsObject = {
    vertexesList: Array<DAG.Neighbor.AsObject>,
  }

  export class Neighbor extends jspb.Message {
    getNeighborsList(): Array<number>;
    setNeighborsList(value: Array<number>): Neighbor;
    clearNeighborsList(): Neighbor;
    addNeighbors(value: number, index?: number): Neighbor;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Neighbor.AsObject;
    static toObject(includeInstance: boolean, msg: Neighbor): Neighbor.AsObject;
    static serializeBinaryToWriter(message: Neighbor, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Neighbor;
    static deserializeBinaryFromReader(message: Neighbor, reader: jspb.BinaryReader): Neighbor;
  }

  export namespace Neighbor {
    export type AsObject = {
      neighborsList: Array<number>,
    }
  }

}

export enum BlockType { 
  NORMAL_BLOCK = 0,
  CONFIG_BLOCK = 1,
  CONTRACT_MGR_BLOCK = 2,
  HAS_COINBASE = 4,
}
