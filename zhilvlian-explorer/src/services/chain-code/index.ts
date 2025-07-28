// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 获取合约列表
 * @param params
 * @returns
 */
export async function getChainCodeList(params: { channel_genesis_hash: string }) {
  const { channel_genesis_hash } = params;
  return request(`${BASE_URL}/api/chaincode/${channel_genesis_hash}`, {
    method: 'GET',
  });
}
