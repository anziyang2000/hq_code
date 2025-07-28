// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 获取节点列表
 * @param params
 * @returns
 */
export async function getNodeList(params: { channel_genesis_hash: string }) {
  const { channel_genesis_hash } = params;
  return request(`${BASE_URL}/api/peers/${channel_genesis_hash}`, {
    method: 'GET',
  });
}
