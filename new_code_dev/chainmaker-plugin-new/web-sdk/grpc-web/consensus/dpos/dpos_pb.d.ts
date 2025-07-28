import * as jspb from 'google-protobuf'



export class CandidateInfo extends jspb.Message {
  getPeerId(): string;
  setPeerId(value: string): CandidateInfo;

  getWeight(): string;
  setWeight(value: string): CandidateInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CandidateInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CandidateInfo): CandidateInfo.AsObject;
  static serializeBinaryToWriter(message: CandidateInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CandidateInfo;
  static deserializeBinaryFromReader(message: CandidateInfo, reader: jspb.BinaryReader): CandidateInfo;
}

export namespace CandidateInfo {
  export type AsObject = {
    peerId: string,
    weight: string,
  }
}

