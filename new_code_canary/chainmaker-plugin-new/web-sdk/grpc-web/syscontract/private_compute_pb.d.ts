import * as jspb from 'google-protobuf'



export class RemoteAttestationRequest extends jspb.Message {
  getSignPairList(): Array<SignInfo>;
  setSignPairList(value: Array<SignInfo>): RemoteAttestationRequest;
  clearSignPairList(): RemoteAttestationRequest;
  addSignPair(value?: SignInfo, index?: number): SignInfo;

  getPayload(): RemoteAttestationPayload | undefined;
  setPayload(value?: RemoteAttestationPayload): RemoteAttestationRequest;
  hasPayload(): boolean;
  clearPayload(): RemoteAttestationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoteAttestationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoteAttestationRequest): RemoteAttestationRequest.AsObject;
  static serializeBinaryToWriter(message: RemoteAttestationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoteAttestationRequest;
  static deserializeBinaryFromReader(message: RemoteAttestationRequest, reader: jspb.BinaryReader): RemoteAttestationRequest;
}

export namespace RemoteAttestationRequest {
  export type AsObject = {
    signPairList: Array<SignInfo.AsObject>,
    payload?: RemoteAttestationPayload.AsObject,
  }
}

export class RemoteAttestationPayload extends jspb.Message {
  getChallenge(): string;
  setChallenge(value: string): RemoteAttestationPayload;

  getOrgIdList(): Array<string>;
  setOrgIdList(value: Array<string>): RemoteAttestationPayload;
  clearOrgIdList(): RemoteAttestationPayload;
  addOrgId(value: string, index?: number): RemoteAttestationPayload;

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
    orgIdList: Array<string>,
  }
}

export class PrivateDeployRequest extends jspb.Message {
  getSignPairList(): Array<SignInfo>;
  setSignPairList(value: Array<SignInfo>): PrivateDeployRequest;
  clearSignPairList(): PrivateDeployRequest;
  addSignPair(value?: SignInfo, index?: number): SignInfo;

  getPayload(): PrivateDeployPayload | undefined;
  setPayload(value?: PrivateDeployPayload): PrivateDeployRequest;
  hasPayload(): boolean;
  clearPayload(): PrivateDeployRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateDeployRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateDeployRequest): PrivateDeployRequest.AsObject;
  static serializeBinaryToWriter(message: PrivateDeployRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateDeployRequest;
  static deserializeBinaryFromReader(message: PrivateDeployRequest, reader: jspb.BinaryReader): PrivateDeployRequest;
}

export namespace PrivateDeployRequest {
  export type AsObject = {
    signPairList: Array<SignInfo.AsObject>,
    payload?: PrivateDeployPayload.AsObject,
  }
}

export class PrivateDeployPayload extends jspb.Message {
  getCodeBytes(): string;
  setCodeBytes(value: string): PrivateDeployPayload;

  getPrivateRlpData(): string;
  setPrivateRlpData(value: string): PrivateDeployPayload;

  getPasswd(): string;
  setPasswd(value: string): PrivateDeployPayload;

  getSigAlgo(): string;
  setSigAlgo(value: string): PrivateDeployPayload;

  getContractName(): string;
  setContractName(value: string): PrivateDeployPayload;

  getContractVersion(): string;
  setContractVersion(value: string): PrivateDeployPayload;

  getCodeHash(): string;
  setCodeHash(value: string): PrivateDeployPayload;

  getOrgIdList(): Array<string>;
  setOrgIdList(value: Array<string>): PrivateDeployPayload;
  clearOrgIdList(): PrivateDeployPayload;
  addOrgId(value: string, index?: number): PrivateDeployPayload;

  getTimeStamp(): string;
  setTimeStamp(value: string): PrivateDeployPayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateDeployPayload.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateDeployPayload): PrivateDeployPayload.AsObject;
  static serializeBinaryToWriter(message: PrivateDeployPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateDeployPayload;
  static deserializeBinaryFromReader(message: PrivateDeployPayload, reader: jspb.BinaryReader): PrivateDeployPayload;
}

export namespace PrivateDeployPayload {
  export type AsObject = {
    codeBytes: string,
    privateRlpData: string,
    passwd: string,
    sigAlgo: string,
    contractName: string,
    contractVersion: string,
    codeHash: string,
    orgIdList: Array<string>,
    timeStamp: string,
  }
}

export class PrivateComputeRequest extends jspb.Message {
  getSignPairList(): Array<SignInfo>;
  setSignPairList(value: Array<SignInfo>): PrivateComputeRequest;
  clearSignPairList(): PrivateComputeRequest;
  addSignPair(value?: SignInfo, index?: number): SignInfo;

  getPayload(): PrivateComputePayload | undefined;
  setPayload(value?: PrivateComputePayload): PrivateComputeRequest;
  hasPayload(): boolean;
  clearPayload(): PrivateComputeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateComputeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateComputeRequest): PrivateComputeRequest.AsObject;
  static serializeBinaryToWriter(message: PrivateComputeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateComputeRequest;
  static deserializeBinaryFromReader(message: PrivateComputeRequest, reader: jspb.BinaryReader): PrivateComputeRequest;
}

export namespace PrivateComputeRequest {
  export type AsObject = {
    signPairList: Array<SignInfo.AsObject>,
    payload?: PrivateComputePayload.AsObject,
  }
}

export class PrivateComputePayload extends jspb.Message {
  getPrivateRlpData(): string;
  setPrivateRlpData(value: string): PrivateComputePayload;

  getPasswd(): string;
  setPasswd(value: string): PrivateComputePayload;

  getSigAlgo(): string;
  setSigAlgo(value: string): PrivateComputePayload;

  getContractName(): string;
  setContractName(value: string): PrivateComputePayload;

  getCodeHash(): string;
  setCodeHash(value: string): PrivateComputePayload;

  getOrgIdList(): Array<string>;
  setOrgIdList(value: Array<string>): PrivateComputePayload;
  clearOrgIdList(): PrivateComputePayload;
  addOrgId(value: string, index?: number): PrivateComputePayload;

  getTimeStamp(): string;
  setTimeStamp(value: string): PrivateComputePayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateComputePayload.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateComputePayload): PrivateComputePayload.AsObject;
  static serializeBinaryToWriter(message: PrivateComputePayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateComputePayload;
  static deserializeBinaryFromReader(message: PrivateComputePayload, reader: jspb.BinaryReader): PrivateComputePayload;
}

export namespace PrivateComputePayload {
  export type AsObject = {
    privateRlpData: string,
    passwd: string,
    sigAlgo: string,
    contractName: string,
    codeHash: string,
    orgIdList: Array<string>,
    timeStamp: string,
  }
}

export class SignInfo extends jspb.Message {
  getClientSign(): string;
  setClientSign(value: string): SignInfo;

  getCert(): string;
  setCert(value: string): SignInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SignInfo): SignInfo.AsObject;
  static serializeBinaryToWriter(message: SignInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignInfo;
  static deserializeBinaryFromReader(message: SignInfo, reader: jspb.BinaryReader): SignInfo;
}

export namespace SignInfo {
  export type AsObject = {
    clientSign: string,
    cert: string,
  }
}

export enum PrivateComputeFunction { 
  GET_CONTRACT = 0,
  GET_DATA = 1,
  SAVE_CA_CERT = 2,
  SAVE_DIR = 3,
  SAVE_DATA = 4,
  SAVE_ENCLAVE_REPORT = 5,
  GET_ENCLAVE_PROOF = 6,
  GET_CA_CERT = 7,
  GET_DIR = 8,
  CHECK_CALLER_CERT_AUTH = 9,
  GET_ENCLAVE_ENCRYPT_PUB_KEY = 10,
  GET_ENCLAVE_VERIFICATION_PUB_KEY = 11,
  GET_ENCLAVE_REPORT = 12,
  GET_ENCLAVE_CHALLENGE = 13,
  GET_ENCLAVE_SIGNATURE = 14,
  SAVE_REMOTE_ATTESTATION = 15,
}
