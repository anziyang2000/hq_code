import * as jspb from 'google-protobuf'



export class ArchiveBlock extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ArchiveBlock.AsObject;
  static toObject(includeInstance: boolean, msg: ArchiveBlock): ArchiveBlock.AsObject;
  static serializeBinaryToWriter(message: ArchiveBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ArchiveBlock;
  static deserializeBinaryFromReader(message: ArchiveBlock, reader: jspb.BinaryReader): ArchiveBlock;
}

export namespace ArchiveBlock {
  export type AsObject = {
  }

  export enum Parameter { 
    BLOCK_HEIGHT = 0,
  }
}

export class RestoreBlock extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RestoreBlock.AsObject;
  static toObject(includeInstance: boolean, msg: RestoreBlock): RestoreBlock.AsObject;
  static serializeBinaryToWriter(message: RestoreBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RestoreBlock;
  static deserializeBinaryFromReader(message: RestoreBlock, reader: jspb.BinaryReader): RestoreBlock;
}

export namespace RestoreBlock {
  export type AsObject = {
  }

  export enum Parameter { 
    FULL_BLOCK = 0,
  }
}

export enum ArchiveFunction { 
  ARCHIVE_BLOCK = 0,
  RESTORE_BLOCK = 1,
}
