require('@openzeppelin/hardhat-upgrades')
const { task } = require('hardhat/config')
require('@nomicfoundation/hardhat-toolbox')
require('@openzeppelin/hardhat-upgrades')
require('@typechain/hardhat')

/** @type import('hardhat/config').HardhatUserConfig */

const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names')
const path = require('path')

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion === '0.8.2') {
    const compilerPath = path.join(__dirname, 'node_modules/solc/soljson.js')

    return {
      compilerPath,
      isSolcJs: true, // if you are using a native compiler, set this to false
      version: args.solcVersion
      // this is used as extra information in the build-info files, but other than
      // that is not important
      // longVersion: "0.8.5-nightly.2021.5.12+commit.98e2b4e5"
    }
  }

  // we just use the default subtask if the version is not 0.8.5
  return runSuper()
})

module.exports = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    myCustomNet: {
      // url: 'http://192.168.120.33:32838',
      url: 'http://192.168.120.33:32849',
      chainId: 3151908,
      accounts: [
        '0x39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d'
      ],
      gasPrice: 1000000000, // 1 Gwei
    },
    canaryNet: {
      url: 'http://192.168.10.128:32769',
      chainId: 3151908,
      accounts: [
        '0x39725efee3fb28614de3bacaffe4cc4bd8c436257e2c8bb887c4b5c4be45e76d'
      ],
      gasPrice: 1000000000, // 1 Gwei
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20"
      },
      {
        version: "0.8.22"
      }
    ],
    // 启用优化器（Enable Optimizer）,尝试减小合约的代码大小并提高执行效率
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
