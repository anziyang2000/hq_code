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
const { creditPrefix, tradePrefix, transactionPrefix, TYPE_MODIFY_OR_NEW, TYPE_ACTIVATE, contractCode } = require('../const/constants');
const { creditInfo, transferInfo, paymentFlowInfo } = require('../const/tradeFields');

class trade extends Contract {
    constructor() {
        super();
        this.Ticket = new ticket();
        this.Permission = new permission();
        this.Verify = new verify();
        this.Debug = new debug();
        this.ErrorObj = new errorObj();
    }

    /**
     * storeCreditInfo handles the storage of credit information based on the provided type and credit data.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} type The type of operation (TYPE_MODIFY_OR_NEW or TYPE_ACTIVATE).
     * @param {String} creditData JSON string containing credit data to be stored.
     * @param {String} triggerTime The trigger time for the transaction.
     * @returns {Boolean} Returns true if the operation is successful.
     * @throws {Error} Throws an error if any validation fails or if the operation encounters an issue.
     */
    async storeCreditInfo(ctx, type, creditData, triggerTime) {
        await this.Permission.checkAdminAndGetUserID(ctx);
        this.Verify.checkFieldsNotEmpty({ type, creditData, triggerTime });
        let creditDataObj;
        try {
            creditDataObj = JSON.parse(creditData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `storeCreditInfo: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(creditDataObj, 'creditData object');
        this.Verify.validateStructure(creditDataObj, creditInfo);

        const { account, merchantId, creditLimit, pledgeAmount, assetsKey, seqNo } = creditDataObj;
        const requiredFields = { account, merchantId, assetsKey, seqNo };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        const creditKey = creditPrefix + assetsKey;
        // Check if seqNo already exists
        const serialKey = tradePrefix + seqNo;
        const serialExists = await ctx.stub.getState(serialKey);
        if (serialExists && serialExists.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `storeCreditInfo: The serial number ${seqNo} has already been used`
            );
        }

        let storeCreditInfoEvent = {
            method_name: 'StoreCreditInfo',
            type,
            account,
            value: '',
            seq_no: seqNo,
            trigger_time: parseInt(triggerTime)
        };

        // Verify that type is the expected value
        if (![TYPE_MODIFY_OR_NEW, TYPE_ACTIVATE].includes(type)) {
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `storeCreditInfo: Invalid type: ${type}`
            );
        }
        if (type === TYPE_MODIFY_OR_NEW) {
            // Add or modify
            const exists = await this._creditExists(ctx, assetsKey);
            this.Verify.checkFieldsNotEmpty({ creditLimit });
            if (isNaN(creditLimit) || Number(creditLimit) < 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `storeCreditInfo: creditLimit ${Number(creditLimit)} cannot be empty and cannot be less than 0`
                );
            }

            let creditInfo;
            if (exists) {
                // Revise
                creditInfo = await this._readCredit(ctx, assetsKey);
                creditInfo.credit_limit = creditLimit;
                creditInfo.owner = account;
                creditInfo.merchant_id = merchantId;
                creditInfo.seq_no = seqNo;
            } else {
                // Add
                creditInfo = {
                    owner: account,
                    merchant_id: merchantId,
                    credit_limit: creditLimit,
                    pledge_amount: '0',  // When adding, pledgeAmount is '0'
                    seq_no: seqNo,
                };
            }

            this.Debug.logDebug('creditInfo:', creditInfo);
            storeCreditInfoEvent.value = creditLimit;
            await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(creditInfo)));

            this.Debug.logDebug('***************', creditInfo);
        }
        if (type === TYPE_ACTIVATE) {
            // activation
            const exists = await this._creditExists(ctx, assetsKey);
            if (!exists) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notExist,
                    `storeCreditInfo: The credit${assetsKey} does not exist`
                );
            }

            this.Verify.checkFieldsNotEmpty({ pledgeAmount });
            if (isNaN(pledgeAmount) || Number(pledgeAmount) < 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `storeCreditInfo: pledgeAmount ${Number(pledgeAmount)} cannot be empty and cannot be less than 0`
                );
            }

            const credit = await this._readCredit(ctx, assetsKey);
            // // Get the existing credit information and check the pledge amount (remove the restriction that it can only be activated once)
            // if (credit.pledge_amount !== '0') {
            //     throw new Error('storeCreditInfo: The credit has been activated');
            // }

            // Update the pledge amount
            credit.pledge_amount = pledgeAmount;
            storeCreditInfoEvent.value = pledgeAmount;
            this.Debug.logDebug('Activated creditInfo:', credit);

            await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(credit)));
        }

        // Store seqNo to the blockchain
        await ctx.stub.putState(serialKey, Buffer.from('used'));
        // event
        await ctx.stub.setEvent('StoreCreditInfo', Buffer.from(JSON.stringify(storeCreditInfoEvent)));

        return true;
    }

    /**
     * transferCredit handles the transfer of credit from one account to another based on the provided credit data.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} from The account ID of the sender.
     * @param {String} to The account ID of the receiver.
     * @param {String} creditData JSON string containing credit transfer data.
     * @param {String} triggerTime The trigger time for the transaction.
     * @returns {Boolean} Returns true if the transfer operation is successful.
     * @throws {Error} Throws an error if any validation fails or if the operation encounters an issue.
     */
    async transferCredit(ctx, from, to, creditData, triggerTime) {
        await this.Permission.checkInitialized(ctx);
        this.Verify.checkFieldsNotEmpty({ from, to, creditData, triggerTime });
        let creditDataObj;
        try {
            creditDataObj = JSON.parse(creditData);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `transferCredit: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(creditDataObj, 'creditData object');
        this.Verify.validateStructure(creditDataObj, transferInfo);

        // Deconstruct the creditData object
        // const { issuer_id, issuer_account, assetsKey, amount, tradeNo } = creditDataObj;
        const { issuer_id, issuer_account, receiver_id, receiver_account, assetsKey, amount, tradeNo } = creditDataObj;

        // Check required fields
        const requiredFields = { issuer_id, issuer_account, receiver_id, receiver_account, assetsKey, amount, tradeNo };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        // Make sure the amount is valid
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `transferCredit: amount ${Number(amount)} must be greater than zero`
            );
        }
        const transferAmount = Number(amount);

        // Check if tradeNo already exists
        const serialKey = tradePrefix + tradeNo;
        const serialExists = await ctx.stub.getState(serialKey);
        if (serialExists && serialExists.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `transferCredit: The serial number ${tradeNo} has already been used`
            );
        }

        // Check if the issuer_account account has credit information
        const fromExists = await this._creditExists(ctx, assetsKey);
        if (!fromExists) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `transferCredit: The credit account ${assetsKey} does not exist`
            );
        }

        // Read the credit information of the issuer_account account
        const fromCredit = await this._readCredit(ctx, assetsKey);
        this.Debug.logDebug('fromCredit: ', fromCredit);

        // Check if the merchant ID read matches sellerMerchantId
        if (fromCredit.owner !== from) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notOwner,
                `transferCredit: The trusted account ${from} is not authorized to perform this operation`
            );
        }

        // Check if the to account exists, if not, create the credit information
        let toCredit;
        const toExists = await this._creditExists(ctx, issuer_id);
        if (!toExists) {
            // Create a new account with an initial credit limit of 0
            toCredit = {
                owner: issuer_account,
                merchant_id: issuer_id,
                value: amount
            };
        } else {
            // If it already exists, directly read the credit information of the to account
            toCredit = await this._readCredit(ctx, issuer_id);

            // Check if the merchant ID read matches sellerMerchantId
            if (toCredit.owner !== to) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notOwner,
                    `transferCredit: The trusted account ${to} is not authorized to perform this operation`
                );
            }
        }

        // Check if fromCredit has enough credit limit for deduction
        if (Number(fromCredit.credit_limit) < transferAmount) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `transferCredit: Insufficient credit limit for account ${from}`
            );
        }

        // Update credit limit
        fromCredit.credit_limit = (Number(fromCredit.credit_limit) - transferAmount).toString();
        toCredit.credit_limit = (Number(toCredit.credit_limit) + transferAmount).toString();

        this.Debug.logDebug('fromCredit:', fromCredit);
        this.Debug.logDebug('toCredit:', toCredit);

        // Store the updated credit information on the blockchain
        const fromCreditKey = creditPrefix + assetsKey;
        const toCreditKey = creditPrefix + issuer_id;
        await ctx.stub.putState(fromCreditKey, Buffer.from(JSON.stringify(fromCredit)));
        await ctx.stub.putState(toCreditKey, Buffer.from(JSON.stringify(toCredit)));

        // Store tradeNo to the blockchain
        await ctx.stub.putState(serialKey, Buffer.from('used'));

        this.Debug.logDebug('======================================');
        this.Debug.logDebug('fromCreditKey:', fromCreditKey);
        this.Debug.logDebug('fromCredit:', fromCredit);
        this.Debug.logDebug('toCreditKey:', toCreditKey);
        this.Debug.logDebug('toCredit:', toCredit);
        this.Debug.logDebug('======================================');

        // Triggering a transfer event
        const transferCreditEvent = {
            method_name: 'TransferCredit',
            from: receiver_account,
            to: issuer_account,
            value: amount,
            trade_no: tradeNo,
            trigger_time: parseInt(triggerTime)
        };
        await ctx.stub.setEvent('TransferCredit', Buffer.from(JSON.stringify(transferCreditEvent)));

        return true;
    }

    /**
     * paymentFlow handles the payment flow by storing payment information and triggering payment events.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} paymentInfo JSON string containing payment information.
     * @param {String} triggerTime The trigger time for the transaction.
     * @returns {Boolean} Returns true if the payment operation is successful.
     * @throws {Error} Throws an error if any validation fails or if the operation encounters an issue.
     */
    async paymentFlow(ctx, paymentInfo, triggerTime) {
        this.Verify.checkFieldsNotEmpty({ paymentInfo, triggerTime });
        let paymentDataObj;
        try {
            paymentDataObj = JSON.parse(paymentInfo);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `paymentFlow: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(paymentDataObj, 'paymentInfo object');
        this.Verify.validateStructure(paymentDataObj, paymentFlowInfo);

        const { user_name, bank_card_number, bank_name, transaction_serial_number, amount, creditor_id, corporation_id } = paymentDataObj;

        // Check required fields
        const requiredFields = { user_name, bank_card_number, bank_name, transaction_serial_number, creditor_id, corporation_id };
        this.Verify.checkFieldsNotEmpty(requiredFields);

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.numberError,
                `paymentFlow: amount ${Number(amount)} should be a positive number`
            );
        }
        const transactionKey = transactionPrefix + transaction_serial_number;

        // Check if transaction_serial_number already exists
        const transactionExists = await ctx.stub.getState(transactionKey);
        if (transactionExists && transactionExists.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `paymentFlow: The transaction serial number ${transaction_serial_number} has already been stored`
            );
        }

        /// Create event data
        let paymentFlowEvent = {
            method_name: 'PaymentFlow',
            transaction_serial_number: transaction_serial_number,
            bank_card_number: bank_card_number,
            amount: amount,
            trigger_time: parseInt(triggerTime)
        };

        //Store paymentInfo on the chain
        await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(paymentDataObj)));
        /// trigger event
        await ctx.stub.setEvent('PaymentFlow', Buffer.from(JSON.stringify(paymentFlowEvent)));

        this.Debug.logDebug('paymentDataObj:', paymentDataObj);
        this.Debug.logDebug('paymentFlowEvent:', paymentFlowEvent);

        return true;
    }

    /**
     * _creditExists checks if credit information for a given account exists on the blockchain.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} account The account identifier for which credit information is being checked.
     * @returns {Boolean} Returns true if credit information exists for the specified account; otherwise, returns false.
     * @throws {Error} Throws an error if there is an issue with accessing blockchain state or if the operation encounters an issue.
     */
    async _creditExists(ctx, account) {
        const creditKey = creditPrefix + account;
        const creditBytes = await ctx.stub.getState(creditKey);
        return creditBytes && creditBytes.length > 0;
    }

    /**
     * _readCredit retrieves credit information for a given account from the blockchain.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} account The account identifier for which credit information is being retrieved.
     * @returns {Object} Returns an object containing credit information if it exists for the specified account.
     * @throws {Error} Throws an error if there is an issue with accessing blockchain state or if the credit information does not exist.
     */
    async _readCredit(ctx, account) {
        const creditKey = creditPrefix + account;
        const creditBytes = await ctx.stub.getState(creditKey);
        if (!creditBytes || creditBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `readCredit: The credit${account} is invalid. It does not exist`
            );
        }

        const credit = JSON.parse(creditBytes.toString());
        return credit;
    }

}

module.exports = trade;