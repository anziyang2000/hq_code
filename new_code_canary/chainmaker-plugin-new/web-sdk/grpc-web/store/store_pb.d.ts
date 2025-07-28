import * as jspb from 'google-protobuf'

import * as common_block_pb from '../common/block_pb';
import * as common_rwset_pb from '../common/rwset_pb';
import * as common_result_pb from '../common/result_pb';
import * as common_transaction_pb from '../common/transaction_pb';


export class SerializedBlock extends jspb.Message {
  getHeader(): common_block_pb.BlockHeader | undefined;
  setHeader(value?: common_block_pb.BlockHeader): SerializedBlock;
  hasHeader(): boolean;
  clearHeader(): SerializedBlock;

  getDag(): common_block_pb.DAG | undefined;
  setDag(value?: common_block_pb.DAG): SerializedBlock;
  hasDag(): boolean;
  clearDag(): SerializedBlock;

  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): SerializedBlock;
  clearTxIdsList(): SerializedBlock;
  addTxIds(value: string, index?: number): SerializedBlock;

  getAdditionalData(): common_block_pb.AdditionalData | undefined;
  setAdditionalData(value?: common_block_pb.AdditionalData): SerializedBlock;
  hasAdditionalData(): boolean;
  clearAdditionalData(): SerializedBlock;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializedBlock.AsObject;
  static toObject(includeInstance: boolean, msg: SerializedBlock): SerializedBlock.AsObject;
  static serializeBinaryToWriter(message: SerializedBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SerializedBlock;
  static deserializeBinaryFromReader(message: SerializedBlock, reader: jspb.BinaryReader): SerializedBlock;
}

export namespace SerializedBlock {
  export type AsObject = {
    header?: common_block_pb.BlockHeader.AsObject,
    dag?: common_block_pb.DAG.AsObject,
    txIdsList: Array<string>,
    additionalData?: common_block_pb.AdditionalData.AsObject,
  }
}

export class BlockWithRWSet extends jspb.Message {
  getBlock(): common_block_pb.Block | undefined;
  setBlock(value?: common_block_pb.Block): BlockWithRWSet;
  hasBlock(): boolean;
  clearBlock(): BlockWithRWSet;

  getTxrwsetsList(): Array<common_rwset_pb.TxRWSet>;
  setTxrwsetsList(value: Array<common_rwset_pb.TxRWSet>): BlockWithRWSet;
  clearTxrwsetsList(): BlockWithRWSet;
  addTxrwsets(value?: common_rwset_pb.TxRWSet, index?: number): common_rwset_pb.TxRWSet;

  getContractEventsList(): Array<common_result_pb.ContractEvent>;
  setContractEventsList(value: Array<common_result_pb.ContractEvent>): BlockWithRWSet;
  clearContractEventsList(): BlockWithRWSet;
  addContractEvents(value?: common_result_pb.ContractEvent, index?: number): common_result_pb.ContractEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockWithRWSet.AsObject;
  static toObject(includeInstance: boolean, msg: BlockWithRWSet): BlockWithRWSet.AsObject;
  static serializeBinaryToWriter(message: BlockWithRWSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockWithRWSet;
  static deserializeBinaryFromReader(message: BlockWithRWSet, reader: jspb.BinaryReader): BlockWithRWSet;
}

export namespace BlockWithRWSet {
  export type AsObject = {
    block?: common_block_pb.Block.AsObject,
    txrwsetsList: Array<common_rwset_pb.TxRWSet.AsObject>,
    contractEventsList: Array<common_result_pb.ContractEvent.AsObject>,
  }
}

export class TransactionStoreInfo extends jspb.Message {
  getTransaction(): common_transaction_pb.Transaction | undefined;
  setTransaction(value?: common_transaction_pb.Transaction): TransactionStoreInfo;
  hasTransaction(): boolean;
  clearTransaction(): TransactionStoreInfo;

  getBlockHeight(): number;
  setBlockHeight(value: number): TransactionStoreInfo;

  getBlockHash(): Uint8Array | string;
  getBlockHash_asU8(): Uint8Array;
  getBlockHash_asB64(): string;
  setBlockHash(value: Uint8Array | string): TransactionStoreInfo;

  getTxIndex(): number;
  setTxIndex(value: number): TransactionStoreInfo;

  getBlockTimestamp(): number;
  setBlockTimestamp(value: number): TransactionStoreInfo;

  getTransactionStoreInfo(): StoreInfo | undefined;
  setTransactionStoreInfo(value?: StoreInfo): TransactionStoreInfo;
  hasTransactionStoreInfo(): boolean;
  clearTransactionStoreInfo(): TransactionStoreInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionStoreInfo.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionStoreInfo): TransactionStoreInfo.AsObject;
  static serializeBinaryToWriter(message: TransactionStoreInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionStoreInfo;
  static deserializeBinaryFromReader(message: TransactionStoreInfo, reader: jspb.BinaryReader): TransactionStoreInfo;
}

export namespace TransactionStoreInfo {
  export type AsObject = {
    transaction?: common_transaction_pb.Transaction.AsObject,
    blockHeight: number,
    blockHash: Uint8Array | string,
    txIndex: number,
    blockTimestamp: number,
    transactionStoreInfo?: StoreInfo.AsObject,
  }
}

export class StoreInfo extends jspb.Message {
  getStoreType(): DataStoreType;
  setStoreType(value: DataStoreType): StoreInfo;

  getFileName(): string;
  setFileName(value: string): StoreInfo;

  getOffset(): number;
  setOffset(value: number): StoreInfo;

  getByteLen(): number;
  setByteLen(value: number): StoreInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StoreInfo.AsObject;
  static toObject(includeInstance: boolean, msg: StoreInfo): StoreInfo.AsObject;
  static serializeBinaryToWriter(message: StoreInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StoreInfo;
  static deserializeBinaryFromReader(message: StoreInfo, reader: jspb.BinaryReader): StoreInfo;
}

export namespace StoreInfo {
  export type AsObject = {
    storeType: DataStoreType,
    fileName: string,
    offset: number,
    byteLen: number,
  }
}

export enum DbType { 
  INVALID_DB = 0,
  BLOCK_DB = 1,
  BLOCK_INDEX_DB = 2,
  TX_DB = 3,
  TX_INDEX_DB = 4,
  SOFT_DB = 5,
  STATE_DB = 6,
  READ_WRITE_DB = 7,
}
export enum DataStoreType { 
  FILE_STORE = 0,
  SQL_STORE = 1,
  COS = 2,
}
