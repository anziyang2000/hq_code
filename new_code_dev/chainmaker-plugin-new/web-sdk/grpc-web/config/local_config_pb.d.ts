import * as jspb from 'google-protobuf'

import * as config_chain_config_pb from '../config/chain_config_pb';


export class DebugConfigRequest extends jspb.Message {
  getPairsList(): Array<config_chain_config_pb.ConfigKeyValue>;
  setPairsList(value: Array<config_chain_config_pb.ConfigKeyValue>): DebugConfigRequest;
  clearPairsList(): DebugConfigRequest;
  addPairs(value?: config_chain_config_pb.ConfigKeyValue, index?: number): config_chain_config_pb.ConfigKeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugConfigRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DebugConfigRequest): DebugConfigRequest.AsObject;
  static serializeBinaryToWriter(message: DebugConfigRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugConfigRequest;
  static deserializeBinaryFromReader(message: DebugConfigRequest, reader: jspb.BinaryReader): DebugConfigRequest;
}

export namespace DebugConfigRequest {
  export type AsObject = {
    pairsList: Array<config_chain_config_pb.ConfigKeyValue.AsObject>,
  }
}

export class DebugConfigResponse extends jspb.Message {
  getCode(): number;
  setCode(value: number): DebugConfigResponse;

  getMessage(): string;
  setMessage(value: string): DebugConfigResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugConfigResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DebugConfigResponse): DebugConfigResponse.AsObject;
  static serializeBinaryToWriter(message: DebugConfigResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugConfigResponse;
  static deserializeBinaryFromReader(message: DebugConfigResponse, reader: jspb.BinaryReader): DebugConfigResponse;
}

export namespace DebugConfigResponse {
  export type AsObject = {
    code: number,
    message: string,
  }
}

export class CheckNewBlockChainConfigRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckNewBlockChainConfigRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CheckNewBlockChainConfigRequest): CheckNewBlockChainConfigRequest.AsObject;
  static serializeBinaryToWriter(message: CheckNewBlockChainConfigRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckNewBlockChainConfigRequest;
  static deserializeBinaryFromReader(message: CheckNewBlockChainConfigRequest, reader: jspb.BinaryReader): CheckNewBlockChainConfigRequest;
}

export namespace CheckNewBlockChainConfigRequest {
  export type AsObject = {
  }
}

export class CheckNewBlockChainConfigResponse extends jspb.Message {
  getCode(): number;
  setCode(value: number): CheckNewBlockChainConfigResponse;

  getMessage(): string;
  setMessage(value: string): CheckNewBlockChainConfigResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckNewBlockChainConfigResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CheckNewBlockChainConfigResponse): CheckNewBlockChainConfigResponse.AsObject;
  static serializeBinaryToWriter(message: CheckNewBlockChainConfigResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckNewBlockChainConfigResponse;
  static deserializeBinaryFromReader(message: CheckNewBlockChainConfigResponse, reader: jspb.BinaryReader): CheckNewBlockChainConfigResponse;
}

export namespace CheckNewBlockChainConfigResponse {
  export type AsObject = {
    code: number,
    message: string,
  }
}

