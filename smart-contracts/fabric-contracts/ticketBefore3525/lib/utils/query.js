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

    // async queryNFTsByOwnerAndBalance(ctx, owner, balance) {
    //     // 构造查询字符串
    //     const queryString = {
    //         selector: {
    //             docType: 'nft',
    //             owner: owner,
    //             balance: balance // 由于 balance 是数字，需要转换为字符串进行匹配
    //         }
    //     };

    //     // 调用 QueryAssets 函数并返回结果
    //     return this.QueryAssets(ctx, JSON.stringify(queryString));
    // }

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

    async QueryByTokenIdPrefix(ctx) {
        // 构建查询字符串，使用正则表达式匹配 tokenId 的前三位
        let queryString = JSON.stringify({
            selector: {
                token_id: {
                    // $regex: `^${prefix}.*` // 正则表达式匹配前缀
                    $exists: true // 确保 token_id 存在，选择所有记录
                }
            }
        });

        // 调用 QueryAssets 函数进行查询
        let result = await this.QueryAssets(ctx, queryString);

        console.log('Query result:', result);

        // 解析查询结果
        const assets = JSON.parse(result);

        // 定义一个数组，用于存储门票信息
        const tickets = [];

        // 遍历资产对象数组
        for (const asset of assets) {
            // 提取门票信息
            const ticketInfo = {
                ticketId: asset.Record.token_id,
                owner: asset.Record.owner,
                balance: asset.Record.balance,
            };

            // 将门票信息添加到数组中
            tickets.push(ticketInfo);
        }

        // 返回门票信息数组
        return tickets;
    }

    // async processQueryResult(queryResult) {
    //     // 解析 JSON 字符串为 JavaScript 对象
    //     const assets = JSON.parse(queryResult);

    //     // 定义一个数组，用于存储门票信息
    //     const tickets = [];

    //     // 遍历资产对象数组
    //     for (const asset of assets) {
    //         // 提取门票信息
    //         const ticketInfo = {
    //             ticketId: asset.Record.token_id,
    //             owner: asset.Record.owner,
    //             slot: asset.Record.slot,
    //             balance: asset.Record.balance,
    //             metadata: asset.Record.metadata
    //         };

    //         // 将门票信息添加到数组中
    //         tickets.push(ticketInfo);
    //     }

    //     // 返回门票信息数组
    //     return tickets;
    // }

    // // 调用函数并处理查询结果
    // const queryResult = "[{\"Key\":\"\\u0000nft\\u00001\\u0000\",\"Record\":{\"balance\":\"100\",\"owner\":\"Bob\",\"token_id\":\"1\"}},{\"Key\":\"\\u0000nft\\u00003\\u0000\",\"Record\":{\"balance\":\"300\",\"owner\":\"Bob\",\"token_id\":\"3\"}}]";
    // const tickets = await processQueryResult(queryResult);

    // // 输出门票信息
    // console.log(tickets);

}

module.exports = query;