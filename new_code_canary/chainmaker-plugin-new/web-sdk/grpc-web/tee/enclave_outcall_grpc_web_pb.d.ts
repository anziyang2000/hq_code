import * as grpcWeb from 'grpc-web';

import * as common_result_pb from '../common/result_pb';
import * as tee_enclave_outcall_pb from '../tee/enclave_outcall_pb';


export class EnclaveOutCallServerClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  outCallGet(
    request: tee_enclave_outcall_pb.OutCallGetRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: common_result_pb.ContractResult) => void
  ): grpcWeb.ClientReadableStream<common_result_pb.ContractResult>;

  outCallPut(
    request: tee_enclave_outcall_pb.OutCallPutRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: common_result_pb.ContractResult) => void
  ): grpcWeb.ClientReadableStream<common_result_pb.ContractResult>;

}

export class EnclaveOutCallServerPromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  outCallGet(
    request: tee_enclave_outcall_pb.OutCallGetRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<common_result_pb.ContractResult>;

  outCallPut(
    request: tee_enclave_outcall_pb.OutCallPutRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<common_result_pb.ContractResult>;

}

