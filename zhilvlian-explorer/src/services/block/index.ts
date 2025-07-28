// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 获取区块列表信息
 * @param params
 * @returns
 */
export async function getBlockList(params: {
  channel_genesis_hash: string;
  from?: any;
  to?: any;
  organization?: string;
  option: any; // 必传
  content?: any;
  page?: number; // 新增：页面参数
  size?: number; // 新增：页面大小参数
}) {
  const { channel_genesis_hash, from, to, organization, option = 1, content,  page = 1, 
  size = 10,  } = params;
  let url = ``;
  if (option == 0) {
    // option = 0 ;筛选，from，to必传
    url = `${BASE_URL}/api/blockAndTxList/${channel_genesis_hash}/0?from=${from}&to=${to}${organization}&page=${page}&size=${size}&option=${option}`;
  } else if (option == 1) {
    // option = 1，get_num =10,展示最新条数 10 条
    // url = `${BASE_URL}/api/blockAndTxList/${channel_genesis_hash}/0?get_num=${20}&option=${option}`;
    url = `${BASE_URL}/api/blockAndTxList/${channel_genesis_hash}/0?&option=${option}&page=${page}&size=${size}`;
  } else if (option == 2) {
    // option = 2,content=xx 查询 hash为xx的交易详情
    url = `${BASE_URL}/api/blockAndTxList/${channel_genesis_hash}/0?option=${option}&content=${content}&page=${page}&size=${size}`;
  }
  return request(url, {
    method: 'GET',
  });
}
