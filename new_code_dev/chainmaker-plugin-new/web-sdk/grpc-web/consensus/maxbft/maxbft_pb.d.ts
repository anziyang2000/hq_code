import * as jspb from 'google-protobuf'

import * as common_block_pb from '../../common/block_pb';
import * as common_request_pb from '../../common/request_pb';
import * as common_rwset_pb from '../../common/rwset_pb';
import * as config_chain_config_pb from '../../config/chain_config_pb';


export class ConsensusMsg extends jspb.Message {
  getType(): MessageType;
  setType(value: MessageType): ConsensusMsg;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): ConsensusMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsensusMsg.AsObject;
  static toObject(includeInstance: boolean, msg: ConsensusMsg): ConsensusMsg.AsObject;
  static serializeBinaryToWriter(message: ConsensusMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsensusMsg;
  static deserializeBinaryFromReader(message: ConsensusMsg, reader: jspb.BinaryReader): ConsensusMsg;
}

export namespace ConsensusMsg {
  export type AsObject = {
    type: MessageType,
    payload: Uint8Array | string,
  }
}

export class ProposalData extends jspb.Message {
  getBlock(): common_block_pb.Block | undefined;
  setBlock(value?: common_block_pb.Block): ProposalData;
  hasBlock(): boolean;
  clearBlock(): ProposalData;

  getView(): number;
  setView(value: number): ProposalData;

  getProposer(): string;
  setProposer(value: string): ProposalData;

  getJustifyQc(): QuorumCert | undefined;
  setJustifyQc(value?: QuorumCert): ProposalData;
  hasJustifyQc(): boolean;
  clearJustifyQc(): ProposalData;

  getEpochId(): number;
  setEpochId(value: number): ProposalData;

  getTxRwSetList(): Array<common_rwset_pb.TxRWSet>;
  setTxRwSetList(value: Array<common_rwset_pb.TxRWSet>): ProposalData;
  clearTxRwSetList(): ProposalData;
  addTxRwSet(value?: common_rwset_pb.TxRWSet, index?: number): common_rwset_pb.TxRWSet;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposalData.AsObject;
  static toObject(includeInstance: boolean, msg: ProposalData): ProposalData.AsObject;
  static serializeBinaryToWriter(message: ProposalData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposalData;
  static deserializeBinaryFromReader(message: ProposalData, reader: jspb.BinaryReader): ProposalData;
}

export namespace ProposalData {
  export type AsObject = {
    block?: common_block_pb.Block.AsObject,
    view: number,
    proposer: string,
    justifyQc?: QuorumCert.AsObject,
    epochId: number,
    txRwSetList: Array<common_rwset_pb.TxRWSet.AsObject>,
  }
}

export class QuorumCert extends jspb.Message {
  getVotesList(): Array<VoteData>;
  setVotesList(value: Array<VoteData>): QuorumCert;
  clearVotesList(): QuorumCert;
  addVotes(value?: VoteData, index?: number): VoteData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuorumCert.AsObject;
  static toObject(includeInstance: boolean, msg: QuorumCert): QuorumCert.AsObject;
  static serializeBinaryToWriter(message: QuorumCert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuorumCert;
  static deserializeBinaryFromReader(message: QuorumCert, reader: jspb.BinaryReader): QuorumCert;
}

export namespace QuorumCert {
  export type AsObject = {
    votesList: Array<VoteData.AsObject>,
  }
}

export class VoteData extends jspb.Message {
  getBlockId(): Uint8Array | string;
  getBlockId_asU8(): Uint8Array;
  getBlockId_asB64(): string;
  setBlockId(value: Uint8Array | string): VoteData;

  getHeight(): number;
  setHeight(value: number): VoteData;

  getView(): number;
  setView(value: number): VoteData;

  getAuthor(): Uint8Array | string;
  getAuthor_asU8(): Uint8Array;
  getAuthor_asB64(): string;
  setAuthor(value: Uint8Array | string): VoteData;

  getEpochId(): number;
  setEpochId(value: number): VoteData;

  getSignature(): common_request_pb.EndorsementEntry | undefined;
  setSignature(value?: common_request_pb.EndorsementEntry): VoteData;
  hasSignature(): boolean;
  clearSignature(): VoteData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VoteData.AsObject;
  static toObject(includeInstance: boolean, msg: VoteData): VoteData.AsObject;
  static serializeBinaryToWriter(message: VoteData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VoteData;
  static deserializeBinaryFromReader(message: VoteData, reader: jspb.BinaryReader): VoteData;
}

export namespace VoteData {
  export type AsObject = {
    blockId: Uint8Array | string,
    height: number,
    view: number,
    author: Uint8Array | string,
    epochId: number,
    signature?: common_request_pb.EndorsementEntry.AsObject,
  }
}

export class ViewData extends jspb.Message {
  getView(): number;
  setView(value: number): ViewData;

  getEpochId(): number;
  setEpochId(value: number): ViewData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ViewData.AsObject;
  static toObject(includeInstance: boolean, msg: ViewData): ViewData.AsObject;
  static serializeBinaryToWriter(message: ViewData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ViewData;
  static deserializeBinaryFromReader(message: ViewData, reader: jspb.BinaryReader): ViewData;
}

export namespace ViewData {
  export type AsObject = {
    view: number,
    epochId: number,
  }
}

export class ProposalFetchMsg extends jspb.Message {
  getBlockId(): Uint8Array | string;
  getBlockId_asU8(): Uint8Array;
  getBlockId_asB64(): string;
  setBlockId(value: Uint8Array | string): ProposalFetchMsg;

  getHeight(): number;
  setHeight(value: number): ProposalFetchMsg;

  getView(): number;
  setView(value: number): ProposalFetchMsg;

  getRequester(): Uint8Array | string;
  getRequester_asU8(): Uint8Array;
  getRequester_asB64(): string;
  setRequester(value: Uint8Array | string): ProposalFetchMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposalFetchMsg.AsObject;
  static toObject(includeInstance: boolean, msg: ProposalFetchMsg): ProposalFetchMsg.AsObject;
  static serializeBinaryToWriter(message: ProposalFetchMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposalFetchMsg;
  static deserializeBinaryFromReader(message: ProposalFetchMsg, reader: jspb.BinaryReader): ProposalFetchMsg;
}

export namespace ProposalFetchMsg {
  export type AsObject = {
    blockId: Uint8Array | string,
    height: number,
    view: number,
    requester: Uint8Array | string,
  }
}

export class ProposalRespMsg extends jspb.Message {
  getProposal(): ProposalData | undefined;
  setProposal(value?: ProposalData): ProposalRespMsg;
  hasProposal(): boolean;
  clearProposal(): ProposalRespMsg;

  getResponser(): Uint8Array | string;
  getResponser_asU8(): Uint8Array;
  getResponser_asB64(): string;
  setResponser(value: Uint8Array | string): ProposalRespMsg;

  getQc(): QuorumCert | undefined;
  setQc(value?: QuorumCert): ProposalRespMsg;
  hasQc(): boolean;
  clearQc(): ProposalRespMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposalRespMsg.AsObject;
  static toObject(includeInstance: boolean, msg: ProposalRespMsg): ProposalRespMsg.AsObject;
  static serializeBinaryToWriter(message: ProposalRespMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposalRespMsg;
  static deserializeBinaryFromReader(message: ProposalRespMsg, reader: jspb.BinaryReader): ProposalRespMsg;
}

export namespace ProposalRespMsg {
  export type AsObject = {
    proposal?: ProposalData.AsObject,
    responser: Uint8Array | string,
    qc?: QuorumCert.AsObject,
  }
}

export class BuildProposal extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): BuildProposal;

  getView(): number;
  setView(value: number): BuildProposal;

  getPreHash(): Uint8Array | string;
  getPreHash_asU8(): Uint8Array;
  getPreHash_asB64(): string;
  setPreHash(value: Uint8Array | string): BuildProposal;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BuildProposal.AsObject;
  static toObject(includeInstance: boolean, msg: BuildProposal): BuildProposal.AsObject;
  static serializeBinaryToWriter(message: BuildProposal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BuildProposal;
  static deserializeBinaryFromReader(message: BuildProposal, reader: jspb.BinaryReader): BuildProposal;
}

export namespace BuildProposal {
  export type AsObject = {
    height: number,
    view: number,
    preHash: Uint8Array | string,
  }
}

export class WalEntry extends jspb.Message {
  getMsg(): Uint8Array | string;
  getMsg_asU8(): Uint8Array;
  getMsg_asB64(): string;
  setMsg(value: Uint8Array | string): WalEntry;

  getMsgType(): MessageType;
  setMsgType(value: MessageType): WalEntry;

  getLastSnapshotIndex(): number;
  setLastSnapshotIndex(value: number): WalEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WalEntry.AsObject;
  static toObject(includeInstance: boolean, msg: WalEntry): WalEntry.AsObject;
  static serializeBinaryToWriter(message: WalEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WalEntry;
  static deserializeBinaryFromReader(message: WalEntry, reader: jspb.BinaryReader): WalEntry;
}

export namespace WalEntry {
  export type AsObject = {
    msg: Uint8Array | string,
    msgType: MessageType,
    lastSnapshotIndex: number,
  }
}

export class GovernanceContract extends jspb.Message {
  getEpochId(): number;
  setEpochId(value: number): GovernanceContract;

  getEndView(): number;
  setEndView(value: number): GovernanceContract;

  getValidatorsList(): Array<string>;
  setValidatorsList(value: Array<string>): GovernanceContract;
  clearValidatorsList(): GovernanceContract;
  addValidators(value: string, index?: number): GovernanceContract;

  getConfigSequence(): number;
  setConfigSequence(value: number): GovernanceContract;

  getChainConfig(): config_chain_config_pb.ChainConfig | undefined;
  setChainConfig(value?: config_chain_config_pb.ChainConfig): GovernanceContract;
  hasChainConfig(): boolean;
  clearChainConfig(): GovernanceContract;

  getCertFrozenList(): Uint8Array | string;
  getCertFrozenList_asU8(): Uint8Array;
  getCertFrozenList_asB64(): string;
  setCertFrozenList(value: Uint8Array | string): GovernanceContract;

  getCrl(): Uint8Array | string;
  getCrl_asU8(): Uint8Array;
  getCrl_asB64(): string;
  setCrl(value: Uint8Array | string): GovernanceContract;

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
    endView: number,
    validatorsList: Array<string>,
    configSequence: number,
    chainConfig?: config_chain_config_pb.ChainConfig.AsObject,
    certFrozenList: Uint8Array | string,
    crl: Uint8Array | string,
  }
}

export class NodeStatus extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): NodeStatus;

  getView(): number;
  setView(value: number): NodeStatus;

  getEpoch(): number;
  setEpoch(value: number): NodeStatus;

  getNodeId(): string;
  setNodeId(value: string): NodeStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeStatus.AsObject;
  static toObject(includeInstance: boolean, msg: NodeStatus): NodeStatus.AsObject;
  static serializeBinaryToWriter(message: NodeStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeStatus;
  static deserializeBinaryFromReader(message: NodeStatus, reader: jspb.BinaryReader): NodeStatus;
}

export namespace NodeStatus {
  export type AsObject = {
    height: number,
    view: number,
    epoch: number,
    nodeId: string,
  }
}

export class ProposeBlock extends jspb.Message {
  getIsPropose(): boolean;
  setIsPropose(value: boolean): ProposeBlock;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposeBlock.AsObject;
  static toObject(includeInstance: boolean, msg: ProposeBlock): ProposeBlock.AsObject;
  static serializeBinaryToWriter(message: ProposeBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposeBlock;
  static deserializeBinaryFromReader(message: ProposeBlock, reader: jspb.BinaryReader): ProposeBlock;
}

export namespace ProposeBlock {
  export type AsObject = {
    isPropose: boolean,
  }
}

export enum MessageType { 
  PROPOSAL_MESSAGE = 0,
  VOTE_MESSAGE = 1,
  PROPOSAL_FETCH_MESSAGE = 2,
  PROPOSAL_RESP_MESSAGE = 3,
  NEW_VIEW_MESSAGE = 4,
}
export enum ConsStateType { 
  VOTE_COLLECT = 0,
  PACEMAKER = 1,
}
