import * as jspb from 'google-protobuf'

import * as consensus_consensus_pb from '../consensus/consensus_pb';
import * as accesscontrol_policy_pb from '../accesscontrol/policy_pb';


export class ConfigKeyValue extends jspb.Message {
  getKey(): string;
  setKey(value: string): ConfigKeyValue;

  getValue(): string;
  setValue(value: string): ConfigKeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfigKeyValue.AsObject;
  static toObject(includeInstance: boolean, msg: ConfigKeyValue): ConfigKeyValue.AsObject;
  static serializeBinaryToWriter(message: ConfigKeyValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfigKeyValue;
  static deserializeBinaryFromReader(message: ConfigKeyValue, reader: jspb.BinaryReader): ConfigKeyValue;
}

export namespace ConfigKeyValue {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class ChainConfig extends jspb.Message {
  getChainId(): string;
  setChainId(value: string): ChainConfig;

  getVersion(): string;
  setVersion(value: string): ChainConfig;

  getAuthType(): string;
  setAuthType(value: string): ChainConfig;

  getSequence(): number;
  setSequence(value: number): ChainConfig;

  getCrypto(): CryptoConfig | undefined;
  setCrypto(value?: CryptoConfig): ChainConfig;
  hasCrypto(): boolean;
  clearCrypto(): ChainConfig;

  getBlock(): BlockConfig | undefined;
  setBlock(value?: BlockConfig): ChainConfig;
  hasBlock(): boolean;
  clearBlock(): ChainConfig;

  getCore(): CoreConfig | undefined;
  setCore(value?: CoreConfig): ChainConfig;
  hasCore(): boolean;
  clearCore(): ChainConfig;

  getConsensus(): ConsensusConfig | undefined;
  setConsensus(value?: ConsensusConfig): ChainConfig;
  hasConsensus(): boolean;
  clearConsensus(): ChainConfig;

  getTrustRootsList(): Array<TrustRootConfig>;
  setTrustRootsList(value: Array<TrustRootConfig>): ChainConfig;
  clearTrustRootsList(): ChainConfig;
  addTrustRoots(value?: TrustRootConfig, index?: number): TrustRootConfig;

  getTrustMembersList(): Array<TrustMemberConfig>;
  setTrustMembersList(value: Array<TrustMemberConfig>): ChainConfig;
  clearTrustMembersList(): ChainConfig;
  addTrustMembers(value?: TrustMemberConfig, index?: number): TrustMemberConfig;

  getResourcePoliciesList(): Array<ResourcePolicy>;
  setResourcePoliciesList(value: Array<ResourcePolicy>): ChainConfig;
  clearResourcePoliciesList(): ChainConfig;
  addResourcePolicies(value?: ResourcePolicy, index?: number): ResourcePolicy;

  getContract(): ContractConfig | undefined;
  setContract(value?: ContractConfig): ChainConfig;
  hasContract(): boolean;
  clearContract(): ChainConfig;

  getSnapshot(): SnapshotConfig | undefined;
  setSnapshot(value?: SnapshotConfig): ChainConfig;
  hasSnapshot(): boolean;
  clearSnapshot(): ChainConfig;

  getScheduler(): SchedulerConfig | undefined;
  setScheduler(value?: SchedulerConfig): ChainConfig;
  hasScheduler(): boolean;
  clearScheduler(): ChainConfig;

  getContext(): ContextConfig | undefined;
  setContext(value?: ContextConfig): ChainConfig;
  hasContext(): boolean;
  clearContext(): ChainConfig;

  getDisabledNativeContractList(): Array<string>;
  setDisabledNativeContractList(value: Array<string>): ChainConfig;
  clearDisabledNativeContractList(): ChainConfig;
  addDisabledNativeContract(value: string, index?: number): ChainConfig;

  getAccountConfig(): GasAccountConfig | undefined;
  setAccountConfig(value?: GasAccountConfig): ChainConfig;
  hasAccountConfig(): boolean;
  clearAccountConfig(): ChainConfig;

  getVm(): Vm | undefined;
  setVm(value?: Vm): ChainConfig;
  hasVm(): boolean;
  clearVm(): ChainConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChainConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ChainConfig): ChainConfig.AsObject;
  static serializeBinaryToWriter(message: ChainConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChainConfig;
  static deserializeBinaryFromReader(message: ChainConfig, reader: jspb.BinaryReader): ChainConfig;
}

export namespace ChainConfig {
  export type AsObject = {
    chainId: string,
    version: string,
    authType: string,
    sequence: number,
    crypto?: CryptoConfig.AsObject,
    block?: BlockConfig.AsObject,
    core?: CoreConfig.AsObject,
    consensus?: ConsensusConfig.AsObject,
    trustRootsList: Array<TrustRootConfig.AsObject>,
    trustMembersList: Array<TrustMemberConfig.AsObject>,
    resourcePoliciesList: Array<ResourcePolicy.AsObject>,
    contract?: ContractConfig.AsObject,
    snapshot?: SnapshotConfig.AsObject,
    scheduler?: SchedulerConfig.AsObject,
    context?: ContextConfig.AsObject,
    disabledNativeContractList: Array<string>,
    accountConfig?: GasAccountConfig.AsObject,
    vm?: Vm.AsObject,
  }
}

export class ResourcePolicy extends jspb.Message {
  getResourceName(): string;
  setResourceName(value: string): ResourcePolicy;

  getPolicy(): accesscontrol_policy_pb.Policy | undefined;
  setPolicy(value?: accesscontrol_policy_pb.Policy): ResourcePolicy;
  hasPolicy(): boolean;
  clearPolicy(): ResourcePolicy;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourcePolicy.AsObject;
  static toObject(includeInstance: boolean, msg: ResourcePolicy): ResourcePolicy.AsObject;
  static serializeBinaryToWriter(message: ResourcePolicy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourcePolicy;
  static deserializeBinaryFromReader(message: ResourcePolicy, reader: jspb.BinaryReader): ResourcePolicy;
}

export namespace ResourcePolicy {
  export type AsObject = {
    resourceName: string,
    policy?: accesscontrol_policy_pb.Policy.AsObject,
  }
}

export class CryptoConfig extends jspb.Message {
  getHash(): string;
  setHash(value: string): CryptoConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CryptoConfig.AsObject;
  static toObject(includeInstance: boolean, msg: CryptoConfig): CryptoConfig.AsObject;
  static serializeBinaryToWriter(message: CryptoConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CryptoConfig;
  static deserializeBinaryFromReader(message: CryptoConfig, reader: jspb.BinaryReader): CryptoConfig;
}

export namespace CryptoConfig {
  export type AsObject = {
    hash: string,
  }
}

export class BlockConfig extends jspb.Message {
  getTxTimestampVerify(): boolean;
  setTxTimestampVerify(value: boolean): BlockConfig;

  getTxTimeout(): number;
  setTxTimeout(value: number): BlockConfig;

  getBlockTxCapacity(): number;
  setBlockTxCapacity(value: number): BlockConfig;

  getBlockSize(): number;
  setBlockSize(value: number): BlockConfig;

  getBlockInterval(): number;
  setBlockInterval(value: number): BlockConfig;

  getTxParameterSize(): number;
  setTxParameterSize(value: number): BlockConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockConfig.AsObject;
  static toObject(includeInstance: boolean, msg: BlockConfig): BlockConfig.AsObject;
  static serializeBinaryToWriter(message: BlockConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockConfig;
  static deserializeBinaryFromReader(message: BlockConfig, reader: jspb.BinaryReader): BlockConfig;
}

export namespace BlockConfig {
  export type AsObject = {
    txTimestampVerify: boolean,
    txTimeout: number,
    blockTxCapacity: number,
    blockSize: number,
    blockInterval: number,
    txParameterSize: number,
  }
}

export class SchedulerConfig extends jspb.Message {
  getEnableEvidence(): boolean;
  setEnableEvidence(value: boolean): SchedulerConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SchedulerConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SchedulerConfig): SchedulerConfig.AsObject;
  static serializeBinaryToWriter(message: SchedulerConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SchedulerConfig;
  static deserializeBinaryFromReader(message: SchedulerConfig, reader: jspb.BinaryReader): SchedulerConfig;
}

export namespace SchedulerConfig {
  export type AsObject = {
    enableEvidence: boolean,
  }
}

export class GasAccountConfig extends jspb.Message {
  getGasAdminAddress(): string;
  setGasAdminAddress(value: string): GasAccountConfig;

  getGasCount(): number;
  setGasCount(value: number): GasAccountConfig;

  getEnableGas(): boolean;
  setEnableGas(value: boolean): GasAccountConfig;

  getDefaultGas(): number;
  setDefaultGas(value: number): GasAccountConfig;

  getDefaultGasPrice(): number;
  setDefaultGasPrice(value: number): GasAccountConfig;

  getInstallBaseGas(): number;
  setInstallBaseGas(value: number): GasAccountConfig;

  getInstallGasPrice(): number;
  setInstallGasPrice(value: number): GasAccountConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GasAccountConfig.AsObject;
  static toObject(includeInstance: boolean, msg: GasAccountConfig): GasAccountConfig.AsObject;
  static serializeBinaryToWriter(message: GasAccountConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GasAccountConfig;
  static deserializeBinaryFromReader(message: GasAccountConfig, reader: jspb.BinaryReader): GasAccountConfig;
}

export namespace GasAccountConfig {
  export type AsObject = {
    gasAdminAddress: string,
    gasCount: number,
    enableGas: boolean,
    defaultGas: number,
    defaultGasPrice: number,
    installBaseGas: number,
    installGasPrice: number,
  }
}

export class SnapshotConfig extends jspb.Message {
  getEnableEvidence(): boolean;
  setEnableEvidence(value: boolean): SnapshotConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SnapshotConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SnapshotConfig): SnapshotConfig.AsObject;
  static serializeBinaryToWriter(message: SnapshotConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SnapshotConfig;
  static deserializeBinaryFromReader(message: SnapshotConfig, reader: jspb.BinaryReader): SnapshotConfig;
}

export namespace SnapshotConfig {
  export type AsObject = {
    enableEvidence: boolean,
  }
}

export class ContextConfig extends jspb.Message {
  getEnableEvidence(): boolean;
  setEnableEvidence(value: boolean): ContextConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContextConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ContextConfig): ContextConfig.AsObject;
  static serializeBinaryToWriter(message: ContextConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContextConfig;
  static deserializeBinaryFromReader(message: ContextConfig, reader: jspb.BinaryReader): ContextConfig;
}

export namespace ContextConfig {
  export type AsObject = {
    enableEvidence: boolean,
  }
}

export class ConsensusTurboConfig extends jspb.Message {
  getConsensusMessageTurbo(): boolean;
  setConsensusMessageTurbo(value: boolean): ConsensusTurboConfig;

  getRetryTime(): number;
  setRetryTime(value: number): ConsensusTurboConfig;

  getRetryInterval(): number;
  setRetryInterval(value: number): ConsensusTurboConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsensusTurboConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ConsensusTurboConfig): ConsensusTurboConfig.AsObject;
  static serializeBinaryToWriter(message: ConsensusTurboConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsensusTurboConfig;
  static deserializeBinaryFromReader(message: ConsensusTurboConfig, reader: jspb.BinaryReader): ConsensusTurboConfig;
}

export namespace ConsensusTurboConfig {
  export type AsObject = {
    consensusMessageTurbo: boolean,
    retryTime: number,
    retryInterval: number,
  }
}

export class CoreConfig extends jspb.Message {
  getTxSchedulerTimeout(): number;
  setTxSchedulerTimeout(value: number): CoreConfig;

  getTxSchedulerValidateTimeout(): number;
  setTxSchedulerValidateTimeout(value: number): CoreConfig;

  getConsensusTurboConfig(): ConsensusTurboConfig | undefined;
  setConsensusTurboConfig(value?: ConsensusTurboConfig): CoreConfig;
  hasConsensusTurboConfig(): boolean;
  clearConsensusTurboConfig(): CoreConfig;

  getEnableSenderGroup(): boolean;
  setEnableSenderGroup(value: boolean): CoreConfig;

  getEnableConflictsBitWindow(): boolean;
  setEnableConflictsBitWindow(value: boolean): CoreConfig;

  getEnableOptimizeChargeGas(): boolean;
  setEnableOptimizeChargeGas(value: boolean): CoreConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoreConfig.AsObject;
  static toObject(includeInstance: boolean, msg: CoreConfig): CoreConfig.AsObject;
  static serializeBinaryToWriter(message: CoreConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoreConfig;
  static deserializeBinaryFromReader(message: CoreConfig, reader: jspb.BinaryReader): CoreConfig;
}

export namespace CoreConfig {
  export type AsObject = {
    txSchedulerTimeout: number,
    txSchedulerValidateTimeout: number,
    consensusTurboConfig?: ConsensusTurboConfig.AsObject,
    enableSenderGroup: boolean,
    enableConflictsBitWindow: boolean,
    enableOptimizeChargeGas: boolean,
  }
}

export class ConsensusConfig extends jspb.Message {
  getType(): consensus_consensus_pb.ConsensusType;
  setType(value: consensus_consensus_pb.ConsensusType): ConsensusConfig;

  getNodesList(): Array<OrgConfig>;
  setNodesList(value: Array<OrgConfig>): ConsensusConfig;
  clearNodesList(): ConsensusConfig;
  addNodes(value?: OrgConfig, index?: number): OrgConfig;

  getExtConfigList(): Array<ConfigKeyValue>;
  setExtConfigList(value: Array<ConfigKeyValue>): ConsensusConfig;
  clearExtConfigList(): ConsensusConfig;
  addExtConfig(value?: ConfigKeyValue, index?: number): ConfigKeyValue;

  getDposConfigList(): Array<ConfigKeyValue>;
  setDposConfigList(value: Array<ConfigKeyValue>): ConsensusConfig;
  clearDposConfigList(): ConsensusConfig;
  addDposConfig(value?: ConfigKeyValue, index?: number): ConfigKeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsensusConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ConsensusConfig): ConsensusConfig.AsObject;
  static serializeBinaryToWriter(message: ConsensusConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsensusConfig;
  static deserializeBinaryFromReader(message: ConsensusConfig, reader: jspb.BinaryReader): ConsensusConfig;
}

export namespace ConsensusConfig {
  export type AsObject = {
    type: consensus_consensus_pb.ConsensusType,
    nodesList: Array<OrgConfig.AsObject>,
    extConfigList: Array<ConfigKeyValue.AsObject>,
    dposConfigList: Array<ConfigKeyValue.AsObject>,
  }
}

export class OrgConfig extends jspb.Message {
  getOrgId(): string;
  setOrgId(value: string): OrgConfig;

  getAddressList(): Array<string>;
  setAddressList(value: Array<string>): OrgConfig;
  clearAddressList(): OrgConfig;
  addAddress(value: string, index?: number): OrgConfig;

  getNodeIdList(): Array<string>;
  setNodeIdList(value: Array<string>): OrgConfig;
  clearNodeIdList(): OrgConfig;
  addNodeId(value: string, index?: number): OrgConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrgConfig.AsObject;
  static toObject(includeInstance: boolean, msg: OrgConfig): OrgConfig.AsObject;
  static serializeBinaryToWriter(message: OrgConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrgConfig;
  static deserializeBinaryFromReader(message: OrgConfig, reader: jspb.BinaryReader): OrgConfig;
}

export namespace OrgConfig {
  export type AsObject = {
    orgId: string,
    addressList: Array<string>,
    nodeIdList: Array<string>,
  }
}

export class TrustRootConfig extends jspb.Message {
  getOrgId(): string;
  setOrgId(value: string): TrustRootConfig;

  getRootList(): Array<string>;
  setRootList(value: Array<string>): TrustRootConfig;
  clearRootList(): TrustRootConfig;
  addRoot(value: string, index?: number): TrustRootConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrustRootConfig.AsObject;
  static toObject(includeInstance: boolean, msg: TrustRootConfig): TrustRootConfig.AsObject;
  static serializeBinaryToWriter(message: TrustRootConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrustRootConfig;
  static deserializeBinaryFromReader(message: TrustRootConfig, reader: jspb.BinaryReader): TrustRootConfig;
}

export namespace TrustRootConfig {
  export type AsObject = {
    orgId: string,
    rootList: Array<string>,
  }
}

export class ContractConfig extends jspb.Message {
  getEnableSqlSupport(): boolean;
  setEnableSqlSupport(value: boolean): ContractConfig;

  getDisabledNativeContractList(): Array<string>;
  setDisabledNativeContractList(value: Array<string>): ContractConfig;
  clearDisabledNativeContractList(): ContractConfig;
  addDisabledNativeContract(value: string, index?: number): ContractConfig;

  getOnlyCreatorCanUpgrade(): boolean;
  setOnlyCreatorCanUpgrade(value: boolean): ContractConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractConfig.AsObject;
  static toObject(includeInstance: boolean, msg: ContractConfig): ContractConfig.AsObject;
  static serializeBinaryToWriter(message: ContractConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractConfig;
  static deserializeBinaryFromReader(message: ContractConfig, reader: jspb.BinaryReader): ContractConfig;
}

export namespace ContractConfig {
  export type AsObject = {
    enableSqlSupport: boolean,
    disabledNativeContractList: Array<string>,
    onlyCreatorCanUpgrade: boolean,
  }
}

export class TrustMemberConfig extends jspb.Message {
  getMemberInfo(): string;
  setMemberInfo(value: string): TrustMemberConfig;

  getOrgId(): string;
  setOrgId(value: string): TrustMemberConfig;

  getRole(): string;
  setRole(value: string): TrustMemberConfig;

  getNodeId(): string;
  setNodeId(value: string): TrustMemberConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrustMemberConfig.AsObject;
  static toObject(includeInstance: boolean, msg: TrustMemberConfig): TrustMemberConfig.AsObject;
  static serializeBinaryToWriter(message: TrustMemberConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrustMemberConfig;
  static deserializeBinaryFromReader(message: TrustMemberConfig, reader: jspb.BinaryReader): TrustMemberConfig;
}

export namespace TrustMemberConfig {
  export type AsObject = {
    memberInfo: string,
    orgId: string,
    role: string,
    nodeId: string,
  }
}

export class Vm extends jspb.Message {
  getSupportListList(): Array<string>;
  setSupportListList(value: Array<string>): Vm;
  clearSupportListList(): Vm;
  addSupportList(value: string, index?: number): Vm;

  getAddrType(): AddrType;
  setAddrType(value: AddrType): Vm;

  getNative(): VmNative | undefined;
  setNative(value?: VmNative): Vm;
  hasNative(): boolean;
  clearNative(): Vm;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vm.AsObject;
  static toObject(includeInstance: boolean, msg: Vm): Vm.AsObject;
  static serializeBinaryToWriter(message: Vm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vm;
  static deserializeBinaryFromReader(message: Vm, reader: jspb.BinaryReader): Vm;
}

export namespace Vm {
  export type AsObject = {
    supportListList: Array<string>,
    addrType: AddrType,
    pb_native?: VmNative.AsObject,
  }
}

export class VmNative extends jspb.Message {
  getMultisign(): MultiSign | undefined;
  setMultisign(value?: MultiSign): VmNative;
  hasMultisign(): boolean;
  clearMultisign(): VmNative;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VmNative.AsObject;
  static toObject(includeInstance: boolean, msg: VmNative): VmNative.AsObject;
  static serializeBinaryToWriter(message: VmNative, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VmNative;
  static deserializeBinaryFromReader(message: VmNative, reader: jspb.BinaryReader): VmNative;
}

export namespace VmNative {
  export type AsObject = {
    multisign?: MultiSign.AsObject,
  }
}

export class MultiSign extends jspb.Message {
  getEnableManualRun(): boolean;
  setEnableManualRun(value: boolean): MultiSign;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiSign.AsObject;
  static toObject(includeInstance: boolean, msg: MultiSign): MultiSign.AsObject;
  static serializeBinaryToWriter(message: MultiSign, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiSign;
  static deserializeBinaryFromReader(message: MultiSign, reader: jspb.BinaryReader): MultiSign;
}

export namespace MultiSign {
  export type AsObject = {
    enableManualRun: boolean,
  }
}

export enum AddrType { 
  CHAINMAKER = 0,
  ZXL = 1,
  ETHEREUM = 2,
}
