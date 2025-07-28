import * as jspb from 'google-protobuf'



export class SaveGateway extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SaveGateway.AsObject;
  static toObject(includeInstance: boolean, msg: SaveGateway): SaveGateway.AsObject;
  static serializeBinaryToWriter(message: SaveGateway, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SaveGateway;
  static deserializeBinaryFromReader(message: SaveGateway, reader: jspb.BinaryReader): SaveGateway;
}

export namespace SaveGateway {
  export type AsObject = {
  }

  export enum Parameter { 
    GATEWAY_INFO_BYTE = 0,
  }
}

export class UpdateGateway extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGateway.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGateway): UpdateGateway.AsObject;
  static serializeBinaryToWriter(message: UpdateGateway, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGateway;
  static deserializeBinaryFromReader(message: UpdateGateway, reader: jspb.BinaryReader): UpdateGateway;
}

export namespace UpdateGateway {
  export type AsObject = {
  }

  export enum Parameter { 
    GATEWAY_ID = 0,
    GATEWAY_INFO_BYTE = 1,
  }
}

export class GetGateway extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGateway.AsObject;
  static toObject(includeInstance: boolean, msg: GetGateway): GetGateway.AsObject;
  static serializeBinaryToWriter(message: GetGateway, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGateway;
  static deserializeBinaryFromReader(message: GetGateway, reader: jspb.BinaryReader): GetGateway;
}

export namespace GetGateway {
  export type AsObject = {
  }

  export enum Parameter { 
    GATEWAY_ID = 0,
  }
}

export class GetGatewayByRange extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGatewayByRange.AsObject;
  static toObject(includeInstance: boolean, msg: GetGatewayByRange): GetGatewayByRange.AsObject;
  static serializeBinaryToWriter(message: GetGatewayByRange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGatewayByRange;
  static deserializeBinaryFromReader(message: GetGatewayByRange, reader: jspb.BinaryReader): GetGatewayByRange;
}

export namespace GetGatewayByRange {
  export type AsObject = {
  }

  export enum Parameter { 
    START_GATEWAY_ID = 0,
    STOP_GATEWAY_ID = 1,
  }
}

export class SaveCrossChainInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SaveCrossChainInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SaveCrossChainInfo): SaveCrossChainInfo.AsObject;
  static serializeBinaryToWriter(message: SaveCrossChainInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SaveCrossChainInfo;
  static deserializeBinaryFromReader(message: SaveCrossChainInfo, reader: jspb.BinaryReader): SaveCrossChainInfo;
}

export namespace SaveCrossChainInfo {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_INFO_BYTE = 0,
  }
}

export class UpdateCrossChainTry extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCrossChainTry.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCrossChainTry): UpdateCrossChainTry.AsObject;
  static serializeBinaryToWriter(message: UpdateCrossChainTry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCrossChainTry;
  static deserializeBinaryFromReader(message: UpdateCrossChainTry, reader: jspb.BinaryReader): UpdateCrossChainTry;
}

export namespace UpdateCrossChainTry {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
    CROSS_CHAIN_TX_BYTE = 1,
  }
}

export class UpdateCrossChainResult extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCrossChainResult.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCrossChainResult): UpdateCrossChainResult.AsObject;
  static serializeBinaryToWriter(message: UpdateCrossChainResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCrossChainResult;
  static deserializeBinaryFromReader(message: UpdateCrossChainResult, reader: jspb.BinaryReader): UpdateCrossChainResult;
}

export namespace UpdateCrossChainResult {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
    CROSS_CHAIN_RESULT = 1,
  }
}

export class DeleteErrorCrossChainTxList extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteErrorCrossChainTxList.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteErrorCrossChainTxList): DeleteErrorCrossChainTxList.AsObject;
  static serializeBinaryToWriter(message: DeleteErrorCrossChainTxList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteErrorCrossChainTxList;
  static deserializeBinaryFromReader(message: DeleteErrorCrossChainTxList, reader: jspb.BinaryReader): DeleteErrorCrossChainTxList;
}

export namespace DeleteErrorCrossChainTxList {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
  }
}

export class UpdateCrossChainConfirm extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCrossChainConfirm.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCrossChainConfirm): UpdateCrossChainConfirm.AsObject;
  static serializeBinaryToWriter(message: UpdateCrossChainConfirm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCrossChainConfirm;
  static deserializeBinaryFromReader(message: UpdateCrossChainConfirm, reader: jspb.BinaryReader): UpdateCrossChainConfirm;
}

export namespace UpdateCrossChainConfirm {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
    CROSS_CHAIN_CONFIRM_BYTE = 1,
  }
}

export class UpdateSrcGatewayConfirm extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateSrcGatewayConfirm.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateSrcGatewayConfirm): UpdateSrcGatewayConfirm.AsObject;
  static serializeBinaryToWriter(message: UpdateSrcGatewayConfirm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateSrcGatewayConfirm;
  static deserializeBinaryFromReader(message: UpdateSrcGatewayConfirm, reader: jspb.BinaryReader): UpdateSrcGatewayConfirm;
}

export namespace UpdateSrcGatewayConfirm {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
    CONFIRM_RESULT = 1,
  }
}

export class GetCrossChainInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCrossChainInfo.AsObject;
  static toObject(includeInstance: boolean, msg: GetCrossChainInfo): GetCrossChainInfo.AsObject;
  static serializeBinaryToWriter(message: GetCrossChainInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCrossChainInfo;
  static deserializeBinaryFromReader(message: GetCrossChainInfo, reader: jspb.BinaryReader): GetCrossChainInfo;
}

export namespace GetCrossChainInfo {
  export type AsObject = {
  }

  export enum Parameter { 
    CROSS_CHAIN_ID = 0,
  }
}

export class GetCrossChainInfoByRange extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCrossChainInfoByRange.AsObject;
  static toObject(includeInstance: boolean, msg: GetCrossChainInfoByRange): GetCrossChainInfoByRange.AsObject;
  static serializeBinaryToWriter(message: GetCrossChainInfoByRange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCrossChainInfoByRange;
  static deserializeBinaryFromReader(message: GetCrossChainInfoByRange, reader: jspb.BinaryReader): GetCrossChainInfoByRange;
}

export namespace GetCrossChainInfoByRange {
  export type AsObject = {
  }

  export enum Parameter { 
    START_CROSS_CHAIN_ID = 0,
    STOP_CROSS_CHAIN_ID = 1,
  }
}

export class EventDataType extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventDataType.AsObject;
  static toObject(includeInstance: boolean, msg: EventDataType): EventDataType.AsObject;
  static serializeBinaryToWriter(message: EventDataType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventDataType;
  static deserializeBinaryFromReader(message: EventDataType, reader: jspb.BinaryReader): EventDataType;
}

export namespace EventDataType {
  export type AsObject = {
  }

  export enum Parameter { 
    STRING = 0,
    MAP = 1,
    BYTE = 2,
    BOOL = 3,
    INT = 4,
    FLOAT = 5,
    ARRAY = 6,
    HASH = 7,
    ADDRESS = 8,
  }
}

export class Code extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Code.AsObject;
  static toObject(includeInstance: boolean, msg: Code): Code.AsObject;
  static serializeBinaryToWriter(message: Code, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Code;
  static deserializeBinaryFromReader(message: Code, reader: jspb.BinaryReader): Code;
}

export namespace Code {
  export type AsObject = {
  }

  export enum Parameter { 
    GATEWAY_SUCCESS = 0,
    GATEWAY_TIMEOUT = 1,
    INVALID_PARAMETER = 2,
    TX_PROVE_ERROR = 3,
    CONTRACT_FAIL = 4,
    INTERNAL_ERROR = 5,
    RELAY_CHAIN_ERROR = 6,
  }
}

export class CrossType extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossType.AsObject;
  static toObject(includeInstance: boolean, msg: CrossType): CrossType.AsObject;
  static serializeBinaryToWriter(message: CrossType, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossType;
  static deserializeBinaryFromReader(message: CrossType, reader: jspb.BinaryReader): CrossType;
}

export namespace CrossType {
  export type AsObject = {
  }

  export enum Parameter { 
    QUERY = 0,
    INVOKE = 1,
  }
}

export class TxResultValue extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxResultValue.AsObject;
  static toObject(includeInstance: boolean, msg: TxResultValue): TxResultValue.AsObject;
  static serializeBinaryToWriter(message: TxResultValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxResultValue;
  static deserializeBinaryFromReader(message: TxResultValue, reader: jspb.BinaryReader): TxResultValue;
}

export namespace TxResultValue {
  export type AsObject = {
  }

  export enum Parameter { 
    TX_SUCCESS = 0,
    TX_TIMEOUT = 1,
    TX_FAIL = 2,
    TX_NOT_EXIST = 3,
    TX_NO_PERMISSIONS = 4,
    GATEWAY_NOT_FOUND = 5,
    GATEWAY_PINGPONG_ERROR = 6,
    CHAIN_PING_ERROR = 7,
    SRC_GATEWAY_GET_ERROR = 8,
  }
}

export class TxVerifyRsult extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxVerifyRsult.AsObject;
  static toObject(includeInstance: boolean, msg: TxVerifyRsult): TxVerifyRsult.AsObject;
  static serializeBinaryToWriter(message: TxVerifyRsult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxVerifyRsult;
  static deserializeBinaryFromReader(message: TxVerifyRsult, reader: jspb.BinaryReader): TxVerifyRsult;
}

export namespace TxVerifyRsult {
  export type AsObject = {
  }

  export enum Parameter { 
    VERIFY_SUCCESS = 0,
    VERIFY_INVALID = 1,
    VERIFY_NOT_NEED = 2,
  }
}

export class CrossChainStateValue extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainStateValue.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainStateValue): CrossChainStateValue.AsObject;
  static serializeBinaryToWriter(message: CrossChainStateValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainStateValue;
  static deserializeBinaryFromReader(message: CrossChainStateValue, reader: jspb.BinaryReader): CrossChainStateValue;
}

export namespace CrossChainStateValue {
  export type AsObject = {
  }

  export enum Parameter { 
    NEW = 0,
    WAIT_EXECUTE = 1,
    WAIT_CONFIRM = 2,
    CONFIRM_END = 3,
    CANCEL_END = 4,
  }
}

export class EventName extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventName.AsObject;
  static toObject(includeInstance: boolean, msg: EventName): EventName.AsObject;
  static serializeBinaryToWriter(message: EventName, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventName;
  static deserializeBinaryFromReader(message: EventName, reader: jspb.BinaryReader): EventName;
}

export namespace EventName {
  export type AsObject = {
  }

  export enum Parameter { 
    NEW_CROSS_CHAIN = 0,
    CROSS_CHAIN_TRY_END = 1,
    UPADATE_RESULT_END = 2,
    GATEWAY_CONFIRM_END = 3,
    SRC_GATEWAY_CONFIRM_END = 4,
  }
}

export class CrossChainInfo extends jspb.Message {
  getCrossChainId(): string;
  setCrossChainId(value: string): CrossChainInfo;

  getCrossChainName(): string;
  setCrossChainName(value: string): CrossChainInfo;

  getCrossChainFlag(): string;
  setCrossChainFlag(value: string): CrossChainInfo;

  getFrom(): string;
  setFrom(value: string): CrossChainInfo;

  getCrossChainMsgList(): Array<CrossChainMsg>;
  setCrossChainMsgList(value: Array<CrossChainMsg>): CrossChainInfo;
  clearCrossChainMsgList(): CrossChainInfo;
  addCrossChainMsg(value?: CrossChainMsg, index?: number): CrossChainMsg;

  getFirstTxContent(): TxContentWithVerify | undefined;
  setFirstTxContent(value?: TxContentWithVerify): CrossChainInfo;
  hasFirstTxContent(): boolean;
  clearFirstTxContent(): CrossChainInfo;

  getCrossChainTxContentList(): Array<TxContentWithVerify>;
  setCrossChainTxContentList(value: Array<TxContentWithVerify>): CrossChainInfo;
  clearCrossChainTxContentList(): CrossChainInfo;
  addCrossChainTxContent(value?: TxContentWithVerify, index?: number): TxContentWithVerify;

  getCrossChainResult(): boolean;
  setCrossChainResult(value: boolean): CrossChainInfo;

  getGatewayConfirmResultList(): Array<CrossChainConfirm>;
  setGatewayConfirmResultList(value: Array<CrossChainConfirm>): CrossChainInfo;
  clearGatewayConfirmResultList(): CrossChainInfo;
  addGatewayConfirmResult(value?: CrossChainConfirm, index?: number): CrossChainConfirm;

  getState(): CrossChainStateValue.Parameter;
  setState(value: CrossChainStateValue.Parameter): CrossChainInfo;

  getConfirmInfo(): ConfirmInfo | undefined;
  setConfirmInfo(value?: ConfirmInfo): CrossChainInfo;
  hasConfirmInfo(): boolean;
  clearConfirmInfo(): CrossChainInfo;

  getCancelInfo(): CancelInfo | undefined;
  setCancelInfo(value?: CancelInfo): CrossChainInfo;
  hasCancelInfo(): boolean;
  clearCancelInfo(): CrossChainInfo;

  getConfirmResult(): CrossChainConfirm | undefined;
  setConfirmResult(value?: CrossChainConfirm): CrossChainInfo;
  hasConfirmResult(): boolean;
  clearConfirmResult(): CrossChainInfo;

  getTimeout(): number;
  setTimeout(value: number): CrossChainInfo;

  getCrossType(): CrossType.Parameter;
  setCrossType(value: CrossType.Parameter): CrossChainInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainInfo): CrossChainInfo.AsObject;
  static serializeBinaryToWriter(message: CrossChainInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainInfo;
  static deserializeBinaryFromReader(message: CrossChainInfo, reader: jspb.BinaryReader): CrossChainInfo;
}

export namespace CrossChainInfo {
  export type AsObject = {
    crossChainId: string,
    crossChainName: string,
    crossChainFlag: string,
    from: string,
    crossChainMsgList: Array<CrossChainMsg.AsObject>,
    firstTxContent?: TxContentWithVerify.AsObject,
    crossChainTxContentList: Array<TxContentWithVerify.AsObject>,
    crossChainResult: boolean,
    gatewayConfirmResultList: Array<CrossChainConfirm.AsObject>,
    state: CrossChainStateValue.Parameter,
    confirmInfo?: ConfirmInfo.AsObject,
    cancelInfo?: CancelInfo.AsObject,
    confirmResult?: CrossChainConfirm.AsObject,
    timeout: number,
    crossType: CrossType.Parameter,
  }
}

export class CrossChainMsg extends jspb.Message {
  getGatewayId(): string;
  setGatewayId(value: string): CrossChainMsg;

  getChainRid(): string;
  setChainRid(value: string): CrossChainMsg;

  getContractName(): string;
  setContractName(value: string): CrossChainMsg;

  getMethod(): string;
  setMethod(value: string): CrossChainMsg;

  getIdentityList(): Array<string>;
  setIdentityList(value: Array<string>): CrossChainMsg;
  clearIdentityList(): CrossChainMsg;
  addIdentity(value: string, index?: number): CrossChainMsg;

  getParameter(): string;
  setParameter(value: string): CrossChainMsg;

  getParamDataList(): Array<number>;
  setParamDataList(value: Array<number>): CrossChainMsg;
  clearParamDataList(): CrossChainMsg;
  addParamData(value: number, index?: number): CrossChainMsg;

  getParamDataTypeList(): Array<EventDataType.Parameter>;
  setParamDataTypeList(value: Array<EventDataType.Parameter>): CrossChainMsg;
  clearParamDataTypeList(): CrossChainMsg;
  addParamDataType(value: EventDataType.Parameter, index?: number): CrossChainMsg;

  getExtraData(): string;
  setExtraData(value: string): CrossChainMsg;

  getConfirmInfo(): ConfirmInfo | undefined;
  setConfirmInfo(value?: ConfirmInfo): CrossChainMsg;
  hasConfirmInfo(): boolean;
  clearConfirmInfo(): CrossChainMsg;

  getCancelInfo(): CancelInfo | undefined;
  setCancelInfo(value?: CancelInfo): CrossChainMsg;
  hasCancelInfo(): boolean;
  clearCancelInfo(): CrossChainMsg;

  getAbi(): string;
  setAbi(value: string): CrossChainMsg;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainMsg.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainMsg): CrossChainMsg.AsObject;
  static serializeBinaryToWriter(message: CrossChainMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainMsg;
  static deserializeBinaryFromReader(message: CrossChainMsg, reader: jspb.BinaryReader): CrossChainMsg;
}

export namespace CrossChainMsg {
  export type AsObject = {
    gatewayId: string,
    chainRid: string,
    contractName: string,
    method: string,
    identityList: Array<string>,
    parameter: string,
    paramDataList: Array<number>,
    paramDataTypeList: Array<EventDataType.Parameter>,
    extraData: string,
    confirmInfo?: ConfirmInfo.AsObject,
    cancelInfo?: CancelInfo.AsObject,
    abi: string,
  }
}

export class TxContentWithVerify extends jspb.Message {
  getTxContent(): TxContent | undefined;
  setTxContent(value?: TxContent): TxContentWithVerify;
  hasTxContent(): boolean;
  clearTxContent(): TxContentWithVerify;

  getTryResultList(): Array<string>;
  setTryResultList(value: Array<string>): TxContentWithVerify;
  clearTryResultList(): TxContentWithVerify;
  addTryResult(value: string, index?: number): TxContentWithVerify;

  getTxVerifyResult(): TxVerifyRsult.Parameter;
  setTxVerifyResult(value: TxVerifyRsult.Parameter): TxContentWithVerify;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxContentWithVerify.AsObject;
  static toObject(includeInstance: boolean, msg: TxContentWithVerify): TxContentWithVerify.AsObject;
  static serializeBinaryToWriter(message: TxContentWithVerify, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxContentWithVerify;
  static deserializeBinaryFromReader(message: TxContentWithVerify, reader: jspb.BinaryReader): TxContentWithVerify;
}

export namespace TxContentWithVerify {
  export type AsObject = {
    txContent?: TxContent.AsObject,
    tryResultList: Array<string>,
    txVerifyResult: TxVerifyRsult.Parameter,
  }
}

export class ConfirmInfo extends jspb.Message {
  getChainRid(): string;
  setChainRid(value: string): ConfirmInfo;

  getContractName(): string;
  setContractName(value: string): ConfirmInfo;

  getMethod(): string;
  setMethod(value: string): ConfirmInfo;

  getParameter(): string;
  setParameter(value: string): ConfirmInfo;

  getParamDataList(): Array<number>;
  setParamDataList(value: Array<number>): ConfirmInfo;
  clearParamDataList(): ConfirmInfo;
  addParamData(value: number, index?: number): ConfirmInfo;

  getParamDataTypeList(): Array<EventDataType.Parameter>;
  setParamDataTypeList(value: Array<EventDataType.Parameter>): ConfirmInfo;
  clearParamDataTypeList(): ConfirmInfo;
  addParamDataType(value: EventDataType.Parameter, index?: number): ConfirmInfo;

  getExtraData(): string;
  setExtraData(value: string): ConfirmInfo;

  getAbi(): string;
  setAbi(value: string): ConfirmInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmInfo): ConfirmInfo.AsObject;
  static serializeBinaryToWriter(message: ConfirmInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmInfo;
  static deserializeBinaryFromReader(message: ConfirmInfo, reader: jspb.BinaryReader): ConfirmInfo;
}

export namespace ConfirmInfo {
  export type AsObject = {
    chainRid: string,
    contractName: string,
    method: string,
    parameter: string,
    paramDataList: Array<number>,
    paramDataTypeList: Array<EventDataType.Parameter>,
    extraData: string,
    abi: string,
  }
}

export class CrossChainConfirm extends jspb.Message {
  getCode(): Code.Parameter;
  setCode(value: Code.Parameter): CrossChainConfirm;

  getMessage(): string;
  setMessage(value: string): CrossChainConfirm;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainConfirm.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainConfirm): CrossChainConfirm.AsObject;
  static serializeBinaryToWriter(message: CrossChainConfirm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainConfirm;
  static deserializeBinaryFromReader(message: CrossChainConfirm, reader: jspb.BinaryReader): CrossChainConfirm;
}

export namespace CrossChainConfirm {
  export type AsObject = {
    code: Code.Parameter,
    message: string,
  }
}

export class TxContent extends jspb.Message {
  getTxId(): string;
  setTxId(value: string): TxContent;

  getTx(): Uint8Array | string;
  getTx_asU8(): Uint8Array;
  getTx_asB64(): string;
  setTx(value: Uint8Array | string): TxContent;

  getTxResult(): TxResultValue.Parameter;
  setTxResult(value: TxResultValue.Parameter): TxContent;

  getGatewayId(): string;
  setGatewayId(value: string): TxContent;

  getChainRid(): string;
  setChainRid(value: string): TxContent;

  getTxProve(): string;
  setTxProve(value: string): TxContent;

  getBlockHeight(): number;
  setBlockHeight(value: number): TxContent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxContent.AsObject;
  static toObject(includeInstance: boolean, msg: TxContent): TxContent.AsObject;
  static serializeBinaryToWriter(message: TxContent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxContent;
  static deserializeBinaryFromReader(message: TxContent, reader: jspb.BinaryReader): TxContent;
}

export namespace TxContent {
  export type AsObject = {
    txId: string,
    tx: Uint8Array | string,
    txResult: TxResultValue.Parameter,
    gatewayId: string,
    chainRid: string,
    txProve: string,
    blockHeight: number,
  }
}

export class CancelInfo extends jspb.Message {
  getChainRid(): string;
  setChainRid(value: string): CancelInfo;

  getContractName(): string;
  setContractName(value: string): CancelInfo;

  getMethod(): string;
  setMethod(value: string): CancelInfo;

  getParameter(): string;
  setParameter(value: string): CancelInfo;

  getParamDataList(): Array<number>;
  setParamDataList(value: Array<number>): CancelInfo;
  clearParamDataList(): CancelInfo;
  addParamData(value: number, index?: number): CancelInfo;

  getParamDataTypeList(): Array<EventDataType.Parameter>;
  setParamDataTypeList(value: Array<EventDataType.Parameter>): CancelInfo;
  clearParamDataTypeList(): CancelInfo;
  addParamDataType(value: EventDataType.Parameter, index?: number): CancelInfo;

  getExtraData(): string;
  setExtraData(value: string): CancelInfo;

  getAbi(): string;
  setAbi(value: string): CancelInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CancelInfo): CancelInfo.AsObject;
  static serializeBinaryToWriter(message: CancelInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelInfo;
  static deserializeBinaryFromReader(message: CancelInfo, reader: jspb.BinaryReader): CancelInfo;
}

export namespace CancelInfo {
  export type AsObject = {
    chainRid: string,
    contractName: string,
    method: string,
    parameter: string,
    paramDataList: Array<number>,
    paramDataTypeList: Array<EventDataType.Parameter>,
    extraData: string,
    abi: string,
  }
}

export class CrossChainTxUpChain extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): CrossChainTxUpChain;

  getTxContentWithVerify(): TxContentWithVerify | undefined;
  setTxContentWithVerify(value?: TxContentWithVerify): CrossChainTxUpChain;
  hasTxContentWithVerify(): boolean;
  clearTxContentWithVerify(): CrossChainTxUpChain;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainTxUpChain.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainTxUpChain): CrossChainTxUpChain.AsObject;
  static serializeBinaryToWriter(message: CrossChainTxUpChain, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainTxUpChain;
  static deserializeBinaryFromReader(message: CrossChainTxUpChain, reader: jspb.BinaryReader): CrossChainTxUpChain;
}

export namespace CrossChainTxUpChain {
  export type AsObject = {
    index: number,
    txContentWithVerify?: TxContentWithVerify.AsObject,
  }
}

export class CrossChainConfirmUpChain extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): CrossChainConfirmUpChain;

  getCrossChainConfirm(): CrossChainConfirm | undefined;
  setCrossChainConfirm(value?: CrossChainConfirm): CrossChainConfirmUpChain;
  hasCrossChainConfirm(): boolean;
  clearCrossChainConfirm(): CrossChainConfirmUpChain;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossChainConfirmUpChain.AsObject;
  static toObject(includeInstance: boolean, msg: CrossChainConfirmUpChain): CrossChainConfirmUpChain.AsObject;
  static serializeBinaryToWriter(message: CrossChainConfirmUpChain, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossChainConfirmUpChain;
  static deserializeBinaryFromReader(message: CrossChainConfirmUpChain, reader: jspb.BinaryReader): CrossChainConfirmUpChain;
}

export namespace CrossChainConfirmUpChain {
  export type AsObject = {
    index: number,
    crossChainConfirm?: CrossChainConfirm.AsObject,
  }
}

export enum RelayCrossFunction { 
  SAVE_GATEWAY = 0,
  UPDATE_GATEWAY = 1,
  SAVE_CROSS_CHAIN_INFO = 2,
  GET_ERROR_CROSS_CHAIN_TX_LIST = 3,
  DELETE_ERROR_CROSS_CHAIN_TX_LIST = 4,
  UPDATE_CROSS_CHAIN_TRY = 5,
  UPDATE_CROSS_CHAIN_RESULT = 6,
  UPDATE_CROSS_CHAIN_CONFIRM = 7,
  UPDATE_SRC_GATEWAY_CONFIRM = 8,
  GET_GATEWAY_NUM = 9,
  GET_GATEWAY = 10,
  GET_GATEWAY_BY_RANGE = 11,
  GET_CROSS_CHAIN_NUM = 12,
  GET_CROSS_CHAIN_INFO = 13,
  GET_CROSS_CHAIN_INFO_BY_RANGE = 14,
  GET_NOT_END_CROSS_CHIAN_ID_LIST = 15,
}
