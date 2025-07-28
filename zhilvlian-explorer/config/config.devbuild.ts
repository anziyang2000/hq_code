/**
 * @name dev环境
 * @see  wiat https://dev.shukeyun.com/blockchain/nft-ui/
 */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  publicPath: '/blockchain/zhilvlian-explorer/',
  define: {
    'process.env.BASE_URL': 'https://api-dev-explorer.shukechain.com',
    'process.env.SCREEN_URL': 'https://dev-explorer.shukechain.com/#/',
    'process.env.UMI_ENV': process.env.UMI_ENV,
  },
});
