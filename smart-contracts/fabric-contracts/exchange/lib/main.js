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
const { ProjectBidding, ProjectBiddingSchema, InstrumentTicket, InstrumentTicketSchema, MarginOrder, MarginOrderSchema, MarginPayment, MarginPaymentSchema, InstrumentOrder, InstrumentOrderSchema, ConvertToInvoice, ConvertToInvoiceSchema, RefundBalance, RefundBalanceSchema, FullRefund, FullRefundSchema, TradeCharge, TradeChargeSchema } = require('../lib/const/exchange');
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

    // 公告信息上链
    async StoreProjectBidding(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreProjectBidding: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(ProjectBiddingSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(ProjectBidding, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreProjectBidding: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const projectBiddingEvent = {
            method_name: 'StoreProjectBidding',
            project_id: dataInfoObj.project_id,
            project_name: dataInfoObj.project_name,
            project_status: dataInfoObj.project_status,
            review_time: dataInfoObj.review_time,
            node_description: dataInfoObj.node_description,
            project_chain_unique_id : dataInfoObj.project_chain_unique_id
        };

        this.Debug.logDebug('projectBiddingEvent:', projectBiddingEvent);

        // 获取交易哈希作为存储的 key
        const projectBiddingKey = await ctx.stub.getTxID();

        if (!projectBiddingKey) {
            throw new Error('StoreProjectBidding: Transaction ID (projectBiddingKey) is empty');
        }

        // 4. 上链：将 ProjectBidding 信息存储到状态数据库中
        try {
            await ctx.stub.putState(projectBiddingKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreProjectBidding', Buffer.from(JSON.stringify(projectBiddingEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreProjectBidding: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreProjectBidding:', dataInfoObj);
        // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
        // 5. 返回值
        return true;
    }

    // 标的信息上链
    async StoreInstrument(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreInstrument: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(InstrumentTicketSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(InstrumentTicket, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreInstrument: mergeDeep failed: ${error.message}`
            );
        }

        // // 3. 检查之前必须是上链公告了，才可以上链标的
        // const targetProjectId = dataInfoObj.instrument.project_id;
        // const exists = await this.Query.QueryProjectIdExists(ctx, targetProjectId);
        // if (!exists) {
        //     throw this.ErrorObj.createError(
        //         contractCode.businessError.conflict,
        //         `StoreInstrument: ProjectBidding project_id ${targetProjectId} not yet on the chain`
        //     );
        // }

        // 4. 打印对应的事件
        const instrumentEvent = {
            method_name: 'StoreInstrument',
            instrument_id: dataInfoObj.instrument.instrument_id,
            instrument_name: dataInfoObj.instrument.instrument_name,
            project_id: dataInfoObj.instrument.project_id,
            project_chain_unique_id : dataInfoObj.project_chain_unique_id ,
        };

        this.Debug.logDebug('instrumentEvent:', instrumentEvent);

        // 获取交易哈希作为存储的 key
        const instrumentKey = await ctx.stub.getTxID();

        if (!instrumentKey) {
            throw new Error('StoreInstrument: Transaction ID (instrumentKey) is empty');
        }

        // 5. 上链：将 ProjectBidding 信息存储到状态数据库中
        try {
            await ctx.stub.putState(instrumentKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreInstrument', Buffer.from(JSON.stringify(instrumentEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreInstrument: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreInstrument:', dataInfoObj);
        // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
        // 6. 返回值
        return true;
    }

    // 保证金订单上链
    async StoreMarginOrder(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreMarginOrder: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(MarginOrderSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(MarginOrder, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreMarginOrder: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const marginOrderEvent = {
            method_name: 'StoreMarginOrder',
            // ..........
        };

        // 获取交易哈希作为存储的 key
        const marginOrderKey = await ctx.stub.getTxID();

        if (!marginOrderKey) {
            throw new Error('StoreMarginOrder: Transaction ID (marginOrderKey) is empty');
        }

        // 4. 上链：将 MarginOrder 信息存储到状态数据库中
        try {
            await ctx.stub.putState(marginOrderKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreMarginOrder', Buffer.from(JSON.stringify(marginOrderEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreMarginOrder: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // // 返回存储成功的信息
        this.Debug.logDebug('StoreMarginOrder:', dataInfoObj);
        // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
        // 5. 返回值
        return true;
    }

    // 保证金支付上链
    async StoreMarginPayment(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreMarginPayment: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(MarginPaymentSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(MarginPayment, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreMarginPayment: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const marginPaymentEvent = {
            method_name: 'StoreMarginPayment',
            // ..........
        };

        // 获取交易哈希作为存储的 key
        const marginPaymentKey = await ctx.stub.getTxID();

        if (!marginPaymentKey) {
            throw new Error('StoreMarginPayment: Transaction ID (marginPaymentKey) is empty');
        }

        // 4. 上链：将 MarginPayment 信息存储到状态数据库中
        try {
            await ctx.stub.putState(marginPaymentKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreMarginPayment', Buffer.from(JSON.stringify(marginPaymentEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreMarginPayment: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // // 返回存储成功的信息
        this.Debug.logDebug('StoreMarginPayment:', dataInfoObj);
        // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
        // 5. 返回值
        return true;
    }

    // 竞拍摘牌订单上链
    async StoreInstrumentOrder(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreInstrumentOrder: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(InstrumentOrderSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(InstrumentOrder, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreInstrumentOrder: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const instrumentOrderEvent = {
            method_name: 'StoreInstrumentOrder',
            trade_id: dataInfoObj.trade_id,
            trade_type: dataInfoObj.trade_status,
            create_time: dataInfoObj.create_time
        };

        // 获取交易哈希作为存储的 key
        const instrumentOrderKey = await ctx.stub.getTxID();

        if (!instrumentOrderKey) {
            throw new Error('StoreInstrumentOrder: Transaction ID (instrumentOrderKey) is empty');
        }

        // 4. 上链：将 InstrumentOrder 信息存储到状态数据库中
        try {
            await ctx.stub.putState(instrumentOrderKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreInstrumentOrder', Buffer.from(JSON.stringify(instrumentOrderEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreInstrumentOrder: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // // 返回存储成功的信息
        this.Debug.logDebug('StoreInstrumentOrder:', dataInfoObj);
        this.Debug.logDebug('instrumentOrderEvent:', instrumentOrderEvent);
        // 5. 返回值
        return true;
    }

    // 保证金转为价款信息上链
    async StoreConvertToInvoice(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreConvertToInvoice: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(ConvertToInvoiceSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(ConvertToInvoice, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreConvertToInvoice: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const convertToInvoiceEvent = {
            method_name: 'StoreConvertToInvoice',
            // ..........
        };

        // 获取交易哈希作为存储的 key
        const convertToInvoiceKey = await ctx.stub.getTxID();

        if (!convertToInvoiceKey) {
            throw new Error('StoreConvertToInvoice: Transaction ID (convertToInvoiceKey) is empty');
        }

        // 4. 上链：将 ConvertToInvoice 信息存储到状态数据库中
        try {
            await ctx.stub.putState(convertToInvoiceKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreConvertToInvoice', Buffer.from(JSON.stringify(convertToInvoiceEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreConvertToInvoice: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreConvertToInvoice:', dataInfoObj);
        return true;
    }

    // 保证金余款自动退回信息上链
    async StoreRefundBalance(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreRefundBalance: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(RefundBalanceSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(RefundBalance, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreRefundBalance: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const refundBalanceEvent = {
            method_name: 'StoreRefundBalance',
            // ..........
        };

        // 获取交易哈希作为存储的 key
        const refundBalanceKey = await ctx.stub.getTxID();

        if (!refundBalanceKey) {
            throw new Error('StoreRefundBalance: Transaction ID (refundBalanceKey) is empty');
        }

        // 4. 上链：将 RefundBalance 信息存储到状态数据库中
        try {
            await ctx.stub.putState(refundBalanceKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreRefundBalance', Buffer.from(JSON.stringify(refundBalanceEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreRefundBalance: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreRefundBalance:', dataInfoObj);
        return true;
    }

    // 保证金全额自动退回信息上链
    async StoreFullRefund(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreFullRefund: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(FullRefundSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(FullRefund, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreFullRefund: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const fullRefundEvent = {
            method_name: 'StoreFullRefund',
            // ..........
        };

        // 获取交易哈希作为存储的 key
        const fullRefundKey = await ctx.stub.getTxID();

        if (!fullRefundKey) {
            throw new Error('StoreFullRefund: Transaction ID (fullRefundKey) is empty');
        }

        // 4. 上链：将 FullRefund 信息存储到状态数据库中
        try {
            await ctx.stub.putState(fullRefundKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreFullRefund', Buffer.from(JSON.stringify(fullRefundEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreFullRefund: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreFullRefund:', dataInfoObj);
        return true;
    }

    // 交易服务费订单信息上链
    async StoreTradeCharge(ctx, dataInfo) {
        // 1. 首先检查admin的权限
        await this.Permission.checkAdminAndGetUserID(ctx);

        // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
        let dataInfoObj;
        try {
            dataInfoObj = JSON.parse(dataInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `StoreTradeCharge: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
        this.Verify.validateData(TradeChargeSchema, dataInfoObj);

        try {
            dataInfoObj = this.Verify.mergeDeep(TradeCharge, dataInfoObj);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `StoreTradeCharge: mergeDeep failed: ${error.message}`
            );
        }

        // 3. 打印对应的事件
        const tradeChargeEvent = {
            method_name: 'StoreTradeCharge',
            trade_id: dataInfoObj.trade_charge_id,
            create_time: dataInfoObj.submit_time,
            trade_type: dataInfoObj.payment_status
        };

        // 获取交易哈希作为存储的 key
        const tradeChargeKey = await ctx.stub.getTxID();

        if (!tradeChargeKey) {
            throw new Error('StoreTradeCharge: Transaction ID (tradeChargeKey) is empty');
        }

        // 4. 上链：将 TradeCharge 信息存储到状态数据库中
        try {
            await ctx.stub.putState(tradeChargeKey, Buffer.from(JSON.stringify(dataInfoObj)));
            ctx.stub.setEvent('StoreTradeCharge', Buffer.from(JSON.stringify(tradeChargeEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `StoreTradeCharge: Storing evidence state or setting event failed: ${error.message}`
            );
        }

        // 返回存储成功的信息
        this.Debug.logDebug('StoreTradeCharge:', dataInfoObj);
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

    // // 公告信息上链
    // async StoreProjectBidding(ctx, dataInfo) {
    //     // 1. 首先检查admin的权限
    //     await this.Permission.checkAdminAndGetUserID(ctx);

    //     // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
    //     let dataInfoObj;
    //     try {
    //         dataInfoObj = JSON.parse(dataInfo);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `StoreProjectBidding: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
    //     this.Verify.validateData(ProjectBiddingSchema, dataInfoObj);

    //     try {
    //         dataInfoObj = this.Verify.mergeDeep(ProjectBidding, dataInfoObj);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `StoreProjectBidding: mergeDeep failed: ${error.message}`
    //         );
    //     }

    //     // 3. 打印对应的事件
    //     const projectBiddingEvent = {
    //         method_name: 'StoreProjectBidding',
    //         project_id: dataInfoObj.project_id,
    //         project_name: dataInfoObj.project_name,
    //         project_status: dataInfoObj.project_status,
    //         review_time: dataInfoObj.review_time,
    //         node_description: dataInfoObj.node_description,
    //         project_chain_unique_id : dataInfoObj.project_chain_unique_id
    //     };

    //     this.Debug.logDebug('projectBiddingEvent:', projectBiddingEvent);

    //     // 获取交易哈希作为存储的 key
    //     const projectBiddingKey = await ctx.stub.getTxID();

    //     if (!projectBiddingKey) {
    //         throw new Error('StoreProjectBidding: Transaction ID (projectBiddingKey) is empty');
    //     }

    //     // 4. 上链：将 ProjectBidding 信息存储到状态数据库中
    //     try {
    //         await ctx.stub.putState(projectBiddingKey, Buffer.from(JSON.stringify(dataInfoObj)));
    //         ctx.stub.setEvent('StoreProjectBidding', Buffer.from(JSON.stringify(projectBiddingEvent)));
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.store,
    //             `StoreProjectBidding: Storing evidence state or setting event failed: ${error.message}`
    //         );
    //     }

    //     // 返回存储成功的信息
    //     this.Debug.logDebug('StoreProjectBidding:', dataInfoObj);
    //     // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
    //     // 5. 返回值
    //     return true;
    // }

    // // 标的信息上链
    // async StoreInstrument(ctx, dataInfo) {
    //     // 1. 首先检查admin的权限
    //     await this.Permission.checkAdminAndGetUserID(ctx);

    //     // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
    //     let dataInfoObj;
    //     try {
    //         dataInfoObj = JSON.parse(dataInfo);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `StoreInstrument: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
    //     this.Verify.validateData(InstrumentTicketSchema, dataInfoObj);

    //     try {
    //         dataInfoObj = this.Verify.mergeDeep(InstrumentTicket, dataInfoObj);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `StoreInstrument: mergeDeep failed: ${error.message}`
    //         );
    //     }

    //     // // 3. 检查之前必须是上链公告了，才可以上链标的
    //     // const targetProjectId = dataInfoObj.instrument.project_id;
    //     // const exists = await this.Query.QueryProjectIdExists(ctx, targetProjectId);
    //     // if (!exists) {
    //     //     throw this.ErrorObj.createError(
    //     //         contractCode.businessError.conflict,
    //     //         `StoreInstrument: ProjectBidding project_id ${targetProjectId} not yet on the chain`
    //     //     );
    //     // }

    //     // 4. 打印对应的事件
    //     const instrumentEvent = {
    //         method_name: 'StoreInstrument',
    //         instrument_id: dataInfoObj.instrument.instrument_id,
    //         instrument_name: dataInfoObj.instrument.instrument_name,
    //         project_id: dataInfoObj.instrument.project_id,
    //         project_chain_unique_id : dataInfoObj.project_chain_unique_id ,
    //     };

    //     this.Debug.logDebug('instrumentEvent:', instrumentEvent);

    //     // 获取交易哈希作为存储的 key
    //     const instrumentKey = await ctx.stub.getTxID();

    //     if (!instrumentKey) {
    //         throw new Error('StoreInstrument: Transaction ID (instrumentKey) is empty');
    //     }

    //     // 5. 上链：将 ProjectBidding 信息存储到状态数据库中
    //     try {
    //         await ctx.stub.putState(instrumentKey, Buffer.from(JSON.stringify(dataInfoObj)));
    //         ctx.stub.setEvent('StoreInstrument', Buffer.from(JSON.stringify(instrumentEvent)));
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.store,
    //             `StoreInstrument: Storing evidence state or setting event failed: ${error.message}`
    //         );
    //     }

    //     // 返回存储成功的信息
    //     this.Debug.logDebug('StoreInstrument:', dataInfoObj);
    //     // this.Debug.logDebug('evidenceEvent:', evidenceEvent);
    //     // 6. 返回值
    //     return true;
    // }

    // // 保证金订单上链
    // async StoreMarginOrder(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, MarginOrderSchema, MarginOrder, 'StoreMarginOrder');
    // }

    // // 保证金支付上链
    // async StoreMarginPayment(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, MarginPaymentSchema, MarginPayment, 'StoreMarginPayment');
    // }

    // // 竞拍摘牌订单上链
    // async StoreInstrumentOrder(ctx, dataInfo) {
    //     // 1. 首先检查admin的权限
    //     await this.Permission.checkAdminAndGetUserID(ctx);

    //     // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
    //     let dataInfoObj;
    //     try {
    //         dataInfoObj = JSON.parse(dataInfo);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `StoreInstrumentOrder: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
    //     this.Verify.validateData(InstrumentOrderSchema, dataInfoObj);

    //     try {
    //         dataInfoObj = this.Verify.mergeDeep(InstrumentOrder, dataInfoObj);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `StoreInstrumentOrder: mergeDeep failed: ${error.message}`
    //         );
    //     }

    //     // 3. 打印对应的事件
    //     const instrumentOrderEvent = {
    //         method_name: 'StoreInstrumentOrder',
    //         trade_id: dataInfoObj.trade_id,
    //         trade_type: dataInfoObj.trade_status,
    //         create_time: dataInfoObj.create_time
    //     };

    //     // 获取交易哈希作为存储的 key
    //     const instrumentOrderKey = await ctx.stub.getTxID();

    //     if (!instrumentOrderKey) {
    //         throw new Error('StoreInstrumentOrder: Transaction ID (instrumentOrderKey) is empty');
    //     }

    //     // 4. 上链：将 InstrumentOrder 信息存储到状态数据库中
    //     try {
    //         await ctx.stub.putState(instrumentOrderKey, Buffer.from(JSON.stringify(dataInfoObj)));
    //         ctx.stub.setEvent('StoreInstrumentOrder', Buffer.from(JSON.stringify(instrumentOrderEvent)));
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.store,
    //             `StoreInstrumentOrder: Storing evidence state or setting event failed: ${error.message}`
    //         );
    //     }

    //     // // 返回存储成功的信息
    //     this.Debug.logDebug('StoreInstrumentOrder:', dataInfoObj);
    //     this.Debug.logDebug('instrumentOrderEvent:', instrumentOrderEvent);
    //     // 5. 返回值
    //     return true;
    // }

    // // 保证金转为价款信息上链
    // async StoreConvertToInvoice(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, ConvertToInvoiceSchema, ConvertToInvoice, 'StoreConvertToInvoice');
    // }

    // // 保证金余款自动退回信息上链
    // async StoreRefundBalance(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, RefundBalanceSchema, RefundBalance, 'StoreRefundBalance');
    // }

    // // 保证金全额自动退回信息上链
    // async StoreFullRefund(ctx, dataInfo) {
    //     return this.StoreData(ctx, dataInfo, FullRefundSchema, FullRefund, 'StoreFullRefund');
    // }

    // // 交易服务费订单信息上链
    // async StoreTradeCharge(ctx, dataInfo) {
    //     // 1. 首先检查admin的权限
    //     await this.Permission.checkAdminAndGetUserID(ctx);

    //     // 2. 解析传递的上链对象的结构，验证dataInfo是否符合schema
    //     let dataInfoObj;
    //     try {
    //         dataInfoObj = JSON.parse(dataInfo);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `StoreTradeCharge: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(dataInfoObj, 'dataInfo object');
    //     this.Verify.validateData(TradeChargeSchema, dataInfoObj);

    //     try {
    //         dataInfoObj = this.Verify.mergeDeep(TradeCharge, dataInfoObj);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `StoreTradeCharge: mergeDeep failed: ${error.message}`
    //         );
    //     }

    //     // 3. 打印对应的事件
    //     const tradeChargeEvent = {
    //         method_name: 'StoreTradeCharge',
    //         trade_id: dataInfoObj.trade_charge_id,
    //         create_time: dataInfoObj.submit_time,
    //         trade_type: dataInfoObj.payment_status
    //     };

    //     // 获取交易哈希作为存储的 key
    //     const tradeChargeKey = await ctx.stub.getTxID();

    //     if (!tradeChargeKey) {
    //         throw new Error('StoreTradeCharge: Transaction ID (tradeChargeKey) is empty');
    //     }

    //     // 4. 上链：将 TradeCharge 信息存储到状态数据库中
    //     try {
    //         await ctx.stub.putState(tradeChargeKey, Buffer.from(JSON.stringify(dataInfoObj)));
    //         ctx.stub.setEvent('StoreTradeCharge', Buffer.from(JSON.stringify(tradeChargeEvent)));
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.store,
    //             `StoreTradeCharge: Storing evidence state or setting event failed: ${error.message}`
    //         );
    //     }

    //     // 返回存储成功的信息
    //     this.Debug.logDebug('StoreTradeCharge:', dataInfoObj);
    //     return true;
    // }

    // ================== Rich Query ==========================
    async QueryProjectIdExists(ctx, targetProjectId) {
        return this.Query.QueryProjectIdExists(ctx, targetProjectId);
    }

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
        }
    }


}

module.exports = main;