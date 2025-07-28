import * as jspb from 'google-protobuf'

import * as common_result_pb from '../common/result_pb';


export class OutCallGetRequest extends jspb.Message {
  getContractName(): string;
  setContractName(value: string): OutCallGetRequest;

  getKey(): string;
  setKey(value: string): OutCallGetRequest;

  getExtra(): Uint8Array | string;
  getExtra_asU8(): Uint8Array;
  getExtra_asB64(): string;
  setExtra(value: Uint8Array | string): OutCallGetRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutCallGetRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OutCallGetRequest): OutCallGetRequest.AsObject;
  static serializeBinaryToWriter(message: OutCallGetRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutCallGetRequest;
  static deserializeBinaryFromReader(message: OutCallGetRequest, reader: jspb.BinaryReader): OutCallGetRequest;
}

export namespace OutCallGetRequest {
  export type AsObject = {
    contractName: string,
    key: string,
    extra: Uint8Array | string,
  }
}

export class OutCallPutRequest extends jspb.Message {
  getContractName(): string;
  setContractName(value: string): OutCallPutRequest;

  getKey(): string;
  setKey(value: string): OutCallPutRequest;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): OutCallPutRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutCallPutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OutCallPutRequest): OutCallPutRequest.AsObject;
  static serializeBinaryToWriter(message: OutCallPutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutCallPutRequest;
  static deserializeBinaryFromReader(message: OutCallPutRequest, reader: jspb.BinaryReader): OutCallPutRequest;
}

export namespace OutCallPutRequest {
  export type AsObject = {
    contractName: string,
    key: string,
    value: Uint8Array | string,
  }
}

