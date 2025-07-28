/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class query extends Contract {
    constructor() {
        super();
    }

    async QueryAssets(ctx, queryString) {
        return await this.GetQueryResultForQueryString(ctx, queryString);
    }

    async GetQueryResultForQueryString(ctx, queryString) {

        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.log('000000000000000000000000');
        console.log(resultsIterator);
        let results = await this._GetAllResults(resultsIterator, false);

        return JSON.stringify(results);
    }

    async _GetAllResults(iterator, isHistory) {
        let allResults = [];
        console.log('45454545454545454545');
        console.log(iterator);
        let res = await iterator.next();
        console.log('898989898988989');
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }

    async queryNFT(ctx, token_id) {
        // 构建查询字符串
        let queryString = JSON.stringify({
            selector: {
                token_id: token_id  // 查询条件，可以根据需要修改
            }
        });

        // 调用QueryAssets函数进行查询
        let result = await this.QueryAssets(ctx, queryString);

        console.log('999999999999999999999999');
        // 输出查询结果
        console.log(result);

        return result;
    }

    async QueryByOwner(ctx, owner) {
        // 构建查询字符串
        let queryString = JSON.stringify({
            selector: {
                owner: owner // 查询 owner 的条件
            }
        });

        // 调用 QueryAssets 函数进行查询
        let result = await this.QueryAssets(ctx, queryString);

        console.log('aoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoaoao');
        // 输出查询结果
        console.log('Query result:', result);

        // return result;

        const assets = JSON.parse(result);

        // 定义一个数组，用于存储门票信息
        const tickets = [];

        // 遍历资产对象数组
        for (const asset of assets) {
            // 提取门票信息
            const ticketInfo = {
                ticketId: asset.Record.token_id,
                owner: asset.Record.owner,
                // slot: asset.Record.slot,
                balance: asset.Record.balance,
                // metadata: asset.Record.metadata
            };

            // 将门票信息添加到数组中
            tickets.push(ticketInfo);
        }

        // 返回门票信息数组
        return tickets;
    }

    // async QueryByTokenIdPrefix(ctx, id) {
    //     // 构建前缀，固定字符串 'nft' 拼接上用户输入的 id
    //     // const prefix = `nft${id}`;

    //     // 构建查询字符串，使用正则表达式匹配 tokenId 的前缀
    //     let queryString = JSON.stringify({
    //         selector: {
    //             token_id: {
    //                 // $regex: `^${id}.*` // 正则表达式匹配以固定前缀开头的 token_id
    //                 $regex: `^${id}`
    //             },
    //             // // 增加排序条件，按时间戳降序排列
    //             // sort: [{ "timestamp": "desc" }],
    //             // // 限制结果数量为1，只返回最近的一笔交易
    //             // limit: 1
    //         }
    //     });

    //     // 调用 QueryAssets 函数进行查询
    //     let result = await this.QueryAssets(ctx, queryString);

    //     console.log('Query result:', result);

    //     // 解析查询结果
    //     const assets = JSON.parse(result);

    //     // 定义一个数组，用于存储 token_id
    //     const tokenIds = [];

    //     // 遍历资产对象数组
    //     for (const asset of assets) {
    //         // 提取 token_id 并添加到数组中
    //         tokenIds.push(asset.Record.token_id);
    //     }

    //     // 返回 token_id 数组
    //     return tokenIds;
    // }

    async QueryByTokenIdPrefix(ctx, prefix) {
        try {
            const startKey = prefix;
            const endKey = prefix + '\ufff0';

            const queryString = JSON.stringify({
                selector: {
                    token_id: {
                        $gte: startKey,
                        $lte: endKey
                    }
                },
                sort: [{ token_id: 'asc' }]
            });

            let result = await this.QueryAssets(ctx, queryString);

            console.log('Query result:', result);

            const assets = JSON.parse(result);

            const tokenIds = assets.map(asset => asset.Record.token_id);

            return tokenIds;
        } catch (error) {
            console.error('Error querying by token ID prefix:', error);
            throw new Error('Failed to query by token ID prefix');
        }
    }

}

module.exports = query;