import * as jspb from 'google-protobuf'

import * as common_birdsnest_pb from '../common/birdsnest_pb';


export class TxFilterConfig extends jspb.Message {
  getType(): TxFilterType;
  setType(value: TxFilterType): TxFilterConfig;

  getBirdsNest(): common_birdsnest_pb.BirdsNestConfig | undefined;
  setBirdsNest(value?: common_birdsnest_pb.BirdsNestConfig): TxFilterConfig;
  hasBirdsNest(): boolean;
  clearBirdsNest(): TxFilterConfig;

  getShardingBirdsNest(): common_birdsnest_pb.ShardingBirdsNestConfig | undefined;
  setShardingBirdsNest(value?: common_birdsnest_pb.ShardingBirdsNestConfig): TxFilterConfig;
  hasShardingBirdsNest(): boolean;
  clearShardingBirdsNest(): TxFilterConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxFilterConfig.AsObject;
  static toObject(includeInstance: boolean, msg: TxFilterConfig): TxFilterConfig.AsObject;
  static serializeBinaryToWriter(message: TxFilterConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxFilterConfig;
  static deserializeBinaryFromReader(message: TxFilterConfig, reader: jspb.BinaryReader): TxFilterConfig;
}

export namespace TxFilterConfig {
  export type AsObject = {
    type: TxFilterType,
    birdsNest?: common_birdsnest_pb.BirdsNestConfig.AsObject,
    shardingBirdsNest?: common_birdsnest_pb.ShardingBirdsNestConfig.AsObject,
  }
}

export enum TxFilterType { 
  NONE = 0,
  BIRDSNEST = 1,
  MAP = 2,
  SHARDINGBIRDSNEST = 3,
}
