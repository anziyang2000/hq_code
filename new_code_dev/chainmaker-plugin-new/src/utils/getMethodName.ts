// utils/getContractName.ts
import { ABI_REGISTRY } from './abi-registry';

/**
 * 从交易对象中解析出合约名称
 */
export function getContractName(tx: { to?: string }): string | null {
  if (!tx.to) return null;

  const to = tx.to.toLowerCase();
  const info = ABI_REGISTRY[to];
  if (!info) return null;

  return info.name;
}