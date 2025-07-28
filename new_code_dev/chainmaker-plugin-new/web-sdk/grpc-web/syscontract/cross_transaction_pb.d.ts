import * as jspb from 'google-protobuf'



export class CrossState extends jspb.Message {
  getState(): CrossTxState;
  setState(value: CrossTxState): CrossState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CrossState.AsObject;
  static toObject(includeInstance: boolean, msg: CrossState): CrossState.AsObject;
  static serializeBinaryToWriter(message: CrossState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CrossState;
  static deserializeBinaryFromReader(message: CrossState, reader: jspb.BinaryReader): CrossState;
}

export namespace CrossState {
  export type AsObject = {
    state: CrossTxState,
  }
}

export enum CrossTransactionFunction { 
  EXECUTE = 0,
  COMMIT = 1,
  ROLLBACK = 2,
  READ_STATE = 3,
  SAVE_PROOF = 4,
  READ_PROOF = 5,
  ARBITRATE = 6,
}
export enum CrossTxState { 
  NON_EXIST = 0,
  INIT = 1,
  EXECUTE_OK = 2,
  EXECUTE_FAIL = 3,
  COMMIT_OK = 4,
  COMMIT_FAIL = 5,
  ROLLBACK_OK = 6,
  ROLLBACK_FAIL = 7,
}
export enum CrossArbitrateCmd { 
  AUTO_CMD = 0,
  EXECUTE_CMD = 1,
  COMMIT_CMD = 2,
  ROLLBACK_CMD = 3,
}
export enum CallType { 
  DIRECT = 0,
  CROSS = 1,
}
export enum CrossParams { 
  CREATOR = 0,
  SENDER = 1,
  CALL_TYPE = 2,
}
