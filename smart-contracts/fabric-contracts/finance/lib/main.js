/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const query = require('./utils/query');
const permission = require('./utils/permission');
const verify = require('./utils/verify');
const debug = require('./utils/debug');
const errorObj = require('./utils/error');
const { CreditRating, LoanApplication, LoanApproval, LoanApprovalFailed, BorrowApplication, BorrowApproval, RepaymentOrder, RepaymentApplication, RepaymentApproval, RepaymentApprovalFailed, CreditRatingSchema, LoanApplicationSchema, LoanApprovalSchema, LoanApprovalFailedSchema, BorrowApplicationSchema, BorrowApprovalSchema, RepaymentOrderSchema, RepaymentApplicationSchema, RepaymentApprovalSchema, RepaymentApprovalFailedSchema } = require('../lib/const/finance');
const { nameKey, symbolKey, orgAdminMappingKey, contractCode } = require('../lib/const/constants');

class main extends Contract {
    constructor() {
        super();
        this.Query = new query();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.ErrorObj = new errorObj();
    }

    // ================== Access Permission ==========================
    async SetOrgAdmin(ctx, org, admin) {
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

    // ================== Protocol Functions ==========================
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

    // 企业信用评级结果
    async StoreCreditRating(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        if (!dataInfo || typeof dataInfo !== 'string') {
            throw this.ErrorObj.createError(
                contractCode.businessError.invalidInput,
                'StoreCreditRating: Invalid input, expected a JSON string'
            );
        }

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreCreditRating: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(CreditRatingSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(CreditRating, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreCreditRating: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const creditRatingEvent = {
        //     method_name: 'StoreCreditRating',
        // };

        // 获取交易哈希作为存储的 key
        const creditRatingKey = await ctx.stub.getTxID();

        if (!creditRatingKey) {
            throw new Error('StoreCreditRating: Transaction ID (creditRatingKey) is empty');
        }

        // 4. 上链：将 creditRating 信息存储到状态数据库中
        try {
            await ctx.stub.putState(creditRatingKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreCreditRating', Buffer.from(JSON.stringify(creditRatingEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreCreditRating: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreCreditRating:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 贷款申请
    async StoreLoanApplication(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreLoanApplication: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(LoanApplicationSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(LoanApplication, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreLoanApplication: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const loanApplicationEvent = {
        //     method_name: 'StoreLoanApplication',
        // };

        // 获取交易哈希作为存储的 key
        const loanApplicationKey = await ctx.stub.getTxID();

        if (!loanApplicationKey) {
            throw new Error('StoreLoanApplication: Transaction ID (loanApplicationKey) is empty');
        }

        // 4. 上链：将 loanApplication 信息存储到状态数据库中
        try {
            await ctx.stub.putState(loanApplicationKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreLoanApplication', Buffer.from(JSON.stringify(loanApplicationEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreLoanApplication: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreLoanApplication:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 贷款审核(通过)
    async StoreLoanApproval(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreLoanApproval: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(LoanApprovalSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(LoanApproval, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreLoanApproval: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const loanApprovalEvent = {
        //     method_name: 'StoreLoanApproval',
        // };

        // 获取交易哈希作为存储的 key
        const loanApprovalKey = await ctx.stub.getTxID();

        if (!loanApprovalKey) {
            throw new Error('StoreLoanApproval: Transaction ID (loanApprovalKey) is empty');
        }

        // 4. 上链：将 loanApproval 信息存储到状态数据库中
        try {
            await ctx.stub.putState(loanApprovalKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreLoanApproval', Buffer.from(JSON.stringify(loanApprovalEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreLoanApproval: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreLoanApproval:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 贷款审核(不通过)
    async StoreLoanApprovalFailed(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreLoanApprovalFailed: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(LoanApprovalFailedSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(LoanApprovalFailed, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreLoanApprovalFailed: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const loanApprovalFailedEvent = {
        //     method_name: 'StoreLoanApprovalFailed',
        // };

        // 获取交易哈希作为存储的 key
        const loanApprovalFailedKey = await ctx.stub.getTxID();

        if (!loanApprovalFailedKey) {
            throw new Error('StoreLoanApprovalFailed: Transaction ID (loanApprovalFailedKey) is empty');
        }

        // 4. 上链：将 loanApprovalFailed 信息存储到状态数据库中
        try {
            await ctx.stub.putState(loanApprovalFailedKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreLoanApprovalFailed', Buffer.from(JSON.stringify(loanApprovalFailedEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreLoanApprovalFailed: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreLoanApprovalFailed:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 再次申请贷款
    async StoreLoanReApplication(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreLoanReApplication: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(LoanApplicationSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(LoanApplication, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreLoanReApplication: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const loanReApplicationEvent = {
        //     method_name: 'StoreLoanReApplication',
        //     danshi_app:
        // };

        // 获取交易哈希作为存储的 key
        const loanApplicationKey = await ctx.stub.getTxID();

        if (!loanApplicationKey) {
            throw new Error('StoreLoanReApplication: Transaction ID (loanApplicationKey) is empty');
        }

        // 4. 上链：将 loanApplication 信息存储到状态数据库中
        try {
            await ctx.stub.putState(loanApplicationKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreLoanReApplication', Buffer.from(JSON.stringify(loanReApplicationEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreLoanReApplication: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreLoanReApplication:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 借款申请
    async StoreBorrowApplication(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreBorrowApplication: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(BorrowApplicationSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(BorrowApplication, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreBorrowApplication: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const borrowApplicationEvent = {
        //     method_name: 'StoreBorrowApplication',
        // };

        // 获取交易哈希作为存储的 key
        const borrowApplicationKey = await ctx.stub.getTxID();

        if (!borrowApplicationKey) {
            throw new Error('StoreBorrowApplication: Transaction ID (borrowApplicationKey) is empty');
        }

        // 4. 上链：将 borrowApplication 信息存储到状态数据库中
        try {
            await ctx.stub.putState(borrowApplicationKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreBorrowApplication', Buffer.from(JSON.stringify(borrowApplicationEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreBorrowApplication: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreBorrowApplication:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 借款审核
    async StoreBorrowApproval(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreBorrowApproval: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(BorrowApprovalSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(BorrowApproval, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreBorrowApproval: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const borrowApprovalEvent = {
        //     method_name: 'StoreBorrowApproval',
        // };

        // 获取交易哈希作为存储的 key
        const borrowApprovalKey = await ctx.stub.getTxID();

        if (!borrowApprovalKey) {
            throw new Error('StoreBorrowApproval: Transaction ID (borrowApprovalKey) is empty');
        }

        // 4. 上链：将 borrowApproval 信息存储到状态数据库中
        try {
            await ctx.stub.putState(borrowApprovalKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreBorrowApproval', Buffer.from(JSON.stringify(borrowApprovalEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreBorrowApproval: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreBorrowApproval:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 还款单生成
    async StoreRepaymentOrder(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRepaymentOrder: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RepaymentOrderSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RepaymentOrder, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRepaymentOrder: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const repaymentOrderEvent = {
        //     method_name: 'StoreRepaymentOrder',
        // };

        // 获取交易哈希作为存储的 key
        const repaymentOrderKey = await ctx.stub.getTxID();

        if (!repaymentOrderKey) {
            throw new Error('StoreRepaymentOrder: Transaction ID (repaymentOrderKey) is empty');
        }

        // 4. 上链：将 repaymentOrder 信息存储到状态数据库中
        try {
            await ctx.stub.putState(repaymentOrderKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreRepaymentOrder', Buffer.from(JSON.stringify(repaymentOrderEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRepaymentOrder: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRepaymentOrder:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 还款申请
    async StoreRepaymentApplication(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRepaymentApplication: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RepaymentApplicationSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RepaymentApplication, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRepaymentApplication: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const repaymentApplicationEvent = {
        //     method_name: 'StoreRepaymentApplication',
        // };

        // 获取交易哈希作为存储的 key
        const repaymentApplicationKey = await ctx.stub.getTxID();

        if (!repaymentApplicationKey) {
            throw new Error('StoreRepaymentApplication: Transaction ID (repaymentApplicationKey) is empty');
        }

        // 4. 上链：将 repaymentApplication 信息存储到状态数据库中
        try {
            await ctx.stub.putState(repaymentApplicationKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreRepaymentApplication', Buffer.from(JSON.stringify(repaymentApplicationEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRepaymentApplication: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRepaymentApplication:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 还款审核（通过）
    async StoreRepaymentApproval(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRepaymentApproval: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RepaymentApprovalSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RepaymentApproval, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRepaymentApproval: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const repaymentApprovalEvent = {
        //     method_name: 'StoreRepaymentApproval',
        // };

        // 获取交易哈希作为存储的 key
        const repaymentApprovalKey = await ctx.stub.getTxID();

        if (!repaymentApprovalKey) {
            throw new Error('StoreRepaymentApproval: Transaction ID (repaymentApprovalKey) is empty');
        }

        // 4. 上链：将 repaymentApproval 信息存储到状态数据库中
        try {
            await ctx.stub.putState(repaymentApprovalKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreRepaymentApproval', Buffer.from(JSON.stringify(repaymentApprovalEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRepaymentApproval: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRepaymentApproval:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 还款审核（不通过）
    async StoreRepaymentApprovalFailed(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRepaymentApprovalFailed: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RepaymentApprovalFailedSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RepaymentApprovalFailed, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRepaymentApprovalFailed: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const repaymentApprovalFailedEvent = {
        //     method_name: 'StoreRepaymentApprovalFailed',
        // };

        // 获取交易哈希作为存储的 key
        const repaymentApprovalFailedKey = await ctx.stub.getTxID();

        if (!repaymentApprovalFailedKey) {
            throw new Error('StoreRepaymentApprovalFailed: Transaction ID (repaymentApprovalFailedKey) is empty');
        }

        // 4. 上链：将 repaymentApprovalFailed 信息存储到状态数据库中
        try {
            await ctx.stub.putState(repaymentApprovalFailedKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreRepaymentApprovalFailed', Buffer.from(JSON.stringify(repaymentApprovalFailedEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRepaymentApprovalFailed: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRepaymentApprovalFailed:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // 再次进行申请还款
    async StoreReRepaymentApplication(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRepaymentApplication: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RepaymentApplicationSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RepaymentApplication, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRepaymentApplication: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 打印对应的事件
        // const repaymentApplicationEvent = {
        //     method_name: 'StoreRepaymentApplication',
        // };

        // 获取交易哈希作为存储的 key
        const repaymentApplicationKey = await ctx.stub.getTxID();

        if (!repaymentApplicationKey) {
            throw new Error('StoreRepaymentApplication: Transaction ID (repaymentApplicationKey) is empty');
        }

        // 4. 上链：将 repaymentApplication 信息存储到状态数据库中
        try {
            await ctx.stub.putState(repaymentApplicationKey, Buffer.from(JSON.stringify(dataInfoObj)));
            // ctx.stub.setEvent('StoreRepaymentApplication', Buffer.from(JSON.stringify(repaymentApplicationEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRepaymentApplication: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRepaymentApplication:', dataInfoObj);
        // 5. 返回值
        return true;
    }

    // ================== Public Functions ==========================
    async StoreData(ctx, dataInfo, schema, defaultObj, methodName) {
        // 1. 检查权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析和验证数据
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `${methodName}: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(schema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(defaultObj, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `${methodName}: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 生成存储 Key
        const txID = await ctx.stub.getTxID();
        if (!txID) {
            throw new Error(`${methodName}: Transaction ID (txID) is empty`);
        }

        // 4. 上链存储
        try {
            await ctx.stub.putState(txID, Buffer.from(JSON.stringify(dataInfoObj)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `${methodName}: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 5. 记录日志并返回
        this.Debug.logDebug(`${methodName}:`, dataInfoObj);
        return true;
    }

    // // 企业信用评级结果
    // async StoreCreditRating(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, CreditRatingSchema, CreditRating, 'StoreCreditRating');
    // }

    // // 贷款申请
    // async StoreLoanApplication(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, LoanApplicationSchema, LoanApplication, 'StoreLoanApplication');
    // }

    // // 贷款审核(通过)
    // async StoreLoanApproval(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, LoanApprovalSchema, LoanApproval, 'StoreLoanApproval');
    // }

    // // 贷款审核(不通过)
    // async StoreLoanApprovalFailed(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, LoanApprovalFailedSchema, LoanApprovalFailed, 'StoreLoanApprovalFailed');
    // }

    // // 再次申请贷款
    // async StoreLoanReApplication(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, LoanApplicationSchema, LoanApplication, 'StoreLoanReApplication');
    // }

    // // 借款申请
    // async StoreBorrowApplication(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, BorrowApplicationSchema, BorrowApplication, 'StoreBorrowApplication');
    // }

    // // 借款审核
    // async StoreBorrowApproval(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, BorrowApprovalSchema, BorrowApproval, 'StoreBorrowApproval');
    // }

    // // 还款单生成
    // async StoreRepaymentOrder(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RepaymentOrderSchema, RepaymentOrder, 'StoreRepaymentOrder');
    // }

    // // 还款申请
    // async StoreRepaymentApplication(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RepaymentApplicationSchema, RepaymentApplication, 'StoreRepaymentApplication');
    // }

    // // 还款审核（通过）
    // async StoreRepaymentApproval(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RepaymentApprovalSchema, RepaymentApproval, 'StoreRepaymentApproval');
    // }

    // // 还款审核（不通过）
    // async StoreRepaymentApprovalFailed(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RepaymentApprovalFailedSchema, RepaymentApprovalFailed, 'StoreRepaymentApprovalFailed');
    // }

    // // 再次进行申请还款
    // async StoreReRepaymentApplication(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RepaymentApplicationSchema, RepaymentApplication, 'StoreReRepaymentApplication');
    // }

    // ================== Test ==========================
    async TestCouchDB(ctx, projectId, to, balance) {
        // 获取交易哈希作为存储的 key
        // const key = await ctx.stub.getTxID();

        const dataInfoObj = {
            projectId,
            to,
            balance,
        };

        try {
            await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(dataInfoObj)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreInstrument: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    async QueryCouchDB(ctx, projectId) {
        // 确保 projectId 参数存在
        if (!projectId) {
            throw new Error('Project ID must be provided for querying.');
        }

        try {
            // 从状态数据库获取数据
            const dataBytes = await ctx.stub.getState(projectId);

            // 检查数据是否存在
            if (!dataBytes || dataBytes.length === 0) {
                throw new Error(`No data found for Project ID: ${projectId}`);
            }

            // 将字节数据解析为 JSON 对象并返回
            const dataInfoObj = JSON.parse(dataBytes.toString());
            return dataInfoObj;
        } catch (error) {
            throw new Error(`QueryCouchDB: Failed to retrieve data for Project ID ${projectId}. Error: ${error.message}`);
            // throw new Error('Project ID must be provided 您上传没啊 for querying.');
        }
    }

    // 测试是否可以正常 ASCII 码排序
    async StoreAAA(dataInfo) {
        const result = await this.Verify.sortASCII(dataInfo);
        // console.log('Result from sortASCII:', result);
        return result;
    }
}

module.exports = main;