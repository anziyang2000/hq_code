import * as jspb from 'google-protobuf'

import * as accesscontrol_member_pb from '../accesscontrol/member_pb';


export class Contract extends jspb.Message {
  getName(): string;
  setName(value: string): Contract;

  getVersion(): string;
  setVersion(value: string): Contract;

  getRuntimeType(): RuntimeType;
  setRuntimeType(value: RuntimeType): Contract;

  getStatus(): ContractStatus;
  setStatus(value: ContractStatus): Contract;

  getCreator(): accesscontrol_member_pb.MemberFull | undefined;
  setCreator(value?: accesscontrol_member_pb.MemberFull): Contract;
  hasCreator(): boolean;
  clearCreator(): Contract;

  getAddress(): string;
  setAddress(value: string): Contract;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Contract.AsObject;
  static toObject(includeInstance: boolean, msg: Contract): Contract.AsObject;
  static serializeBinaryToWriter(message: Contract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Contract;
  static deserializeBinaryFromReader(message: Contract, reader: jspb.BinaryReader): Contract;
}

export namespace Contract {
  export type AsObject = {
    name: string,
    version: string,
    runtimeType: RuntimeType,
    status: ContractStatus,
    creator?: accesscontrol_member_pb.MemberFull.AsObject,
    address: string,
  }
}

export enum RuntimeType { 
  INVALID = 0,
  NATIVE = 1,
  WASMER = 2,
  WXVM = 3,
  GASM = 4,
  EVM = 5,
  DOCKER_GO = 6,
  JAVA = 7,
  GO = 8,
}
export enum ContractStatus { 
  NORMAL = 0,
  FROZEN = 1,
  REVOKED = 2,
}
