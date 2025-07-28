import * as jspb from 'google-protobuf'

import * as accesscontrol_member_pb from '../accesscontrol/member_pb';


export class TxRequest extends jspb.Message {
  getPayload(): Payload | undefined;
  setPayload(value?: Payload): TxRequest;
  hasPayload(): boolean;
  clearPayload(): TxRequest;

  getSender(): EndorsementEntry | undefined;
  setSender(value?: EndorsementEntry): TxRequest;
  hasSender(): boolean;
  clearSender(): TxRequest;

  getEndorsersList(): Array<EndorsementEntry>;
  setEndorsersList(value: Array<EndorsementEntry>): TxRequest;
  clearEndorsersList(): TxRequest;
  addEndorsers(value?: EndorsementEntry, index?: number): EndorsementEntry;

  getPayer(): EndorsementEntry | undefined;
  setPayer(value?: EndorsementEntry): TxRequest;
  hasPayer(): boolean;
  clearPayer(): TxRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TxRequest): TxRequest.AsObject;
  static serializeBinaryToWriter(message: TxRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxRequest;
  static deserializeBinaryFromReader(message: TxRequest, reader: jspb.BinaryReader): TxRequest;
}

export namespace TxRequest {
  export type AsObject = {
    payload?: Payload.AsObject,
    sender?: EndorsementEntry.AsObject,
    endorsersList: Array<EndorsementEntry.AsObject>,
    payer?: EndorsementEntry.AsObject,
  }
}

export class RawTxRequest extends jspb.Message {
  getRawtx(): Uint8Array | string;
  getRawtx_asU8(): Uint8Array;
  getRawtx_asB64(): string;
  setRawtx(value: Uint8Array | string): RawTxRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RawTxRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RawTxRequest): RawTxRequest.AsObject;
  static serializeBinaryToWriter(message: RawTxRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RawTxRequest;
  static deserializeBinaryFromReader(message: RawTxRequest, reader: jspb.BinaryReader): RawTxRequest;
}

export namespace RawTxRequest {
  export type AsObject = {
    rawtx: Uint8Array | string,
  }
}

export class Payload extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): Payload;

  getTxType(): TxType;
  setTxType(value: TxType): Payload;

  getTxId(): string;
  setTxId(value: string): Payload;

  getTimestamp(): number;
  setTimestamp(value: number): Payload;

  getExpirationTime(): number;
  setExpirationTime(value: number): Payload;

  getContractName(): string;
  setContractName(value: string): Payload;

  getMethod(): string;
  setMethod(value: string): Payload;

  getParametersList(): Array<KeyValuePair>;
  setParametersList(value: Array<KeyValuePair>): Payload;
  clearParametersList(): Payload;
  addParameters(value?: KeyValuePair, index?: number): KeyValuePair;

  getSequence(): number;
  setSequence(value: number): Payload;

  getLimit(): Limit | undefined;
  setLimit(value?: Limit): Payload;
  hasLimit(): boolean;
  clearLimit(): Payload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Payload.AsObject;
  static toObject(includeInstance: boolean, msg: Payload): Payload.AsObject;
  static serializeBinaryToWriter(message: Payload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Payload;
  static deserializeBinaryFromReader(message: Payload, reader: jspb.BinaryReader): Payload;
}

export namespace Payload {
  export type AsObject = {
    chainId: string,
    txType: TxType,
    txId: string,
    timestamp: number,
    expirationTime: number,
    contractName: string,
    method: string,
    parametersList: Array<KeyValuePair.AsObject>,
    sequence: number,
    limit?: Limit.AsObject,
  }
}

export class EndorsementEntry extends jspb.Message {
  getSigner(): accesscontrol_member_pb.Member | undefined;
  setSigner(value?: accesscontrol_member_pb.Member): EndorsementEntry;
  hasSigner(): boolean;
  clearSigner(): EndorsementEntry;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): EndorsementEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndorsementEntry.AsObject;
  static toObject(includeInstance: boolean, msg: EndorsementEntry): EndorsementEntry.AsObject;
  static serializeBinaryToWriter(message: EndorsementEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EndorsementEntry;
  static deserializeBinaryFromReader(message: EndorsementEntry, reader: jspb.BinaryReader): EndorsementEntry;
}

export namespace EndorsementEntry {
  export type AsObject = {
    signer?: accesscontrol_member_pb.Member.AsObject,
    signature: Uint8Array | string,
  }
}

export class KeyValuePair extends jspb.Message {
  getKey(): string;
  setKey(value: string): KeyValuePair;

  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): KeyValuePair;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValuePair.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValuePair): KeyValuePair.AsObject;
  static serializeBinaryToWriter(message: KeyValuePair, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValuePair;
  static deserializeBinaryFromReader(message: KeyValuePair, reader: jspb.BinaryReader): KeyValuePair;
}

export namespace KeyValuePair {
  export type AsObject = {
    key: string,
    value: Uint8Array | string,
  }
}

export class Limit extends jspb.Message {
  getGasLimit(): number;
  setGasLimit(value: number): Limit;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Limit.AsObject;
  static toObject(includeInstance: boolean, msg: Limit): Limit.AsObject;
  static serializeBinaryToWriter(message: Limit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Limit;
  static deserializeBinaryFromReader(message: Limit, reader: jspb.BinaryReader): Limit;
}

export namespace Limit {
  export type AsObject = {
    gasLimit: number,
  }
}

export enum TxType { 
  INVOKE_CONTRACT = 0,
  QUERY_CONTRACT = 1,
  SUBSCRIBE = 2,
  ARCHIVE = 3,
}
