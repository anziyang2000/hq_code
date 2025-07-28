# README_DEV

> 以下步骤适用于 eth 合约，为标准的 hardhat 框架用法

## usage

### 1 参数配置
- 修改 hardhat.config.js 参数

``` shell
    defaultNetwork: "priv_network",
    networks: {
        hardhat: {},
        priv_network: {
            url: "http://127.0.0.1:8545",
            accounts: [PRIVATE_KEY]
        }
    },
```

- 配置 .env 文件中的私钥环境变量

``` shell
PRIVATE_KEY = ''
```

### 2 项目运行

- 初始化 hardhat 项目

``` shell
npm install --save-dev hardhat
npx hardhat
```

- 运行项目

```
# deploy
npx hardhat run scripts/deploy.js

# balance
npx hardhat run scripts/balance.js

```