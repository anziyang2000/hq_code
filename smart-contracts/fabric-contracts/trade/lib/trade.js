/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { assetIdPrefix, transactionIdPrefix } = require('./const/constants');

class trade extends Contract {
    // （景区管理员）发布数字资产（选择发布门票产品、数量）
    async PublishAsset(ctx, assetId, asset) {
        console.log('景区提交数字资产发布申请');
        // 从传入的资产对象中解构出各个属性
        const { assetType, number, status, paymentStatus, assetDetails } = asset;

        // 构建资产对象
        const newAsset = {
            assetId: assetId,
            assetType: assetType,
            number: number,
            status: status,
            paymentStatus: paymentStatus,
            assetDetails: assetDetails,
            transactionHistory: []
        };

        // 将资产对象存储到账本中
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(newAsset)));

        console.log('数字资产发布申请已提交');

        // 记录发布资产事件
        const publishEvent = { assetId: assetId, action: '发布数字资产' };
        ctx.stub.setEvent('PublishAssetEvent', Buffer.from(JSON.stringify(publishEvent)));

        return newAsset;
    }

    // （交易所）数字资产审核通过
    async AuditAsset(ctx, assetId, status) {
        console.log('审核数字资产');
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
        console.log('数字资产审核完成');

        // 记录审核通过事件 (此时合约事件通知景区，进行门票白票铸造)
        const auditEvent = { assetId: assetId, action: '审核通过' };
        ctx.stub.setEvent('AuditAssetEvent', Buffer.from(JSON.stringify(auditEvent)));

        return asset;
    }

    // （交易所）数字资产审核驳回
    async RejectAsset(ctx, assetId) {
        console.log('数字资产审核驳回');
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
        console.log('数字资产审核已驳回');

        // 记录审核驳回事件
        const rejectEvent = { assetId: assetId, action: '审核驳回' };
        ctx.stub.setEvent('RejectAssetEvent', Buffer.from(JSON.stringify(rejectEvent)));

        return asset;
    }

    // （交易所）数字资产待审核
    async PendingAsset(ctx, assetId) {
        console.log('数字资产待审核');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`Digital assets ${assetId} does not exist`);
        }
        const asset = JSON.parse(assetBytes.toString());
        asset.status = 'pending'; // 将状态设置为待审核
        // asset.transactionHistory.push({
        //     timestamp: new Date().toISOString(),
        //     action: '待审核',
        //     details: details
        // });
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));
        console.log('数字资产状态已更新为待审核');

        // 记录待审核事件
        const pendingEvent = { assetId: assetId, action: '待审核' };
        ctx.stub.setEvent('PendingAssetEvent', Buffer.from(JSON.stringify(pendingEvent)));

        return asset;
    }

    // （景区管理员/交易所）资产信息查询(目前写的是只是查询整体的资产信息，不能只查某一部分的)
    async GetAsset(ctx, assetId) {
        console.log('查询数字资产');
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());
        return asset;
    }

    // （景区管理员）交易收款确认(及交割) 景区管理员是交割的发起人，是他来进行白票的 Mint 的
    async confirmPayment(ctx, assetId, to) {
        console.log('确认收款');

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const from = x509Object[0].CN;

        // 获取数字资产
        const compositeKey = ctx.stub.createCompositeKey(assetIdPrefix, [assetId]);
        const assetBytes = await ctx.stub.getState(compositeKey);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`数字资产 ${assetId} 不存在`);
        }
        const asset = JSON.parse(assetBytes.toString());

        // 修改交易收款状态
        asset.paymentStatus = 'confirmed';

        // 更新数字资产状态
        await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(asset)));

        // 触发门票合约进行NFT门票交割（这部分需要根据具体情况实现）
        // 合约触发逻辑放置在这里
        console.log('交易收款状态已确认，门票合约已触发');

        // 记录确认收款事件
        const confirmEvent = { assetId: assetId, action: '确认收款' };
        ctx.stub.setEvent('ConfirmPaymentEvent', Buffer.from(JSON.stringify(confirmEvent)));

        // 合约触发门票合约，进行NFT门票交割!!!!!!
        // !!!!!这里是需要铸造多少张呢？？查看下数字资产的数量 做循环？？？ 如果指定铸造某些数量的，那还得更新下数字资产中的 number
        // TransferFrom(ctx, from, to, tokenId)
        const otherContractName = 'ticket-v2';
        const otherContractVersion = '1.0.0';
        const number = asset.number; // 获取数字资产的数量
        // 根据数字资产的数量循环进行 NFT 交割
        for (let i = 0; i < number; i++) {
            // 构造参数
            const tokenId = `token_${assetId}_${i}`; // 假设每个数字资产都对应一个唯一的tokenId
            // 调用链码进行 NFT 交割
            await ctx.stub.invokeChaincode(otherContractName, ['TransferFrom', from, to, tokenId], 'chan-travel', otherContractVersion);
        }

        return asset;
    }

    // (景区管理员/交易所) 记录交易信息--交易凭证：景区确认收款，生成交易凭证之后，上传交易凭证
    async RecordTransaction(ctx, transactionId, transactionCertificate) {
        console.log('合约记录交易凭证');

        // 构建交易信息对象
        const transaction = {
            transactionId: transactionId,
            transactionCertificate: transactionCertificate
        };

        // 将交易信息存储到账本中
        const transactionIdKey = ctx.stub.createCompositeKey(transactionIdPrefix, [transactionId]);
        await ctx.stub.putState(transactionIdKey, Buffer.from(JSON.stringify(transaction)));

        console.info('交易凭证已记录');

        // 记录记录交易信息事件
        const recordEvent = { transactionId: transactionId, action: '记录交易凭证' };
        ctx.stub.setEvent('RecordTransactionEvent', Buffer.from(JSON.stringify(recordEvent)));

        return transaction;
    }

    // 记录交易凭证--交易凭证：景区确认收款，生成交易凭证之后，双穿交易凭证

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
}

module.exports = trade;