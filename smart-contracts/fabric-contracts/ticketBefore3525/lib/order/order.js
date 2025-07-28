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
const { nftPrefix, orderIdPrefix, PURCHASE_ORDER, REFUND_ORDER, Ticket_REFUND, AVAILABLE_RATIO, contractCode } = require('../const/constants');
const { tickets } = require('../const/ticketFields');
const { OrderInfo, OrderRefundInfoToC, DistributionOrderInfo, DistributeRefundInfo, ActiveInfo } = require('../const/orderFields');
const _ = require('lodash');

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
    async distribution(ctx, transferDetails, orderData, orderType, triggerTime) {
        // ================== Identity and parameter verification ==========================
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ transferDetails, orderData, orderType, triggerTime });
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
        let orderKeysToWrite = [];
        // ================== B-side - order on-chain ==========================
        if (orderType === PURCHASE_ORDER) {
            this.Verify.validateStructure(orderDataObj, DistributionOrderInfo);

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

            const orderKey = orderIdPrefix + order_group_id;
            orderKeysToWrite.push({ key: orderKey, data: orderDataObj });
            orderId = order_group_id;
        }
        if (orderType === REFUND_ORDER) {
            this.Verify.validateStructure(orderDataObj, DistributeRefundInfo);

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
                orderKeysToWrite.push({ key: orderKey, data: orderDataObj });
            }
        }

        let nftUpdates = [];
        let distributionOrderEvents = [];
        let distributionRefundEvents = [];
        // ================== B-side transaction-ticket circulation ==========================
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
            const { sender_stock_id, receive_stock_id, sender, receive, amount, available_ratio, available_total_num } = detail;

            this.Verify.checkFieldsNotEmpty({ receive_stock_id, receive, amount });
            const nft = await this.Ticket.readNFT(ctx, sender_stock_id);
            const owner = nft.owner;

            if (owner !== sender) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notOwner,
                    `distribution: The sender is not the current owner.${owner} === ${sender}`
                );
            }

            const nftBalance = parseInt(nft.balance);
            const nftTotalBalance = parseInt(nft.total_balance);
            const transferAmount = parseInt(amount);

            console.log('99999999999999999999999999999999999999');
            if (nftBalance < transferAmount) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `distribution: Insufficient balance for tokenId ${sender_stock_id}`
                );
            }
            console.log('99999999999999999999999999999999999999');

            if (nftTotalBalance < transferAmount) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `distribution: Insufficient total_balance for tokenId ${sender_stock_id}`
                );
            }

            if (transferAmount <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `distribution: Amount ${amount} must be greater than 0`
                );
            }

            // If available_ratio exists, it is the exchange's
            let effectiveBalance;
            if (available_ratio && available_ratio !== AVAILABLE_RATIO) {
                const ratio = parseFloat(available_ratio);
                effectiveBalance = Math.ceil(transferAmount * ratio);
            } else {
                effectiveBalance = transferAmount;
            }

            this.Debug.logDebug('effectiveBalance:', effectiveBalance);

            nft.balance = (nftBalance - transferAmount).toString();
            nft.total_balance = (nftTotalBalance - transferAmount).toString();
            nftUpdates.push({ key: nftPrefix + sender_stock_id, data: nft });

            let existingNft;
            try {
                existingNft = await this.Ticket.readNFT(ctx, receive_stock_id);
            } catch (error) {
                existingNft = null;
            }

            // TODO：逻辑优化，注意这两个判断中都有 关于交易所的判断，根据读出来的nft信息判断是否为交易所门票，优化逻辑
            if (existingNft) {
                // TODO：考虑是不是可以从 nft 中判断是不是来自交易所 优化 层级太多
                if (available_ratio && available_ratio !== '0') {
                    const existingNftBalance = parseInt(existingNft.balance);
                    const updatedBalance = existingNftBalance + effectiveBalance;
                    if (updatedBalance.toString() !== available_total_num) {
                        throw this.ErrorObj.createError(
                            contractCode.businessError.numberError,
                            `distribution: Updated balance ${updatedBalance} does not match provided available_total_num ${available_total_num}`
                        );
                    }
                }

                existingNft.balance = (parseInt(existingNft.balance) + effectiveBalance).toString();
                existingNft.total_balance = (parseInt(existingNft.total_balance) + transferAmount).toString();
                nftUpdates.push({ key: nftPrefix + receive_stock_id, data: existingNft });
            } else {
                if (available_ratio && available_ratio !== '0') {
                    if (effectiveBalance.toString() !== available_total_num) {
                        throw this.ErrorObj.createError(
                            contractCode.businessError.numberError,
                            `distribution: Calculated effective balance ${effectiveBalance} does not match provided available_total_num ${available_total_num}`
                        );
                    }
                }

                const newNFT = await this.Ticket.mintSplit(ctx, receive_stock_id, receive, JSON.stringify(nft.slot), effectiveBalance.toString(), transferAmount.toString(), JSON.stringify(nft.metadata));
                nftUpdates.push({ key: nftPrefix + receive_stock_id, data: newNFT });
            }

            let ticketStatus = existingNft ? existingNft.slot.AdditionalInformation.TicketData.status : nft.slot.AdditionalInformation.TicketData.status;
            // event
            if (orderType === PURCHASE_ORDER) {
                for (const order of orderDataObj.orderTabDistributeData) {
                    const sender_id = order.seller_id.toString();
                    const receiver_id = order.buyer_id;
                    distributionOrderEvents.push({
                        method_name: 'DistributionOrder',
                        sender_id: sender_id,
                        receiver_id: receiver_id,
                        order_id: orderId,
                        token_id: receive_stock_id,
                        stock_id: sender_stock_id,
                        ticket_status: ticketStatus,
                        trigger_time: parseInt(triggerTime)
                    });
                }
            }
            if (orderType === REFUND_ORDER) {
                const { orderRefund, orderRefundGroup } = orderDataObj;

                for (const refund of orderRefund) {
                    for (const group of orderRefundGroup) {
                        if (group.order_refund_id === refund.refund_id) {
                            const orders = await this.readOrder(ctx, group.order_group_id);

                            for (const order of orders.orderTabToBData) {
                                if (order.order_id === refund.order_id) {
                                    const sender_id = order.seller_id.toString();
                                    const user_id = order.user_id;
                                    this.Verify.checkFieldsNotEmpty({ sender_id, user_id });
                                    distributionRefundEvents.push({
                                        method_name: 'DistributionRefund',
                                        sender_id: user_id,
                                        receiver_id: sender_id,
                                        refund_order_id: refund.refund_id,
                                        token_id: sender_stock_id,
                                        stock_id: receive_stock_id,
                                        ticket_status: ticketStatus,
                                        trigger_time: parseInt(triggerTime)
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
            for (const order of orderKeysToWrite) {
                await ctx.stub.putState(order.key, Buffer.from(JSON.stringify(order.data)));
            }
            for (const nftUpdate of nftUpdates) {
                nftUpdate.data = this.Verify.mergeDeep(tickets, nftUpdate.data);
                this.Debug.logDebug('write4_obj', nftUpdate.data);
                this.Debug.logDebug('write5_string', JSON.stringify(nftUpdate.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(nftUpdate.data)));
                await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
            }
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
    async storeOrder(ctx, orderData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ orderData, triggerTime });
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
        this.Verify.validateStructure(orderDataObj, OrderInfo);
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

        const events = []; // Used to store all events
        // Loop printing events
        for (const order of orderDataObj.OrderTab) {
            const sender_id = order.seller_id.toString();
            const receiver_id = order.user_id;

            for (const product of order.OrderProductTicketData) {
                for (const ticket of product.OrderProductTicketRnData) {
                    const tokenid = ticket.ticket_number;
                    const ticketStatus = ticket.ticket_status;
                    this.Verify.checkFieldsNotEmpty({ sender_id, receiver_id, tokenid, status: ticketStatus.toString() });
                    const storeOrderEvent = {
                        method_name: 'StoreOrder',
                        sender_id: sender_id,
                        receiver_id: receiver_id,
                        order_id: orderGroupId,
                        token_id: tokenid,
                        ticket_status: ticketStatus,
                        trigger_time: parseInt(triggerTime)
                    };
                    events.push(storeOrderEvent); // Add events to the array
                }
            }
        }

        // Make sure there are no problems with the previous operations before writing to the blockchain
        const orderKey = orderIdPrefix + orderGroupId;
        try {
            await ctx.stub.putState(orderKey, Buffer.from(JSON.stringify(orderDataObj)));
            ctx.stub.setEvent('StoreOrder', Buffer.from(JSON.stringify(events)));
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
    async storeRefund(ctx, orderData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ orderData, triggerTime });
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
        this.Verify.validateStructure(orderDataObj, OrderRefundInfoToC);
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
            const { ticket_number, stock_batch_info } = ticket;
            this.Verify.checkFieldsNotEmpty({ ticket_number });
            this.Verify.validateArray(stock_batch_info, 'stock_batch_info');
            const nft = await this.Ticket.readNFT(ctx, ticket_number);

            // Update ticket status to "refundable"
            nft.slot.AdditionalInformation.TicketData = _.cloneDeep(tickets.slot.AdditionalInformation.TicketData);
            nft.slot.AdditionalInformation.TicketData.status = Ticket_REFUND;
            nft.slot.AdditionalInformation.TicketCheckData = [];
            const ticketStatus = nft.slot.AdditionalInformation.TicketData.status;

            let totalAmountToReduce = 0; // Reset for each ticket
            // Process each stock batch info
            for (const stockInfo of stock_batch_info) {
                const { stock_batch_number, sender, amount } = stockInfo;
                this.Verify.checkFieldsNotEmpty({ stock_batch_number, sender, amount: amount.toString() });
                if (amount < 0) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.numberError,
                        `storeRefund: Amount ${amount} must be greater than 0`
                    );
                }

                const oldNft = await this.Ticket.readNFT(ctx, stock_batch_number);
                // console.log('oldNft', oldNft.slot.AdditionalInformation.TicketCheckData);
                if (oldNft.owner !== sender) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.notOwner,
                        `storeRefund: The owner of stock ${stock_batch_number} is not ${sender}`
                    );
                }

                const oldNftBalance = parseInt(oldNft.balance);
                const oldNftTotalBalance = parseInt(oldNft.total_balance);
                oldNft.balance = (oldNftBalance + amount).toString();
                oldNft.total_balance = (oldNftTotalBalance + amount).toString();

                // Update stock batch in nft's stockBatchNumber array
                const stockBatch = nft.stockBatchNumber.find(batch => batch.stock_batch_number === stock_batch_number);
                if (!stockBatch) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.notExist,
                        `storeRefund: Stock batch number ${stock_batch_number} not found in ticket ${ticket_number}`
                    );
                }

                if (stockBatch.amount < amount) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.numberError,
                        `storeRefund: Insufficient amount in stock batch number ${stock_batch_number} for ticket ${ticket_number}`
                    );
                }

                stockBatch.amount -= amount;
                totalAmountToReduce += amount;
                this.Debug.logDebug('DEBUG oldNft', oldNft);
                // Store updated oldNft
                const oldNftKey = nftPrefix + stock_batch_number;
                nftUpdates.push({ key: oldNftKey, data: oldNft });
            }

            // Update ticket's balance
            const nftBalance = parseInt(nft.balance);
            const nftTotalBalance = parseInt(nft.total_balance);
            this.Debug.logDebug('******************************************');
            this.Debug.logDebug('nftBalance:', nftBalance);
            this.Debug.logDebug('totalAmountToReduce:', totalAmountToReduce);
            if (nftBalance < totalAmountToReduce) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `storeRefund: Insufficient balance for ticket ${ticket_number}`
                );
            }
            if (nftTotalBalance < totalAmountToReduce) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `storeRefund: Insufficient total_balance for ticket ${ticket_number}`
                );
            }

            nft.balance = (nftBalance - totalAmountToReduce).toString();
            nft.total_balance = (nftTotalBalance - totalAmountToReduce).toString();
            this.Debug.logDebug('DEBUG nft', nft);

            // Store updated NFT
            const nftKey = nftPrefix + ticket_number;
            nftUpdates.push({ key: nftKey, data: nft });

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
                        trigger_time: parseInt(triggerTime)
                    };
                    distributionEvents.push(storeRefundEvent);
                }
                // Now that the matching order_id has been found and the relevant operations have been completed, you can exit the outer loop
                break;
            }
        }

        // Write all NFT updates to the ledger
        try {
            for (const nftUpdate of nftUpdates) {
                nftUpdate.data = this.Verify.mergeDeep(tickets, nftUpdate.data);
                this.Debug.logDebug('write4_obj', nftUpdate.data);
                this.Debug.logDebug('write5_string', JSON.stringify(nftUpdate.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(nftUpdate.data)));
                await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
            }
            // Trigger all distribution events
            ctx.stub.setEvent('StoreRefund', Buffer.from(JSON.stringify(distributionEvents)));
            // Store order on the blockchain
            const orderKey = orderIdPrefix + refund_id;
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

        // Check if order exists
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
    async activateTickets(ctx, activeInfo, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ activeInfo,triggerTime });
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
        const nftUpdates = [];
        const tradeUpdates = [];

        for (const info of activeInfoObj) {
            this.Verify.validateStructure(info, ActiveInfo);

            const { order_id, batch_id, token_id, available_total_num, periods, total_periods, trade_no, amount, total_repayment } = info;

            // Check required fields
            const requiredFields = { order_id, batch_id, token_id, available_total_num, periods, total_periods, trade_no, amount, total_repayment };
            this.Verify.checkFieldsNotEmpty(requiredFields);

            // Convert total_periods to a number
            const totalPeriodsNumber = parseFloat(total_periods);
            if (isNaN(totalPeriodsNumber) || totalPeriodsNumber <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `activateTickets: total_periods must be a positive number, found ${total_periods}`
                );
            }

            // Check if the key already exists
            const keyExists = await this._keyExists(ctx, trade_no);
            if (keyExists) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `activateTickets: Key ${trade_no} already exists`
                );
            }

            // Step 1: Query order information by order number
            const order = await this.readOrder(ctx, order_id);

            // Step 2: Find the batch_id that is the same as the order number
            let targetBatch;
            this.Verify.validateArray(order.orderTabDistributeData, 'order.orderTabDistributeData');
            for (const distributeData of order.orderTabDistributeData) {
                for (const productDistributeData of distributeData.OrderProductDistributeData) {
                    if (productDistributeData.batch_id === batch_id) {
                        targetBatch = productDistributeData;
                        break;
                    }
                }
                if (targetBatch) {
                    break;
                }
            }

            if (!targetBatch) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notExist,
                    `activateTickets: Batch with id ${batch_id} not found in order ${order_id}`
                );
            }

            const num = parseFloat(targetBatch.num);
            const available_ratio = parseFloat(targetBatch.available_ratio);

            if (isNaN(num) || num < 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `activateTickets: num must be a number and greater than or equal to 0, found ${targetBatch.num}`
                );
            }

            if (isNaN(available_ratio) || available_ratio < 0 || available_ratio > 1) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `activateTickets: available_ratio must be a number between 0 and 1, found ${targetBatch.available_ratio}`
                );
            }

            // Step 3: Calculate the total frozen amount
            const totalFrozenQuantity = (1 - available_ratio) * num;
            // Step 4: Calculate the amount that can be unfrozen
            const repayRatio = 1 / totalPeriodsNumber;
            let unfreezeQuantity = Math.ceil(totalFrozenQuantity * repayRatio);

            // Step 5: Update ticket balance and total_balance
            const nft = await this.Ticket.readNFT(ctx, token_id);
            let balance = parseFloat(nft.balance);
            let totalBalance = parseFloat(nft.total_balance);

            // Check if it's the last repayment period
            const isLastPeriod = periods === total_periods;

            // Handle balance exceeding totalBalance only for the last repayment period
            if (isLastPeriod && balance + unfreezeQuantity > totalBalance) {
                unfreezeQuantity = totalBalance - balance;
            } else if (!isLastPeriod && balance + unfreezeQuantity > totalBalance) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `activateTickets: The unfreeze quantity ${unfreezeQuantity} will exceed the total balance ${totalBalance} for token_id ${token_id}`
                );
            }

            balance += unfreezeQuantity;

            /// Step 6: Check whether the quantity of the current batch is consistent
            if (balance.toString() !== available_total_num) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `activateTickets: Updated balance ${balance} does not match available_total_num ${available_total_num}`
                );
            }

            // Step 7: Update ticket information
            nft.balance = balance.toString();
            const nftKey = nftPrefix + token_id;
            this.Debug.logDebug('DEBUG nft', nft);
            nftUpdates.push({ key: nftKey, value: nft });

            // Step 8: Update order information
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
                trigger_time: parseInt(triggerTime)
            };

            events.push(activateTicketsEvent); // Add events to the array
        }

        try {
            for (const date of nftUpdates) {
                date.value = this.Verify.mergeDeep(tickets, date.value);
                this.Debug.logDebug('write4_obj', date.value);
                this.Debug.logDebug('write5_string', JSON.stringify(date.value));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(date.value)));
                await ctx.stub.putState(date.key, Buffer.from(JSON.stringify(date.value)));
            }
            for (const trade of tradeUpdates) {
                await ctx.stub.putState(trade.key, Buffer.from(JSON.stringify(trade.value)));
            }
            ctx.stub.setEvent('ActivateTickets', Buffer.from(JSON.stringify(events)));
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