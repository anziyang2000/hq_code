/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const verify = require('./utils/verify');
const debug = require('./utils/debug');
const permission = require('./utils/permission');
const errorObj = require('./utils/error');
const { nameKey, symbolKey, orgAdminMappingKey, contractCode } = require('../lib/const/constants');
class main extends Contract {
    constructor() {
        super();
        this.Verify = new verify();
        this.Debug = new debug();
        this.Permission = new permission();
        this.ErrorObj = new errorObj();
    }

    async Initialize(ctx, name, symbol, org, admin) {
        this.Verify.checkFieldsNotEmpty({ name, symbol, org, admin });

        // Check contract options are not already set, client is not authorized to change them once intitialized
        const nameBytes = await ctx.stub.getState(nameKey);
        if (nameBytes && nameBytes.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.serviceError.init,
                'Initialize: contract options are already set, client is not authorized to change them'
            );
        }

        const orgAdminBytes = await ctx.stub.getState(orgAdminMappingKey);
        if (orgAdminBytes && orgAdminBytes.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.serviceError.init,
                'Initialize: contract options are already set, client is not authorized to change them'
            );
        }

        // Add a new administrator to the admin array corresponding to the organization
        // orgAdminMapping[org] = admin;
        let orgAdminMapping = {};
        orgAdminMapping[org] = [admin]; // Initialize admin as an array

        try {
            await ctx.stub.putState(nameKey, Buffer.from(name));
            await ctx.stub.putState(symbolKey, Buffer.from(symbol));
            // Write the updated orgAdminMapping back to the blockchain
            await ctx.stub.putState(orgAdminMappingKey, Buffer.from(JSON.stringify(orgAdminMapping)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `Initialize: Storing state failed: ${error.message}`
            );
        }

        return true;
    }

    async StoreEvidence(ctx, fileHash, fileName, fileTime, tokenId, userId, type, name, contentUrl) {
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 检查必填字段
        const requiredFields = { fileHash, fileName, fileTime, tokenId, userId, type, name, contentUrl };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        // 获取交易哈希作为存储的 key
        const evidenceKey = await ctx.stub.getTxID();

        if (!evidenceKey) {
            throw new Error('StoreEvidence: Transaction ID (evidenceKey) is empty');
        }

        // 检查是否已存在
        const existingEvidence = await ctx.stub.getState(evidenceKey);
        if (existingEvidence && existingEvidence.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreEvidence: Evidence with transaction ID ${evidenceKey} already exists`
            );
        }

        // 要上链的数据
        const evidenceData = {
            fileHash,
            fileName,
            fileTime,
        };

        // 事件信息（包含所有 8 个参数）
        const evidenceEvent = {
            method_name: 'StoreEvidence',
            file_hash: fileHash,
            file_name: fileName,
            file_time: fileTime,
            token_id: tokenId,
            user_id: userId,
            type,
            name,
            content_url: contentUrl,
        };

        // 上链：将 evidenceData 存储到状态数据库中
        try {
            await ctx.stub.putState(evidenceKey, Buffer.from(JSON.stringify(evidenceData)));
            ctx.stub.setEvent('StoreEvidence', Buffer.from(JSON.stringify(evidenceEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreEvidence: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreEvidence:', evidenceData);
        this.Debug.logDebug('evidenceEvent:', evidenceEvent);
        return true;
    }

    // ================== Access Permission ==========================
    async SetOrgAdmin(ctx, org, admin) {
        console.log('进入main中的SetOrgAdmin');
        return await this.Permission.setOrgAdmin(ctx, org, admin);
    }

    async GetOrgAdmins(ctx) {
        return await this.Permission.getOrgAdmins(ctx);
    }

    async SetLock(ctx) {
        return await this.Permission.setLock(ctx);
    }

    async GetLock(ctx) {
        return await this.Permission.getLock(ctx);
    }

}

module.exports = main;