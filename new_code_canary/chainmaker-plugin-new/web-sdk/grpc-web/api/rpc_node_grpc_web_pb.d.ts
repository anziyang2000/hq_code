import * as grpcWeb from 'grpc-web';

import * as common_request_pb from '../common/request_pb';
import * as common_result_pb from '../common/result_pb';
import * as config_chainmaker_server_pb from '../config/chainmaker_server_pb';
import * as config_local_config_pb from '../config/local_config_pb';
import * as config_log_config_pb from '../config/log_config_pb';
import * as txpool_transaction_pool_pb from '../txpool/transaction_pool_pb';


export class RpcNodeClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  sendRequest(
    request: common_request_pb.TxRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: common_result_pb.TxResponse) => void
  ): grpcWeb.ClientReadableStream<common_result_pb.TxResponse>;

  subscribe(
    request: common_request_pb.TxRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<common_result_pb.SubscribeResult>;

  subscribeWS(
    request: common_request_pb.RawTxRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<common_result_pb.SubscribeResult>;

  updateDebugConfig(
    request: config_local_config_pb.DebugConfigRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: config_local_config_pb.DebugConfigResponse) => void
  ): grpcWeb.ClientReadableStream<config_local_config_pb.DebugConfigResponse>;

  refreshLogLevelsConfig(
    request: config_log_config_pb.LogLevelsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: config_log_config_pb.LogLevelsResponse) => void
  ): grpcWeb.ClientReadableStream<config_log_config_pb.LogLevelsResponse>;

  getChainMakerVersion(
    request: config_chainmaker_server_pb.ChainMakerVersionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: config_chainmaker_server_pb.ChainMakerVersionResponse) => void
  ): grpcWeb.ClientReadableStream<config_chainmaker_server_pb.ChainMakerVersionResponse>;

  checkNewBlockChainConfig(
    request: config_local_config_pb.CheckNewBlockChainConfigRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: config_local_config_pb.CheckNewBlockChainConfigResponse) => void
  ): grpcWeb.ClientReadableStream<config_local_config_pb.CheckNewBlockChainConfigResponse>;

  getPoolStatus(
    request: txpool_transaction_pool_pb.GetPoolStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: txpool_transaction_pool_pb.TxPoolStatus) => void
  ): grpcWeb.ClientReadableStream<txpool_transaction_pool_pb.TxPoolStatus>;

  getTxIdsByTypeAndStage(
    request: txpool_transaction_pool_pb.GetTxIdsByTypeAndStageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: txpool_transaction_pool_pb.GetTxIdsByTypeAndStageResponse) => void
  ): grpcWeb.ClientReadableStream<txpool_transaction_pool_pb.GetTxIdsByTypeAndStageResponse>;

  getTxsInPoolByTxIds(
    request: txpool_transaction_pool_pb.GetTxsInPoolByTxIdsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: txpool_transaction_pool_pb.GetTxsInPoolByTxIdsResponse) => void
  ): grpcWeb.ClientReadableStream<txpool_transaction_pool_pb.GetTxsInPoolByTxIdsResponse>;

}

export class RpcNodePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  sendRequest(
    request: common_request_pb.TxRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<common_result_pb.TxResponse>;

  subscribe(
    request: common_request_pb.TxRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<common_result_pb.SubscribeResult>;

  subscribeWS(
    request: common_request_pb.RawTxRequest,
    metadata?: grpcWeb.Metadata
  ): grpcWeb.ClientReadableStream<common_result_pb.SubscribeResult>;

  updateDebugConfig(
    request: config_local_config_pb.DebugConfigRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<config_local_config_pb.DebugConfigResponse>;

  refreshLogLevelsConfig(
    request: config_log_config_pb.LogLevelsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<config_log_config_pb.LogLevelsResponse>;

  getChainMakerVersion(
    request: config_chainmaker_server_pb.ChainMakerVersionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<config_chainmaker_server_pb.ChainMakerVersionResponse>;

  checkNewBlockChainConfig(
    request: config_local_config_pb.CheckNewBlockChainConfigRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<config_local_config_pb.CheckNewBlockChainConfigResponse>;

  getPoolStatus(
    request: txpool_transaction_pool_pb.GetPoolStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<txpool_transaction_pool_pb.TxPoolStatus>;

  getTxIdsByTypeAndStage(
    request: txpool_transaction_pool_pb.GetTxIdsByTypeAndStageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<txpool_transaction_pool_pb.GetTxIdsByTypeAndStageResponse>;

  getTxsInPoolByTxIds(
    request: txpool_transaction_pool_pb.GetTxsInPoolByTxIdsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<txpool_transaction_pool_pb.GetTxsInPoolByTxIdsResponse>;

}

