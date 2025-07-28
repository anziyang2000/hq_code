import * as jspb from 'google-protobuf'



export class LogLevelsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogLevelsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LogLevelsRequest): LogLevelsRequest.AsObject;
  static serializeBinaryToWriter(message: LogLevelsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogLevelsRequest;
  static deserializeBinaryFromReader(message: LogLevelsRequest, reader: jspb.BinaryReader): LogLevelsRequest;
}

export namespace LogLevelsRequest {
  export type AsObject = {
  }
}

export class LogLevelsResponse extends jspb.Message {
  getCode(): number;
  setCode(value: number): LogLevelsResponse;

  getMessage(): string;
  setMessage(value: string): LogLevelsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogLevelsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LogLevelsResponse): LogLevelsResponse.AsObject;
  static serializeBinaryToWriter(message: LogLevelsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogLevelsResponse;
  static deserializeBinaryFromReader(message: LogLevelsResponse, reader: jspb.BinaryReader): LogLevelsResponse;
}

export namespace LogLevelsResponse {
  export type AsObject = {
    code: number,
    message: string,
  }
}

