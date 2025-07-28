import * as jspb from 'google-protobuf'



export class Msg extends jspb.Message {
  getMsg(): NetMsg | undefined;
  setMsg(value?: NetMsg): Msg;
  hasMsg(): boolean;
  clearMsg(): Msg;

  getChainId(): string;
  setChainId(value: string): Msg;

  getFlag(): string;
  setFlag(value: string): Msg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Msg.AsObject;
  static toObject(includeInstance: boolean, msg: Msg): Msg.AsObject;
  static serializeBinaryToWriter(message: Msg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Msg;
  static deserializeBinaryFromReader(message: Msg, reader: jspb.BinaryReader): Msg;
}

export namespace Msg {
  export type AsObject = {
    msg?: NetMsg.AsObject,
    chainId: string,
    flag: string,
  }
}

export class NetMsg extends jspb.Message {
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): NetMsg;

  getType(): NetMsg.MsgType;
  setType(value: NetMsg.MsgType): NetMsg;

  getTo(): string;
  setTo(value: string): NetMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NetMsg.AsObject;
  static toObject(includeInstance: boolean, msg: NetMsg): NetMsg.AsObject;
  static serializeBinaryToWriter(message: NetMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NetMsg;
  static deserializeBinaryFromReader(message: NetMsg, reader: jspb.BinaryReader): NetMsg;
}

export namespace NetMsg {
  export type AsObject = {
    payload: Uint8Array | string,
    type: NetMsg.MsgType,
    to: string,
  }

  export enum MsgType { 
    INVALID_MSG = 0,
    TX = 1,
    TXS = 2,
    BLOCK = 3,
    BLOCKS = 4,
    CONSENSUS_MSG = 5,
    SYNC_BLOCK_MSG = 6,
    CONSISTENT_MSG = 7,
  }
}

