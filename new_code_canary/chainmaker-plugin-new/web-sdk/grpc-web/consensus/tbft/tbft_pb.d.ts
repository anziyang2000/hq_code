import * as jspb from 'google-protobuf'

import * as common_block_pb from '../../common/block_pb';
import * as common_request_pb from '../../common/request_pb';
import * as common_rwset_pb from '../../common/rwset_pb';


export class ValidatorSet extends jspb.Message {
  getValidatorsList(): Array<string>;
  setValidatorsList(value: Array<string>): ValidatorSet;
  clearValidatorsList(): ValidatorSet;
  addValidators(value: string, index?: number): ValidatorSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidatorSet.AsObject;
  static toObject(includeInstance: boolean, msg: ValidatorSet): ValidatorSet.AsObject;
  static serializeBinaryToWriter(message: ValidatorSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidatorSet;
  static deserializeBinaryFromReader(message: ValidatorSet, reader: jspb.BinaryReader): ValidatorSet;
}

export namespace ValidatorSet {
  export type AsObject = {
    validatorsList: Array<string>,
  }
}

export class TBFTMsg extends jspb.Message {
  getType(): TBFTMsgType;
  setType(value: TBFTMsgType): TBFTMsg;

  getMsg(): Uint8Array | string;
  getMsg_asU8(): Uint8Array;
  getMsg_asB64(): string;
  setMsg(value: Uint8Array | string): TBFTMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TBFTMsg.AsObject;
  static toObject(includeInstance: boolean, msg: TBFTMsg): TBFTMsg.AsObject;
  static serializeBinaryToWriter(message: TBFTMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TBFTMsg;
  static deserializeBinaryFromReader(message: TBFTMsg, reader: jspb.BinaryReader): TBFTMsg;
}

export namespace TBFTMsg {
  export type AsObject = {
    type: TBFTMsgType,
    msg: Uint8Array | string,
  }
}

export class Proposal extends jspb.Message {
  getVoter(): string;
  setVoter(value: string): Proposal;

  getHeight(): number;
  setHeight(value: number): Proposal;

  getRound(): number;
  setRound(value: number): Proposal;

  getPolRound(): number;
  setPolRound(value: number): Proposal;

  getBlock(): common_block_pb.Block | undefined;
  setBlock(value?: common_block_pb.Block): Proposal;
  hasBlock(): boolean;
  clearBlock(): Proposal;

  getEndorsement(): common_request_pb.EndorsementEntry | undefined;
  setEndorsement(value?: common_request_pb.EndorsementEntry): Proposal;
  hasEndorsement(): boolean;
  clearEndorsement(): Proposal;

  getTxsRwSetMap(): jspb.Map<string, common_rwset_pb.TxRWSet>;
  clearTxsRwSetMap(): Proposal;

  getQcList(): Array<Vote>;
  setQcList(value: Array<Vote>): Proposal;
  clearQcList(): Proposal;
  addQc(value?: Vote, index?: number): Vote;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Proposal.AsObject;
  static toObject(includeInstance: boolean, msg: Proposal): Proposal.AsObject;
  static serializeBinaryToWriter(message: Proposal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Proposal;
  static deserializeBinaryFromReader(message: Proposal, reader: jspb.BinaryReader): Proposal;
}

export namespace Proposal {
  export type AsObject = {
    voter: string,
    height: number,
    round: number,
    polRound: number,
    block?: common_block_pb.Block.AsObject,
    endorsement?: common_request_pb.EndorsementEntry.AsObject,
    txsRwSetMap: Array<[string, common_rwset_pb.TxRWSet.AsObject]>,
    qcList: Array<Vote.AsObject>,
  }
}

export class Vote extends jspb.Message {
  getType(): VoteType;
  setType(value: VoteType): Vote;

  getVoter(): string;
  setVoter(value: string): Vote;

  getHeight(): number;
  setHeight(value: number): Vote;

  getRound(): number;
  setRound(value: number): Vote;

  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): Vote;

  getEndorsement(): common_request_pb.EndorsementEntry | undefined;
  setEndorsement(value?: common_request_pb.EndorsementEntry): Vote;
  hasEndorsement(): boolean;
  clearEndorsement(): Vote;

  getInvalidtxsList(): Array<string>;
  setInvalidtxsList(value: Array<string>): Vote;
  clearInvalidtxsList(): Vote;
  addInvalidtxs(value: string, index?: number): Vote;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vote.AsObject;
  static toObject(includeInstance: boolean, msg: Vote): Vote.AsObject;
  static serializeBinaryToWriter(message: Vote, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vote;
  static deserializeBinaryFromReader(message: Vote, reader: jspb.BinaryReader): Vote;
}

export namespace Vote {
  export type AsObject = {
    type: VoteType,
    voter: string,
    height: number,
    round: number,
    hash: Uint8Array | string,
    endorsement?: common_request_pb.EndorsementEntry.AsObject,
    invalidtxsList: Array<string>,
  }
}

export class BlockVotes extends jspb.Message {
  getVotesMap(): jspb.Map<string, Vote>;
  clearVotesMap(): BlockVotes;

  getSum(): number;
  setSum(value: number): BlockVotes;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockVotes.AsObject;
  static toObject(includeInstance: boolean, msg: BlockVotes): BlockVotes.AsObject;
  static serializeBinaryToWriter(message: BlockVotes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockVotes;
  static deserializeBinaryFromReader(message: BlockVotes, reader: jspb.BinaryReader): BlockVotes;
}

export namespace BlockVotes {
  export type AsObject = {
    votesMap: Array<[string, Vote.AsObject]>,
    sum: number,
  }
}

export class VoteSet extends jspb.Message {
  getType(): VoteType;
  setType(value: VoteType): VoteSet;

  getHeight(): number;
  setHeight(value: number): VoteSet;

  getRound(): number;
  setRound(value: number): VoteSet;

  getSum(): number;
  setSum(value: number): VoteSet;

  getMaj23(): Uint8Array | string;
  getMaj23_asU8(): Uint8Array;
  getMaj23_asB64(): string;
  setMaj23(value: Uint8Array | string): VoteSet;

  getVotesMap(): jspb.Map<string, Vote>;
  clearVotesMap(): VoteSet;

  getVotesByBlockMap(): jspb.Map<string, BlockVotes>;
  clearVotesByBlockMap(): VoteSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VoteSet.AsObject;
  static toObject(includeInstance: boolean, msg: VoteSet): VoteSet.AsObject;
  static serializeBinaryToWriter(message: VoteSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VoteSet;
  static deserializeBinaryFromReader(message: VoteSet, reader: jspb.BinaryReader): VoteSet;
}

export namespace VoteSet {
  export type AsObject = {
    type: VoteType,
    height: number,
    round: number,
    sum: number,
    maj23: Uint8Array | string,
    votesMap: Array<[string, Vote.AsObject]>,
    votesByBlockMap: Array<[string, BlockVotes.AsObject]>,
  }
}

export class RoundVoteSet extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): RoundVoteSet;

  getRound(): number;
  setRound(value: number): RoundVoteSet;

  getPrevotes(): VoteSet | undefined;
  setPrevotes(value?: VoteSet): RoundVoteSet;
  hasPrevotes(): boolean;
  clearPrevotes(): RoundVoteSet;

  getPrecommits(): VoteSet | undefined;
  setPrecommits(value?: VoteSet): RoundVoteSet;
  hasPrecommits(): boolean;
  clearPrecommits(): RoundVoteSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoundVoteSet.AsObject;
  static toObject(includeInstance: boolean, msg: RoundVoteSet): RoundVoteSet.AsObject;
  static serializeBinaryToWriter(message: RoundVoteSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoundVoteSet;
  static deserializeBinaryFromReader(message: RoundVoteSet, reader: jspb.BinaryReader): RoundVoteSet;
}

export namespace RoundVoteSet {
  export type AsObject = {
    height: number,
    round: number,
    prevotes?: VoteSet.AsObject,
    precommits?: VoteSet.AsObject,
  }
}

export class HeightRoundVoteSet extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): HeightRoundVoteSet;

  getRound(): number;
  setRound(value: number): HeightRoundVoteSet;

  getRoundVoteSetsMap(): jspb.Map<number, RoundVoteSet>;
  clearRoundVoteSetsMap(): HeightRoundVoteSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HeightRoundVoteSet.AsObject;
  static toObject(includeInstance: boolean, msg: HeightRoundVoteSet): HeightRoundVoteSet.AsObject;
  static serializeBinaryToWriter(message: HeightRoundVoteSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HeightRoundVoteSet;
  static deserializeBinaryFromReader(message: HeightRoundVoteSet, reader: jspb.BinaryReader): HeightRoundVoteSet;
}

export namespace HeightRoundVoteSet {
  export type AsObject = {
    height: number,
    round: number,
    roundVoteSetsMap: Array<[number, RoundVoteSet.AsObject]>,
  }
}

export class ConsensusState extends jspb.Message {
  getId(): string;
  setId(value: string): ConsensusState;

  getHeight(): number;
  setHeight(value: number): ConsensusState;

  getRound(): number;
  setRound(value: number): ConsensusState;

  getStep(): Step;
  setStep(value: Step): ConsensusState;

  getProposal(): Proposal | undefined;
  setProposal(value?: Proposal): ConsensusState;
  hasProposal(): boolean;
  clearProposal(): ConsensusState;

  getVerifingProposal(): Proposal | undefined;
  setVerifingProposal(value?: Proposal): ConsensusState;
  hasVerifingProposal(): boolean;
  clearVerifingProposal(): ConsensusState;

  getLockedProposal(): Proposal | undefined;
  setLockedProposal(value?: Proposal): ConsensusState;
  hasLockedProposal(): boolean;
  clearLockedProposal(): ConsensusState;

  getValidProposal(): Proposal | undefined;
  setValidProposal(value?: Proposal): ConsensusState;
  hasValidProposal(): boolean;
  clearValidProposal(): ConsensusState;

  getHeightRoundVoteSet(): HeightRoundVoteSet | undefined;
  setHeightRoundVoteSet(value?: HeightRoundVoteSet): ConsensusState;
  hasHeightRoundVoteSet(): boolean;
  clearHeightRoundVoteSet(): ConsensusState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsensusState.AsObject;
  static toObject(includeInstance: boolean, msg: ConsensusState): ConsensusState.AsObject;
  static serializeBinaryToWriter(message: ConsensusState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsensusState;
  static deserializeBinaryFromReader(message: ConsensusState, reader: jspb.BinaryReader): ConsensusState;
}

export namespace ConsensusState {
  export type AsObject = {
    id: string,
    height: number,
    round: number,
    step: Step,
    proposal?: Proposal.AsObject,
    verifingProposal?: Proposal.AsObject,
    lockedProposal?: Proposal.AsObject,
    validProposal?: Proposal.AsObject,
    heightRoundVoteSet?: HeightRoundVoteSet.AsObject,
  }
}

export class FetchRoundQC extends jspb.Message {
  getId(): string;
  setId(value: string): FetchRoundQC;

  getHeight(): number;
  setHeight(value: number): FetchRoundQC;

  getRound(): number;
  setRound(value: number): FetchRoundQC;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FetchRoundQC.AsObject;
  static toObject(includeInstance: boolean, msg: FetchRoundQC): FetchRoundQC.AsObject;
  static serializeBinaryToWriter(message: FetchRoundQC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FetchRoundQC;
  static deserializeBinaryFromReader(message: FetchRoundQC, reader: jspb.BinaryReader): FetchRoundQC;
}

export namespace FetchRoundQC {
  export type AsObject = {
    id: string,
    height: number,
    round: number,
  }
}

export class RoundQC extends jspb.Message {
  getId(): string;
  setId(value: string): RoundQC;

  getHeight(): number;
  setHeight(value: number): RoundQC;

  getRound(): number;
  setRound(value: number): RoundQC;

  getQc(): VoteSet | undefined;
  setQc(value?: VoteSet): RoundQC;
  hasQc(): boolean;
  clearQc(): RoundQC;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoundQC.AsObject;
  static toObject(includeInstance: boolean, msg: RoundQC): RoundQC.AsObject;
  static serializeBinaryToWriter(message: RoundQC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoundQC;
  static deserializeBinaryFromReader(message: RoundQC, reader: jspb.BinaryReader): RoundQC;
}

export namespace RoundQC {
  export type AsObject = {
    id: string,
    height: number,
    round: number,
    qc?: VoteSet.AsObject,
  }
}

export class GossipState extends jspb.Message {
  getId(): string;
  setId(value: string): GossipState;

  getHeight(): number;
  setHeight(value: number): GossipState;

  getRound(): number;
  setRound(value: number): GossipState;

  getStep(): Step;
  setStep(value: Step): GossipState;

  getProposal(): Uint8Array | string;
  getProposal_asU8(): Uint8Array;
  getProposal_asB64(): string;
  setProposal(value: Uint8Array | string): GossipState;

  getVerifingProposal(): Uint8Array | string;
  getVerifingProposal_asU8(): Uint8Array;
  getVerifingProposal_asB64(): string;
  setVerifingProposal(value: Uint8Array | string): GossipState;

  getRoundVoteSet(): RoundVoteSet | undefined;
  setRoundVoteSet(value?: RoundVoteSet): GossipState;
  hasRoundVoteSet(): boolean;
  clearRoundVoteSet(): GossipState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GossipState.AsObject;
  static toObject(includeInstance: boolean, msg: GossipState): GossipState.AsObject;
  static serializeBinaryToWriter(message: GossipState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GossipState;
  static deserializeBinaryFromReader(message: GossipState, reader: jspb.BinaryReader): GossipState;
}

export namespace GossipState {
  export type AsObject = {
    id: string,
    height: number,
    round: number,
    step: Step,
    proposal: Uint8Array | string,
    verifingProposal: Uint8Array | string,
    roundVoteSet?: RoundVoteSet.AsObject,
  }
}

export class TimeoutInfo extends jspb.Message {
  getDuration(): number;
  setDuration(value: number): TimeoutInfo;

  getHeight(): number;
  setHeight(value: number): TimeoutInfo;

  getRound(): number;
  setRound(value: number): TimeoutInfo;

  getStep(): Step;
  setStep(value: Step): TimeoutInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TimeoutInfo.AsObject;
  static toObject(includeInstance: boolean, msg: TimeoutInfo): TimeoutInfo.AsObject;
  static serializeBinaryToWriter(message: TimeoutInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TimeoutInfo;
  static deserializeBinaryFromReader(message: TimeoutInfo, reader: jspb.BinaryReader): TimeoutInfo;
}

export namespace TimeoutInfo {
  export type AsObject = {
    duration: number,
    height: number,
    round: number,
    step: Step,
  }
}

export class WalEntry extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): WalEntry;

  getType(): WalEntryType;
  setType(value: WalEntryType): WalEntry;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): WalEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WalEntry.AsObject;
  static toObject(includeInstance: boolean, msg: WalEntry): WalEntry.AsObject;
  static serializeBinaryToWriter(message: WalEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WalEntry;
  static deserializeBinaryFromReader(message: WalEntry, reader: jspb.BinaryReader): WalEntry;
}

export namespace WalEntry {
  export type AsObject = {
    height: number,
    type: WalEntryType,
    data: Uint8Array | string,
  }
}

export enum TBFTMsgType { 
  MSG_PROPOSE = 0,
  MSG_PREVOTE = 1,
  MSG_PRECOMMIT = 2,
  MSG_STATE = 3,
  MSG_FETCH_ROUNDQC = 4,
  MSG_SEND_ROUND_QC = 5,
}
export enum VoteType { 
  VOTE_PREVOTE = 0,
  VOTE_PRECOMMIT = 1,
}
export enum Step { 
  NEW_HEIGHT = 0,
  NEW_ROUND = 1,
  PROPOSE = 2,
  PREVOTE = 3,
  PREVOTE_WAIT = 4,
  PRECOMMIT = 5,
  PRECOMMIT_WAIT = 6,
  COMMIT = 7,
}
export enum WalEntryType { 
  TIMEOUT_ENTRY = 0,
  PROPOSAL_ENTRY = 1,
  VOTE_ENTRY = 2,
  PROPOSAL_VOTE_ENTRY = 3,
}
