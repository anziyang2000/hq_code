/**
 * @name local本地开发环境
 * @see  wiat
 */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  define: {
    'process.env.BASE_URL': '/BASE_URL', // 走本地代理，为了方便后续开发测试
    'process.env.SCREEN_URL': 'http://localhost:8000/#/',
    'process.env.UMI_ENV': process.env.UMI_ENV,
  }
});
