/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { assetIdPrefix, transactionIdPrefix, userIdPrefix, transactionIDPrefix } = require('./const/constants');

class trade extends Contract {
    // 发布数字资产（选择发布门票产品、数量）
    async PublishAsset(ctx, assetId, asset) {
        console.info('景区提交数字资产发布申请');
        // 从传入的资产对象中解构出各个属性
        const { assetType, quantity, status, paymentStatus, assetDetails } = asset;

        // 构建资产对象
        const newAsset = {
            assetId: assetId,
            assetType: assetType,
            quantity: quantity,
            status: status,
            paymentStatus: paymentStatus,
            assetDetails: assetDetails,
            transactionHistory: []
        };

        // 将资产对象存储到账本中
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(newAsset)));

        console.info('数字资产发布申请已提交');

        // 记录发布资产事件
        const publishEvent = { assetId: assetId, action: '发布数字资产' };
        ctx.stub.setEvent('PublishAssetEvent', Buffer.from(JSON.stringify(publishEvent)));

        return newAsset;
    }

    // 数字资产审核通过
    async AuditAsset(ctx, assetId, status) {
        console.info('审核数字资产');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());
        asset.status = status;
        // asset.transactionHistory.push({
        //     timestamp: new Date().toISOString(),
        //     action: 'passed',
        //     details: details
        // });
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));
        console.info('数字资产审核完成');

        // 记录审核通过事件 (此时合约事件通知景区，进行门票白票铸造)
        const auditEvent = { assetId: assetId, action: '审核通过' };
        ctx.stub.setEvent('AuditAssetEvent', Buffer.from(JSON.stringify(auditEvent)));

        return asset;
    }

    // 数字资产审核驳回
    async RejectAsset(ctx, assetId) {
        console.info('数字资产审核驳回');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());
        asset.status = 'rejected'; // 将状态设置为被驳回
        // asset.transactionHistory.push({
        //     timestamp: new Date().toISOString(),
        //     action: '审核驳回',
        //     details: details
        // });
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));
        console.info('数字资产审核已驳回');

        // 记录审核驳回事件
        const rejectEvent = { assetId: assetId, action: '审核驳回' };
        ctx.stub.setEvent('RejectAssetEvent', Buffer.from(JSON.stringify(rejectEvent)));

        return asset;
    }

    // 数字资产待审核
    async PendingAsset(ctx, assetId) {
        console.info('数字资产待审核');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());
        asset.status = 'pending'; // 将状态设置为待审核
        // asset.transactionHistory.push({
        //     timestamp: new Date().toISOString(),
        //     action: '待审核',
        //     details: details
        // });
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));
        console.info('数字资产状态已更新为待审核');

        // 记录待审核事件
        const pendingEvent = { assetId: assetId, action: '待审核' };
        ctx.stub.setEvent('PendingAssetEvent', Buffer.from(JSON.stringify(pendingEvent)));

        return asset;
    }

    // 资产信息查询(目前写的是只是查询整体的资产信息，不能只查某一部分的)
    async GetAsset(ctx, assetId) {
        console.info('查询数字资产');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());
        return asset;
    }

    // 交易收款确认(及交割)
    async confirmPayment(ctx, assetId) {
        console.info('确认收款');

        // 获取数字资产
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());

        // 修改交易收款状态
        asset.paymentStatus = 'confirmed';

        // 记录交易历史
        // asset.transactionHistory.push({
        //     timestamp: new Date().toISOString(),
        //     action: '确认收款',
        //     details: '交易收款状态已确认'
        // });

        // 更新数字资产状态
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));

        // 触发门票合约进行NFT门票交割（这部分需要根据具体情况实现）
        // 合约触发逻辑放置在这里
        console.info('交易收款状态已确认，门票合约已触发');

        // 记录确认收款事件
        const confirmEvent = { assetId: assetId, action: '确认收款' };
        ctx.stub.setEvent('ConfirmPaymentEvent', Buffer.from(JSON.stringify(confirmEvent)));

        // 合约触发门票合约，进行NFT门票交割!!!!!!
        // !!!!!这里是需要铸造多少张呢？？查看下数字资产的数量 做循环？？？ 如果指定铸造某些数量的，那还得更新下数字资产中的 quantity
        // TransferFrom(ctx, from, to, tokenId)
        // const otherContractName = 'tjs20-v8';
        // const otherContractVersion = '1.0.0';
        // await ctx.stub.invokeChaincode(otherContractName, ['TransferFrom', from, to, tokenId], 'chan-travel', otherContractVersion);

        return asset;
    }

    // 记录交易信息（交易凭证）- 景区管理员/交易所：景区确认收款，生成交易凭证之后，上传交易凭证
    async RecordTransaction(ctx, transactionId, transactionDetails) {
        console.info('合约记录交易信息');

        // 构建交易信息对象
        const transaction = {
            transactionId: transactionId,
            transactionDetails: transactionDetails
        };

        // 将交易信息存储到账本中
        const transactionIdKey = ctx.stub.createCompositeKey(transactionIdPrefix, [transactionId]);
        await ctx.stub.putState(transactionIdKey, Buffer.from(JSON.stringify(transaction)));

        console.info('交易信息已记录');

        // 记录记录交易信息事件
        const recordEvent = { transactionId: transactionId, action: '记录交易信息' };
        ctx.stub.setEvent('RecordTransactionEvent', Buffer.from(JSON.stringify(recordEvent)));

        return transaction;
    }

    // 预授信相关信息上链
    async SetCreditInfo(ctx, creditLimit) {
        console.info('设置用户预授信信息');

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        // 构建预授信信息对象
        const creditInfo = {
            userId: userID,
            creditLimit: creditLimit,
        };

        // 将预授信信息存储在区块链上
        const userIdKey = ctx.stub.createCompositeKey(userIdPrefix, [userID]);
        await ctx.stub.putState(userIdKey, Buffer.from(JSON.stringify(creditInfo)));

        // 记录设置预授信信息事件
        const SetCreditEvent = { userId: userID, action: '设置用户预授信信息' };
        ctx.stub.setEvent('SetCreditInfoEvent', Buffer.from(JSON.stringify(SetCreditEvent)));

        return creditInfo;
    }

    // 用户预授信额度修改
    async UpdateCreditLimit(ctx, newCreditLimit) {
        console.info('修改用户预授信额度');

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        // 获取现有的预授信信息
        const userIdKey = ctx.stub.createCompositeKey(userIdPrefix, [userID]);
        const creditInfoBytes = await ctx.stub.getState(userIdKey);
        if (!creditInfoBytes || creditInfoBytes.length === 0) {
            throw new Error(`用户 ${userID} 的预授信信息不存在`);
        }

        // 解析预授信信息
        const creditInfo = JSON.parse(creditInfoBytes.toString());

        // 更新预授信额度
        creditInfo.creditLimit = newCreditLimit;

        // 存储更新后的预授信信息
        await ctx.stub.putState(userIdKey, Buffer.from(JSON.stringify(creditInfo)));

        // 记录修改预授信额度事件
        const UpdateCreditEvent = { userId: userID, action: '修改用户预授信额度' };
        ctx.stub.setEvent('UpdateCreditEvent', Buffer.from(JSON.stringify(UpdateCreditEvent)));

        return creditInfo;
    }

    async _parseX509String(str) {
        const obj = {};
        // Cut off prefix 'x509::'
        const content = str.slice(7);
        // Use '::' to split a string into two parts
        const segments = content.split('::');
        segments.forEach(segment => {
            const innerObj = {};
            // Use '/' to split the string into key-value pairs
            const innerSegments = segment.split('/');
            innerSegments.forEach(innerSegment => {
                const [key, ...valueParts] = innerSegment.split('=');
                const value = valueParts.join('=');
                innerObj[key] = value;
            });
            obj[segments.indexOf(segment)] = innerObj;
        });
        return obj;
    }

    // 上传交易记录 - 旅行商：采购数字资产之后，交易记录更新到区块链
    async UploadTransactionRecord(ctx, transactionId, transactionRecord) {
        console.info('上传交易记录到合约');

        // 解析交易记录对象
        const { assetId, buyerId, purchaseAmount, purchaseDate } = transactionRecord;

        const completeTransactionRecord = {
            transactionId: transactionId,
            assetId: assetId,
            buyerId: buyerId,
            purchaseAmount: purchaseAmount,
            purchaseDate: purchaseDate,
            status: 'purchased'
        };

        // 将预授信信息存储在区块链上
        const transactionIDKey = ctx.stub.createCompositeKey(transactionIDPrefix, [transactionId]);
        await ctx.stub.putState(transactionIDKey, Buffer.from(JSON.stringify(completeTransactionRecord)));

        console.info('交易记录已上传到区块链');

        // 记录交易记录事件
        const UploadTransactionEvent = { transactionId: transactionId, action: '上传交易记录' };
        ctx.stub.setEvent('UploadTransactionRecordEvent', Buffer.from(JSON.stringify(UploadTransactionEvent)));

        return completeTransactionRecord;
    }

    // 交易记录信息查询
    async QueryTransactionRecord(ctx, transactionId) {
        console.info('查询交易记录信息');
        const transactionIDKey = ctx.stub.createCompositeKey(transactionIDPrefix, [transactionId]);
        const transactionRecordAsBytes = await ctx.stub.getState(transactionIDKey);
        if (!transactionRecordAsBytes || transactionRecordAsBytes.length === 0) {
            throw new Error(`交易记录 ${transactionId} 不存在`);
        }
        const transactionRecord = JSON.parse(transactionRecordAsBytes.toString());
        console.info('交易记录信息查询成功');

        return transactionRecord;
    }
}

module.exports = trade;

// async CallMint(ctx, amount) {
//     // 获取已部署合约的名称和版本
//     const otherContractName = 'tjs20-v8';
//     const otherContractVersion = '1.0.0';
//     try {
//         // 提交交易到另一个合约
//         const mintResponse = await ctx.stub.invokeChaincode(otherContractName, ['Mint', amount], 'chan-travel', otherContractVersion);

//         // 检查交易执行结果
//         if (mintResponse && mintResponse.status === 200) {
//             console.log('Successful transaction');
//         } else {
//             console.error('The Mint method failed:', mintResponse && mintResponse.status);
//             console.error('Error message:', mintResponse && mintResponse.message); // 打印调用失败的具体错误信息
//             throw new Error(`Minting failed with status ${mintResponse && mintResponse.status}`);
//         }
//     } catch (error) {
//         console.error('Error occurred:', error.message);
//         throw new Error(`Error occurred: ${error.message}`);
//     }
// }
