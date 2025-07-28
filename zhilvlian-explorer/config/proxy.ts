/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/BASE_URL': {
      // 要代理的地址
      target: 'http://192.168.90.141:8080/', 
      // target: 'http://192.168.120.21:8080/', //release  
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      logLevel: 'debug',
      changeOrigin: true,
      pathRewrite: { '^/BASE_URL': '' },
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    '/BASE_URL': {
      target: 'https://test.shukeyun.com/blockchain/explorer',
      // logLevel: 'debug',
      changeOrigin: true,
      pathRewrite: { '^/BASE_URL': '' },
    },
  },
  prod: {
    '/BASE_URL': {
      target: 'https://explorer.zhilvlian.com',
      // logLevel: 'debug',
      changeOrigin: true,
      pathRewrite: { '^/BASE_URL': '' },
    },
  },
};
