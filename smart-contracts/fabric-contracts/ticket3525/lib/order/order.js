/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ticket = require('../ticket/ticket');
const permission = require('../utils/permission');
const verify = require('../utils/verify');
const debug = require('../utils/debug');
const errorObj = require('../utils/error');
const { nftPrefix, orderIdPrefix, PURCHASE_ORDER, REFUND_ORDER, Ticket_REFUND, AVAILABLE_RATIO, contractCode, nftBasicInfoKey, nftPriceInfoKey, nftCheckDataKey, nftTicketDataKey, nftStockKey, uuidPrefix } = require('../const/constants');
const { tickets } = require('../const/ticketFields');
const { OrderInfoSchema, DistributionOrderSchema, DistributeRefundSchema, OrderRefundSchema, ActiveInfoSchema } = require('../const/orderFields');
const _ = require('lodash');
const CryptoJS = require('crypto-js');
class order extends Contract {
    constructor() {
        super();
        this.Ticket = new ticket();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.ErrorObj = new errorObj();
    }

    /**
     * Distribution processes the transfer of tickets and updates order information.
     *
     * @param {Context} ctx the transaction context
     * @param {String} transferDetails details of the transfer operations
     * @param {String} orderData order data associated with the transfer
     * @param {String} orderType the type of the order (e.g., 'Purchase', 'Refund')
     * @param {String} triggerTime the time when the distribution is triggered
     * @returns {Boolean} returns true if the distribution process is successful
     */
    async distribution(ctx, transferDetails, orderData, orderType, triggerTime, uuid) {
        // ================== Identity and parameter verification ==========================
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ transferDetails, orderData, orderType, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let orderDataObj;
        try {
            orderDataObj = JSON.parse(orderData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `distribution: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(orderDataObj, 'orderData object');

        let orderId;
        let keysToWrite = [];
        // ================== B-side - order on-chain ==========================
        if (orderType === PURCHASE_ORDER) {
            // this.Verify.validateStructure(orderDataObj, DistributionOrderInfo);
            this.Verify.validateData(DistributionOrderSchema, orderDataObj);

            const { order_group_id } = orderDataObj;
            this.Verify.checkFieldsNotEmpty({ order_group_id });
            const exists = await this._orderExists(ctx, order_group_id);
            if (exists) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `distribution: The order ${order_group_id} is already stored`
                );
            }

            // There is no need to sort the order of all orders
            // orderDataObjs = await this.Verify.mergeDeep(DistributionOrderInfo, orderDataObj);

            if (orderDataObj.user_phone && orderDataObj.user_phone !=='') {
                orderDataObj.user_phone = CryptoJS.SHA256(orderDataObj.user_phone).toString(CryptoJS.enc.Hex);
            }

            const orderKey = orderIdPrefix + order_group_id;
            keysToWrite.push({ key: orderKey, data: orderDataObj });
            orderId = order_group_id;
        }
        if (orderType === REFUND_ORDER) {
            // this.Verify.validateStructure(orderDataObj, DistributeRefundInfo);
            this.Verify.validateData(DistributeRefundSchema, orderDataObj);

            const { orderRefund } = orderDataObj;
            if (!Array.isArray(orderRefund) || orderRefund.length === 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    'distribution: The orderRefund must be a non-empty array'
                );
            }

            for (const refund of orderRefund) {
                const { refund_id } = refund;
                this.Verify.checkFieldsNotEmpty({ refund_id });
                const exists = await this._orderExists(ctx, refund_id);
                if (exists) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.conflict,
                        `distribution: The order ${refund_id} is already stored`
                    );
                }

                const orderKey = orderIdPrefix + refund_id;
                keysToWrite.push({ key: orderKey, data: orderDataObj });
            }
        }

        // let nftUpdates = [];
        let distributionOrderEvents = [];
        let distributionRefundEvents = [];
        // ================== B-side transaction-ticket ==========================
        let transferDetailsObj;
        try {
            transferDetailsObj = JSON.parse(transferDetails);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `distribution: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(transferDetailsObj, 'transferDetails object');
        this.Verify.validateArray(transferDetailsObj, 'transferDetailsObj');
        for (const detail of transferDetailsObj) {
            const { sender_stock_id, receive_stock_id, sender, receive, amount, available_ratio } = detail;
            this.Verify.checkFieldsNotEmpty({ sender_stock_id, sender, receive_stock_id, receive, amount });

            const nft = await this.Ticket.readNFT(ctx, sender_stock_id);
            const owner = nft.owner;
            if (owner !== sender) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notOwner,
                    `distribution: The sender is not the current owner.${owner} === ${sender}`
                );
            }

            const transferAmount = parseInt(amount);
            // If available_ratio exists, it is the exchange's
            let effectiveBalance;
            if (available_ratio && available_ratio !== AVAILABLE_RATIO) {
                const ratio = parseFloat(available_ratio);
                effectiveBalance = Math.ceil(transferAmount * ratio);
            } else {
                effectiveBalance = transferAmount;
            }

            // nftUpdates.push({ key: nftPrefix + sender_stock_id, data: nft });

            let existingNft;
            try {
                // 从链上读取数据
                existingNft = await this.Ticket.readNFT(ctx, receive_stock_id);
            } catch (error) {
                existingNft = null;
            }

            // 先把这个出票信息读出来,因为如果存在也需要用到状态字段
            const ticketData = await this.Ticket.readNFT(ctx, sender_stock_id, nftTicketDataKey);

            let existingNftTicketData;
            // TODO：逻辑优化，注意这两个判断中都有 关于交易所的判断，根据读出来的nft信息判断是否为交易所门票，优化逻辑
            if (existingNft) {
                // 如果存在读取它的出票信息
                existingNftTicketData = await this.Ticket.readNFT(ctx, receive_stock_id, nftTicketDataKey);
                // nftUpdates.push({ key: nftPrefix + receive_stock_id, data: existingNft });
            } else {
                // 继续读取这个库存的其他信息
                const basicInfo = await this.Ticket.readNFT(ctx, sender_stock_id, nftBasicInfoKey);
                const priceInfo = await this.Ticket.readNFT(ctx, sender_stock_id, nftPriceInfoKey);
                const checkData = await this.Ticket.readNFT(ctx, sender_stock_id, nftCheckDataKey);
                // const stockInfo = await this.Ticket.readNFT(ctx, sender_stock_id, nftStockKey);
                let stockInfo;
                try {
                    stockInfo = await this.Ticket.readNFT(ctx, sender_stock_id, nftStockKey);
                } catch (error) {
                    stockInfo = {};
                    if (basicInfo && basicInfo.SimpleTicket && basicInfo.SimpleTicket.TicketStock) {
                        const ticketStock = basicInfo.SimpleTicket.TicketStock;
                        stockInfo.purchase_begin_time = ticketStock.purchase_begin_time;
                        stockInfo.purchase_end_time = ticketStock.purchase_end_time;
                        stockInfo.stock_enter_begin_time = ticketStock.stock_enter_begin_time;
                        stockInfo.stock_enter_end_time = ticketStock.stock_enter_end_time;

                        delete basicInfo.SimpleTicket.TicketStock.purchase_begin_time;
                        delete basicInfo.SimpleTicket.TicketStock.purchase_end_time;
                        delete basicInfo.SimpleTicket.TicketStock.stock_enter_begin_time;
                        delete basicInfo.SimpleTicket.TicketStock.stock_enter_end_time;
                    } else {
                        stockInfo = tickets.slot.AdditionalInformation.StockInfo;
                    }
                    stockInfo = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.StockInfo, stockInfo);
                }

                await this.Ticket.mintSplit(ctx, receive_stock_id, receive, JSON.stringify(nft.slot), effectiveBalance.toString(), JSON.stringify(nft.metadata), JSON.stringify(basicInfo), JSON.stringify(priceInfo), JSON.stringify(checkData), JSON.stringify(ticketData), JSON.stringify(stockInfo));
                // nftUpdates.push({ key: nftPrefix + receive_stock_id, data: newNFT });
            }

            let ticketStatus = existingNft ? existingNftTicketData.status : ticketData.status;
            // event
            if (orderType === PURCHASE_ORDER) {
                for (const order of orderDataObj.orderTabDistributeData) {
                    const sender_id = order.seller_id.toString();
                    const receiver_id = order.buyer_id.toString();
                    this.Verify.checkFieldsNotEmpty({ sender_id, receiver_id });
                    distributionOrderEvents.push({
                        method_name: 'DistributionOrder',
                        sender_id: sender_id,
                        receiver_id: receiver_id,
                        order_id: orderId,
                        token_id: receive_stock_id,
                        stock_id: sender_stock_id,
                        ticket_status: ticketStatus,
                        trigger_time: parseInt(triggerTime),
                        uuid: uuid
                    });
                }
            }
            if (orderType === REFUND_ORDER) {
                const { orderRefund, orderRefundGroup } = orderDataObj;

                for (const refund of orderRefund) {
                    for (const group of orderRefundGroup) {
                        if (group.order_refund_id === refund.refund_id) {
                            const orders = await this.readOrder(ctx, group.order_group_id);

                            for (const order of orders.orderTabDistributeData) {
                                if (order.order_id === refund.order_id) {
                                    const sender_id = order.seller_id.toString();
                                    const buyer_id = order.buyer_id.toString();
                                    this.Verify.checkFieldsNotEmpty({ sender_id, buyer_id });
                                    distributionRefundEvents.push({
                                        method_name: 'DistributionRefund',
                                        sender_id: buyer_id,
                                        receiver_id: sender_id,
                                        refund_order_id: refund.refund_id,
                                        token_id: sender_stock_id,
                                        stock_id: receive_stock_id,
                                        ticket_status: ticketStatus,
                                        trigger_time: parseInt(triggerTime),
                                        uuid: uuid
                                    });
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        // ================== Writing to the blockchain ==========================
        try {
            for (const item of keysToWrite) {
                console.log('##item.data', item.data);
                await ctx.stub.putState(item.key, Buffer.from(JSON.stringify(item.data)));
            }
            // for (const nftUpdate of nftUpdates) {
            //     nftUpdate.data = this.Verify.mergeDeep(ticketSplit, nftUpdate.data);
            //     this.Debug.logDebug('write4_obj', nftUpdate.data);
            //     this.Debug.logDebug('write5_string', JSON.stringify(nftUpdate.data));
            //     this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(nftUpdate.data)));
            //     await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
            // }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            if (distributionOrderEvents.length > 0) {
                ctx.stub.setEvent('DistributionOrder', Buffer.from(JSON.stringify(distributionOrderEvents)));
            }
            if (distributionRefundEvents.length > 0) {
                ctx.stub.setEvent('DistributionRefund', Buffer.from(JSON.stringify(distributionRefundEvents)));
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `distribution: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * StoreOrder stores order data on the blockchain and triggers corresponding events.
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderData order data to be stored
     * @param {String} triggerTime the time when the order is triggered
     * @returns {Boolean} returns true if the order storage process is successful
     */
    async storeOrder(ctx, orderData, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ orderData, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let orderDataObj;
        try {
            orderDataObj = JSON.parse(orderData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `storeOrder: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(orderDataObj, 'orderData object');

        // Verify data type
        // this.Verify.validateStructure(orderDataObj, OrderInfo);
        this.Verify.validateData(OrderInfoSchema, orderDataObj);
        this.Verify.validateArray(orderDataObj.OrderTab, 'orderDataObj.OrderTab');

        // About order operations
        const orderGroupId = orderDataObj.order_group_id;
        this.Verify.checkFieldsNotEmpty({ orderGroupId });
        const exists = await this._orderExists(ctx, orderGroupId);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `storeOrder: The order ${orderGroupId} is already stored`
            );
        }

        if (orderDataObj.user_phone && orderDataObj.user_phone !== '') {
            orderDataObj.user_phone = CryptoJS.SHA256(orderDataObj.user_phone).toString(CryptoJS.enc.Hex);
        }

        // Loop printing events
        const storeOrderEvent = {
            method_name: 'StoreOrder',
            trigger_time: parseInt(triggerTime),
            uuid: uuid
        };

        // Make sure there are no problems with the previous operations before writing to the blockchain
        const orderKey = orderIdPrefix + orderGroupId;
        const uuidKey = uuidPrefix + uuid;

        console.log('###orderDataObj', orderDataObj);
        try {
            await ctx.stub.putState(orderKey, Buffer.from(JSON.stringify(orderDataObj)));
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            ctx.stub.setEvent('StoreOrder', Buffer.from(JSON.stringify(storeOrderEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `storeOrder: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * StoreRefund processes and stores refund information on the blockchain, updating ticket balances and triggering events.
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderData refund order data to be stored
     * @param {String} triggerTime the time when the refund is triggered
     * @returns {Boolean} returns true if the refund storage process is successful
     */
    async storeRefund(ctx, orderData, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ orderData, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let orderDataObj;
        try {
            orderDataObj = JSON.parse(orderData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `storeRefund: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(orderDataObj, 'orderData object');
        // this.Verify.validateStructure(orderDataObj, OrderRefundInfoToC);
        this.Verify.validateData(OrderRefundSchema, orderDataObj);
        this.Verify.validateArray(orderDataObj.refundProductTicketToC, 'orderDataObj.refundProductTicketToC');

        // About order operations
        const { refund_id } = orderDataObj.refundInfoToC;
        this.Verify.checkFieldsNotEmpty({ refund_id });
        const exists = await this._orderExists(ctx, refund_id);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `storeRefund: The order ${refund_id} is already stored`
            );
        }

        let nftUpdates = [];
        let distributionEvents = [];
        // Process each ticket
        for (const ticket of orderDataObj.refundProductTicketToC) {
            const { ticket_number } = ticket;
            this.Verify.checkFieldsNotEmpty({ ticket_number });
            const nft = await this.Ticket.readNFT(ctx, ticket_number);
            let nftCheckData = await this.Ticket.readNFT(ctx, ticket_number, nftCheckDataKey);
            let nftTicketData = await this.Ticket.readNFT(ctx, ticket_number, nftTicketDataKey);

            // Update ticket status to "refundable"
            nftTicketData = _.cloneDeep(tickets.slot.AdditionalInformation.TicketData);
            nftTicketData.status = Ticket_REFUND;
            nftCheckData = [];
            const ticketStatus = nftTicketData.status;

            // Store updated NFT
            const nftKey = nftPrefix + ticket_number;
            const CheckDataKey = nftKey + nftCheckDataKey;
            const TicketDataKey = nftKey + nftTicketDataKey;
            nftUpdates.push({ key: nftKey, data: nft });
            nftUpdates.push({ key: CheckDataKey, data: nftCheckData });
            nftUpdates.push({ key: TicketDataKey, data: nftTicketData });

            // Emit event
            const { order_group_id, order_id } = orderDataObj.refundInfoToC;
            const orders = await this.readOrder(ctx, order_group_id);
            this.Verify.validateArray(orders.OrderTab, 'orders.OrderTab');
            for (const order of orders.OrderTab) {
                // If order_id does not match, continue with the next loop
                if (order.order_id !== order_id) {
                    continue;
                }
                const receiver_id = order.seller_id.toString();
                const sender_id = order.user_id;
                this.Verify.checkFieldsNotEmpty({receiver_id, sender_id});
                this.Verify.validateArray(nft.stockBatchNumber, 'nft.stockBatchNumber');
                for (const batch of nft.stockBatchNumber) {
                    const storeRefundEvent = {
                        method_name: 'StoreRefund',
                        sender_id: sender_id,
                        receiver_id: receiver_id,
                        refund_order_id: refund_id,
                        token_id: ticket_number,
                        stock_id: batch.stock_batch_number,
                        ticket_status: ticketStatus,
                        trigger_time: parseInt(triggerTime),
                        uuid: uuid
                    };
                    distributionEvents.push(storeRefundEvent);
                }
                // Now that the matching order_id has been found and the relevant operations have been completed, you can exit the outer loop
                break;
            }
        }

        if (orderDataObj.refundProductTicketToC && Array.isArray(orderDataObj.refundProductTicketToC)) {
            for (let i = 0; i < orderDataObj.refundProductTicketToC.length; i++) {
                const Info = orderDataObj.refundProductTicketToC[i];

                if (Info.name && Info.name !== '') {
                    Info.name = CryptoJS.SHA256(Info.name).toString(CryptoJS.enc.Hex);
                } else {
                    Info.name = '';
                }

                // Encrypt id_number if exists
                if (Info.identity && Info.identity !== '') {
                    Info.identity = CryptoJS.SHA256(Info.identity).toString(CryptoJS.enc.Hex);
                } else {
                    Info.identity = '';
                }
            }
        }

        // Write all NFT updates to the ledger
        try {
            for (const nftUpdate of nftUpdates) {
                this.Debug.logDebug('write4_obj', nftUpdate.key);
                this.Debug.logDebug('write4_obj', nftUpdate.data);
                // this.Debug.logDebug('write5_string', JSON.stringify(nftUpdate.data));
                // this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(nftUpdate.data)));
                await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
            }
            if (distributionEvents.length > 0) {
                // Trigger all distribution events
                ctx.stub.setEvent('StoreRefund', Buffer.from(JSON.stringify(distributionEvents)));
            }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            // Store order on the blockchain
            const orderKey = orderIdPrefix + refund_id;
            this.Debug.logDebug('###orderDataObj', orderDataObj);
            await ctx.stub.putState(orderKey, Buffer.from(JSON.stringify(orderDataObj)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `storeRefund: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * Reads an order from the blockchain ledger based on orderId.
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderId the ID of the order to retrieve
     * @returns {Object} returns the order object if found
     * @throws {Error} throws an error if the order with orderId does not exist
     */
    async readOrder(ctx, orderId) {
        const orderKey = orderIdPrefix + orderId;
        const orderBytes = await ctx.stub.getState(orderKey);
        if (!orderBytes || orderBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readOrder: Order with ID ${orderId} does not exist`
            );
        }

        return JSON.parse(orderBytes.toString());
    }

    /**
     * Checks if an order with the specified orderId exists in the blockchain ledger.
     *
     * @param {Context} ctx the transaction context
     * @param {String} orderId the ID of the order to check existence
     * @returns {Boolean} returns true if the order exists, false otherwise
     */
    async _orderExists(ctx, orderId) {
        const orderKey = orderIdPrefix + orderId;
        const orderBytes = await ctx.stub.getState(orderKey);
        return orderBytes && orderBytes.length > 0;
    }

    /**
     * activateTickets activates tickets based on provided information.
     * It processes multiple ticket activation requests, updates balances,
     * and stores necessary states and events.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} activeInfo JSON string containing activation information.
     * @param {Number} triggerTime The trigger time for activation.
     * @returns {Boolean} Returns true if activation is successful.
     * @throws {Error} Throws error if any validation fails or operation encounters an error.
     */
    async activateTickets(ctx, activeInfo, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ activeInfo, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let activeInfoObj;
        try {
            activeInfoObj = JSON.parse(activeInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `activateTickets: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(activeInfoObj, 'activeInfo object');
        this.Verify.validateArray(activeInfoObj, 'activeInfoObj');

        const events = [];
        const tradeUpdates = [];

        for (const info of activeInfoObj) {
            // this.Verify.validateStructure(info, ActiveInfo);
            this.Verify.validateData(ActiveInfoSchema, info);

            const { order_id, batch_id, token_id, available_total_num, periods, total_periods, trade_no, amount, total_repayment } = info;

            // Check required fields
            const requiredFields = { order_id, batch_id, token_id, available_total_num, periods, total_periods, trade_no, amount, total_repayment };
            this.Verify.checkFieldsNotEmpty(requiredFields);

            // Check if the key already exists
            const keyExists = await this._keyExists(ctx, trade_no);
            if (keyExists) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `activateTickets: Key ${trade_no} already exists`
                );
            }

            tradeUpdates.push({ key: trade_no, value: info });

            const activateTicketsEvent = {
                method_name: 'ActivateTickets',
                order_id,
                batch_id,
                token_id,
                available_total_num,
                periods,
                total_periods,
                trade_no,
                amount,
                total_repayment,
                trigger_time: parseInt(triggerTime),
                uuid: uuid
            };

            events.push(activateTicketsEvent); // Add events to the array
        }

        try {
            for (const trade of tradeUpdates) {
                await ctx.stub.putState(trade.key, Buffer.from(JSON.stringify(trade.value)));
            }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            if (events.length > 0) {
                ctx.stub.setEvent('ActivateTickets', Buffer.from(JSON.stringify(events)));
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `activateTickets: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * _keyExists checks if a key exists in the ledger.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} key The key to check existence for.
     * @returns {Boolean} Returns true if the key exists, false otherwise.
     */
    async _keyExists(ctx, key) {
        const dataBuffer = await ctx.stub.getState(key);
        return !!dataBuffer && dataBuffer.length > 0;
    }

}

module.exports = order;