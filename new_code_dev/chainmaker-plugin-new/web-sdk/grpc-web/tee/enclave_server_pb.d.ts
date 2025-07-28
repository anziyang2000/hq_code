import * as jspb from 'google-protobuf'

import * as common_request_pb from '../common/request_pb';
import * as common_result_pb from '../common/result_pb';
import * as common_rwset_pb from '../common/rwset_pb';


export class InitEnclaveRequest extends jspb.Message {
  getTeeCertSignAlg(): string;
  setTeeCertSignAlg(value: string): InitEnclaveRequest;

  getTeeEncryptAlg(): string;
  setTeeEncryptAlg(value: string): InitEnclaveRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitEnclaveRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InitEnclaveRequest): InitEnclaveRequest.AsObject;
  static serializeBinaryToWriter(message: InitEnclaveRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitEnclaveRequest;
  static deserializeBinaryFromReader(message: InitEnclaveRequest, reader: jspb.BinaryReader): InitEnclaveRequest;
}

export namespace InitEnclaveRequest {
  export type AsObject = {
    teeCertSignAlg: string,
    teeEncryptAlg: string,
  }
}

export class InitEnclaveResponse extends jspb.Message {
  getTeeReport(): Uint8Array | string;
  getTeeReport_asU8(): Uint8Array;
  getTeeReport_asB64(): string;
  setTeeReport(value: Uint8Array | string): InitEnclaveResponse;

  getTeePubkey(): Uint8Array | string;
  getTeePubkey_asU8(): Uint8Array;
  getTeePubkey_asB64(): string;
  setTeePubkey(value: Uint8Array | string): InitEnclaveResponse;

  getTeeCsr(): Uint8Array | string;
  getTeeCsr_asU8(): Uint8Array;
  getTeeCsr_asB64(): string;
  setTeeCsr(value: Uint8Array | string): InitEnclaveResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitEnclaveResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InitEnclaveResponse): InitEnclaveResponse.AsObject;
  static serializeBinaryToWriter(message: InitEnclaveResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitEnclaveResponse;
  static deserializeBinaryFromReader(message: InitEnclaveResponse, reader: jspb.BinaryReader): InitEnclaveResponse;
}

export namespace InitEnclaveResponse {
  export type AsObject = {
    teeReport: Uint8Array | string,
    teePubkey: Uint8Array | string,
    teeCsr: Uint8Array | string,
  }
}

export class EnclaveResponse extends jspb.Message {
  getEnclaveResponsePayload(): EnclaveResponsePayload | undefined;
  setEnclaveResponsePayload(value?: EnclaveResponsePayload): EnclaveResponse;
  hasEnclaveResponsePayload(): boolean;
  clearEnclaveResponsePayload(): EnclaveResponse;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): EnclaveResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnclaveResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EnclaveResponse): EnclaveResponse.AsObject;
  static serializeBinaryToWriter(message: EnclaveResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnclaveResponse;
  static deserializeBinaryFromReader(message: EnclaveResponse, reader: jspb.BinaryReader): EnclaveResponse;
}

export namespace EnclaveResponse {
  export type AsObject = {
    enclaveResponsePayload?: EnclaveResponsePayload.AsObject,
    signature: Uint8Array | string,
  }
}

export class EnclaveResponsePayload extends jspb.Message {
  getContractResult(): common_result_pb.ContractResult | undefined;
  setContractResult(value?: common_result_pb.ContractResult): EnclaveResponsePayload;
  hasContractResult(): boolean;
  clearContractResult(): EnclaveResponsePayload;

  getTxRwset(): common_rwset_pb.TxRWSet | undefined;
  setTxRwset(value?: common_rwset_pb.TxRWSet): EnclaveResponsePayload;
  hasTxRwset(): boolean;
  clearTxRwset(): EnclaveResponsePayload;

  getTxRequest(): common_request_pb.TxRequest | undefined;
  setTxRequest(value?: common_request_pb.TxRequest): EnclaveResponsePayload;
  hasTxRequest(): boolean;
  clearTxRequest(): EnclaveResponsePayload;

  getContractName(): string;
  setContractName(value: string): EnclaveResponsePayload;

  getContractVersion(): string;
  setContractVersion(value: string): EnclaveResponsePayload;

  getContractHash(): string;
  setContractHash(value: string): EnclaveResponsePayload;

  getReportHash(): string;
  setReportHash(value: string): EnclaveResponsePayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnclaveResponsePayload.AsObject;
  static toObject(includeInstance: boolean, msg: EnclaveResponsePayload): EnclaveResponsePayload.AsObject;
  static serializeBinaryToWriter(message: EnclaveResponsePayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EnclaveResponsePayload;
  static deserializeBinaryFromReader(message: EnclaveResponsePayload, reader: jspb.BinaryReader): EnclaveResponsePayload;
}

export namespace EnclaveResponsePayload {
  export type AsObject = {
    contractResult?: common_result_pb.ContractResult.AsObject,
    txRwset?: common_rwset_pb.TxRWSet.AsObject,
    txRequest?: common_request_pb.TxRequest.AsObject,
    contractName: string,
    contractVersion: string,
    contractHash: string,
    reportHash: string,
  }
}

export class RemoteAttestationRequest extends jspb.Message {
  getChallenge(): string;
  setChallenge(value: string): RemoteAttestationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoteAttestationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoteAttestationRequest): RemoteAttestationRequest.AsObject;
  static serializeBinaryToWriter(message: RemoteAttestationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoteAttestationRequest;
  static deserializeBinaryFromReader(message: RemoteAttestationRequest, reader: jspb.BinaryReader): RemoteAttestationRequest;
}

export namespace RemoteAttestationRequest {
  export type AsObject = {
    challenge: string,
  }
}

export class RemoteAttestationResponse extends jspb.Message {
  getRemoteAttestationPayload(): RemoteAttestationPayload | undefined;
  setRemoteAttestationPayload(value?: RemoteAttestationPayload): RemoteAttestationResponse;
  hasRemoteAttestationPayload(): boolean;
  clearRemoteAttestationPayload(): RemoteAttestationResponse;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): RemoteAttestationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoteAttestationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoteAttestationResponse): RemoteAttestationResponse.AsObject;
  static serializeBinaryToWriter(message: RemoteAttestationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoteAttestationResponse;
  static deserializeBinaryFromReader(message: RemoteAttestationResponse, reader: jspb.BinaryReader): RemoteAttestationResponse;
}

export namespace RemoteAttestationResponse {
  export type AsObject = {
    remoteAttestationPayload?: RemoteAttestationPayload.AsObject,
    signature: Uint8Array | string,
  }
}

export class RemoteAttestationPayload extends jspb.Message {
  getChallenge(): string;
  setChallenge(value: string): RemoteAttestationPayload;

  getReport(): Uint8Array | string;
  getReport_asU8(): Uint8Array;
  getReport_asB64(): string;
  setReport(value: Uint8Array | string): RemoteAttestationPayload;

  getTeeCert(): Uint8Array | string;
  getTeeCert_asU8(): Uint8Array;
  getTeeCert_asB64(): string;
  setTeeCert(value: Uint8Array | string): RemoteAttestationPayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoteAttestationPayload.AsObject;
  static toObject(includeInstance: boolean, msg: RemoteAttestationPayload): RemoteAttestationPayload.AsObject;
  static serializeBinaryToWriter(message: RemoteAttestationPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoteAttestationPayload;
  static deserializeBinaryFromReader(message: RemoteAttestationPayload, reader: jspb.BinaryReader): RemoteAttestationPayload;
}

export namespace RemoteAttestationPayload {
  export type AsObject = {
    challenge: string,
    report: Uint8Array | string,
    teeCert: Uint8Array | string,
  }
}

