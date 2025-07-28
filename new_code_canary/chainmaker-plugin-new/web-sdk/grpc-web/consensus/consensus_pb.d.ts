import * as jspb from 'google-protobuf'

import * as common_block_pb from '../common/block_pb';
import * as common_rwset_pb from '../common/rwset_pb';


export class VerifyResult extends jspb.Message {
  getVerifiedBlock(): common_block_pb.Block | undefined;
  setVerifiedBlock(value?: common_block_pb.Block): VerifyResult;
  hasVerifiedBlock(): boolean;
  clearVerifiedBlock(): VerifyResult;

  getCode(): VerifyResult.Code;
  setCode(value: VerifyResult.Code): VerifyResult;

  getMsg(): string;
  setMsg(value: string): VerifyResult;

  getTxsRwSetMap(): jspb.Map<string, common_rwset_pb.TxRWSet>;
  clearTxsRwSetMap(): VerifyResult;

  getRwSetVerifyFailTxs(): RwSetVerifyFailTxs | undefined;
  setRwSetVerifyFailTxs(value?: RwSetVerifyFailTxs): VerifyResult;
  hasRwSetVerifyFailTxs(): boolean;
  clearRwSetVerifyFailTxs(): VerifyResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyResult.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyResult): VerifyResult.AsObject;
  static serializeBinaryToWriter(message: VerifyResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyResult;
  static deserializeBinaryFromReader(message: VerifyResult, reader: jspb.BinaryReader): VerifyResult;
}

export namespace VerifyResult {
  export type AsObject = {
    verifiedBlock?: common_block_pb.Block.AsObject,
    code: VerifyResult.Code,
    msg: string,
    txsRwSetMap: Array<[string, common_rwset_pb.TxRWSet.AsObject]>,
    rwSetVerifyFailTxs?: RwSetVerifyFailTxs.AsObject,
  }

  export enum Code { 
    SUCCESS = 0,
    FAIL = 1,
  }
}

export class RwSetVerifyFailTxs extends jspb.Message {
  getBlockHeight(): number;
  setBlockHeight(value: number): RwSetVerifyFailTxs;

  getTxIdsList(): Array<string>;
  setTxIdsList(value: Array<string>): RwSetVerifyFailTxs;
  clearTxIdsList(): RwSetVerifyFailTxs;
  addTxIds(value: string, index?: number): RwSetVerifyFailTxs;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RwSetVerifyFailTxs.AsObject;
  static toObject(includeInstance: boolean, msg: RwSetVerifyFailTxs): RwSetVerifyFailTxs.AsObject;
  static serializeBinaryToWriter(message: RwSetVerifyFailTxs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RwSetVerifyFailTxs;
  static deserializeBinaryFromReader(message: RwSetVerifyFailTxs, reader: jspb.BinaryReader): RwSetVerifyFailTxs;
}

export namespace RwSetVerifyFailTxs {
  export type AsObject = {
    blockHeight: number,
    txIdsList: Array<string>,
  }
}

export class ProposalBlock extends jspb.Message {
  getBlock(): common_block_pb.Block | undefined;
  setBlock(value?: common_block_pb.Block): ProposalBlock;
  hasBlock(): boolean;
  clearBlock(): ProposalBlock;

  getTxsRwSetMap(): jspb.Map<string, common_rwset_pb.TxRWSet>;
  clearTxsRwSetMap(): ProposalBlock;

  getCutBlock(): common_block_pb.Block | undefined;
  setCutBlock(value?: common_block_pb.Block): ProposalBlock;
  hasCutBlock(): boolean;
  clearCutBlock(): ProposalBlock;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposalBlock.AsObject;
  static toObject(includeInstance: boolean, msg: ProposalBlock): ProposalBlock.AsObject;
  static serializeBinaryToWriter(message: ProposalBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposalBlock;
  static deserializeBinaryFromReader(message: ProposalBlock, reader: jspb.BinaryReader): ProposalBlock;
}

export namespace ProposalBlock {
  export type AsObject = {
    block?: common_block_pb.Block.AsObject,
    txsRwSetMap: Array<[string, common_rwset_pb.TxRWSet.AsObject]>,
    cutBlock?: common_block_pb.Block.AsObject,
  }
}

export class BlockHeaderConsensusArgs extends jspb.Message {
  getConsensusType(): number;
  setConsensusType(value: number): BlockHeaderConsensusArgs;

  getRound(): number;
  setRound(value: number): BlockHeaderConsensusArgs;

  getView(): number;
  setView(value: number): BlockHeaderConsensusArgs;

  getConsensusData(): common_rwset_pb.TxRWSet | undefined;
  setConsensusData(value?: common_rwset_pb.TxRWSet): BlockHeaderConsensusArgs;
  hasConsensusData(): boolean;
  clearConsensusData(): BlockHeaderConsensusArgs;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockHeaderConsensusArgs.AsObject;
  static toObject(includeInstance: boolean, msg: BlockHeaderConsensusArgs): BlockHeaderConsensusArgs.AsObject;
  static serializeBinaryToWriter(message: BlockHeaderConsensusArgs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockHeaderConsensusArgs;
  static deserializeBinaryFromReader(message: BlockHeaderConsensusArgs, reader: jspb.BinaryReader): BlockHeaderConsensusArgs;
}

export namespace BlockHeaderConsensusArgs {
  export type AsObject = {
    consensusType: number,
    round: number,
    view: number,
    consensusData?: common_rwset_pb.TxRWSet.AsObject,
  }
}

export class GovernanceMember extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): GovernanceMember;

  getIndex(): number;
  setIndex(value: number): GovernanceMember;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GovernanceMember.AsObject;
  static toObject(includeInstance: boolean, msg: GovernanceMember): GovernanceMember.AsObject;
  static serializeBinaryToWriter(message: GovernanceMember, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GovernanceMember;
  static deserializeBinaryFromReader(message: GovernanceMember, reader: jspb.BinaryReader): GovernanceMember;
}

export namespace GovernanceMember {
  export type AsObject = {
    nodeId: string,
    index: number,
  }
}

export class GovernanceContract extends jspb.Message {
  getEpochId(): number;
  setEpochId(value: number): GovernanceContract;

  getType(): ConsensusType;
  setType(value: ConsensusType): GovernanceContract;

  getCurMaxIndex(): number;
  setCurMaxIndex(value: number): GovernanceContract;

  getSkipTimeoutCommit(): boolean;
  setSkipTimeoutCommit(value: boolean): GovernanceContract;

  getConfigSequence(): number;
  setConfigSequence(value: number): GovernanceContract;

  getN(): number;
  setN(value: number): GovernanceContract;

  getMinQuorumForQc(): number;
  setMinQuorumForQc(value: number): GovernanceContract;

  getCachedLen(): number;
  setCachedLen(value: number): GovernanceContract;

  getNextSwitchHeight(): number;
  setNextSwitchHeight(value: number): GovernanceContract;

  getTransitBlock(): number;
  setTransitBlock(value: number): GovernanceContract;

  getBlockNumPerEpoch(): number;
  setBlockNumPerEpoch(value: number): GovernanceContract;

  getValidatorNum(): number;
  setValidatorNum(value: number): GovernanceContract;

  getNodeProposeRound(): number;
  setNodeProposeRound(value: number): GovernanceContract;

  getMembersList(): Array<GovernanceMember>;
  setMembersList(value: Array<GovernanceMember>): GovernanceContract;
  clearMembersList(): GovernanceContract;
  addMembers(value?: GovernanceMember, index?: number): GovernanceMember;

  getValidatorsList(): Array<GovernanceMember>;
  setValidatorsList(value: Array<GovernanceMember>): GovernanceContract;
  clearValidatorsList(): GovernanceContract;
  addValidators(value?: GovernanceMember, index?: number): GovernanceMember;

  getNextValidatorsList(): Array<GovernanceMember>;
  setNextValidatorsList(value: Array<GovernanceMember>): GovernanceContract;
  clearNextValidatorsList(): GovernanceContract;
  addNextValidators(value?: GovernanceMember, index?: number): GovernanceMember;

  getLastMinQuorumForQc(): number;
  setLastMinQuorumForQc(value: number): GovernanceContract;

  getMaxbftRoundTimeoutMill(): number;
  setMaxbftRoundTimeoutMill(value: number): GovernanceContract;

  getMaxbftRoundTimeoutIntervalMill(): number;
  setMaxbftRoundTimeoutIntervalMill(value: number): GovernanceContract;

  getLastValidatorsList(): Array<GovernanceMember>;
  setLastValidatorsList(value: Array<GovernanceMember>): GovernanceContract;
  clearLastValidatorsList(): GovernanceContract;
  addLastValidators(value?: GovernanceMember, index?: number): GovernanceMember;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GovernanceContract.AsObject;
  static toObject(includeInstance: boolean, msg: GovernanceContract): GovernanceContract.AsObject;
  static serializeBinaryToWriter(message: GovernanceContract, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GovernanceContract;
  static deserializeBinaryFromReader(message: GovernanceContract, reader: jspb.BinaryReader): GovernanceContract;
}

export namespace GovernanceContract {
  export type AsObject = {
    epochId: number,
    type: ConsensusType,
    curMaxIndex: number,
    skipTimeoutCommit: boolean,
    configSequence: number,
    n: number,
    minQuorumForQc: number,
    cachedLen: number,
    nextSwitchHeight: number,
    transitBlock: number,
    blockNumPerEpoch: number,
    validatorNum: number,
    nodeProposeRound: number,
    membersList: Array<GovernanceMember.AsObject>,
    validatorsList: Array<GovernanceMember.AsObject>,
    nextValidatorsList: Array<GovernanceMember.AsObject>,
    lastMinQuorumForQc: number,
    maxbftRoundTimeoutMill: number,
    maxbftRoundTimeoutIntervalMill: number,
    lastValidatorsList: Array<GovernanceMember.AsObject>,
  }
}

export enum ConsensusType { 
  SOLO = 0,
  TBFT = 1,
  MBFT = 2,
  MAXBFT = 3,
  RAFT = 4,
  DPOS = 5,
  POW = 10,
}
