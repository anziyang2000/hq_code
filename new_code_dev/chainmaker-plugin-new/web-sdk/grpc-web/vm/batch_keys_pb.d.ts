import * as jspb from 'google-protobuf'



export class BatchKey extends jspb.Message {
  getKey(): string;
  setKey(value: string): BatchKey;

  getField(): string;
  setField(value: string): BatchKey;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): BatchKey;

  getContractName(): string;
  setContractName(value: string): BatchKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchKey.AsObject;
  static toObject(includeInstance: boolean, msg: BatchKey): BatchKey.AsObject;
  static serializeBinaryToWriter(message: BatchKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchKey;
  static deserializeBinaryFromReader(message: BatchKey, reader: jspb.BinaryReader): BatchKey;
}

export namespace BatchKey {
  export type AsObject = {
    key: string,
    field: string,
    value: Uint8Array | string,
    contractName: string,
  }
}

export class BatchKeys extends jspb.Message {
  getKeysList(): Array<BatchKey>;
  setKeysList(value: Array<BatchKey>): BatchKeys;
  clearKeysList(): BatchKeys;
  addKeys(value?: BatchKey, index?: number): BatchKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchKeys.AsObject;
  static toObject(includeInstance: boolean, msg: BatchKeys): BatchKeys.AsObject;
  static serializeBinaryToWriter(message: BatchKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchKeys;
  static deserializeBinaryFromReader(message: BatchKeys, reader: jspb.BinaryReader): BatchKeys;
}

export namespace BatchKeys {
  export type AsObject = {
    keysList: Array<BatchKey.AsObject>,
  }
}

export class Keys extends jspb.Message {
  getKeyList(): Array<string>;
  setKeyList(value: Array<string>): Keys;
  clearKeyList(): Keys;
  addKey(value: string, index?: number): Keys;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Keys.AsObject;
  static toObject(includeInstance: boolean, msg: Keys): Keys.AsObject;
  static serializeBinaryToWriter(message: Keys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Keys;
  static deserializeBinaryFromReader(message: Keys, reader: jspb.BinaryReader): Keys;
}

export namespace Keys {
  export type AsObject = {
    keyList: Array<string>,
  }
}

