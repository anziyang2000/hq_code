const KEY = 'Authorization-token';

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

// 设置网络详情
export function getLocalStoryage(data: any) {
  return localStorage.getItem(KEY);
}

// 设置网络详情
export function setChannelInfo(data: any) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
