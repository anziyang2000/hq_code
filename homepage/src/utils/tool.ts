/** 判断是否白天 */
export function isDaytime(time?: Date) {
  const now = time || new Date();
  const hours = now.getHours();
  // 假设白天是从 6 点到 18 点
  if (hours >= 6 && hours < 18) {
    return true; // 白天
  }
  return false; // 夜晚
}
