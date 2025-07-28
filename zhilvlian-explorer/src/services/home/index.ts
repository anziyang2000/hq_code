// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

/**
 * 数据总览
 * @param params
 * @returns
 */
// export async function getTravel(
//   params: { alliances_name: string },
//   // options?: { [key: string]: any },
// ) {
//   return request(`${BASE_URL}/v2/travel/index/overview`, {
//     method: 'GET',
//     params,
//     // ...(options || {}),
//   });
// }

/**
 * 首页-交易图表
 * @param params
 * @returns
 */
export function getTravelEcharts(params: HOME.txByHour) {
  const { channel_genesis_hash, days } = params;
  return request(`${BASE_URL}/api/txByHour/${channel_genesis_hash}/${days}`, {
    method: 'GET',
  });
}

export function getTxForChart(params: HOME.txByHour) {
  const { channel_genesis_hash, days, day_length } = params;
  return request(`${BASE_URL}/api/getTxForChart/${channel_genesis_hash}/${days}/${day_length}`, {
    method: 'GET',
  });
}

// router.get('/txByMinute/:channel_genesis_hash/:hours', (req, res) => {
export function getTXMinuteEcharts(params: HOME.txByMinute) {
  const { channel_genesis_hash, hours } = params;
  return request(`${BASE_URL}/api/txByMinute/${channel_genesis_hash}/${hours}`, {
    method: 'GET',
  });
}

/**
 * 首页-最新区块
 * @param params
 * @returns
 */
export function getBlockActivity(params: HOME.blockActivity) {
  return request(`${BASE_URL}/api/block/latest/${params.channel_genesis_hash}/5`, {
    method: 'GET',
  });
}

/**
 * 首页-基础数据
 * @param params
 * @returns
 */
export function getHomeIndexData(params: HOME.blockActivity) {
  return request(`${BASE_URL}/api/home/index/${params.channel_genesis_hash}`, {
    method: 'GET',
  });
}

/**
 * 首页-最新交易
 * @param params
 * @returns
 */
export function getBlockAndTxList(params: HOME.blockActivity) {
  return request(`${BASE_URL}/api/transaction/latest/${params.channel_genesis_hash}/5`, {
    method: 'GET',
  });
}
