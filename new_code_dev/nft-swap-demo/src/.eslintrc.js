module.exports = {
    env: {
      es2020: true,  // 启用ES2020环境，确保BigInt可用
    },
    globals: {
      BigInt: 'readonly',  // 将BigInt声明为只读全局变量
    },
    rules: {
      // 你可以在这里添加你自己的 ESLint 规则
    },
  };
  