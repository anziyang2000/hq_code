import * as jspb from 'google-protobuf'



export class Member extends jspb.Message {
  getOrgId(): string;
  setOrgId(value: string): Member;

  getMemberType(): MemberType;
  setMemberType(value: MemberType): Member;

  getMemberInfo(): Uint8Array | string;
  getMemberInfo_asU8(): Uint8Array;
  getMemberInfo_asB64(): string;
  setMemberInfo(value: Uint8Array | string): Member;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Member.AsObject;
  static toObject(includeInstance: boolean, msg: Member): Member.AsObject;
  static serializeBinaryToWriter(message: Member, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Member;
  static deserializeBinaryFromReader(message: Member, reader: jspb.BinaryReader): Member;
}

export namespace Member {
  export type AsObject = {
    orgId: string,
    memberType: MemberType,
    memberInfo: Uint8Array | string,
  }
}

export class MemberFull extends jspb.Message {
  getOrgId(): string;
  setOrgId(value: string): MemberFull;

  getMemberType(): MemberType;
  setMemberType(value: MemberType): MemberFull;

  getMemberInfo(): Uint8Array | string;
  getMemberInfo_asU8(): Uint8Array;
  getMemberInfo_asB64(): string;
  setMemberInfo(value: Uint8Array | string): MemberFull;

  getMemberId(): string;
  setMemberId(value: string): MemberFull;

  getRole(): string;
  setRole(value: string): MemberFull;

  getUid(): string;
  setUid(value: string): MemberFull;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MemberFull.AsObject;
  static toObject(includeInstance: boolean, msg: MemberFull): MemberFull.AsObject;
  static serializeBinaryToWriter(message: MemberFull, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MemberFull;
  static deserializeBinaryFromReader(message: MemberFull, reader: jspb.BinaryReader): MemberFull;
}

export namespace MemberFull {
  export type AsObject = {
    orgId: string,
    memberType: MemberType,
    memberInfo: Uint8Array | string,
    memberId: string,
    role: string,
    uid: string,
  }
}

export class MemberExtraData extends jspb.Message {
  getSequence(): number;
  setSequence(value: number): MemberExtraData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MemberExtraData.AsObject;
  static toObject(includeInstance: boolean, msg: MemberExtraData): MemberExtraData.AsObject;
  static serializeBinaryToWriter(message: MemberExtraData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MemberExtraData;
  static deserializeBinaryFromReader(message: MemberExtraData, reader: jspb.BinaryReader): MemberExtraData;
}

export namespace MemberExtraData {
  export type AsObject = {
    sequence: number,
  }
}

export class MemberAndExtraData extends jspb.Message {
  getMember(): Member | undefined;
  setMember(value?: Member): MemberAndExtraData;
  hasMember(): boolean;
  clearMember(): MemberAndExtraData;

  getExtraData(): MemberExtraData | undefined;
  setExtraData(value?: MemberExtraData): MemberAndExtraData;
  hasExtraData(): boolean;
  clearExtraData(): MemberAndExtraData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MemberAndExtraData.AsObject;
  static toObject(includeInstance: boolean, msg: MemberAndExtraData): MemberAndExtraData.AsObject;
  static serializeBinaryToWriter(message: MemberAndExtraData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MemberAndExtraData;
  static deserializeBinaryFromReader(message: MemberAndExtraData, reader: jspb.BinaryReader): MemberAndExtraData;
}

export namespace MemberAndExtraData {
  export type AsObject = {
    member?: Member.AsObject,
    extraData?: MemberExtraData.AsObject,
  }
}

export class PKInfo extends jspb.Message {
  getPkBytes(): Uint8Array | string;
  getPkBytes_asU8(): Uint8Array;
  getPkBytes_asB64(): string;
  setPkBytes(value: Uint8Array | string): PKInfo;

  getRole(): string;
  setRole(value: string): PKInfo;

  getOrgId(): string;
  setOrgId(value: string): PKInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PKInfo.AsObject;
  static toObject(includeInstance: boolean, msg: PKInfo): PKInfo.AsObject;
  static serializeBinaryToWriter(message: PKInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PKInfo;
  static deserializeBinaryFromReader(message: PKInfo, reader: jspb.BinaryReader): PKInfo;
}

export namespace PKInfo {
  export type AsObject = {
    pkBytes: Uint8Array | string,
    role: string,
    orgId: string,
  }
}

export enum MemberType { 
  CERT = 0,
  CERT_HASH = 1,
  PUBLIC_KEY = 2,
  DID = 3,
  ALIAS = 4,
  ADDR = 5,
}
export enum MemberStatus { 
  NORMAL = 0,
  INVALID = 1,
  REVOKED = 2,
  FROZEN = 3,
}
export enum VerifyType { 
  CRL = 0,
}
