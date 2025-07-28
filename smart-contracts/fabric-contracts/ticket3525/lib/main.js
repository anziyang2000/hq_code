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
const { tickets, TicketInfoSchema, MetadataSchema, ticketSplit } = require('../lib/const/ticketFields');
const { nftPrefix, nameKey, symbolKey, orgAdminMappingKey, contractCode, nftBasicInfoKey, nftPriceInfoKey, nftCheckDataKey, nftTicketDataKey, nftStockKey, uuidPrefix } = require('../lib/const/constants');
const Ajv = require('ajv');
const CryptoJS = require('crypto-js');
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

    async testValidateString(inputString) {
        const schema = {
            type: 'string',
            minLength: 1, // Minimum length of the string (adjust as needed)
            maxLength: 100, // Maximum length of the string (adjust as needed)
            // Add more constraints if necessary
        };
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(inputString);
        if (!valid) {
            return validate.errors;
        }
        return null; // Validation successful
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
    async Mint(ctx, tokenId, to, stockNumber, slot, balance, metadata, triggerTime, uuid, stockBatchNumber = []) {
        // Contract initialization, call permission check
        await this.Permission.checkAdminAndGetUserID(ctx);

        // Check required fields
        const requiredFields = { tokenId, to, stockNumber, slot, balance, metadata, triggerTime, uuid};
        this.Verify.checkFieldsNotEmpty(requiredFields);

        // 调用公共函数检查 UUID 是否已经上链
        await this.Verify.checkUUIDExists(ctx, uuid);

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
        const requiredFieldss = { batch_id: slotObj.BasicInformation.SimpleTicket.TicketStock.batch_id, scenic_id: slotObj.BasicInformation.SimpleTicket.scenic_id  };
        this.Verify.checkFieldsNotEmpty(requiredFieldss);

        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The token ${tokenId} is already minted`
            );
        }

        // Encrypt BuyerInfo and TicketCheckData fields if they exist
        if (slotObj.AdditionalInformation.TicketData.phone && slotObj.AdditionalInformation.TicketData.phone !=='') {
            slotObj.AdditionalInformation.TicketData.phone = CryptoJS.SHA256(slotObj.AdditionalInformation.TicketData.phone).toString(CryptoJS.enc.Hex);
        }
        if (slotObj.AdditionalInformation.TicketData && slotObj.AdditionalInformation.TicketData.BuyerInfo) {
            for (let i = 0; i < slotObj.AdditionalInformation.TicketData.BuyerInfo.length; i++) {
                const buyerInfo = slotObj.AdditionalInformation.TicketData.BuyerInfo[i];

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
        if (slotObj.AdditionalInformation.TicketCheckData) {
            for (let i = 0; i < slotObj.AdditionalInformation.TicketCheckData.length; i++) {
                const checkDataItem = slotObj.AdditionalInformation.TicketCheckData[i];

                // Encrypt id_name if exists
                if (checkDataItem.id_name && checkDataItem.id_name !== '') {
                    checkDataItem.id_name = CryptoJS.SHA256(checkDataItem.id_name).toString(CryptoJS.enc.Hex);
                } else {
                    checkDataItem.id_name = '';
                }

                // Encrypt id_card if exists
                if (checkDataItem.id_card && checkDataItem.id_card !== '') {
                    checkDataItem.id_card = CryptoJS.SHA256(checkDataItem.id_card).toString(CryptoJS.enc.Hex);
                } else {
                    checkDataItem.id_card = '';
                }
            }
        }

        const existsBasic = await this._nftExists(ctx, tokenId, nftBasicInfoKey);
        if (existsBasic) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The basic info for token ${tokenId} is already minted`
            );
        }
        const existsPrice = await this._nftExists(ctx, tokenId, nftPriceInfoKey);
        if (existsPrice) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The price info for token ${tokenId} is already minted`
            );
        }
        const existsCheck = await this._nftExists(ctx, tokenId, nftCheckDataKey);
        if (existsCheck) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The check data for token ${tokenId} is already minted`
            );
        }
        const existsTicket = await this._nftExists(ctx, tokenId, nftTicketDataKey);
        if (existsTicket) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The ticket data for token ${tokenId} is already minted`
            );
        }
        const existsStock = await this._nftExists(ctx, tokenId, nftStockKey);
        if (existsStock) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: The ticket stockInfo for token ${tokenId} is already minted`
            );
        }

        this.Verify.validateData(TicketInfoSchema, slotObj);
        this.Verify.validateData(MetadataSchema, metadataObj);

        // Rearrange the order of ticket information again
        try {
            slotObj.AdditionalInformation.TicketData = this.Verify.mergeDeep(tickets.slot.AdditionalInformation.TicketData, slotObj.AdditionalInformation.TicketData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `Mint: mergeDeep failed: ${error.message}`
            );
        }

        // Create composite key for the new NFT
        const nftKey = nftPrefix + tokenId;
        // Store parts of slot objects separately
        const basicInfoKey = nftKey + nftBasicInfoKey;
        const priceInfoKey = nftKey + nftPriceInfoKey;
        const checkDataKey = nftKey + nftCheckDataKey;
        const ticketDataKey = nftKey + nftTicketDataKey;
        const stockInfoKey = nftKey + nftStockKey;
        const uuidKey = uuidPrefix + uuid;
        let nft = {
            balance: balance,
            metadata: metadataObj,
            owner: to,
            slot: {},
            stockBatchNumber: stockBatchNumber,
            token_id: tokenId
        };
        const basicInformation = slotObj.BasicInformation;
        const priceInfo = slotObj.AdditionalInformation.PriceInfo;
        const checkData = slotObj.AdditionalInformation.TicketCheckData;
        const ticketData = slotObj.AdditionalInformation.TicketData;
        const stockInfo = slotObj.AdditionalInformation.StockInfo;
        // 存储一个库存对应下级的对象数组
        // const stockNumberValue = [tokenId];

        const mintEvent = {
            method_name: 'Mint',
            stock_id: tokenId,
            stock_batch_number: slotObj.BasicInformation.SimpleTicket.TicketStock.batch_id,
            owner: slotObj.BasicInformation.SimpleTicket.scenic_id,
            // stock_batch_number: nft.slot?.BasicInformation?.SimpleTicket?.TicketStock?.batch_id,
            // owner: nft.slot?.BasicInformation?.SimpleTicket?.scenic_id,
            trigger_time: parseInt(triggerTime),
            uuid: uuid
        };

        this.Debug.logDebug('MintBefore:', nft);
        this.Debug.logDebug('MintBefore:', slotObj.AdditionalInformation.TicketData);
        this.Debug.logDebug('MintBefore:', slotObj.AdditionalInformation.PriceInfo);
        this.Debug.logDebug('MintBefore:', slotObj.AdditionalInformation.TicketCheckData);
        this.Debug.logDebug('MintBefore:', slotObj.AdditionalInformation.StockInfo);
        // TODO: 因为数据源进行了排序，暂时注释mergeDeep
        nft = this.Verify.mergeDeep(ticketSplit, nft);

        // Store updated NFT and emit event at the end
        try {
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
            await ctx.stub.putState(basicInfoKey, Buffer.from(JSON.stringify(basicInformation)));
            await ctx.stub.putState(priceInfoKey, Buffer.from(JSON.stringify(priceInfo)));
            await ctx.stub.putState(checkDataKey, Buffer.from(JSON.stringify(checkData)));
            await ctx.stub.putState(ticketDataKey, Buffer.from(JSON.stringify(ticketData)));
            await ctx.stub.putState(stockInfoKey, Buffer.from(JSON.stringify(stockInfo)));
            // 把 UUID 上链
            await ctx.stub.putState(uuidKey, Buffer.from('exists'));
            // await ctx.stub.putState(stockNumberKey, Buffer.from(JSON.stringify(stockNumberValue)));
            ctx.stub.setEvent('Mint', Buffer.from(JSON.stringify(mintEvent)));
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.store,
                `Mint: Storing NFT state or setting event failed: ${error.message}`
            );
        }
        this.Debug.logDebug('MintAfter-nft:', nft);
        this.Debug.logDebug('MintAfter-TicketData:', slotObj.AdditionalInformation.TicketData);
        this.Debug.logDebug('MintAfter-PriceInfo:', slotObj.AdditionalInformation.PriceInfo);
        this.Debug.logDebug('MintAfter-TicketCheckData:', slotObj.AdditionalInformation.TicketCheckData);

        let nftReturn = {
            balance: balance,
            metadata: metadataObj,
            owner: to,
            slot: slotObj,
            stockBatchNumber: stockBatchNumber,
            token_id: tokenId
        };

        return nftReturn;
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

    async _nftExists(ctx, tokenId, part = null) {
        let nftKey = nftPrefix + tokenId;
        if (part) {
            nftKey += part;
        }
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
    async StoreOrder(ctx, orderData, triggerTime, uuid) {
        return await this.Order.storeOrder(ctx, orderData, triggerTime, uuid);
    }

    async StoreRefund(ctx, orderData, triggerTime, uuid) {
        return await this.Order.storeRefund(ctx, orderData, triggerTime, uuid);
    }

    async DistributionOrder(ctx, transferDetails, orderData, triggerTime, uuid) {
        return await this.Order.distribution(ctx, transferDetails, orderData, 'Purchase', triggerTime, uuid);
    }

    async DistributionRefund(ctx, transferDetails, orderData, triggerTime, uuid) {
        return await this.Order.distribution(ctx, transferDetails, orderData, 'Refund', triggerTime, uuid);
    }

    async ReadOrder(ctx, orderId) {
        return await this.Order.readOrder(ctx, orderId);
    }

    // ================== Ticket ==========================
    async UpdatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime, uuid) {
        return await this.Ticket.updatePriceInfo(ctx, tokenId, type, updatedFields, triggerTime, uuid);
    }

    async UpdateStockInfo(ctx, stockNumber, updatedFields, triggerTime, uuid) {
        return await this.Ticket.updateStockInfo(ctx, stockNumber, updatedFields, triggerTime, uuid);
    }

    async VerifyTicket(ctx, verifyInfosData, triggerTime, uuid) {
        return await this.Ticket.verifyTicket(ctx, verifyInfosData, triggerTime, uuid);
    }

    async UpdateIssueTickets(ctx, ticketsData, triggerTime, uuid) {
        return await this.Ticket.updateIssueTickets(ctx, ticketsData, triggerTime, uuid);
    }

    async TimerUpdateTickets(ctx, ticketsData, triggerTime, uuid) {
        return await this.Ticket.timerUpdateTickets(ctx, ticketsData, triggerTime, uuid);
    }

    async ReadTicket(ctx, tokenId) {
        return await this.Ticket.readCompleteNFT(ctx, tokenId);
    }

    async ActivateTickets(ctx, activeInfo, triggerTime, uuid) {
        return await this.Order.activateTickets(ctx, activeInfo, triggerTime, uuid);
    }

    async StoreEvidence(ctx, dataArray) {
        return await this.Ticket.storeEvidence(ctx, dataArray);
    }

    async VerifyEvidence(ctx, dataArray) {
        return await this.Ticket.verifyEvidence(ctx, dataArray);
    }

    // ================== Rich Query ==========================
    // async QueryByTokenIdPrefix(ctx) {
    //     return this.Query.QueryByTokenIdPrefix(ctx);
    // }

    async queryNFTsByOwnerAndBalance(ctx, owner, balance) {
        return this.Query.queryNFTsByOwnerAndBalance(ctx, owner, balance);
    }

    async queryNFT(ctx, tokenId) {
        return this.Query.queryNFT(ctx, tokenId);
    }

    async QueryByOwner(ctx, owner) {
        return this.Query.QueryByOwner(ctx, owner);
    }

    async QueryByTokenIdPrefix(ctx, id) {
        return this.Query.QueryByTokenIdPrefix(ctx, id);
    }

    // ================== Exchange Finance ==========================
    async StoreCreditInfo(ctx, type, creditData, triggerTime) {
        // return this.Trade.storeCreditInfo(ctx, type, creditData, triggerTime);
        const info = { type, creditData };
        return await this.Trade.informationStorage(ctx, '1', JSON.stringify(info), triggerTime);
    }

    async TransferCredit(ctx, from, to, creditData, triggerTime) {
        // return this.Trade.transferCredit(ctx, from, to, creditData, triggerTime);
        const info = { from, to, creditData };
        return await this.Trade.informationStorage(ctx, '2', JSON.stringify(info), triggerTime);
    }

    async PaymentFlow(ctx, paymentInfo, triggerTime) {
        // return this.Trade.paymentFlow(ctx, paymentInfo, triggerTime);
        return await this.Trade.informationStorage(ctx, '3', paymentInfo, triggerTime);
    }
    // ================== Test ==========================
    async TestMints(ctx, tokenId, to, balance) {
        return await this.TestObj.testMints(ctx, tokenId, to, balance);
    }

    async TestUpdate(ctx, tokenId, info){
        return await this.TestObj.testUpdate(ctx, tokenId, info);
    }

    async MintTest(ctx, tokenId, to, balance) {
        const nft = {
            tokenId: tokenId,
            owner: to,
            balance: balance
        };
        const txId = await ctx.stub.getTxID();
        const nftKey = await ctx.stub.createCompositeKey(nftCheckDataKey, [tokenId, txId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        return nft;
    }

    async queryCheckDataByTokenId(ctx, tokenId) {
        // 根据部分复合键获取状态数据的迭代器
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

module.exports = main;