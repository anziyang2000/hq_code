// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 查询网络区块数据(接口暂时未使用)
 * num = 1, return 1 data
 * num = 0, return latest 100 data
 * @param params
 * @returns
 */
export async function getTravel(
  params: { alliances_name: string },
  // options?: { [key: string]: any },
) {
  return request(`${BASE_URL}/api/blockActivity/0`, {
    method: 'GET',
    params
    // ...(options || {}),
  });
}

