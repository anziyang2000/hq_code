import * as jspb from 'google-protobuf'

import * as common_request_pb from '../common/request_pb';


export class MultiSignInfo extends jspb.Message {
  getPayload(): common_request_pb.Payload | undefined;
  setPayload(value?: common_request_pb.Payload): MultiSignInfo;
  hasPayload(): boolean;
  clearPayload(): MultiSignInfo;

  getContractName(): string;
  setContractName(value: string): MultiSignInfo;

  getMethod(): string;
  setMethod(value: string): MultiSignInfo;

  getStatus(): MultiSignStatus;
  setStatus(value: MultiSignStatus): MultiSignInfo;

  getVoteInfosList(): Array<MultiSignVoteInfo>;
  setVoteInfosList(value: Array<MultiSignVoteInfo>): MultiSignInfo;
  clearVoteInfosList(): MultiSignInfo;
  addVoteInfos(value?: MultiSignVoteInfo, index?: number): MultiSignVoteInfo;

  getMessage(): string;
  setMessage(value: string): MultiSignInfo;

  getResult(): Uint8Array | string;
  getResult_asU8(): Uint8Array;
  getResult_asB64(): string;
  setResult(value: Uint8Array | string): MultiSignInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiSignInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MultiSignInfo): MultiSignInfo.AsObject;
  static serializeBinaryToWriter(message: MultiSignInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiSignInfo;
  static deserializeBinaryFromReader(message: MultiSignInfo, reader: jspb.BinaryReader): MultiSignInfo;
}

export namespace MultiSignInfo {
  export type AsObject = {
    payload?: common_request_pb.Payload.AsObject,
    contractName: string,
    method: string,
    status: MultiSignStatus,
    voteInfosList: Array<MultiSignVoteInfo.AsObject>,
    message: string,
    result: Uint8Array | string,
  }
}

export class MultiSignVoteInfo extends jspb.Message {
  getVote(): VoteStatus;
  setVote(value: VoteStatus): MultiSignVoteInfo;

  getEndorsement(): common_request_pb.EndorsementEntry | undefined;
  setEndorsement(value?: common_request_pb.EndorsementEntry): MultiSignVoteInfo;
  hasEndorsement(): boolean;
  clearEndorsement(): MultiSignVoteInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiSignVoteInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MultiSignVoteInfo): MultiSignVoteInfo.AsObject;
  static serializeBinaryToWriter(message: MultiSignVoteInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiSignVoteInfo;
  static deserializeBinaryFromReader(message: MultiSignVoteInfo, reader: jspb.BinaryReader): MultiSignVoteInfo;
}

export namespace MultiSignVoteInfo {
  export type AsObject = {
    vote: VoteStatus,
    endorsement?: common_request_pb.EndorsementEntry.AsObject,
  }
}

export class MultiReq extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiReq.AsObject;
  static toObject(includeInstance: boolean, msg: MultiReq): MultiReq.AsObject;
  static serializeBinaryToWriter(message: MultiReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiReq;
  static deserializeBinaryFromReader(message: MultiReq, reader: jspb.BinaryReader): MultiReq;
}

export namespace MultiReq {
  export type AsObject = {
  }

  export enum Parameter { 
    SYS_CONTRACT_NAME = 0,
    SYS_METHOD = 1,
  }
}

export class MultiVote extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiVote.AsObject;
  static toObject(includeInstance: boolean, msg: MultiVote): MultiVote.AsObject;
  static serializeBinaryToWriter(message: MultiVote, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiVote;
  static deserializeBinaryFromReader(message: MultiVote, reader: jspb.BinaryReader): MultiVote;
}

export namespace MultiVote {
  export type AsObject = {
  }

  export enum Parameter { 
    VOTE_INFO = 0,
    TX_ID = 1,
  }
}

export class MultiQuery extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiQuery.AsObject;
  static toObject(includeInstance: boolean, msg: MultiQuery): MultiQuery.AsObject;
  static serializeBinaryToWriter(message: MultiQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiQuery;
  static deserializeBinaryFromReader(message: MultiQuery, reader: jspb.BinaryReader): MultiQuery;
}

export namespace MultiQuery {
  export type AsObject = {
  }

  export enum Parameter { 
    TX_ID = 0,
  }
}

export enum MultiSignFunction { 
  REQ = 0,
  VOTE = 1,
  QUERY = 2,
  TRIG = 3,
}
export enum VoteStatus { 
  AGREE = 0,
  REJECT = 1,
}
export enum MultiSignStatus { 
  PROCESSING = 0,
  ADOPTED = 1,
  REFUSED = 2,
  FAILED = 3,
  PASSED = 4,
}
export enum ContractStatus { 
  NORMAL = 0,
  FROZEN = 1,
  REVOKED = 2,
}
