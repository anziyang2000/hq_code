/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ticket = require('./ticket/ticket');
const order = require('./order/order');
const trade = require('./trade/trade');
const query = require('./utils/query');
const permission = require('./utils/permission');
const verify = require('./utils/verify');
const debug = require('./utils/debug');
const errorObj = require('./utils/error');
const testObj = require('./utils/test');
const { tickets } = require('../lib/const/ticketFields');
const { nftPrefix, nameKey, symbolKey, orgAdminMappingKey, contractCode } = require('../lib/const/constants');

class main extends Contract {
    constructor() {
        super();
        this.Ticket = new ticket();
        this.Order = new order();
        this.Query = new query();
        this.Trade = new trade();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.ErrorObj = new errorObj();
        this.TestObj = new testObj();
    }

    async BalanceOfIds() {}

    async BalanceOfValue(ctx, tokenId) {
        await this.Permission.checkInitialized(ctx);

        const nft =  await this.Ticket.readNFT(ctx, tokenId);
        const balance = parseInt(nft.balance);

        if (!balance) {
            throw new Error('This token does not have a balance assigned');
        }

        return balance;
    }

    async OwnerOf(ctx, tokenId) {
        await this.Permission.checkInitialized(ctx);
        const nft = await this.Ticket.readNFT(ctx, tokenId);
        const owner = nft.owner;
        if (!owner) {
            throw new Error('No owner is assigned to this token');
        }

        return owner;
    }

    async SlotOf(ctx, tokenId) {
        await this.Permission.checkInitialized(ctx);
        const nft = await this.Ticket.readNFT(ctx, tokenId);
        const slot = nft.slot;
        if (!slot) {
            throw new Error('This token does not have a slot assigned');
        }

        return slot;
    }

    async Approve() {
        throw new Error('The Approve function is no longer supported.');
    }

    async Name(ctx) {
        await this.Permission.checkInitialized(ctx);

        const nameAsBytes = await ctx.stub.getState(nameKey);
        return nameAsBytes.toString();
    }

    async Symbol(ctx) {
        await this.Permission.checkInitialized(ctx);

        const symbolAsBytes = await ctx.stub.getState(symbolKey);
        return symbolAsBytes.toString();
    }

    async TokenURI(ctx, tokenId) {
        await this.Permission.checkInitialized(ctx);

        const nft = await this.Ticket.readNFT(ctx, tokenId);
        return nft.metadata.token_url;
    }

    async TotalSupply(ctx) {
        await this.Permission.checkInitialized(ctx);

        // There is a key record for every non-fungible token in the format of nftPrefix.tokenId.
        // TotalSupply() queries for and counts all records matching nftPrefix.*
        const iterator = await ctx.stub.getStateByPartialCompositeKey(nftPrefix, []);

        // Count the number of returned composite keys
        let totalSupply = 0;
        let result = await iterator.next();
        while (!result.done) {
            totalSupply++;
            result = await iterator.next();
        }
        return totalSupply;
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
    /**
     * Initialize the contract with essential parameters.
     * Sets the contract name, symbol, organization admin mapping, and initializes with an admin.
     *
     * @param {Object} ctx - Transaction context object
     * @param {string} name - Contract name
     * @param {string} symbol - Contract symbol
     * @param {string} org - Organization name
     * @param {string} admin - Administrator name
     * @returns {boolean} Returns true if initialization is successful
     * @throws {Error} If contract options are already set or any required field is empty
     */
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

    /**
     * Mint creates a new NFT and assigns it to the specified owner.
     *
     * @param {Context} ctx the transaction context
     * @param {String} tokenId the unique identifier for the NFT to be minted
     * @param {String} to the recipient of the minted NFT
     * @param {String} slot the slot information for the NFT
     * @param {String} balance the balance of the NFT
     * @param {String} metadata the metadata associated with the NFT
     * @param {String} triggerTime the time when the minting is triggered
     * @param {Array} stockBatchNumber optional, batch numbers associated with the NFT
     * @returns {Object} the minted NFT object
     */
    async Mint(ctx, tokenId, to, slot, balance, metadata, triggerTime, stockBatchNumber = []) {
        // Contract initialization, call permission check
        await this.Permission.checkAdminAndGetUserID(ctx);

        // Check required fields
        const requiredFields = { tokenId, to, slot, balance, metadata, triggerTime };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        // Check if balance is greater than 0
        if (parseInt(balance) <= 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `Mint: balance ${balance} must be greater than 0`
            );
        }

        // Convert metadata and slot strings to objects
        let metadataObj, slotObj;
        try {
            metadataObj = JSON.parse(metadata);
            slotObj = JSON.parse(slot);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `Mint: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(metadataObj, 'Metadata object');
        this.Verify.checkObjectNotEmpty(slotObj, 'Slot object');

        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The token ${tokenId} is already minted`
            );
        }

        // TODO：验证数据结构是否有必要
        // Validate slotObj、metadataObj
        this.Verify.validateStructure(slotObj, tickets.slot);
        this.Verify.validateStructure(metadataObj, tickets.metadata);

        // 判断 PriceInfo 数组是否不为空
        // TODO: 如果这个参数将来出现不为空的情况，这段代码需要考虑是否启用
        // if (slotObj.AdditionalInformation.PriceInfo && slotObj.AdditionalInformation.PriceInfo.length > 0) {
        //     // 再次重新排列顺序，循环数组中的每一项，把每一项的值换顺序
        //     slotObj.AdditionalInformation.PriceInfo = slotObj.AdditionalInformation.PriceInfo.map((item) => {
        //         let mergedItem = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.PriceInfo[0], item);

        //         if (mergedItem.PriceDetailedInfo) {
        //             mergedItem.PriceDetailedInfo = this.Verify.mergeDeep(
        //                 tickets.slot.AdditionalInformation.PriceInfo[0].PriceDetailedInfo,
        //                 mergedItem.PriceDetailedInfo
        //             );
        //         }

        //         return mergedItem;
        //     });
        // }

        // 这段代码的意思是保证在铸造的时候 check_point_ids 检票点数组中必须有元素
        const ticketGoods = slotObj.BasicInformation.SimpleTicket.ticketGoods;
        for (let i = 0; i < ticketGoods.length; i++) {
            const checkPointIds = ticketGoods[i].RuleCheck.check_point_ids;
            if (checkPointIds.length <= 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    `check_point_ids does not exist for ticketGoods at index ${i}`
                );
            }
        }

        // Rearrange the order of ticket information again
        try {
            slotObj.AdditionalInformation.TicketData = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketData, slotObj.AdditionalInformation.TicketData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: mergeDeep failed: ${error.message}`
            );
        }

        let nft = {
            balance: balance,
            metadata: metadataObj,
            owner: to,
            slot: slotObj,
            stockBatchNumber: stockBatchNumber,
            token_id: tokenId,
            total_balance: balance,
        };

        const mintEvent = {
            method_name: 'Mint',
            stock_id: tokenId,
            stock_batch_number: nft.slot.BasicInformation.SimpleTicket.TicketStock.batch_id,
            owner: nft.slot.BasicInformation.SimpleTicket.scenic_id,
            // stock_batch_number: nft.slot?.BasicInformation?.SimpleTicket?.TicketStock?.batch_id,
            // owner: nft.slot?.BasicInformation?.SimpleTicket?.scenic_id,
            trigger_time: parseInt(triggerTime)
        };

        // Create composite key for the new NFT
        const nftKey = nftPrefix + tokenId;
        this.Debug.logDebug('MintBefore:', nft);
        this.Debug.logDebug('MintBefore:', nft.slot.AdditionalInformation.TicketData);
        this.Debug.logDebug('MintBefore:', nft.slot.AdditionalInformation.PriceInfo);
        // TODO: 因为数据源进行了排序，暂时注释mergeDeep
        nft = this.Verify.mergeDeep(tickets, nft);

        // Store updated NFT and emit event at the end
        try {
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
            ctx.stub.setEvent('Mint', Buffer.from(JSON.stringify(mintEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `Mint: Storing NFT state or setting event failed: ${error.message}`
            );
        }
        this.Debug.logDebug('MintAfter:', nft);
        this.Debug.logDebug('MintAfter:', nft.slot.AdditionalInformation.TicketData);
        this.Debug.logDebug('MintBefore:', nft.slot.AdditionalInformation.PriceInfo);

        return nft;
    }

    async Burn(ctx, tokenId, amount) {
        await this.Permission.checkInitialized(ctx);

        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this.Permission._parseX509String(x509ByteArray);
        const owner = x509Object[0].CN;

        const nftKey = nftPrefix + tokenId;
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`The token ${tokenId} does not exist.`);
        }

        // Read the NFT data from the ledger
        const nft = JSON.parse(nftBytes.toString());

        // Check if the caller is the owner of the non-fungible token
        if (nft.owner !== owner) {
            throw new Error(`Non-fungible token ${tokenId} is not owned by ${owner}`);
        }

        if (amount) {
            // Check if the amount to burn is valid
            if (parseInt(amount) <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            // Check if the balance is sufficient for burning
            if (parseInt(nft.balance) < parseInt(amount)) {
                throw new Error(`Insufficient balance for burning tokenId ${tokenId}`);
            }

            // Update the balance of the token
            nft.balance = (parseInt(nft.balance) - parseInt(amount)).toString();

            // If the balance becomes zero after burning, delete the token
            if (parseInt(nft.balance) <= 0) {
                // Delete the token
                await ctx.stub.deleteState(nftKey);
            } else {
                // Update the token's balance
                await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
            }
        } else {
            // If no amount is specified, burn the entire tokenId
            // Delete the token
            await ctx.stub.deleteState(nftKey);
        }

        return true;
    }

    async _nftExists(ctx, tokenId) {
        const nftKey = nftPrefix + tokenId;
        const nftBytes = await ctx.stub.getState(nftKey);
        return nftBytes && nftBytes.length > 0;
    }

    async ClientAccountBalance(ctx) {
        // check contract options are already set first to execute the function
        await this.Permission.CheckInitialized(ctx);

        // Get ID of submitting client identity
        const x509ByteArray = ctx.clientIdentity.getID();
        // Parse certificate string into object
        const x509Object = await this.Permission._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const clientAccountID = x509Object[0].CN;

        return this.BalanceOf(ctx, clientAccountID);
    }

    async ClientAccountID(ctx) {
        // check contract options are already set first to execute the function
        await this.Permission.CheckInitialized(ctx);

        // Get ID of submitting client identity
        const x509ByteArray = ctx.clientIdentity.getID();
        // Parse certificate string into object
        const x509Object = await this.Permission._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const clientAccountID = x509Object[0].CN;

        return clientAccountID;
    }

    // ================== Order ==========================
    async StoreOrder(ctx, orderData, triggerTime) {
        return await this.Order.storeOrder(ctx, orderData, triggerTime);
    }

    async StoreRefund(ctx, orderData, triggerTime) {
        return await this.Order.storeRefund(ctx, orderData, triggerTime);
    }

    async DistributionOrder(ctx, transferDetails, orderData, triggerTime) {
        return await this.Order.distribution(ctx, transferDetails, orderData, 'Purchase', triggerTime);
    }

    async DistributionRefund(ctx, transferDetails, orderData, triggerTime) {
        return await this.Order.distribution(ctx, transferDetails, orderData, 'Refund', triggerTime);
    }

    async ReadOrder(ctx, orderId) {
        return await this.Order.readOrder(ctx, orderId);
    }

    // ================== Ticket ==========================
    async UpdatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime) {
        return await this.Ticket.updatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime);
    }

    async VerifyTicket(ctx, verifyInfosData, triggerTime) {
        return await this.Ticket.verifyTicket(ctx, verifyInfosData, triggerTime);
    }

    async UpdateIssueTickets(ctx, ticketsData) {
        return await this.Ticket.updateIssueTickets(ctx, ticketsData);
    }

    async CreateTicketId(ctx, tokenIds, issuanceType, ticketsData, triggerTime) {
        return await this.Ticket.createTicketId(ctx, tokenIds, issuanceType, ticketsData, triggerTime);
    }

    async TimerUpdateTickets(ctx, ticketsData, triggerTime) {
        return await this.Ticket.timerUpdateTickets(ctx, ticketsData, triggerTime);
    }

    async UpdateTicketInfo(ctx, tokenId, updatedFields, triggerTime) {
        return this.Ticket.updateTicketInfo(ctx, tokenId, updatedFields, triggerTime);
    }

    async ReadTicket(ctx, tokenId) {
        return await this.Ticket.readNFT(ctx, tokenId);
    }

    async ActivateTickets(ctx, activeInfo, triggerTime) {
        return await this.Order.activateTickets(ctx, activeInfo, triggerTime);
    }

    // ================== Rich Query ==========================
    async QueryByTokenIdPrefix(ctx) {
        return this.Query.QueryByTokenIdPrefix(ctx);
    }

    async queryNFTsByOwnerAndBalance(ctx, owner, balance) {
        return this.Query.queryNFTsByOwnerAndBalance(ctx, owner, balance);
    }

    async queryNFT(ctx, tokenId) {
        return this.Query.queryNFT(ctx, tokenId);
    }

    async QueryByOwner(ctx, owner) {
        return this.Query.QueryByOwner(ctx, owner);
    }

    // ================== Exchange Finance ==========================
    async StoreCreditInfo(ctx, type, creditData, triggerTime) {
        return this.Trade.storeCreditInfo(ctx, type, creditData, triggerTime);
    }

    async TransferCredit(ctx, from, to, creditData, triggerTime) {
        return this.Trade.transferCredit(ctx, from, to, creditData, triggerTime);
    }

    async PaymentFlow(ctx, paymentInfo, triggerTime) {
        return this.Trade.paymentFlow(ctx, paymentInfo, triggerTime);
    }
    // ================== Test ==========================
    async TestMints(ctx, tokenId, to, balance) {
        return await this.TestObj.testMints(ctx, tokenId, to, balance);
    }

    async TestUpdate(ctx, tokenId, info){
        return await this.TestObj.testUpdate(ctx, tokenId, info);
    }

}

module.exports = main;