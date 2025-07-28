// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

export async function getSearchInput(params: { content: string; channel_genesis_hash: string }) {
  const { content, channel_genesis_hash } = params;
  return request(`${BASE_URL}/api/search/${channel_genesis_hash}/${content}`, {
    method: 'GET',
  });
}
