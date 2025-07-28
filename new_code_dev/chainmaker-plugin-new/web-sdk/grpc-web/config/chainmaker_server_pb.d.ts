import * as jspb from 'google-protobuf'



export class ChainMakerVersionRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChainMakerVersionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChainMakerVersionRequest): ChainMakerVersionRequest.AsObject;
  static serializeBinaryToWriter(message: ChainMakerVersionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChainMakerVersionRequest;
  static deserializeBinaryFromReader(message: ChainMakerVersionRequest, reader: jspb.BinaryReader): ChainMakerVersionRequest;
}

export namespace ChainMakerVersionRequest {
  export type AsObject = {
  }
}

export class ChainMakerVersionResponse extends jspb.Message {
  getCode(): number;
  setCode(value: number): ChainMakerVersionResponse;

  getMessage(): string;
  setMessage(value: string): ChainMakerVersionResponse;

  getVersion(): string;
  setVersion(value: string): ChainMakerVersionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChainMakerVersionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChainMakerVersionResponse): ChainMakerVersionResponse.AsObject;
  static serializeBinaryToWriter(message: ChainMakerVersionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChainMakerVersionResponse;
  static deserializeBinaryFromReader(message: ChainMakerVersionResponse, reader: jspb.BinaryReader): ChainMakerVersionResponse;
}

export namespace ChainMakerVersionResponse {
  export type AsObject = {
    code: number,
    message: string,
    version: string,
  }
}

