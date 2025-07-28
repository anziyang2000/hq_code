/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class main extends Contract {
    async CallMint(ctx, projectId, to, balance) {
        // 获取已部署合约的名称和版本
        const otherContractName = 'exchange-contract';
        const otherContractVersion = '1.1.5';
        try {
            // 提交交易到另一个合约
            const mintResponse = await ctx.stub.invokeChaincode(otherContractName, ['TestCouchDB', projectId, to, balance], 'tourism', otherContractVersion);

            // 检查交易执行结果
            if (mintResponse && mintResponse.status === 200) {
                console.log('Successful transaction');
            } else {
                console.error('The Mint method failed:', mintResponse && mintResponse.status);
                console.error('Error message:', mintResponse && mintResponse.message); // 打印调用失败的具体错误信息
                throw new Error(`Minting failed with status ${mintResponse && mintResponse.status}`);
            }
        } catch (error) {
            console.error('Error occurred:', error.message);
            throw new Error(`Error occurred: ${error.message}`);
        }

        return true;
    }
}

module.exports = main;