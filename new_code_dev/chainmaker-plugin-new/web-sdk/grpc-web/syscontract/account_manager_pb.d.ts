import * as jspb from 'google-protobuf'



export class AccountMultiSign extends jspb.Message {
  getPayloads(): Uint8Array | string;
  getPayloads_asU8(): Uint8Array;
  getPayloads_asB64(): string;
  setPayloads(value: Uint8Array | string): AccountMultiSign;

  getClientSign(): Uint8Array | string;
  getClientSign_asU8(): Uint8Array;
  getClientSign_asB64(): string;
  setClientSign(value: Uint8Array | string): AccountMultiSign;

  getPublicKeyInfo(): Uint8Array | string;
  getPublicKeyInfo_asU8(): Uint8Array;
  getPublicKeyInfo_asB64(): string;
  setPublicKeyInfo(value: Uint8Array | string): AccountMultiSign;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountMultiSign.AsObject;
  static toObject(includeInstance: boolean, msg: AccountMultiSign): AccountMultiSign.AsObject;
  static serializeBinaryToWriter(message: AccountMultiSign, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountMultiSign;
  static deserializeBinaryFromReader(message: AccountMultiSign, reader: jspb.BinaryReader): AccountMultiSign;
}

export namespace AccountMultiSign {
  export type AsObject = {
    payloads: Uint8Array | string,
    clientSign: Uint8Array | string,
    publicKeyInfo: Uint8Array | string,
  }
}

export class AccountMultiSignsReq extends jspb.Message {
  getGasMultiSignsList(): Array<AccountMultiSign>;
  setGasMultiSignsList(value: Array<AccountMultiSign>): AccountMultiSignsReq;
  clearGasMultiSignsList(): AccountMultiSignsReq;
  addGasMultiSigns(value?: AccountMultiSign, index?: number): AccountMultiSign;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountMultiSignsReq.AsObject;
  static toObject(includeInstance: boolean, msg: AccountMultiSignsReq): AccountMultiSignsReq.AsObject;
  static serializeBinaryToWriter(message: AccountMultiSignsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountMultiSignsReq;
  static deserializeBinaryFromReader(message: AccountMultiSignsReq, reader: jspb.BinaryReader): AccountMultiSignsReq;
}

export namespace AccountMultiSignsReq {
  export type AsObject = {
    gasMultiSignsList: Array<AccountMultiSign.AsObject>,
  }
}

export class RechargeGas extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): RechargeGas;

  getGasAmount(): number;
  setGasAmount(value: number): RechargeGas;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RechargeGas.AsObject;
  static toObject(includeInstance: boolean, msg: RechargeGas): RechargeGas.AsObject;
  static serializeBinaryToWriter(message: RechargeGas, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RechargeGas;
  static deserializeBinaryFromReader(message: RechargeGas, reader: jspb.BinaryReader): RechargeGas;
}

export namespace RechargeGas {
  export type AsObject = {
    address: string,
    gasAmount: number,
  }
}

export class RechargeGasReq extends jspb.Message {
  getBatchRechargeGasList(): Array<RechargeGas>;
  setBatchRechargeGasList(value: Array<RechargeGas>): RechargeGasReq;
  clearBatchRechargeGasList(): RechargeGasReq;
  addBatchRechargeGas(value?: RechargeGas, index?: number): RechargeGas;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RechargeGasReq.AsObject;
  static toObject(includeInstance: boolean, msg: RechargeGasReq): RechargeGasReq.AsObject;
  static serializeBinaryToWriter(message: RechargeGasReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RechargeGasReq;
  static deserializeBinaryFromReader(message: RechargeGasReq, reader: jspb.BinaryReader): RechargeGasReq;
}

export namespace RechargeGasReq {
  export type AsObject = {
    batchRechargeGasList: Array<RechargeGas.AsObject>,
  }
}

export enum GasAccountFunction { 
  SET_ADMIN = 0,
  GET_ADMIN = 1,
  RECHARGE_GAS = 2,
  GET_BALANCE = 3,
  CHARGE_GAS = 4,
  FROZEN_ACCOUNT = 5,
  UNFROZEN_ACCOUNT = 6,
  ACCOUNT_STATUS = 7,
  REFUND_GAS = 8,
  REFUND_GAS_VM = 9,
  CHARGE_GAS_FOR_MULTI_ACCOUNT = 10,
}
