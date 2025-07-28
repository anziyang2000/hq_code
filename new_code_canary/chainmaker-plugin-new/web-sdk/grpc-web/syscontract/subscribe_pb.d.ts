import * as jspb from 'google-protobuf'



export class SubscribeBlock extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeBlock.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeBlock): SubscribeBlock.AsObject;
  static serializeBinaryToWriter(message: SubscribeBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeBlock;
  static deserializeBinaryFromReader(message: SubscribeBlock, reader: jspb.BinaryReader): SubscribeBlock;
}

export namespace SubscribeBlock {
  export type AsObject = {
  }

  export enum Parameter { 
    START_BLOCK = 0,
    END_BLOCK = 1,
    WITH_RWSET = 2,
    ONLY_HEADER = 3,
  }
}

export class SubscribeTx extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeTx.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeTx): SubscribeTx.AsObject;
  static serializeBinaryToWriter(message: SubscribeTx, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeTx;
  static deserializeBinaryFromReader(message: SubscribeTx, reader: jspb.BinaryReader): SubscribeTx;
}

export namespace SubscribeTx {
  export type AsObject = {
  }

  export enum Parameter { 
    START_BLOCK = 0,
    END_BLOCK = 1,
    CONTRACT_NAME = 2,
    TX_IDS = 3,
  }
}

export class SubscribeContractEvent extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeContractEvent.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeContractEvent): SubscribeContractEvent.AsObject;
  static serializeBinaryToWriter(message: SubscribeContractEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeContractEvent;
  static deserializeBinaryFromReader(message: SubscribeContractEvent, reader: jspb.BinaryReader): SubscribeContractEvent;
}

export namespace SubscribeContractEvent {
  export type AsObject = {
  }

  export enum Parameter { 
    TOPIC = 0,
    CONTRACT_NAME = 1,
    START_BLOCK = 2,
    END_BLOCK = 3,
  }
}

export enum SubscribeFunction { 
  SUBSCRIBE_BLOCK = 0,
  SUBSCRIBE_TX = 1,
  SUBSCRIBE_CONTRACT_EVENT = 2,
}
