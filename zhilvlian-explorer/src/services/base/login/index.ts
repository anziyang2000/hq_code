// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const { BASE_URL } = process.env;

export async function loginToken(body: { user: string; password: string; network: string }) {
  return request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    data: body,
  });
}