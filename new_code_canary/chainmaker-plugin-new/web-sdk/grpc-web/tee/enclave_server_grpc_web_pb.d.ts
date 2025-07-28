import * as grpcWeb from 'grpc-web';

import * as common_request_pb from '../common/request_pb';
import * as tee_enclave_server_pb from '../tee/enclave_server_pb';


export class EnclaveServerClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  initEnclave(
    request: tee_enclave_server_pb.InitEnclaveRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: tee_enclave_server_pb.InitEnclaveResponse) => void
  ): grpcWeb.ClientReadableStream<tee_enclave_server_pb.InitEnclaveResponse>;

  deployContract(
    request: common_request_pb.TxRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: tee_enclave_server_pb.EnclaveResponse) => void
  ): grpcWeb.ClientReadableStream<tee_enclave_server_pb.EnclaveResponse>;

  invokeContract(
    request: common_request_pb.TxRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: tee_enclave_server_pb.EnclaveResponse) => void
  ): grpcWeb.ClientReadableStream<tee_enclave_server_pb.EnclaveResponse>;

  remoteAttestationProve(
    request: tee_enclave_server_pb.RemoteAttestationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: tee_enclave_server_pb.RemoteAttestationResponse) => void
  ): grpcWeb.ClientReadableStream<tee_enclave_server_pb.RemoteAttestationResponse>;

}

export class EnclaveServerPromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  initEnclave(
    request: tee_enclave_server_pb.InitEnclaveRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<tee_enclave_server_pb.InitEnclaveResponse>;

  deployContract(
    request: common_request_pb.TxRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<tee_enclave_server_pb.EnclaveResponse>;

  invokeContract(
    request: common_request_pb.TxRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<tee_enclave_server_pb.EnclaveResponse>;

  remoteAttestationProve(
    request: tee_enclave_server_pb.RemoteAttestationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<tee_enclave_server_pb.RemoteAttestationResponse>;

}

