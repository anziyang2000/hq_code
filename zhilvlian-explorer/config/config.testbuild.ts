/**
 * @name test测试环境
 * @see  wiat https://test.shukeyun.com/blockchain/nft-ui/
 */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  publicPath: '/blockchain/zhilvlian-explorer/',
  define: {
    'process.env.BASE_URL': ' https://api-test-explorer.shukechain.com',
    'process.env.SCREEN_URL': 'https://test-explorer.shukechain.com/#/',
    'process.env.UMI_ENV': process.env.UMI_ENV,
  },
});