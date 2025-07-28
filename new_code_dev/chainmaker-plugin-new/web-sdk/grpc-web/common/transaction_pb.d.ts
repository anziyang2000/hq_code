import * as jspb from 'google-protobuf'

import * as common_request_pb from '../common/request_pb';
import * as common_result_pb from '../common/result_pb';
import * as common_rwset_pb from '../common/rwset_pb';


export class Transaction extends jspb.Message {
  getPayload(): common_request_pb.Payload | undefined;
  setPayload(value?: common_request_pb.Payload): Transaction;
  hasPayload(): boolean;
  clearPayload(): Transaction;

  getSender(): common_request_pb.EndorsementEntry | undefined;
  setSender(value?: common_request_pb.EndorsementEntry): Transaction;
  hasSender(): boolean;
  clearSender(): Transaction;

  getEndorsersList(): Array<common_request_pb.EndorsementEntry>;
  setEndorsersList(value: Array<common_request_pb.EndorsementEntry>): Transaction;
  clearEndorsersList(): Transaction;
  addEndorsers(value?: common_request_pb.EndorsementEntry, index?: number): common_request_pb.EndorsementEntry;

  getResult(): common_result_pb.Result | undefined;
  setResult(value?: common_result_pb.Result): Transaction;
  hasResult(): boolean;
  clearResult(): Transaction;

  getPayer(): common_request_pb.EndorsementEntry | undefined;
  setPayer(value?: common_request_pb.EndorsementEntry): Transaction;
  hasPayer(): boolean;
  clearPayer(): Transaction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Transaction.AsObject;
  static toObject(includeInstance: boolean, msg: Transaction): Transaction.AsObject;
  static serializeBinaryToWriter(message: Transaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Transaction;
  static deserializeBinaryFromReader(message: Transaction, reader: jspb.BinaryReader): Transaction;
}

export namespace Transaction {
  export type AsObject = {
    payload?: common_request_pb.Payload.AsObject,
    sender?: common_request_pb.EndorsementEntry.AsObject,
    endorsersList: Array<common_request_pb.EndorsementEntry.AsObject>,
    result?: common_result_pb.Result.AsObject,
    payer?: common_request_pb.EndorsementEntry.AsObject,
  }
}

export class TransactionInfo extends jspb.Message {
  getTransaction(): Transaction | undefined;
  setTransaction(value?: Transaction): TransactionInfo;
  hasTransaction(): boolean;
  clearTransaction(): TransactionInfo;

  getBlockHeight(): number;
  setBlockHeight(value: number): TransactionInfo;

  getBlockHash(): Uint8Array | string;
  getBlockHash_asU8(): Uint8Array;
  getBlockHash_asB64(): string;
  setBlockHash(value: Uint8Array | string): TransactionInfo;

  getTxIndex(): number;
  setTxIndex(value: number): TransactionInfo;

  getBlockTimestamp(): number;
  setBlockTimestamp(value: number): TransactionInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionInfo.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionInfo): TransactionInfo.AsObject;
  static serializeBinaryToWriter(message: TransactionInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionInfo;
  static deserializeBinaryFromReader(message: TransactionInfo, reader: jspb.BinaryReader): TransactionInfo;
}

export namespace TransactionInfo {
  export type AsObject = {
    transaction?: Transaction.AsObject,
    blockHeight: number,
    blockHash: Uint8Array | string,
    txIndex: number,
    blockTimestamp: number,
  }
}

export class TransactionWithRWSet extends jspb.Message {
  getTransaction(): Transaction | undefined;
  setTransaction(value?: Transaction): TransactionWithRWSet;
  hasTransaction(): boolean;
  clearTransaction(): TransactionWithRWSet;

  getRwSet(): common_rwset_pb.TxRWSet | undefined;
  setRwSet(value?: common_rwset_pb.TxRWSet): TransactionWithRWSet;
  hasRwSet(): boolean;
  clearRwSet(): TransactionWithRWSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionWithRWSet.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionWithRWSet): TransactionWithRWSet.AsObject;
  static serializeBinaryToWriter(message: TransactionWithRWSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionWithRWSet;
  static deserializeBinaryFromReader(message: TransactionWithRWSet, reader: jspb.BinaryReader): TransactionWithRWSet;
}

export namespace TransactionWithRWSet {
  export type AsObject = {
    transaction?: Transaction.AsObject,
    rwSet?: common_rwset_pb.TxRWSet.AsObject,
  }
}

export class TransactionInfoWithRWSet extends jspb.Message {
  getTransaction(): Transaction | undefined;
  setTransaction(value?: Transaction): TransactionInfoWithRWSet;
  hasTransaction(): boolean;
  clearTransaction(): TransactionInfoWithRWSet;

  getBlockHeight(): number;
  setBlockHeight(value: number): TransactionInfoWithRWSet;

  getBlockHash(): Uint8Array | string;
  getBlockHash_asU8(): Uint8Array;
  getBlockHash_asB64(): string;
  setBlockHash(value: Uint8Array | string): TransactionInfoWithRWSet;

  getTxIndex(): number;
  setTxIndex(value: number): TransactionInfoWithRWSet;

  getBlockTimestamp(): number;
  setBlockTimestamp(value: number): TransactionInfoWithRWSet;

  getRwSet(): common_rwset_pb.TxRWSet | undefined;
  setRwSet(value?: common_rwset_pb.TxRWSet): TransactionInfoWithRWSet;
  hasRwSet(): boolean;
  clearRwSet(): TransactionInfoWithRWSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionInfoWithRWSet.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionInfoWithRWSet): TransactionInfoWithRWSet.AsObject;
  static serializeBinaryToWriter(message: TransactionInfoWithRWSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionInfoWithRWSet;
  static deserializeBinaryFromReader(message: TransactionInfoWithRWSet, reader: jspb.BinaryReader): TransactionInfoWithRWSet;
}

export namespace TransactionInfoWithRWSet {
  export type AsObject = {
    transaction?: Transaction.AsObject,
    blockHeight: number,
    blockHash: Uint8Array | string,
    txIndex: number,
    blockTimestamp: number,
    rwSet?: common_rwset_pb.TxRWSet.AsObject,
  }
}

