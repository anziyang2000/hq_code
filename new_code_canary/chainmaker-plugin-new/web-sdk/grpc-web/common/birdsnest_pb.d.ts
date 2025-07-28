import * as jspb from 'google-protobuf'



export class BirdsNest extends jspb.Message {
  getConfig(): BirdsNestConfig | undefined;
  setConfig(value?: BirdsNestConfig): BirdsNest;
  hasConfig(): boolean;
  clearConfig(): BirdsNest;

  getHeight(): number;
  setHeight(value: number): BirdsNest;

  getCurrentindex(): number;
  setCurrentindex(value: number): BirdsNest;

  getFiltersList(): Array<CuckooFilter>;
  setFiltersList(value: Array<CuckooFilter>): BirdsNest;
  clearFiltersList(): BirdsNest;
  addFilters(value?: CuckooFilter, index?: number): CuckooFilter;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BirdsNest.AsObject;
  static toObject(includeInstance: boolean, msg: BirdsNest): BirdsNest.AsObject;
  static serializeBinaryToWriter(message: BirdsNest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BirdsNest;
  static deserializeBinaryFromReader(message: BirdsNest, reader: jspb.BinaryReader): BirdsNest;
}

export namespace BirdsNest {
  export type AsObject = {
    config?: BirdsNestConfig.AsObject,
    height: number,
    currentindex: number,
    filtersList: Array<CuckooFilter.AsObject>,
  }
}

export class ShardingBirdsNest extends jspb.Message {
  getLength(): number;
  setLength(value: number): ShardingBirdsNest;

  getHeight(): number;
  setHeight(value: number): ShardingBirdsNest;

  getConfig(): ShardingBirdsNestConfig | undefined;
  setConfig(value?: ShardingBirdsNestConfig): ShardingBirdsNest;
  hasConfig(): boolean;
  clearConfig(): ShardingBirdsNest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShardingBirdsNest.AsObject;
  static toObject(includeInstance: boolean, msg: ShardingBirdsNest): ShardingBirdsNest.AsObject;
  static serializeBinaryToWriter(message: ShardingBirdsNest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShardingBirdsNest;
  static deserializeBinaryFromReader(message: ShardingBirdsNest, reader: jspb.BinaryReader): ShardingBirdsNest;
}

export namespace ShardingBirdsNest {
  export type AsObject = {
    length: number,
    height: number,
    config?: ShardingBirdsNestConfig.AsObject,
  }
}

export class CuckooFilter extends jspb.Message {
  getCuckoo(): Uint8Array | string;
  getCuckoo_asU8(): Uint8Array;
  getCuckoo_asB64(): string;
  setCuckoo(value: Uint8Array | string): CuckooFilter;

  getExtension(): Uint8Array | string;
  getExtension_asU8(): Uint8Array;
  getExtension_asB64(): string;
  setExtension(value: Uint8Array | string): CuckooFilter;

  getConfig(): Uint8Array | string;
  getConfig_asU8(): Uint8Array;
  getConfig_asB64(): string;
  setConfig(value: Uint8Array | string): CuckooFilter;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CuckooFilter.AsObject;
  static toObject(includeInstance: boolean, msg: CuckooFilter): CuckooFilter.AsObject;
  static serializeBinaryToWriter(message: CuckooFilter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CuckooFilter;
  static deserializeBinaryFromReader(message: CuckooFilter, reader: jspb.BinaryReader): CuckooFilter;
}

export namespace CuckooFilter {
  export type AsObject = {
    cuckoo: Uint8Array | string,
    extension: Uint8Array | string,
    config: Uint8Array | string,
  }
}

export class ShardingBirdsNestConfig extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): ShardingBirdsNestConfig;

  getLength(): number;
  setLength(value: number): ShardingBirdsNestConfig;

  getTimeout(): number;
  setTimeout(value: number): ShardingBirdsNestConfig;

  getBirdsnest(): BirdsNestConfig | undefined;
  setBirdsnest(value?: BirdsNestConfig): ShardingBirdsNestConfig;
  hasBirdsnest(): boolean;
  clearBirdsnest(): ShardingBirdsNestConfig;

  getSnapshot(): SnapshotSerializerConfig | undefined;
  setSnapshot(value?: SnapshotSerializerConfig): ShardingBirdsNestConfig;
  hasSnapshot(): boolean;
  clearSnapshot(): ShardingBirdsNestConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShardingBirdsNestConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ShardingBirdsNestConfig): ShardingBirdsNestConfig.AsObject;
  static serializeBinaryToWriter(message: ShardingBirdsNestConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShardingBirdsNestConfig;
  static deserializeBinaryFromReader(message: ShardingBirdsNestConfig, reader: jspb.BinaryReader): ShardingBirdsNestConfig;
}

export namespace ShardingBirdsNestConfig {
  export type AsObject = {
    chainId: string,
    length: number,
    timeout: number,
    birdsnest?: BirdsNestConfig.AsObject,
    snapshot?: SnapshotSerializerConfig.AsObject,
  }
}

export class BirdsNestConfig extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): BirdsNestConfig;

  getLength(): number;
  setLength(value: number): BirdsNestConfig;

  getRules(): RulesConfig | undefined;
  setRules(value?: RulesConfig): BirdsNestConfig;
  hasRules(): boolean;
  clearRules(): BirdsNestConfig;

  getCuckoo(): CuckooConfig | undefined;
  setCuckoo(value?: CuckooConfig): BirdsNestConfig;
  hasCuckoo(): boolean;
  clearCuckoo(): BirdsNestConfig;

  getSnapshot(): SnapshotSerializerConfig | undefined;
  setSnapshot(value?: SnapshotSerializerConfig): BirdsNestConfig;
  hasSnapshot(): boolean;
  clearSnapshot(): BirdsNestConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BirdsNestConfig.AsObject;
  static toObject(includeInstance: boolean, msg: BirdsNestConfig): BirdsNestConfig.AsObject;
  static serializeBinaryToWriter(message: BirdsNestConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BirdsNestConfig;
  static deserializeBinaryFromReader(message: BirdsNestConfig, reader: jspb.BinaryReader): BirdsNestConfig;
}

export namespace BirdsNestConfig {
  export type AsObject = {
    chainId: string,
    length: number,
    rules?: RulesConfig.AsObject,
    cuckoo?: CuckooConfig.AsObject,
    snapshot?: SnapshotSerializerConfig.AsObject,
  }
}

export class RulesConfig extends jspb.Message {
  getAbsoluteExpireTime(): number;
  setAbsoluteExpireTime(value: number): RulesConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RulesConfig.AsObject;
  static toObject(includeInstance: boolean, msg: RulesConfig): RulesConfig.AsObject;
  static serializeBinaryToWriter(message: RulesConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RulesConfig;
  static deserializeBinaryFromReader(message: RulesConfig, reader: jspb.BinaryReader): RulesConfig;
}

export namespace RulesConfig {
  export type AsObject = {
    absoluteExpireTime: number,
  }
}

export class CuckooConfig extends jspb.Message {
  getKeyType(): KeyType;
  setKeyType(value: KeyType): CuckooConfig;

  getTagsPerBucket(): number;
  setTagsPerBucket(value: number): CuckooConfig;

  getBitsPerItem(): number;
  setBitsPerItem(value: number): CuckooConfig;

  getMaxNumKeys(): number;
  setMaxNumKeys(value: number): CuckooConfig;

  getTableType(): number;
  setTableType(value: number): CuckooConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CuckooConfig.AsObject;
  static toObject(includeInstance: boolean, msg: CuckooConfig): CuckooConfig.AsObject;
  static serializeBinaryToWriter(message: CuckooConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CuckooConfig;
  static deserializeBinaryFromReader(message: CuckooConfig, reader: jspb.BinaryReader): CuckooConfig;
}

export namespace CuckooConfig {
  export type AsObject = {
    keyType: KeyType,
    tagsPerBucket: number,
    bitsPerItem: number,
    maxNumKeys: number,
    tableType: number,
  }
}

export class SnapshotSerializerConfig extends jspb.Message {
  getType(): SerializeIntervalType;
  setType(value: SerializeIntervalType): SnapshotSerializerConfig;

  getTimed(): TimedSerializeIntervalConfig | undefined;
  setTimed(value?: TimedSerializeIntervalConfig): SnapshotSerializerConfig;
  hasTimed(): boolean;
  clearTimed(): SnapshotSerializerConfig;

  getBlockHeight(): BlockHeightSerializeIntervalConfig | undefined;
  setBlockHeight(value?: BlockHeightSerializeIntervalConfig): SnapshotSerializerConfig;
  hasBlockHeight(): boolean;
  clearBlockHeight(): SnapshotSerializerConfig;

  getPath(): string;
  setPath(value: string): SnapshotSerializerConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SnapshotSerializerConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SnapshotSerializerConfig): SnapshotSerializerConfig.AsObject;
  static serializeBinaryToWriter(message: SnapshotSerializerConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SnapshotSerializerConfig;
  static deserializeBinaryFromReader(message: SnapshotSerializerConfig, reader: jspb.BinaryReader): SnapshotSerializerConfig;
}

export namespace SnapshotSerializerConfig {
  export type AsObject = {
    type: SerializeIntervalType,
    timed?: TimedSerializeIntervalConfig.AsObject,
    blockHeight?: BlockHeightSerializeIntervalConfig.AsObject,
    path: string,
  }
}

export class TimedSerializeIntervalConfig extends jspb.Message {
  getInterval(): number;
  setInterval(value: number): TimedSerializeIntervalConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TimedSerializeIntervalConfig.AsObject;
  static toObject(includeInstance: boolean, msg: TimedSerializeIntervalConfig): TimedSerializeIntervalConfig.AsObject;
  static serializeBinaryToWriter(message: TimedSerializeIntervalConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TimedSerializeIntervalConfig;
  static deserializeBinaryFromReader(message: TimedSerializeIntervalConfig, reader: jspb.BinaryReader): TimedSerializeIntervalConfig;
}

export namespace TimedSerializeIntervalConfig {
  export type AsObject = {
    interval: number,
  }
}

export class BlockHeightSerializeIntervalConfig extends jspb.Message {
  getInterval(): number;
  setInterval(value: number): BlockHeightSerializeIntervalConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockHeightSerializeIntervalConfig.AsObject;
  static toObject(includeInstance: boolean, msg: BlockHeightSerializeIntervalConfig): BlockHeightSerializeIntervalConfig.AsObject;
  static serializeBinaryToWriter(message: BlockHeightSerializeIntervalConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockHeightSerializeIntervalConfig;
  static deserializeBinaryFromReader(message: BlockHeightSerializeIntervalConfig, reader: jspb.BinaryReader): BlockHeightSerializeIntervalConfig;
}

export namespace BlockHeightSerializeIntervalConfig {
  export type AsObject = {
    interval: number,
  }
}

export enum KeyType { 
  KTDEFAULT = 0,
  KTTIMESTAMPKEY = 1,
}
export enum FilterExtensionType { 
  FETDEFAULT = 0,
  FETTIMESTAMP = 1,
}
export enum RuleType { 
  ABSOLUTEEXPIRETIME = 0,
}
export enum SerializeIntervalType { 
  HEIGHT = 0,
  TIMED = 1,
  EXIT = 2,
}
