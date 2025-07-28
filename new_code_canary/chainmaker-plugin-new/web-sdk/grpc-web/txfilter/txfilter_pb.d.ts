import * as jspb from 'google-protobuf'



export class Stat extends jspb.Message {
  getFpCount(): number;
  setFpCount(value: number): Stat;

  getFilterCosts(): number;
  setFilterCosts(value: number): Stat;

  getDbCosts(): number;
  setDbCosts(value: number): Stat;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Stat.AsObject;
  static toObject(includeInstance: boolean, msg: Stat): Stat.AsObject;
  static serializeBinaryToWriter(message: Stat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Stat;
  static deserializeBinaryFromReader(message: Stat, reader: jspb.BinaryReader): Stat;
}

export namespace Stat {
  export type AsObject = {
    fpCount: number,
    filterCosts: number,
    dbCosts: number,
  }
}

