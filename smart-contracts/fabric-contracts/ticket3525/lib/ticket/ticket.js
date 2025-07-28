/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { nftPrefix } = require('../const/constants');
const createId = require('../utils/createId');
const permission = require('../utils/permission');
const verify = require('../utils/verify');
const debug = require('../utils/debug');
const errorObj = require('../utils/error');
const query = require('../utils/query');
const { NEW_PRICE_STRATEGY, UPDATE_PRICE_STRATEGY, NULL_STRING, contractCode, nftBasicInfoKey, nftPriceInfoKey, nftCheckDataKey, nftTicketDataKey, nftStockKey, orderIdPrefix, uuidPrefix} = require('../const/constants');
const { TicketCheck, tickets, PriceInfoSchema, TicketDataSchema, VerifyTicketSchema, TimerUpdateTicketsSchema, stockInfoSchema, ticketSplit } = require('../const/ticketFields');
const CryptoJS = require('crypto-js');
class ticket extends Contract {
    constructor() {
        super();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.CreateId = new createId();
        this.ErrorObj = new errorObj();
        this.Query = new query();
    }

    /**
     * readNFT retrieves the non-fungible token (NFT) information based on the tokenId.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} tokenId The ID of the non-fungible token to retrieve.
     * @returns {Object} Returns the NFT object corresponding to the tokenId.
     * @throws {Error} Throws an error if the tokenId is invalid or does not exist.
     */
    async readNFT(ctx, tokenId, part = null) {
        let nftKey = nftPrefix + tokenId;
        if (part) {
            nftKey += part;
        }
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            // throw this.ErrorObj.createError(
            //     contractCode.businessError.notExist,
            //     `readNFT: The tokenId ${tokenId} is invalid. It does not exist`
            // );
            let errorMessage = `readNFT: The tokenId ${tokenId}`;
            if (part) {
                errorMessage += ` with part ${part}`;
            }
            errorMessage += ' is invalid. It does not exist';
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                errorMessage
            );
        }
        // Parse the string into a JSON-formatted object. This is done to facilitate subsequent operations and access to the non-fungible token object.
        this.Debug.logDebug('read1_bytes', nftBytes);
        this.Debug.logDebug('read2_string', nftBytes.toString());
        this.Debug.logDebug('read3_obj', JSON.parse(nftBytes.toString()));
        try {
            return JSON.parse(nftBytes.toString());
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `readNFT: JSON parsing or object check failed: ${error.message}`
            );
        }
    }

    async readCompleteNFT(ctx, tokenId) {
        const nftKey = nftPrefix + tokenId;

        // Read basic information
        const basicInfoKey = nftKey + nftBasicInfoKey;
        const basicInfoBytes = await ctx.stub.getState(basicInfoKey);
        if (!basicInfoBytes || basicInfoBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readCompleteNFT: The basic information for basicInfoKey ${basicInfoKey} does not exist`
            );
        }
        let basicInformation = JSON.parse(basicInfoBytes.toString());
        basicInformation = this.Verify.mergeDeep(tickets.slot.BasicInformation, basicInformation);

        // Read price information
        const priceInfoKey = nftKey + nftPriceInfoKey;
        const priceInfoBytes = await ctx.stub.getState(priceInfoKey);
        const priceInfo = (priceInfoBytes && priceInfoBytes.length > 0) ? this.Verify.mergeDeep(tickets.slot.AdditionalInformation.PriceInfo, JSON.parse(priceInfoBytes.toString())) : [];

        // Read ticket checking data
        // const checkDataKey = nftKey + nftCheckDataKey;
        // const checkDataBytes = await ctx.stub.getState(checkDataKey);
        // const checkData = (checkDataBytes && checkDataBytes.length > 0) ? this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketCheckData, JSON.parse(checkDataBytes.toString())) : [];
        const checkData = await this._queryCheckDataByTokenId(ctx, tokenId);

        // Read ticket information
        const ticketDataKey = nftKey + nftTicketDataKey;
        const ticketDataBytes = await ctx.stub.getState(ticketDataKey);
        if (!ticketDataBytes || ticketDataBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readCompleteNFT: The ticket data for ticketDataKey ${ticketDataKey} does not exist`
            );
        }
        let ticketData = JSON.parse(ticketDataBytes.toString());
        ticketData = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketData, ticketData);

        // Read stock information
        const stockInfoKey = nftKey + nftStockKey;
        const stockInfoBytes = await ctx.stub.getState(stockInfoKey);
        let stockInfo;
        if (!stockInfoBytes || stockInfoBytes.length === 0) {
            stockInfo = {};
            if (basicInformation && basicInformation.SimpleTicket && basicInformation.SimpleTicket.TicketStock) {
                const ticketStock = basicInformation.SimpleTicket.TicketStock;
                stockInfo.purchase_begin_time = ticketStock.purchase_begin_time;
                stockInfo.purchase_end_time = ticketStock.purchase_end_time;
                stockInfo.stock_enter_begin_time = ticketStock.stock_enter_begin_time;
                stockInfo.stock_enter_end_time = ticketStock.stock_enter_end_time;

                delete basicInformation.SimpleTicket.TicketStock.purchase_begin_time;
                delete basicInformation.SimpleTicket.TicketStock.purchase_end_time;
                delete basicInformation.SimpleTicket.TicketStock.stock_enter_begin_time;
                delete basicInformation.SimpleTicket.TicketStock.stock_enter_end_time;
            } else {
                stockInfo = tickets.slot.AdditionalInformation.StockInfo;
            }
        }else {
            stockInfo = JSON.parse(stockInfoBytes.toString());
        }
        stockInfo = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.StockInfo, stockInfo);

        // Read other information of NFT
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readCompleteNFT: The tokenId ${tokenId} does not exist`
            );
        }
        let nft = JSON.parse(nftBytes.toString());
        nft = this.Verify.mergeDeep(ticketSplit, nft);

        // Rejoin slot
        const slotObj = {
            AdditionalInformation: {
                PriceInfo: priceInfo,
                StockInfo: stockInfo,
                TicketCheckData: checkData,
                TicketData: ticketData
            },
            BasicInformation: basicInformation
        };

        // Reassign slotObj to nft.slot
        nft.slot = slotObj;

        // nft = this.Verify.mergeDeep(ticketSplit, nft);

        return nft;
    }

    // TODO：try catch 考虑做到更细粒度，不要全包起来
    /**
     * updatePriceInfo updates price information for a specific non-fungible token (NFT).
     * Depending on the type of update strategy (NEW_PRICE_STRATEGY, UPDATE_PRICE_STRATEGY, NULL_STRING),
     * it adds new price information, updates existing price information, or handles direct sales scenarios.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} tokenId The ID of the non-fungible token for which price information is updated.
     * @param {String} type The type of update strategy (NEW_PRICE_STRATEGY, UPDATE_PRICE_STRATEGY, NULL_STRING).
     * @param {String} updatedFields JSON string containing updated fields for price information.
     * @param {Number} triggerTime The trigger time for the update.
     * @returns {Boolean} Returns true if the update is successful.
     * @throws {Error} Throws an error if validation fails or an operation encounters an error.
     */
    async updatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ tokenId, updatedFields, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let updatedFieldsObj;
        try {
            updatedFieldsObj = JSON.parse(updatedFields);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `updatePriceInfo: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(updatedFieldsObj, 'updatedFields object');
        // this.Verify.validateStructure(updatedFieldsObj, PriceInfo);
        this.Verify.validateData(PriceInfoSchema, updatedFieldsObj);

        let priceInfo = await this.readNFT(ctx, tokenId, nftPriceInfoKey);

        switch (type) {
        case NEW_PRICE_STRATEGY:
            await this._addStrategy(priceInfo, updatedFieldsObj);
            break;
        case UPDATE_PRICE_STRATEGY:
            await this._updateDtrategy(priceInfo, updatedFieldsObj);
            break;
        case NULL_STRING:
            await this._directSales(priceInfo, updatedFieldsObj);
            break;
        default:
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `updatePriceInfo: Invalid type: ${type}`
            );
        }

        const priceInfoKey = nftPrefix + tokenId + nftPriceInfoKey;
        const uuidKey = uuidPrefix + uuid;
        const updatePriceInfoEvent = {
            method_name: 'UpdatePriceInfo',
            stock_id: tokenId,
            trigger_time: parseInt(triggerTime),
            uuid: uuid
        };
        this.Debug.logDebug('BeforepriceInfo', JSON.stringify(priceInfo));
        this.Debug.logDebug('DEBUG Buffer.from(JSON.stringify(priceInfo):', Buffer.from(JSON.stringify(priceInfo)));

        // Rearrange the order again
        try {
            priceInfo = priceInfo.map((item) => {
                let mergedItem = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.PriceInfo[0], item);

                if (mergedItem.PriceDetailedInfo) {
                    mergedItem.PriceDetailedInfo = this.Verify.mergeDeep(
                        tickets.slot.AdditionalInformation.PriceInfo[0].PriceDetailedInfo,
                        mergedItem.PriceDetailedInfo
                    );
                }

                return mergedItem;
            });
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `updatePriceInfo: mergeDeep failed: ${error.message}`
            );
        }

        try {
            this.Debug.logDebug('write4_obj', priceInfo);
            this.Debug.logDebug('write5_string', JSON.stringify(priceInfo));
            this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(priceInfo)));
            await ctx.stub.putState(priceInfoKey, Buffer.from(JSON.stringify(priceInfo)));
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            ctx.stub.setEvent('UpdatePriceInfo', Buffer.from(JSON.stringify(updatePriceInfoEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `updatePriceInfo: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * updateIssueTickets updates ticket issuance information for multiple non-fungible tokens (NFTs).
     * It verifies permissions, validates ticket data, and updates each NFT with new issuance data.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} ticketsData JSON string containing ticket issuance data for multiple tokens.
     * @returns {Boolean} Returns true if the update is successful.
     * @throws {Error} Throws an error if validation fails or an operation encounters an error.
     */
    async updateIssueTickets(ctx, ticketsData, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ ticketsData, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let ticketsDataObj;
        try {
            ticketsDataObj = JSON.parse(ticketsData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `updateIssueTickets: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(ticketsDataObj, 'ticketsData object');
        // Make sure ticketsDataObj is an array before you can use for
        this.Verify.validateArray(ticketsDataObj, 'ticketsDataObj');

        const nftMints = [];
        const events = [];

        // Update ticket information in batches
        for (const ticketData of ticketsDataObj) {
            // 验证 ticketData
            this.Verify.validateData(TicketDataSchema, ticketData);
            const tokenId = ticketData.ticket_id;
            const stock_batch_number = ticketData.stock_batch_number;
            const account = ticketData.account;
            const org = ticketData.org;
            const balance = ticketData.player_num.toString();
            const print_encode = ticketData.print_encode;
            const sender_id = ticketData.provider_id;
            const receiver_id = ticketData.user_id;
            const order_id = ticketData.order_id;
            this.Verify.checkFieldsNotEmpty({ tokenId, stock_batch_number, account, org, balance, print_encode, sender_id, receiver_id, order_id });
            // const currentStockBatchNumber = stock_batch_number + account + org;
            const currentStockBatchNumber = stock_batch_number + '-' + account + '-' + org;
            const currentNft = await this.readNFT(ctx, currentStockBatchNumber);
            const currentBasicinfo = await this.readNFT(ctx, currentStockBatchNumber, nftBasicInfoKey);
            const currentPriceinfo = await this.readNFT(ctx, currentStockBatchNumber, nftPriceInfoKey);
            const currentCheckdata = await this.readNFT(ctx, currentStockBatchNumber, nftCheckDataKey);
            // const currentTicketdata = await this.readNFT(ctx, currentStockBatchNumber, nftTicketDataKey);
            const currentStockInfo = await this.readNFT(ctx, currentStockBatchNumber, nftStockKey);
            delete ticketData.account;
            delete ticketData.org;

            console.log('********************',ticketData);

            if (ticketData.phone && ticketData.phone !=='') {
                ticketData.phone = CryptoJS.SHA256(ticketData.phone).toString(CryptoJS.enc.Hex);
            }
            if (ticketData.BuyerInfo && Array.isArray(ticketData.BuyerInfo)) {
                for (let i = 0; i < ticketData.BuyerInfo.length; i++) {
                    const buyerInfo = ticketData.BuyerInfo[i];

                    // Encrypt buyerInfo_id_name if exists
                    if (buyerInfo.buyerInfo_id_name && buyerInfo.buyerInfo_id_name !== '') {
                        buyerInfo.buyerInfo_id_name = CryptoJS.SHA256(buyerInfo.buyerInfo_id_name).toString(CryptoJS.enc.Hex);
                    } else {
                        buyerInfo.buyerInfo_id_name = '';
                    }

                    // Encrypt id_number if exists
                    if (buyerInfo.id_number && buyerInfo.id_number !== '') {
                        buyerInfo.id_number = CryptoJS.SHA256(buyerInfo.id_number).toString(CryptoJS.enc.Hex);
                    } else {
                        buyerInfo.id_number = '';
                    }
                }
            }

            nftMints.push({
                ticket_number: tokenId,
                encode: print_encode,
                sender_id,
                receiver_id,
                order_id,
                owner: currentNft.owner,
                slot: JSON.stringify(currentNft.slot),
                balance: balance,
                // total_balance: ticketData.player_num.toString(),
                metadata: JSON.stringify(currentNft.metadata),
                stockBatchNumber: [{ stock_batch_number: currentStockBatchNumber, amount: balance }],
                basicInformation: JSON.stringify(currentBasicinfo),
                priceInfo: JSON.stringify(currentPriceinfo),
                checkData: JSON.stringify(currentCheckdata),
                ticketData: JSON.stringify(ticketData),
                stockInfo: JSON.stringify(currentStockInfo)
            });
        }

        for (const nft of nftMints) {
            await this.mintSplit(ctx, nft.ticket_number, nft.owner, nft.slot, nft.balance, nft.metadata, nft.basicInformation, nft.priceInfo, nft.checkData, nft.ticketData, nft.stockInfo, nft.stockBatchNumber);

            const updateIssueTicketsEvent = {
                token_id: nft.ticket_number,
                stock_id: nft.stockBatchNumber,
                // sign: nft.sign,
                sender_id: nft.sender_id,
                receiver_id: nft.receiver_id,
                order_id: nft.order_id,
                encode: nft.encode
            };
            events.push(updateIssueTicketsEvent);
        }

        const eventObj = {
            method_name: 'UpdateIssueTickets',
            list: events,
            trigger_time: parseInt(triggerTime),
            uuid: uuid
        };
        const uuidKey = uuidPrefix + uuid;
        try {
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            ctx.stub.setEvent('UpdateIssueTickets', Buffer.from(JSON.stringify(eventObj)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `updateIssueTickets: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * verifyTicket verifies ticket information, updates ticket status, and records verification details.
     * It requires admin permissions, validates input data, updates NFT ticket data, and emits events.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} verifyInfosData JSON string containing verification information for tickets.
     * @param {Number} triggerTime Unix timestamp indicating the trigger time for the operation.
     * @returns {Boolean} Returns true if verification is successful.
     * @throws {Error} Throws an error if validation fails or an operation encounters an error.
     */
    async verifyTicket(ctx, verifyInfosData, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ verifyInfosData, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let verifyInfosDataObj;
        try {
            verifyInfosDataObj = JSON.parse(verifyInfosData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `verifyTicket: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(verifyInfosDataObj, 'verifyInfosData object');
        this.Verify.validateArray(verifyInfosDataObj, 'verifyInfosDataObj');

        const events = [];
        const Updates = [];

        //Batch record verification information and update ticket status at the same time
        for (const verifyInfo of verifyInfosDataObj) {
            // Verify data type
            this.Verify.validateData(VerifyTicketSchema, verifyInfo);
            const tokenId = verifyInfo.VerifyStatus.ticket_id;

            this.Verify.checkFieldsNotEmpty({
                status: verifyInfo.VerifyStatus.status.toString(),
            });

            // Create composite key for the new CheckData
            const txId = await ctx.stub.getTxID();
            const checkDataKey = await ctx.stub.createCompositeKey(nftCheckDataKey, [tokenId, txId]);
            // const checkDataKey = nftPrefix + tokenId + nftCheckDataKey;

            const verifyTicketEvent = {
                method_name: 'VerifyTicket',
                token_id: tokenId,
                ticket_status: verifyInfo.VerifyStatus.status,
                trigger_time: parseInt(triggerTime),
                uuid: uuid
            };

            // Store the updated nft and the key
            // Rearrange the order again
            let newInfo;
            try {
                newInfo = this.Verify.mergeDeep(TicketCheck, verifyInfo.VerifyInfo);

                // Encrypt sensitive fields if they exist
                if (newInfo.id_card && newInfo.id_card !== '') {
                    newInfo.id_card = CryptoJS.SHA256(newInfo.id_card).toString(CryptoJS.enc.Hex);
                }
                if (newInfo.id_name && newInfo.id_name !== '') {
                    newInfo.id_name = CryptoJS.SHA256(newInfo.id_name).toString(CryptoJS.enc.Hex);
                }
            } catch (error) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `verifyTicket: mergeDeep failed: ${error.message}`
                );
            }
            // 可以去查询下Updates里面的key有没有跟这次循环的checkDataKey相同的，如果有，则data就变成数组把之前的值和现在的都存进去，有相同的就直接存
            Updates.push({ key: checkDataKey, data: newInfo });
            events.push(verifyTicketEvent);
        }

        try {
            // After processing all logic, batch write all NFTs to the blockchain
            for (const update of Updates) {
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            if (events.length > 0) {
                ctx.stub.setEvent('VerifyTicket', Buffer.from(JSON.stringify(events)));
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `verifyTicket: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * timerUpdateTickets updates ticket status based on timer triggers, requiring admin permissions.
     * It validates input data, updates NFT ticket status, and emits events upon successful updates.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} ticketsData JSON string containing ticket data to update.
     * @param {Number} triggerTime Unix timestamp indicating the trigger time for the operation.
     * @returns {Boolean} Returns true if ticket updates are successful.
     * @throws {Error} Throws an error if validation fails or an operation encounters an error.
     */
    async timerUpdateTickets(ctx, ticketsData, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ ticketsData, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let ticketsDataObj;
        try {
            ticketsDataObj = JSON.parse(ticketsData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `timerUpdateTickets: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(ticketsDataObj, 'ticketsData object');
        this.Verify.validateArray(ticketsDataObj, 'ticketsDataObj');

        const events = [];
        const Updates = [];

        // Update ticket information in batches
        for (const ticketData of ticketsDataObj) {
            // Verify data type
            // this.Verify.validateStructure(ticketData, TimerUpdateTickets);
            this.Verify.validateData(TimerUpdateTicketsSchema, ticketData);
            const tokenId = ticketData.ticket_id;
            this.Verify.checkFieldsNotEmpty({ status: ticketData.status.toString() });
            const existingTicketData = await this.readNFT(ctx, tokenId, nftTicketDataKey);

            // Update TicketData
            existingTicketData.status = ticketData.status;
            const ticketDataKey = nftPrefix + tokenId + nftTicketDataKey;
            const timerUpdateTicketsEvent = {
                method_name: 'TimerUpdateTickets',
                token_id: tokenId,
                ticket_status: existingTicketData.status,
                trigger_time: parseInt(triggerTime),
                uuid: uuid
            };

            // Store the nftKey and newNft in the updates array
            Updates.push({ key: ticketDataKey, data: existingTicketData });
            events.push(timerUpdateTicketsEvent);
        }

        try {
            // Once all checks and updates are successful, write to blockchain
            for (const update of Updates) {
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            if (events.length > 0) {
                ctx.stub.setEvent('TimerUpdateTickets', Buffer.from(JSON.stringify(events)));
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `timerUpdateTickets: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * mintSplit creates a new NFT and assigns it to the specified owner.
     *
     * @param {Context} ctx the transaction context
     * @param {String} tokenId the unique identifier for the NFT to be minted
     * @param {String} to the recipient of the minted NFT
     * @param {String} slot the slot information for the NFT
     * @param {String} balance the balance of the NFT
     * @param {String} totalBalance the total balance of the NFT
     * @param {String} metadata the metadata associated with the NFT
     * @param {Array} stockBatchNumber optional, batch numbers associated with the NFT
     * @returns {Object} the minted NFT object
     */
    async mintSplit(ctx, tokenId, to, slot, balance, metadata, basicInformation, priceInfo, checkData, ticketData, stockInfo, stockBatchNumber = []) {
        await this.Permission.checkAdminAndGetUserID(ctx);

        // Check required fields
        console.log('tokenId:', tokenId);
        console.log('to:', to);
        console.log('slot:', slot);
        console.log('balance:', balance);
        console.log('metadata:', metadata);
        console.log('basicInformation:', basicInformation);
        console.log('priceInfo:', priceInfo);
        console.log('checkData:', checkData);
        console.log('ticketData:', ticketData);
        console.log('stockInfo:', stockInfo);
        console.log('stockBatchNumber:', stockBatchNumber);
        const requiredFields = { tokenId, to, balance, metadata, basicInformation, ticketData, stockInfo };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        // Convert metadata and slot strings to objects
        let metadataObj, slotObj, basicInfoObj, priceInfoObj, checkDataObj, ticketDataObj, stockInfoObj;
        try {
            metadataObj = JSON.parse(metadata);
            slotObj = JSON.parse(slot);
            basicInfoObj = JSON.parse(basicInformation);
            priceInfoObj = JSON.parse(priceInfo);
            checkDataObj = JSON.parse(checkData);
            ticketDataObj = JSON.parse(ticketData);
            stockInfoObj = JSON.parse(stockInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `mintSplit: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(metadataObj, 'metadata object');
        this.Verify.checkObjectNotEmpty(basicInfoObj, 'basicInformation object');
        this.Verify.checkObjectNotEmpty(ticketDataObj, 'ticketData object');
        this.Verify.checkObjectNotEmpty(stockInfoObj, 'stockInfo object');

        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The token ${tokenId} is already minted`
            );
        }
        const existsBasic = await this._nftExists(ctx, tokenId, nftBasicInfoKey);
        if (existsBasic) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The basic info for token ${tokenId} is already minted`
            );
        }
        const existsPrice = await this._nftExists(ctx, tokenId, nftPriceInfoKey);
        if (existsPrice) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The price info for token ${tokenId} is already minted`
            );
        }
        const existsCheck = await this._nftExists(ctx, tokenId, nftCheckDataKey);
        if (existsCheck) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The check data for token ${tokenId} is already minted`
            );
        }
        const existsTicket = await this._nftExists(ctx, tokenId, nftTicketDataKey);
        if (existsTicket) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The ticket data for token ${tokenId} is already minted`
            );
        }
        const existsStock = await this._nftExists(ctx, tokenId, nftStockKey);
        if (existsStock) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The ticket stockInfo for token ${tokenId} is already minted`
            );
        }

        // Validate slotObj
        // this.Verify.validateStructure(slotObj, tickets.slot);
        // this.Verify.validateStructure(metadataObj, tickets.metadata);

        const ticketGoods = basicInfoObj.SimpleTicket.ticketGoods;
        for (let i = 0; i < ticketGoods.length; i++) {
            const checkPointIds = ticketGoods[i].RuleCheck.check_point_ids;

            if (checkPointIds.length <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    `mintSplit: check_point_ids does not exist for ticketGoods at index ${i}`
                );
            }
        }

        let nft = {
            balance: balance,
            metadata: metadataObj,
            owner: to,
            slot: slotObj,
            stockBatchNumber: stockBatchNumber,
            token_id: tokenId,
        };

        // Create composite key for the new NFT
        const nftKey = nftPrefix + tokenId;
        const basicInfoKey = nftKey + nftBasicInfoKey;
        const priceInfoKey = nftKey + nftPriceInfoKey;
        const checkDataKey = nftKey + nftCheckDataKey;
        const ticketDataKey = nftKey + nftTicketDataKey;
        const stockInfoKey = nftKey + nftStockKey;

        // Store updated NFT and emit event at the end
        try {
            nft = this.Verify.mergeDeep(ticketSplit, nft);
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
            await ctx.stub.putState(basicInfoKey, Buffer.from(JSON.stringify(basicInfoObj)));
            await ctx.stub.putState(priceInfoKey, Buffer.from(JSON.stringify(priceInfoObj)));
            await ctx.stub.putState(checkDataKey, Buffer.from(JSON.stringify(checkDataObj)));
            await ctx.stub.putState(ticketDataKey, Buffer.from(JSON.stringify(ticketDataObj)));
            await ctx.stub.putState(stockInfoKey, Buffer.from(JSON.stringify(stockInfoObj)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `mintSplit: Storing NFT state or setting event failed: ${error.message}`
            );
        }
        this.Debug.logDebug('DEBUG Buffer.from(JSON.stringify(nft):', JSON.stringify(nft));
        this.Debug.logDebug('DEBUG Buffer.from(JSON.stringify(nft):', Buffer.from(JSON.stringify(nft)));

        return nft;
    }

    /**
     * _nftExists checks if an NFT (Non-Fungible Token) with the specified tokenId exists in the blockchain state.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} tokenId The unique identifier of the NFT to check.
     * @returns {Boolean} Returns true if the NFT exists, otherwise returns false.
     */
    async _nftExists(ctx, tokenId, part = null) {
        let nftKey = nftPrefix + tokenId;
        if (part) {
            nftKey += part;
        }
        const nftBytes = await ctx.stub.getState(nftKey);
        return nftBytes && nftBytes.length > 0;
    }

    // async updateStockInfo(ctx, stockNumber, updatedFields, triggerTime) {
    //     await this.Permission.checkAdminAndGetUserID(ctx);
    //     this.Verify.checkFieldsNotEmpty({ stockNumber, updatedFields, triggerTime });
    //     let updatedFieldsObj;
    //     try {
    //         updatedFieldsObj = JSON.parse(updatedFields);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `updateStockInfo: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(updatedFieldsObj, 'updatedFields object');
    //     this.Verify.validateData(stockInfoSchema, updatedFieldsObj);

    //     // 读取
    //     const stockNumberKey = stockNumber + stockArrayKey;
    //     const stockNumberBytes = await ctx.stub.getState(stockNumberKey);
    //     if (!stockNumberBytes || stockNumberBytes.length === 0) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.notExist,
    //             `updateStockInfo: The stockNumber ${stockNumber} is invalid. It does not exist`
    //         );
    //     }
    //     let stockNumberArray;
    //     try {
    //         stockNumberArray = JSON.parse(stockNumberBytes.toString());
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `updateStockInfo: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }

    //     let nftUpdates = [];
    //     const validKeys = [];
    //     for (const key of stockNumberArray) {
    //         const ticketData = await this.readNFT(ctx, key, nftTicketDataKey);
    //         if (ticketData && [1, 2, 3, 4].includes(ticketData.status)) {
    //             continue; // 如果状态为 1、2、3、4，跳过这个 key
    //         }
    //         validKeys.push(key);
    //     }

    //     for (const key of validKeys) {
    //         let stockInfo = await this.readNFT(ctx, key, nftStockKey);
    //         stockInfo = updatedFieldsObj;

    //         nftUpdates.push({ key: nftPrefix + key + nftStockKey, data: stockInfo });
    //     }

    //     try {
    //         for (const nftUpdate of nftUpdates) {
    //             nftUpdate.data = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.StockInfo, nftUpdate.data);
    //             await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
    //         }
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.store,
    //             `updateStockInfo: Storing NFT state or setting event failed: ${error.message}`
    //         );
    //     }

    //     return true;
    // }

    async updateStockInfo(ctx, stockNumber, updatedFields, triggerTime, uuid) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ stockNumber, updatedFields, triggerTime, uuid });
        await this.Verify.checkUUIDExists(ctx, uuid);
        let updatedFieldsObj;
        try {
            updatedFieldsObj = JSON.parse(updatedFields);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `updateStockInfo: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(updatedFieldsObj, 'updatedFields object');
        this.Verify.validateData(stockInfoSchema, updatedFieldsObj);

        // 获取所有满足条件的 key
        const keys = await this.Query.QueryByTokenIdPrefix(ctx, stockNumber);
        // 新数组：移除 status 为 1、2、3、4 的 key
        const validKeys = [];
        for (const key of keys) {
            const ticketData = await this.readNFT(ctx, key, nftTicketDataKey);
            if (ticketData && [1, 2, 3, 4].includes(ticketData.status)) {
                continue; // 如果状态为 1、2、3、4，跳过这个 key
            }
            validKeys.push(key);
        }

        // 如果 validKeys 为空的情况
        if (validKeys.length === 0) {
            console.log('No valid keys found for stockNumber:', stockNumber);
        }

        const basicInfos = await this.readNFT(ctx, validKeys[0], nftBasicInfoKey);
        // 要确保获取 basicInfos 中的 batchId 和 user
        const batchId = basicInfos.SimpleTicket.TicketStock.batch_id;
        const user = basicInfos.SimpleTicket.scenic_id;

        let nftUpdates = [];
        // 遍历有效的 key，并更新 stockinfo
        for (const key of validKeys) {
            let currentStockInfo;
            try {
                currentStockInfo = await this.readNFT(ctx, key, nftStockKey);
                currentStockInfo = updatedFieldsObj;
            } catch (error) {
                currentStockInfo = {};
                const basicInfo = await this.readNFT(ctx, key, nftBasicInfoKey);
                if (basicInfo && basicInfo.SimpleTicket && basicInfo.SimpleTicket.TicketStock) {
                    const ticketStock = basicInfo.SimpleTicket.TicketStock;
                    console.log(ticketStock);
                    currentStockInfo.purchase_begin_time = ticketStock.purchase_begin_time;
                    currentStockInfo.purchase_end_time = ticketStock.purchase_end_time;
                    currentStockInfo.stock_enter_begin_time = ticketStock.stock_enter_begin_time;
                    currentStockInfo.stock_enter_end_time = ticketStock.stock_enter_end_time;

                    delete basicInfo.SimpleTicket.TicketStock.purchase_begin_time;
                    delete basicInfo.SimpleTicket.TicketStock.purchase_end_time;
                    delete basicInfo.SimpleTicket.TicketStock.stock_enter_begin_time;
                    delete basicInfo.SimpleTicket.TicketStock.stock_enter_end_time;
                    nftUpdates.push({ key: nftPrefix + key + nftBasicInfoKey, data: basicInfo });
                } else {
                    currentStockInfo = updatedFieldsObj;
                }
            }
            currentStockInfo = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.StockInfo, currentStockInfo);
            nftUpdates.push({ key: nftPrefix + key + nftStockKey, data: currentStockInfo });
        }

        // 添加事件
        const updateStockEvent = {
            method_name: 'UpdateStockInfo',
            stock_id: stockNumber,
            stock_batch_number: batchId,
            owner: user,
            trigger_time: parseInt(triggerTime),
            uuid: uuid
        };

        try {
            for (const nftUpdate of nftUpdates) {
                console.log('666666666666666666666666666');
                console.log(nftUpdate.data);
                console.log(nftUpdate.key);
                await ctx.stub.putState(nftUpdate.key, Buffer.from(JSON.stringify(nftUpdate.data)));
            }
            const uuidKey = uuidPrefix + uuid;
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            // 触发事件
            await ctx.stub.setEvent('UpdateStockInfo', Buffer.from(JSON.stringify(updateStockEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `updateStockInfo: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    // 存证
    async storeEvidence(ctx, dataArray) {
        await this.Permission.checkAdminAndGetUserID(ctx);  // 验证管理员权限
        this.Verify.checkFieldsNotEmpty({ dataArray });  // 检查参数是否为空

        let dataArrayObj;
        try {
            // 检查是否为有效的 JSON 字符串
            if (dataArray.startsWith('{') || dataArray.startsWith('[')) {
                // 可能是 JSON 字符串，尝试解析
                dataArrayObj = JSON.parse(dataArray);
            } else {
                // 否则直接将其作为字符串处理
                dataArrayObj = dataArray;
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `storeEvidence: Parsing failed for input data: ${error.message}`
            );
        }

        this.Verify.checkObjectNotEmpty(dataArrayObj, 'dataArray object');

        // 对整个对象或字符串进行加密处理，生成哈希
        const encryptedDataKey = CryptoJS.SHA256(JSON.stringify(dataArrayObj)).toString(CryptoJS.enc.Hex);
        console.log('##encryptedDataKey', encryptedDataKey);

        // 检查该哈希是否已经存在于区块链中
        const existingData = await ctx.stub.getState(encryptedDataKey);  // 获取当前哈希对应的值
        if (existingData && existingData.length > 0) {
            // 如果哈希存在，报错表示该数据已存证
            throw this.ErrorObj.createError(
                contractCode.businessError.exists,
                `storeEvidence: Evidence already stored with this hash: ${encryptedDataKey}`
            );
        }

        // 这里只存储哈希值，没有存储具体的value
        try {
            await ctx.stub.putState(encryptedDataKey, Buffer.from('true'));  // 存储空值
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `storeEvidence: Storing key without value failed: ${error.message}`
            );
        }

        // 触发事件
        const eventObj = {
            method_name: 'StoreEvidence',
        };

        try {
            ctx.stub.setEvent('StoreEvidence', Buffer.from(JSON.stringify(eventObj)));  // 触发事件
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `storeEvidence: Setting event failed: ${error.message}`
            );
        }

        return true;
    }

    // 验证存证信息
    async verifyEvidence(ctx, dataArray) {
        // 检查参数是否为空
        this.Verify.checkFieldsNotEmpty({ dataArray });

        let dataArrayObj;
        try {
            dataArrayObj = JSON.parse(dataArray);  // 解析传入的 JSON 字符串
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `verifyEvidence: JSON parsing or object check failed: ${error.message}`
            );
        }

        this.Verify.checkObjectNotEmpty(dataArrayObj, 'dataArray object');
        // this.Verify.validateArray(dataArrayObj, 'dataArrayObj');  // 确保数据是数组

        // 对整个数组进行加密处理，生成存证的哈希
        const encryptedDataKey = CryptoJS.SHA256(JSON.stringify(dataArrayObj)).toString(CryptoJS.enc.Hex);

        try {
            const result = await ctx.stub.getState(encryptedDataKey);

            // 如果没有找到该key，说明没有存证
            if (!result || result.length === 0) {
                // return { status: false, message: 'Evidence not found on the blockchain' };
                return false;
            }

            // 如果找到该key，说明已经存证
            // return { status: true, message: 'Evidence verified and exists on the blockchain' };
            return true;
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.query,
                `verifyEvidence: Querying blockchain failed: ${error.message}`
            );
        }
    }

    // ================== Internal Functions ==========================
    async _addStrategy(priceInfo, updatedFieldsObj) {
        const PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;
        const priceId = PriceDetailedInfo.price_id;
        const group = PriceDetailedInfo.group;

        this.Verify.checkFieldsNotEmpty({ priceId });

        if (!group.group_id || group.group_id.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notFound,
                'updatePriceInfo: group_id array must have values'
            );
        }

        const existingPrice = priceInfo.find(info => info.PriceDetailedInfo.price_id === priceId);

        if (existingPrice) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `updatePriceInfo: The corresponding price id ${priceId} already exists`
            );
        }

        const newPriceInfo = Object.assign({}, updatedFieldsObj);
        newPriceInfo.PriceDetailedInfo.group = group.group_id;

        priceInfo.push(newPriceInfo);
        this.Debug.logDebug('priceInfo', priceInfo);
    }

    async _updateDtrategy(priceInfo, updatedFieldsObj) {
        const PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;
        const priceId = PriceDetailedInfo.price_id;
        const group = PriceDetailedInfo.group;

        this.Verify.checkFieldsNotEmpty({ priceId });

        // const` 定义的变量不能被重新赋值，即不能被重新绑定到另一个值。然而，`const` 定义的对象的属性是可以修改的
        const existingPrice = priceInfo.find(info => info.PriceDetailedInfo.price_id === priceId);

        if (!existingPrice) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `updatePriceInfo: Cannot find the corresponding price id ${priceId}`
            );
        }

        if (group.add_group_id && group.add_group_id.length > 0) {
            existingPrice.PriceDetailedInfo.group.push(...group.add_group_id);
        }

        if (group.del_group_id && group.del_group_id.length > 0) {
            existingPrice.PriceDetailedInfo.group = existingPrice.PriceDetailedInfo.group.filter(id => !group.del_group_id.includes(id));
        }

        delete updatedFieldsObj.PriceDetailedInfo.group;
        existingPrice.PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;

        this.Debug.logDebug('priceInfo', priceInfo);
    }

    async _directSales(priceInfo, updatedFieldsObj) {
        const PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;
        const group = PriceDetailedInfo.group;

        const newPriceInfo = Object.assign({}, updatedFieldsObj);
        newPriceInfo.PriceDetailedInfo.group = group.group_id;

        priceInfo.push(newPriceInfo);

        this.Debug.logDebug('priceInfo', priceInfo);
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

    // 根据部分复合键获取状态数据的迭代器
    async _queryCheckDataByTokenId(ctx, tokenId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey(nftCheckDataKey, [tokenId]);
        const nfts = [];
        let result = await iterator.next();

        // 遍历结果
        while (!result.done) {
            const { value } = result;
            if (value && value.value) {
                // 将缓冲区转换为字符串
                const jsonString = value.value.toString('utf8');
                try {
                    // 解析 JSON 字符串
                    const nft = JSON.parse(jsonString);
                    nfts.push(nft);
                } catch (err) {
                    // 处理 JSON 解析错误
                    console.error('JSON 解析错误:', err);
                }
            }
            result = await iterator.next();
        }

        return nfts;
    }

}

module.exports = ticket;