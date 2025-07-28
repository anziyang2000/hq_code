import * as jspb from 'google-protobuf'



export class KeyVersion extends jspb.Message {
  getRefTxId(): string;
  setRefTxId(value: string): KeyVersion;

  getRefOffset(): number;
  setRefOffset(value: number): KeyVersion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyVersion.AsObject;
  static toObject(includeInstance: boolean, msg: KeyVersion): KeyVersion.AsObject;
  static serializeBinaryToWriter(message: KeyVersion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyVersion;
  static deserializeBinaryFromReader(message: KeyVersion, reader: jspb.BinaryReader): KeyVersion;
}

export namespace KeyVersion {
  export type AsObject = {
    refTxId: string,
    refOffset: number,
  }
}

export class TxRead extends jspb.Message {
  getKey(): Uint8Array | string;
  getKey_asU8(): Uint8Array;
  getKey_asB64(): string;
  setKey(value: Uint8Array | string): TxRead;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): TxRead;

  getContractName(): string;
  setContractName(value: string): TxRead;

  getVersion(): KeyVersion | undefined;
  setVersion(value?: KeyVersion): TxRead;
  hasVersion(): boolean;
  clearVersion(): TxRead;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxRead.AsObject;
  static toObject(includeInstance: boolean, msg: TxRead): TxRead.AsObject;
  static serializeBinaryToWriter(message: TxRead, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxRead;
  static deserializeBinaryFromReader(message: TxRead, reader: jspb.BinaryReader): TxRead;
}

export namespace TxRead {
  export type AsObject = {
    key: Uint8Array | string,
    value: Uint8Array | string,
    contractName: string,
    version?: KeyVersion.AsObject,
  }
}

export class TxWrite extends jspb.Message {
  getKey(): Uint8Array | string;
  getKey_asU8(): Uint8Array;
  getKey_asB64(): string;
  setKey(value: Uint8Array | string): TxWrite;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): TxWrite;

  getContractName(): string;
  setContractName(value: string): TxWrite;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxWrite.AsObject;
  static toObject(includeInstance: boolean, msg: TxWrite): TxWrite.AsObject;
  static serializeBinaryToWriter(message: TxWrite, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxWrite;
  static deserializeBinaryFromReader(message: TxWrite, reader: jspb.BinaryReader): TxWrite;
}

export namespace TxWrite {
  export type AsObject = {
    key: Uint8Array | string,
    value: Uint8Array | string,
    contractName: string,
  }
}

export class TxRWSet extends jspb.Message {
  getTxId(): string;
  setTxId(value: string): TxRWSet;

  getTxReadsList(): Array<TxRead>;
  setTxReadsList(value: Array<TxRead>): TxRWSet;
  clearTxReadsList(): TxRWSet;
  addTxReads(value?: TxRead, index?: number): TxRead;

  getTxWritesList(): Array<TxWrite>;
  setTxWritesList(value: Array<TxWrite>): TxRWSet;
  clearTxWritesList(): TxRWSet;
  addTxWrites(value?: TxWrite, index?: number): TxWrite;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxRWSet.AsObject;
  static toObject(includeInstance: boolean, msg: TxRWSet): TxRWSet.AsObject;
  static serializeBinaryToWriter(message: TxRWSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxRWSet;
  static deserializeBinaryFromReader(message: TxRWSet, reader: jspb.BinaryReader): TxRWSet;
}

export namespace TxRWSet {
  export type AsObject = {
    txId: string,
    txReadsList: Array<TxRead.AsObject>,
    txWritesList: Array<TxWrite.AsObject>,
  }
}

