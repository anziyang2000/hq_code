import * as jspb from 'google-protobuf'



export class ChainInfo extends jspb.Message {
  getBlockHeight(): number;
  setBlockHeight(value: number): ChainInfo;

  getNodeListList(): Array<Node>;
  setNodeListList(value: Array<Node>): ChainInfo;
  clearNodeListList(): ChainInfo;
  addNodeList(value?: Node, index?: number): Node;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChainInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ChainInfo): ChainInfo.AsObject;
  static serializeBinaryToWriter(message: ChainInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChainInfo;
  static deserializeBinaryFromReader(message: ChainInfo, reader: jspb.BinaryReader): ChainInfo;
}

export namespace ChainInfo {
  export type AsObject = {
    blockHeight: number,
    nodeListList: Array<Node.AsObject>,
  }
}

export class Node extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): Node;

  getNodeAddress(): string;
  setNodeAddress(value: string): Node;

  getNodeTlsCert(): Uint8Array | string;
  getNodeTlsCert_asU8(): Uint8Array;
  getNodeTlsCert_asB64(): string;
  setNodeTlsCert(value: Uint8Array | string): Node;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    nodeId: string,
    nodeAddress: string,
    nodeTlsCert: Uint8Array | string,
  }
}

export class ChainList extends jspb.Message {
  getChainIdListList(): Array<string>;
  setChainIdListList(value: Array<string>): ChainList;
  clearChainIdListList(): ChainList;
  addChainIdList(value: string, index?: number): ChainList;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChainList.AsObject;
  static toObject(includeInstance: boolean, msg: ChainList): ChainList.AsObject;
  static serializeBinaryToWriter(message: ChainList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChainList;
  static deserializeBinaryFromReader(message: ChainList, reader: jspb.BinaryReader): ChainList;
}

export namespace ChainList {
  export type AsObject = {
    chainIdListList: Array<string>,
  }
}

