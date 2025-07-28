// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import code from '@/utils/code';

const { BASE_URL } = process.env;

/**
 * 获取网络列表
 * @returns [value, label]
 */
export async function getChannel() {
  const res = await request(`${BASE_URL}/api/channels/info`, {
    method: 'GET',
  });
  if (res?.code == code.SUCCESS_CODE) {
    res.data.forEach((i: any) => {
      i.value = i.channelname;
      i.label = i.channelname;
    });
    return res.data;
  }
  return [];
}

/**
 * 获取网络列表
 * @returns [value, label]
 */
export async function getOrganizationList(params: any) {
  const res = await request(`${BASE_URL}/api/org/list/${params.channel_genesis_hash}`, {
    method: 'GET',
  });
  if (res?.code == code.SUCCESS_CODE) {
    return res.data.map((i: any) => {
      return {
        value: i,
        label: i,
      };
    });
  }
  return [];
}
