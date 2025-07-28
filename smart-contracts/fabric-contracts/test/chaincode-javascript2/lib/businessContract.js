'use strict';

const { Contract } = require('fabric-contract-api');

class BusinessContract extends Contract {
    async CallMint(ctx, amount) {
        // 获取已部署合约的名称和版本
        const otherContractName = 'tjs20-v8';
        const otherContractVersion = '1.0.0';
        try {
            // 提交交易到另一个合约
            const mintResponse = await ctx.stub.invokeChaincode(otherContractName, ['Mint', amount], 'chan-travel', otherContractVersion);

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
    }
}

module.exports = BusinessContract;





