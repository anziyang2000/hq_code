import * as jspb from 'google-protobuf'



export class Epoch extends jspb.Message {
  getEpochId(): number;
  setEpochId(value: number): Epoch;

  getProposerVectorList(): Array<string>;
  setProposerVectorList(value: Array<string>): Epoch;
  clearProposerVectorList(): Epoch;
  addProposerVector(value: string, index?: number): Epoch;

  getNextEpochCreateHeight(): number;
  setNextEpochCreateHeight(value: number): Epoch;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Epoch.AsObject;
  static toObject(includeInstance: boolean, msg: Epoch): Epoch.AsObject;
  static serializeBinaryToWriter(message: Epoch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Epoch;
  static deserializeBinaryFromReader(message: Epoch, reader: jspb.BinaryReader): Epoch;
}

export namespace Epoch {
  export type AsObject = {
    epochId: number,
    proposerVectorList: Array<string>,
    nextEpochCreateHeight: number,
  }
}

export class Validator extends jspb.Message {
  getValidatorAddress(): string;
  setValidatorAddress(value: string): Validator;

  getJailed(): boolean;
  setJailed(value: boolean): Validator;

  getStatus(): BondStatus;
  setStatus(value: BondStatus): Validator;

  getTokens(): string;
  setTokens(value: string): Validator;

  getDelegatorShares(): string;
  setDelegatorShares(value: string): Validator;

  getUnbondingEpochId(): number;
  setUnbondingEpochId(value: number): Validator;

  getUnbondingCompletionEpochId(): number;
  setUnbondingCompletionEpochId(value: number): Validator;

  getSelfDelegation(): string;
  setSelfDelegation(value: string): Validator;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Validator.AsObject;
  static toObject(includeInstance: boolean, msg: Validator): Validator.AsObject;
  static serializeBinaryToWriter(message: Validator, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Validator;
  static deserializeBinaryFromReader(message: Validator, reader: jspb.BinaryReader): Validator;
}

export namespace Validator {
  export type AsObject = {
    validatorAddress: string,
    jailed: boolean,
    status: BondStatus,
    tokens: string,
    delegatorShares: string,
    unbondingEpochId: number,
    unbondingCompletionEpochId: number,
    selfDelegation: string,
  }
}

export class Delegation extends jspb.Message {
  getDelegatorAddress(): string;
  setDelegatorAddress(value: string): Delegation;

  getValidatorAddress(): string;
  setValidatorAddress(value: string): Delegation;

  getShares(): string;
  setShares(value: string): Delegation;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Delegation.AsObject;
  static toObject(includeInstance: boolean, msg: Delegation): Delegation.AsObject;
  static serializeBinaryToWriter(message: Delegation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Delegation;
  static deserializeBinaryFromReader(message: Delegation, reader: jspb.BinaryReader): Delegation;
}

export namespace Delegation {
  export type AsObject = {
    delegatorAddress: string,
    validatorAddress: string,
    shares: string,
  }
}

export class UnbondingDelegation extends jspb.Message {
  getEpochId(): string;
  setEpochId(value: string): UnbondingDelegation;

  getDelegatorAddress(): string;
  setDelegatorAddress(value: string): UnbondingDelegation;

  getValidatorAddress(): string;
  setValidatorAddress(value: string): UnbondingDelegation;

  getEntriesList(): Array<UnbondingDelegationEntry>;
  setEntriesList(value: Array<UnbondingDelegationEntry>): UnbondingDelegation;
  clearEntriesList(): UnbondingDelegation;
  addEntries(value?: UnbondingDelegationEntry, index?: number): UnbondingDelegationEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnbondingDelegation.AsObject;
  static toObject(includeInstance: boolean, msg: UnbondingDelegation): UnbondingDelegation.AsObject;
  static serializeBinaryToWriter(message: UnbondingDelegation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnbondingDelegation;
  static deserializeBinaryFromReader(message: UnbondingDelegation, reader: jspb.BinaryReader): UnbondingDelegation;
}

export namespace UnbondingDelegation {
  export type AsObject = {
    epochId: string,
    delegatorAddress: string,
    validatorAddress: string,
    entriesList: Array<UnbondingDelegationEntry.AsObject>,
  }
}

export class UnbondingDelegationEntry extends jspb.Message {
  getCreationEpochId(): number;
  setCreationEpochId(value: number): UnbondingDelegationEntry;

  getCompletionEpochId(): number;
  setCompletionEpochId(value: number): UnbondingDelegationEntry;

  getAmount(): string;
  setAmount(value: string): UnbondingDelegationEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnbondingDelegationEntry.AsObject;
  static toObject(includeInstance: boolean, msg: UnbondingDelegationEntry): UnbondingDelegationEntry.AsObject;
  static serializeBinaryToWriter(message: UnbondingDelegationEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnbondingDelegationEntry;
  static deserializeBinaryFromReader(message: UnbondingDelegationEntry, reader: jspb.BinaryReader): UnbondingDelegationEntry;
}

export namespace UnbondingDelegationEntry {
  export type AsObject = {
    creationEpochId: number,
    completionEpochId: number,
    amount: string,
  }
}

export class ValidatorVector extends jspb.Message {
  getVectorList(): Array<string>;
  setVectorList(value: Array<string>): ValidatorVector;
  clearVectorList(): ValidatorVector;
  addVector(value: string, index?: number): ValidatorVector;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidatorVector.AsObject;
  static toObject(includeInstance: boolean, msg: ValidatorVector): ValidatorVector.AsObject;
  static serializeBinaryToWriter(message: ValidatorVector, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidatorVector;
  static deserializeBinaryFromReader(message: ValidatorVector, reader: jspb.BinaryReader): ValidatorVector;
}

export namespace ValidatorVector {
  export type AsObject = {
    vectorList: Array<string>,
  }
}

export class DelegationInfo extends jspb.Message {
  getInfosList(): Array<Delegation>;
  setInfosList(value: Array<Delegation>): DelegationInfo;
  clearInfosList(): DelegationInfo;
  addInfos(value?: Delegation, index?: number): Delegation;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DelegationInfo.AsObject;
  static toObject(includeInstance: boolean, msg: DelegationInfo): DelegationInfo.AsObject;
  static serializeBinaryToWriter(message: DelegationInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DelegationInfo;
  static deserializeBinaryFromReader(message: DelegationInfo, reader: jspb.BinaryReader): DelegationInfo;
}

export namespace DelegationInfo {
  export type AsObject = {
    infosList: Array<Delegation.AsObject>,
  }
}

export enum DPoSStakeFunction { 
  GET_ALL_CANDIDATES = 0,
  GET_VALIDATOR_BY_ADDRESS = 1,
  DELEGATE = 2,
  GET_DELEGATIONS_BY_ADDRESS = 3,
  GET_USER_DELEGATION_BY_VALIDATOR = 4,
  UNDELEGATE = 5,
  READ_EPOCH_BY_ID = 6,
  READ_LATEST_EPOCH = 7,
  SET_NODE_ID = 8,
  GET_NODE_ID = 9,
  UPDATE_MIN_SELF_DELEGATION = 10,
  READ_MIN_SELF_DELEGATION = 11,
  UPDATE_EPOCH_VALIDATOR_NUMBER = 12,
  READ_EPOCH_VALIDATOR_NUMBER = 13,
  UPDATE_EPOCH_BLOCK_NUMBER = 14,
  READ_EPOCH_BLOCK_NUMBER = 15,
  READ_COMPLETE_UNBOUNDING_EPOCH_NUMBER = 16,
  READ_SYSTEM_CONTRACT_ADDR = 18,
}
export enum BondStatus { 
  BONDED = 0,
  UNBONDING = 1,
  UNBONDED = 2,
}
