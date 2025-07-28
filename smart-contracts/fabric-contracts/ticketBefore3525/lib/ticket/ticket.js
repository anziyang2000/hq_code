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
const { NEW_PRICE_STRATEGY, UPDATE_PRICE_STRATEGY, NULL_STRING, ISSUANCE_TYPE_MULTIPLE, ISSUANCE_TYPE_SINGLE, contractCode } = require('../const/constants');
const { TicketCheck, tickets, VerifyTicket, TimerUpdateTickets, GenerateTicketNumberInfo, TokenIds, PriceInfo } = require('../const/ticketFields');
const _ = require('lodash');

class ticket extends Contract {
    constructor() {
        super();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.CreateId = new createId();
        this.ErrorObj = new errorObj();
    }

    /**
     * readNFT retrieves the non-fungible token (NFT) information based on the tokenId.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} tokenId The ID of the non-fungible token to retrieve.
     * @returns {Object} Returns the NFT object corresponding to the tokenId.
     * @throws {Error} Throws an error if the tokenId is invalid or does not exist.
     */
    async readNFT(ctx, tokenId) {
        const nftKey = nftPrefix + tokenId;
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readNFT: The tokenId ${tokenId} is invalid. It does not exist`
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
    async updatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ tokenId, updatedFields, triggerTime });
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
        this.Verify.validateStructure(updatedFieldsObj, PriceInfo);

        let nft = await this.readNFT(ctx, tokenId);
        this.Debug.logDebug('BeforeNFT', JSON.stringify(nft));

        switch (type) {
        case NEW_PRICE_STRATEGY:
            await this._addStrategy(nft, updatedFieldsObj);
            break;
        case UPDATE_PRICE_STRATEGY:
            await this._updateDtrategy(nft, updatedFieldsObj);
            break;
        case NULL_STRING:
            await this._directSales(nft, updatedFieldsObj);
            break;
        default:
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `updatePriceInfo: Invalid type: ${type}`
            );
        }

        const nftKey = nftPrefix + tokenId;
        const updatePriceInfoEvent = {
            method_name: 'UpdatePriceInfo',
            stock_id: tokenId,
            trigger_time: parseInt(triggerTime)
        };
        this.Debug.logDebug('BeforeNFT', JSON.stringify(nft));
        this.Debug.logDebug('DEBUG nft', nft);
        this.Debug.logDebug('DEBUG Buffer.from(JSON.stringify(nft):', Buffer.from(JSON.stringify(nft)));

        // Rearrange the order again
        try {
            nft.slot.AdditionalInformation.PriceInfo = nft.slot.AdditionalInformation.PriceInfo.map((item) => {
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

        this.Debug.logDebug('nft.slot.AdditionalInformation.PriceInfo', nft.slot.AdditionalInformation.PriceInfo);

        try {
            nft = this.Verify.mergeDeep(tickets, nft);
            this.Debug.logDebug('write4_obj', nft);
            this.Debug.logDebug('write5_string', JSON.stringify(nft));
            this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(nft)));
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
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
    async updateIssueTickets(ctx, ticketsData) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ ticketsData });
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

        const nftUpdates = [];

        // Make sure ticketsDataObj is an array before you can use for
        this.Verify.validateArray(ticketsDataObj, 'ticketsDataObj');
        // Update ticket information in batches
        for (const ticketData of ticketsDataObj) {
            // 验证 ticketData
            this.Verify.validateStructure(ticketData, tickets.slot.AdditionalInformation.TicketData);
            const tokenId = ticketData.ticket_id;
            this.Verify.checkFieldsNotEmpty({ tokenId });
            const nft =  await this.readNFT(ctx, tokenId);

            // Rearrange the order again
            try {
                nft.slot.AdditionalInformation.TicketData = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketData, ticketData);
            } catch (error) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `updateIssueTickets: mergeDeep failed: ${error.message}`
                );
            }

            const nftKey = nftPrefix + tokenId;
            this.Debug.logDebug('DEBUG nft', nft);
            this.Debug.logDebug('DEBUG Buffer.from(JSON.stringify(nft):', Buffer.from(JSON.stringify(nft)));
            nftUpdates.push({ key: nftKey, data: nft });
        }

        try {
            for (const update of nftUpdates) {
                update.data = this.Verify.mergeDeep(tickets, update.data);
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `updateIssueTickets: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return true;
    }

    /**
     * createTicketId generates and assigns ticket IDs to multiple tokens based on specified issuance types.
     * It verifies admin permissions, validates input data, updates token balances, and mints new tokens.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} tokenIds JSON string containing token IDs and associated information.
     * @param {String} issuanceType Type of issuance (ISSUANCE_TYPE_MULTIPLE or ISSUANCE_TYPE_SINGLE).
     * @param {String} ticketsData JSON string containing ticket data for each token.
     * @param {Number} triggerTime Unix timestamp indicating the trigger time for the operation.
     * @returns {Array} Returns an array of ticket information objects if successful.
     * @throws {Error} Throws an error if validation fails or an operation encounters an error.
     */
    async createTicketId(ctx, tokenIds, issuanceType, ticketsData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ tokenIds, issuanceType, ticketsData, triggerTime });
        let tokenIdsObj, ticketsDataObj;
        try {
            tokenIdsObj = JSON.parse(tokenIds);
            ticketsDataObj = JSON.parse(ticketsData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `createTicketId: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(tokenIdsObj, 'tokenIds object');
        this.Verify.checkObjectNotEmpty(ticketsDataObj, 'ticketsData object');
        this.Verify.validateArray(tokenIdsObj, 'tokenIdsObj');
        this.Verify.validateArray(ticketsDataObj, 'ticketsDataObj');

        const ticketInfoArray = [];
        const nftMints = [];
        const nftUpdates = [];
        const events = [];

        // Verify that issuanceType is the expected value
        if (![ISSUANCE_TYPE_MULTIPLE, ISSUANCE_TYPE_SINGLE].includes(issuanceType)) {
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `createTicketId: Invalid type: ${issuanceType}`
            );
        }
        if (issuanceType === ISSUANCE_TYPE_MULTIPLE) { // One ticket for multiple people
            this.Verify.validateStructure(tokenIdsObj, TokenIds);
            const firstStockBatchNumber = tokenIdsObj[0].stock_batch_number;
            const oldNft = await this.readNFT(ctx, firstStockBatchNumber);

            const stockBatchNumber = tokenIdsObj.map(tokenObj => {
                const newObj = Object.assign({}, tokenObj);
                delete newObj.sender;
                return newObj;
            });

            for (const ticketData of ticketsDataObj) {
                this.Verify.validateStructure(ticketData, GenerateTicketNumberInfo);
                if (ticketData.check_point_ids.length <= 0) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.notFound,
                        'createTicketId: check_point_ids does not exist'
                    );
                }

                const time = await this.CreateId.getShareTime(ticketData.time_share_id, ticketData.time_share_book, ticketData.begin_time, ticketData.end_time);
                const ticket_number = await this.CreateId.createId(ticketData.scenic_id, ticketData.enter_time, ticketData.certificate, ticketData.rand);
                const { sign, encode } = await this.CreateId.createSign(ticket_number, ticketData.enter_time, time, ticketData.check_point_ids, ticketData.certificate, ticketData.player_num, ticketData.uuid);

                nftMints.push({
                    ticket_number,
                    owner: oldNft.owner,
                    slot: JSON.stringify(oldNft.slot),
                    balance: ticketData.player_num.toString(),
                    total_balance: ticketData.player_num.toString(),
                    metadata: JSON.stringify(oldNft.metadata),
                    stockBatchNumber
                });

                ticketInfoArray.push({
                    ticket_number: ticket_number,
                    sign: sign,
                    print_encode: encode
                });
            }
        }
        if (issuanceType === ISSUANCE_TYPE_SINGLE) { // One vote per person
            let tokenIndex = 0;
            let remainingAmount = tokenIdsObj[tokenIndex].amount;
            const tokenIdsObjCopy = _.cloneDeep(tokenIdsObj); // 使用 Lodash 进行深拷贝

            for (const ticketData of ticketsDataObj) {
                this.Verify.validateStructure(ticketData, GenerateTicketNumberInfo);
                if (ticketData.check_point_ids.length <= 0) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.notFound,
                        'createTicketId: check_point_ids does not exist'
                    );
                }

                const time = await this.CreateId.getShareTime(ticketData.time_share_id, ticketData.time_share_book, ticketData.begin_time, ticketData.end_time);
                const ticket_number = await this.CreateId.createId(ticketData.scenic_id, ticketData.enter_time, ticketData.certificate, ticketData.rand);
                const { sign, encode } = await this.CreateId.createSign(ticket_number, ticketData.enter_time, time, ticketData.check_point_ids, ticketData.certificate, ticketData.player_num, ticketData.uuid);

                while (remainingAmount < 1) {
                    tokenIndex++;
                    if (tokenIndex < tokenIdsObjCopy.length) {
                        remainingAmount = tokenIdsObjCopy[tokenIndex].amount;
                        continue; // Skip the subsequent logic and continue the next loop
                    }
                    throw this.ErrorObj.createError(
                        contractCode.businessError.numberError,
                        'createTicketId: Insufficient total balance to cover all player numbers'
                    );
                }

                tokenIdsObjCopy[tokenIndex].amount -= 1;
                remainingAmount -= 1;
                const currentStockBatchNumber = tokenIdsObjCopy[tokenIndex].stock_batch_number;
                const currentNft = await this.readNFT(ctx, currentStockBatchNumber);

                nftMints.push({
                    ticket_number,
                    owner: currentNft.owner,
                    slot: JSON.stringify(currentNft.slot),
                    balance: ticketData.player_num.toString(),
                    total_balance: ticketData.player_num.toString(),
                    metadata: JSON.stringify(currentNft.metadata),
                    stockBatchNumber: [{ stock_batch_number: currentStockBatchNumber, amount: 1 }]
                });

                ticketInfoArray.push({
                    ticket_number: ticket_number,
                    sign: sign,
                    print_encode: encode
                });
            }
        }

        for (const tokenObj of tokenIdsObj) {
            const nft = await this.readNFT(ctx, tokenObj.stock_batch_number);
            const owner = nft.owner;

            if (owner !== tokenObj.sender) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notOwner,
                    `createTicketId: The tokenObj.sender is not the current owner. ${owner} !== ${tokenObj.sender}`
                );
            }

            if (tokenObj.amount === null || tokenObj.amount <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `createTicketId: amount ${tokenObj.amount} must exist and be greater than 0`
                );
            }

            if (parseInt(nft.balance) < tokenObj.amount) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `createTicketId: Insufficient balance for stock batch number ${tokenObj.stock_batch_number}`
                );
            }
            if (parseInt(nft.total_balance) < tokenObj.amount) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `createTicketId: Insufficient total_balance for stock batch number ${tokenObj.stock_batch_number}`
                );
            }

            nft.balance = (parseInt(nft.balance) - tokenObj.amount).toString();
            nft.total_balance = (parseInt(nft.total_balance) - tokenObj.amount).toString();

            const nftKey = nftPrefix + tokenObj.stock_batch_number;
            this.Debug.logDebug('DEBUG nft', nft);
            nftUpdates.push({ key: nftKey, data: nft });
        }

        for (const nft of nftMints) {
            await this.mintSplit(ctx, nft.ticket_number, nft.owner, nft.slot, nft.balance, nft.total_balance, nft.metadata, nft.stockBatchNumber);

            const createTicketIdEvent = {
                method_name: 'CreateTicketId',
                token_id: nft.ticket_number,
                stock_id: nft.stockBatchNumber,
                trigger_time: parseInt(triggerTime)
            };
            events.push(createTicketIdEvent);
        }

        try {
            for (const update of nftUpdates) {
                update.data = this.Verify.mergeDeep(tickets, update.data);
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
            ctx.stub.setEvent('CreateTicketId', Buffer.from(JSON.stringify(events)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `createTicketId: Storing NFT state or setting event failed: ${error.message}`
            );
        }

        return ticketInfoArray;
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
    async verifyTicket(ctx, verifyInfosData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ verifyInfosData, triggerTime });
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
        const nftUpdates = [];

        //Batch record verification information and update ticket status at the same time
        for (const verifyInfo of verifyInfosDataObj) {
            const tokenId = verifyInfo.VerifyStatus.ticket_id;
            const nft = await this.readNFT(ctx, tokenId);

            // Verify data type
            this.Verify.validateStructure(verifyInfo.VerifyStatus, VerifyTicket.VerifyStatus);

            this.Verify.checkFieldsNotEmpty({
                status: verifyInfo.VerifyStatus.status.toString(),
                checked_num: verifyInfo.VerifyStatus.checked_num.toString(),
                used_count: verifyInfo.VerifyStatus.used_count.toString(),
                used_days: verifyInfo.VerifyStatus.used_days.toString(),
            });
            // Update TicketData
            nft.slot.AdditionalInformation.TicketData.status = verifyInfo.VerifyStatus.status;
            nft.slot.AdditionalInformation.TicketData.checked_num = verifyInfo.VerifyStatus.checked_num;
            nft.slot.AdditionalInformation.TicketData.used_count = verifyInfo.VerifyStatus.used_count;
            nft.slot.AdditionalInformation.TicketData.used_days = verifyInfo.VerifyStatus.used_days;

            // Verify VerifyInfo. If the ticket_number in verifyInfo.VerifyInfo exists, continue processing.
            if (verifyInfo.VerifyInfo && verifyInfo.VerifyInfo.ticket_number) {
                this.Verify.validateStructure(verifyInfo.VerifyInfo, VerifyTicket.VerifyInfo);
                const newInfo = verifyInfo.VerifyInfo;
                nft.slot.AdditionalInformation.TicketCheckData.push(newInfo);
            }else {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    'verifyTicket: verifyInfo.VerifyInfo or verifyInfo.VerifyInfo.ticket_number is missing.'
                );
            }

            const nftKey = nftPrefix + tokenId;

            const verifyTicketEvent = {
                method_name: 'VerifyTicket',
                token_id: tokenId,
                ticket_status: nft.slot.AdditionalInformation.TicketData.status,
                trigger_time: parseInt(triggerTime)
            };

            this.Debug.logDebug('DEBUG Before nft: ', JSON.stringify(nft));
            // Store the updated nft and the key
            // Rearrange the order again
            try {
                nft.slot.AdditionalInformation.TicketCheckData = nft.slot.AdditionalInformation.TicketCheckData.map((item) => {
                    return this.Verify.mergeDeep(TicketCheck, item);
                });
            } catch (error) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `verifyTicket: mergeDeep failed: ${error.message}`
                );
            }
            this.Debug.logDebug('DEBUG After nft: ', JSON.stringify(nft));
            nftUpdates.push({ key: nftKey, data: nft });
            events.push(verifyTicketEvent);
        }

        try {
            // After processing all logic, batch write all NFTs to the blockchain
            for (const update of nftUpdates) {
                update.data = this.Verify.mergeDeep(tickets, update.data);
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
            ctx.stub.setEvent('VerifyTicket', Buffer.from(JSON.stringify(events)));
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
    async timerUpdateTickets(ctx, ticketsData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ ticketsData, triggerTime });
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
        const nftUpdates = [];

        // Update ticket information in batches
        for (const ticketData of ticketsDataObj) {
            // Verify data type
            this.Verify.validateStructure(ticketData, TimerUpdateTickets);
            const tokenId = ticketData.ticket_id;
            const nft = await this.readNFT(ctx, tokenId);

            this.Verify.checkFieldsNotEmpty({ status: ticketData.status.toString() });
            // Update TicketData
            nft.slot.AdditionalInformation.TicketData.status = ticketData.status;
            const nftKey = nftPrefix + tokenId;
            const timerUpdateTicketsEvent = {
                method_name: 'TimerUpdateTickets',
                token_id: tokenId,
                ticket_status: nft.slot.AdditionalInformation.TicketData.status,
                trigger_time: parseInt(triggerTime)
            };
            this.Debug.logDebug('DEBUG nft', nft);

            // Store the nftKey and newNft in the updates array
            nftUpdates.push({ key: nftKey, data: nft });
            events.push(timerUpdateTicketsEvent);
        }

        try {
            // Once all checks and updates are successful, write to blockchain
            for (const update of nftUpdates) {
                update.data = this.Verify.mergeDeep(tickets, update.data);
                this.Debug.logDebug('write4_obj', update.data);
                this.Debug.logDebug('write5_string', JSON.stringify(update.data));
                this.Debug.logDebug('write6_bytes', Buffer.from(JSON.stringify(update.data)));
                await ctx.stub.putState(update.key, Buffer.from(JSON.stringify(update.data)));
            }
            ctx.stub.setEvent('TimerUpdateTickets', Buffer.from(JSON.stringify(events)));
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
    async mintSplit(ctx, tokenId, to, slot, balance, totalBalance, metadata, stockBatchNumber = []) {
        await this.Permission.checkAdminAndGetUserID(ctx);

        // Convert metadata and slot strings to objects
        let metadataObj, slotObj;
        try {
            metadataObj = JSON.parse(metadata);
            slotObj = JSON.parse(slot);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `mintSplit: JSON parsing or object check failed: ${error.message}`
            );
        }

        this.Verify.checkFieldsNotEmpty({ tokenId, to });

        // Check if balance is greater than 0
        if (parseInt(balance) <= 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `mintSplit: balance ${balance} must be greater than 0`
            );
        }

        if (parseInt(totalBalance) <= 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `mintSplit: totalBalance ${totalBalance} must be greater than 0`
            );
        }

        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: The token ${tokenId} is already minted.`
            );
        }

        // Validate slotObj
        // this.Verify.validateStructure(slotObj, tickets.slot);
        // this.Verify.validateStructure(metadataObj, tickets.metadata);

        const ticketGoods = slotObj.BasicInformation.SimpleTicket.ticketGoods;
        for (let i = 0; i < ticketGoods.length; i++) {
            const checkPointIds = ticketGoods[i].RuleCheck.check_point_ids;

            if (checkPointIds.length <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    `mintSplit: check_point_ids does not exist for ticketGoods at index ${i}`
                );
            }
        }

        try {
            // Check if the PriceInfo array is not empty
            if (slotObj.AdditionalInformation.PriceInfo && slotObj.AdditionalInformation.PriceInfo.length > 0) {
                // Rearrange the order again, loop through each item in the array, and change the order of each item's value
                slotObj.AdditionalInformation.PriceInfo = slotObj.AdditionalInformation.PriceInfo.map((item) => {
                    let mergedItem = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.PriceInfo[0], item);

                    if (mergedItem.PriceDetailedInfo) {
                        mergedItem.PriceDetailedInfo = this.Verify.mergeDeep(
                            tickets.slot.AdditionalInformation.PriceInfo[0].PriceDetailedInfo,
                            mergedItem.PriceDetailedInfo
                        );
                    }

                    return mergedItem;
                });
            }
            // Rearrange the order of ticket information again
            slotObj.AdditionalInformation.TicketData = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketData, slotObj.AdditionalInformation.TicketData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `mintSplit: mergeDeep failed: ${error.message}`
            );
        }

        let nft = {
            balance: balance,
            metadata: metadataObj,
            owner: to,
            slot: slotObj,
            stockBatchNumber: stockBatchNumber,
            token_id: tokenId,
            total_balance: totalBalance
        };

        // Create composite key for the new NFT
        const nftKey = nftPrefix + tokenId;
        this.Debug.logDebug('DEBUG nft', nft);
        // Store updated NFT and emit event at the end

        try {
            nft = this.Verify.mergeDeep(tickets, nft);
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
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
    async _nftExists(ctx, tokenId) {
        const nftKey = nftPrefix + tokenId;
        const nftBytes = await ctx.stub.getState(nftKey);
        return nftBytes && nftBytes.length > 0;
    }

    // 通用的门票信息的函数（待讨论）
    async updateTicketInfo(ctx, tokenId, updatedFields) {
        await this.Permission.checkAdminAndGetUserID(ctx);

        // Read the NFT information
        const nft = await this.readNFT(ctx, tokenId);

        // Check if nft or its properties are null or undefined before accessing ticketStatus
        const updatedFieldsObj = JSON.parse(updatedFields);

        // console.log(JSON.stringify(updatedFieldsObj));
        // console.log('=============================');
        // console.log(JSON.stringify(nft.slot.AdditionalInformation));

        // Update TicketData if it exists and is not empty
        if (updatedFieldsObj.TicketData && Object.keys(updatedFieldsObj.TicketData).length > 0) {
            if (updatedFieldsObj.TicketData.BuyerInfo) {
                for (const id_number in updatedFieldsObj.TicketData.BuyerInfo) {
                    const buyerInfo = updatedFieldsObj.TicketData.BuyerInfo[id_number];

                    // Find the matching BuyerInfo element by id_number in the array
                    const index = nft.slot.AdditionalInformation.TicketData.BuyerInfo.findIndex(buyer => buyer.id_number === id_number);
                    if (index !== -1) {
                        // Merge the buyerInfo into the existing buyerInfo object
                        const newNft = await this.Verify.mergeDeep2(nft.slot.AdditionalInformation.TicketData.BuyerInfo[index], buyerInfo);
                        nft.slot.AdditionalInformation.TicketData.BuyerInfo[index] = newNft;
                    } else {
                        throw new Error(`Buyer with id_number ${id_number} not found.`);
                    }
                }
                // Remove BuyerInfo from updatedFieldsObj.TicketData
                delete updatedFieldsObj.TicketData.BuyerInfo;
            }

            // Merge the rest of updatedFieldsObj.TicketData into nft.slot.AdditionalInformation.TicketData
            const newNft = await this.Verify.mergeDeep2(nft.slot.AdditionalInformation.TicketData, updatedFieldsObj.TicketData);
            nft.slot.AdditionalInformation.TicketData = newNft;
        }

        // Update PriceInfo if it exists and is not empty
        if (updatedFieldsObj.PriceInfo && Object.keys(updatedFieldsObj.PriceInfo).length > 0) {
            const newNft = await this.Verify.mergeDeep2(nft.slot.AdditionalInformation.PriceInfo, updatedFieldsObj.PriceInfo);
            nft.slot.AdditionalInformation.PriceInfo = newNft;
        }

        // Update TicketCheckData if it exists and is not empty
        if (updatedFieldsObj.TicketCheckData && Object.keys(updatedFieldsObj.TicketCheckData).length > 0) {
            for (const ticketNumber in updatedFieldsObj.TicketCheckData) {

                const ticketCheck = updatedFieldsObj.TicketCheckData[ticketNumber];

                const index = nft.slot.AdditionalInformation.TicketCheckData.findIndex(t => t.ticket_number === ticketNumber);
                if (index !== -1) {
                    // console.log(nft.slot.AdditionalInformation.TicketCheckData[index]);
                    const newNft = await this.Verify.mergeDeep2(nft.slot.AdditionalInformation.TicketCheckData[index], ticketCheck);
                    nft.slot.AdditionalInformation.TicketCheckData[index] = newNft;
                } else {
                    throw new Error(`Ticket with number ${ticketNumber} not found.`);
                }
            }
        }

        // console.log('88888888888888888888888');
        // console.log(JSON.stringify(nft.slot.AdditionalInformation));

        const nftKey = nftPrefix + tokenId;
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // Update the NFT on the ledger
        return true;
    }

    // ================== Internal Functions ==========================
    async _addStrategy(nft, updatedFieldsObj) {
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

        const priceInfo = nft.slot.AdditionalInformation.PriceInfo;
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

    async _updateDtrategy(nft, updatedFieldsObj) {
        const PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;
        const priceId = PriceDetailedInfo.price_id;
        const group = PriceDetailedInfo.group;

        this.Verify.checkFieldsNotEmpty({ priceId });

        const priceInfo = nft.slot.AdditionalInformation.PriceInfo;
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

    async _directSales(nft, updatedFieldsObj) {
        const PriceDetailedInfo = updatedFieldsObj.PriceDetailedInfo;
        const group = PriceDetailedInfo.group;

        const newPriceInfo = Object.assign({}, updatedFieldsObj);
        newPriceInfo.PriceDetailedInfo.group = group.group_id;

        nft.slot.AdditionalInformation.PriceInfo.push(newPriceInfo);

        this.Debug.logDebug('nft.slot.AdditionalInformation.PriceInfo', nft.slot.AdditionalInformation.PriceInfo);
    }

}

module.exports = ticket;