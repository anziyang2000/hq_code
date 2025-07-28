import * as jspb from 'google-protobuf'



export class Policy extends jspb.Message {
  getRule(): string;
  setRule(value: string): Policy;

  getOrgListList(): Array<string>;
  setOrgListList(value: Array<string>): Policy;
  clearOrgListList(): Policy;
  addOrgList(value: string, index?: number): Policy;

  getRoleListList(): Array<string>;
  setRoleListList(value: Array<string>): Policy;
  clearRoleListList(): Policy;
  addRoleList(value: string, index?: number): Policy;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Policy.AsObject;
  static toObject(includeInstance: boolean, msg: Policy): Policy.AsObject;
  static serializeBinaryToWriter(message: Policy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Policy;
  static deserializeBinaryFromReader(message: Policy, reader: jspb.BinaryReader): Policy;
}

export namespace Policy {
  export type AsObject = {
    rule: string,
    orgListList: Array<string>,
    roleListList: Array<string>,
  }
}

