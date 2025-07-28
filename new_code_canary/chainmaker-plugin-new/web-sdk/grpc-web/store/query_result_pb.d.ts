import * as jspb from 'google-protobuf'



export class KeyModification extends jspb.Message {
  getTxId(): string;
  setTxId(value: string): KeyModification;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): KeyModification;

  getTimestamp(): number;
  setTimestamp(value: number): KeyModification;

  getIsDelete(): boolean;
  setIsDelete(value: boolean): KeyModification;

  getBlockHeight(): number;
  setBlockHeight(value: number): KeyModification;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyModification.AsObject;
  static toObject(includeInstance: boolean, msg: KeyModification): KeyModification.AsObject;
  static serializeBinaryToWriter(message: KeyModification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyModification;
  static deserializeBinaryFromReader(message: KeyModification, reader: jspb.BinaryReader): KeyModification;
}

export namespace KeyModification {
  export type AsObject = {
    txId: string,
    value: Uint8Array | string,
    timestamp: number,
    isDelete: boolean,
    blockHeight: number,
  }
}

export class TxHistory extends jspb.Message {
  getTxId(): string;
  setTxId(value: string): TxHistory;

  getBlockHeight(): number;
  setBlockHeight(value: number): TxHistory;

  getBlockHash(): Uint8Array | string;
  getBlockHash_asU8(): Uint8Array;
  getBlockHash_asB64(): string;
  setBlockHash(value: Uint8Array | string): TxHistory;

  getTimestamp(): number;
  setTimestamp(value: number): TxHistory;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxHistory.AsObject;
  static toObject(includeInstance: boolean, msg: TxHistory): TxHistory.AsObject;
  static serializeBinaryToWriter(message: TxHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxHistory;
  static deserializeBinaryFromReader(message: TxHistory, reader: jspb.BinaryReader): TxHistory;
}

export namespace TxHistory {
  export type AsObject = {
    txId: string,
    blockHeight: number,
    blockHash: Uint8Array | string,
    timestamp: number,
  }
}

export class KV extends jspb.Message {
  getContractName(): string;
  setContractName(value: string): KV;

  getKey(): Uint8Array | string;
  getKey_asU8(): Uint8Array;
  getKey_asB64(): string;
  setKey(value: Uint8Array | string): KV;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): KV;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KV.AsObject;
  static toObject(includeInstance: boolean, msg: KV): KV.AsObject;
  static serializeBinaryToWriter(message: KV, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KV;
  static deserializeBinaryFromReader(message: KV, reader: jspb.BinaryReader): KV;
}

export namespace KV {
  export type AsObject = {
    contractName: string,
    key: Uint8Array | string,
    value: Uint8Array | string,
  }
}

