/**
 * @name prod生产环境
 * @see  wiat https://nft.zhilvlian.com
 */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  publicPath: '/blockchain/zhilvlian-explorer/',  
  define: {
    'process.env.BASE_URL': 'https://api-explorer.shukechain.com', // 生产环境
    'process.env.SCREEN_URL': 'https://explorer.shukechain.com/#/',
    'process.env.UMI_ENV': process.env.UMI_ENV,
  },
});