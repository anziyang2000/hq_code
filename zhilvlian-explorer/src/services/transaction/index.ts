// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 获取交易列表
 * @param params
 * @returns
 */
export async function getTransactionList(params: {
  channel_genesis_hash: string;
  from?: any;
  to?: any;
  organization?: string;
  option: any; // 必传
  content?: any;
  page?: number; // 新增：页面参数
  size?: number; // 新增：页面大小参数
}) {
  const { channel_genesis_hash, from, to, organization, option = 1, content, page = 1, 
    size = 10 } = params;
  let url = ``;
  if (option == 0) {
    // option = 0 ;筛选，from，to必传
    // url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?from=${from}&to=${to}${organization}&option=${option}`;
    // url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?from=${from}&to=${to}${organization}&page=${1}&size=${10}&option=${option}`;
    url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?from=${from}&to=${to}${organization}&option=${option}`;
    // url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?${organization}&option=${option}`;
  } else if (option == 1) {
    // option = 1，get_num =10,展示最新条数 10 条
    // url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?get_num=${20}&option=${option}`;
    url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?&page=${page}&size=${size}&option=${option}`;
    // url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?page=${1}&size=${10}`;
  } else if (option == 2) {
    // option = 2,content=xx 查询 hash为xx的交易详情
    url = `${BASE_URL}/api/txList/${channel_genesis_hash}/0/0?option=${option}&content=${content}`;
  }
  return request(url, {
    method: 'GET',
  });
}

/**
 * 获取直接跳转获取交易列表
 * @param params
 * @returns
 */
export async function getTransactionLatestList(params: { channel_genesis_hash: string }) {
  const { channel_genesis_hash } = params;
  return request(`${BASE_URL}/api/transaction/latest/${channel_genesis_hash}/10`, {
    method: 'GET',
  });
}

/**
 * 获取交易详情
 * @param params
 * @returns
 */
export async function getBlockDetailList(params: {
  channel_genesis_hash: string;
  tx_hash?: string;
}) {
  const { channel_genesis_hash, tx_hash } = params;
  return request(`${BASE_URL}/api/transaction/${channel_genesis_hash}/${tx_hash}`, {
    method: 'GET',
  });
}