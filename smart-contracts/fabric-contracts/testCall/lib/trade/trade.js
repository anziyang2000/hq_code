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
const { creditPrefix, tradePrefix, transactionPrefix, TYPE_MODIFY_OR_NEW, TYPE_ACTIVATE, contractCode, STORAGE_CREDIT, STORAGE_TRANSFER,STORAGE_BANK, STORAGE_ACTIVATE, transferCreditPrefix } = require('../const/constants');
const { creditInfoSchema, transferInfoSchema, paymentFlowInfoSchema } = require('../const/tradeFields');
// , transferCreditPrefix, paymentFlowPrefix

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
    // async storeCreditInfo(ctx, type, creditData, triggerTime) {
    //     await this.Permission.checkAdminAndGetUserID(ctx);
    //     this.Verify.checkFieldsNotEmpty({ type, creditData, triggerTime });
    //     let creditDataObj;
    //     try {
    //         creditDataObj = JSON.parse(creditData);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `storeCreditInfo: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(creditDataObj, 'creditData object');
    //     // this.Verify.validateStructure(creditDataObj, creditInfo);
    //     this.Verify.validateData(creditInfoSchema, creditDataObj);

    //     const { account, merchantId, creditLimit, pledgeAmount, assetsKey, seqNo } = creditDataObj;
    //     const requiredFields = { account, merchantId, assetsKey, seqNo };
    //     this.Verify.checkFieldsNotEmpty(requiredFields);

    //     const creditKey = creditPrefix + assetsKey;
    //     // Check if seqNo already exists
    //     const serialKey = tradePrefix + seqNo;
    //     const serialExists = await ctx.stub.getState(serialKey);
    //     if (serialExists && serialExists.length > 0) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `storeCreditInfo: The serial number ${seqNo} has already been used`
    //         );
    //     }

    //     let storeCreditInfoEvent = {
    //         method_name: 'StoreCreditInfo',
    //         type,
    //         account,
    //         value: '',
    //         seq_no: seqNo,
    //         trigger_time: parseInt(triggerTime)
    //     };

    //     // Verify that type is the expected value
    //     if (![TYPE_MODIFY_OR_NEW, TYPE_ACTIVATE].includes(type)) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.type,
    //             `storeCreditInfo: Invalid type: ${type}`
    //         );
    //     }
    //     if (type === TYPE_MODIFY_OR_NEW) {
    //         // Add or modify
    //         const exists = await this._creditExists(ctx, assetsKey);
    //         this.Verify.checkFieldsNotEmpty({ creditLimit });
    //         if (isNaN(creditLimit) || Number(creditLimit) < 0) {
    //             throw this.ErrorObj.createError(
    //                 contractCode.businessError.numberError,
    //                 `storeCreditInfo: creditLimit ${Number(creditLimit)} cannot be empty and cannot be less than 0`
    //             );
    //         }

    //         let creditInfo;
    //         if (exists) {
    //             // Revise
    //             creditInfo = await this._readCredit(ctx, assetsKey);
    //             creditInfo.credit_limit = creditLimit;
    //             creditInfo.owner = account;
    //             creditInfo.merchant_id = merchantId;
    //             creditInfo.seq_no = seqNo;
    //         } else {
    //             // Add
    //             creditInfo = {
    //                 owner: account,
    //                 merchant_id: merchantId,
    //                 credit_limit: creditLimit,
    //                 pledge_amount: '0',  // When adding, pledgeAmount is '0'
    //                 seq_no: seqNo,
    //             };
    //         }

    //         this.Debug.logDebug('creditInfo:', creditInfo);
    //         storeCreditInfoEvent.value = creditLimit;
    //         await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(creditInfo)));

    //         this.Debug.logDebug('***************', creditInfo);
    //     }
    //     if (type === TYPE_ACTIVATE) {
    //         // activation
    //         const exists = await this._creditExists(ctx, assetsKey);
    //         if (!exists) {
    //             throw this.ErrorObj.createError(
    //                 contractCode.businessError.notExist,
    //                 `storeCreditInfo: The credit${assetsKey} does not exist`
    //             );
    //         }

    //         this.Verify.checkFieldsNotEmpty({ pledgeAmount });
    //         if (isNaN(pledgeAmount) || Number(pledgeAmount) < 0) {
    //             throw this.ErrorObj.createError(
    //                 contractCode.businessError.numberError,
    //                 `storeCreditInfo: pledgeAmount ${Number(pledgeAmount)} cannot be empty and cannot be less than 0`
    //             );
    //         }

    //         const credit = await this._readCredit(ctx, assetsKey);
    //         // // Get the existing credit information and check the pledge amount (remove the restriction that it can only be activated once)
    //         // if (credit.pledge_amount !== '0') {
    //         //     throw new Error('storeCreditInfo: The credit has been activated');
    //         // }

    //         // Update the pledge amount
    //         credit.pledge_amount = pledgeAmount;
    //         storeCreditInfoEvent.value = pledgeAmount;
    //         this.Debug.logDebug('Activated creditInfo:', credit);

    //         await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(credit)));
    //     }

    //     // Store seqNo to the blockchain
    //     await ctx.stub.putState(serialKey, Buffer.from('used'));
    //     // event
    //     await ctx.stub.setEvent('StoreCreditInfo', Buffer.from(JSON.stringify(storeCreditInfoEvent)));

    //     return true;
    // }

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
    // async transferCredit(ctx, from, to, creditData, triggerTime) {
    //     await this.Permission.checkInitialized(ctx);
    //     this.Verify.checkFieldsNotEmpty({ from, to, creditData, triggerTime });
    //     let creditDataObj;
    //     try {
    //         creditDataObj = JSON.parse(creditData);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `transferCredit: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(creditDataObj, 'creditData object');
    //     // this.Verify.validateStructure(creditDataObj, transferInfo);
    //     this.Verify.validateData(transferInfoSchema, creditDataObj);

    //     // Deconstruct the creditData object
    //     // const { issuer_id, issuer_account, assetsKey, amount, tradeNo } = creditDataObj;
    //     const { issuer_id, issuer_account, receiver_id, receiver_account, assetsKey, amount, tradeNo } = creditDataObj;

    //     // Check required fields
    //     const requiredFields = { issuer_id, issuer_account, receiver_id, receiver_account, assetsKey, amount, tradeNo };
    //     this.Verify.checkFieldsNotEmpty(requiredFields);

    //     // Check if tradeNo already exists
    //     const serialKey = tradePrefix + tradeNo;
    //     const serialExists = await ctx.stub.getState(serialKey);
    //     if (serialExists && serialExists.length > 0) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `transferCredit: The serial number ${tradeNo} has already been used`
    //         );
    //     }

    //     // Check if the issuer_account account has credit information
    //     const fromExists = await this._creditExists(ctx, assetsKey);
    //     if (!fromExists) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.notExist,
    //             `transferCredit: The credit account ${assetsKey} does not exist`
    //         );
    //     }

    //     // Check if the to account exists, if not, create the credit information
    //     const toExists = await this._creditExists(ctx, issuer_id);
    //     if (!toExists) {
    //         // Create a new account with an initial credit limit of 0
    //         const toCredit = {
    //             owner: issuer_account,
    //             merchant_id: issuer_id,
    //             // value: amount
    //             credit_limit: ''
    //         };

    //         const toCreditKey = creditPrefix + issuer_id;
    //         await ctx.stub.putState(toCreditKey, Buffer.from(JSON.stringify(toCredit)));
    //     }

    //     // Store tradeNo to the blockchain
    //     await ctx.stub.putState(serialKey, Buffer.from('used'));

    //     // Triggering a transfer event
    //     const transferCreditEvent = {
    //         method_name: 'TransferCredit',
    //         from: receiver_account,
    //         to: issuer_account,
    //         value: amount,
    //         trade_no: tradeNo,
    //         trigger_time: parseInt(triggerTime)
    //     };
    //     await ctx.stub.setEvent('TransferCredit', Buffer.from(JSON.stringify(transferCreditEvent)));

    //     return true;
    // }

    /**
     * paymentFlow handles the payment flow by storing payment information and triggering payment events.
     *
     * @param {Context} ctx The transaction context.
     * @param {String} paymentInfo JSON string containing payment information.
     * @param {String} triggerTime The trigger time for the transaction.
     * @returns {Boolean} Returns true if the payment operation is successful.
     * @throws {Error} Throws an error if any validation fails or if the operation encounters an issue.
     */
    // async paymentFlow(ctx, paymentInfo, triggerTime) {
    //     this.Verify.checkFieldsNotEmpty({ paymentInfo, triggerTime });
    //     let paymentDataObj;
    //     try {
    //         paymentDataObj = JSON.parse(paymentInfo);
    //     } catch (error) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.parse,
    //             `paymentFlow: JSON parsing or object check failed: ${error.message}`
    //         );
    //     }
    //     this.Verify.checkObjectNotEmpty(paymentDataObj, 'paymentInfo object');
    //     // this.Verify.validateStructure(paymentDataObj, paymentFlowInfo);
    //     this.Verify.validateData(paymentFlowInfoSchema, paymentDataObj);

    //     const { user_name, bank_card_number, bank_name, transaction_serial_number, amount, creditor_id, corporation_id } = paymentDataObj;

    //     // Check required fields
    //     const requiredFields = { user_name, bank_card_number, bank_name, transaction_serial_number, creditor_id, corporation_id };
    //     this.Verify.checkFieldsNotEmpty(requiredFields);

    //     if (!amount || isNaN(amount) || Number(amount) <= 0) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.numberError,
    //             `paymentFlow: amount ${Number(amount)} should be a positive number`
    //         );
    //     }
    //     const transactionKey = transactionPrefix + transaction_serial_number;

    //     // Check if transaction_serial_number already exists
    //     const transactionExists = await ctx.stub.getState(transactionKey);
    //     if (transactionExists && transactionExists.length > 0) {
    //         throw this.ErrorObj.createError(
    //             contractCode.businessError.conflict,
    //             `paymentFlow: The transaction serial number ${transaction_serial_number} has already been stored`
    //         );
    //     }

    //     /// Create event data
    //     let paymentFlowEvent = {
    //         method_name: 'PaymentFlow',
    //         transaction_serial_number: transaction_serial_number,
    //         bank_card_number: bank_card_number,
    //         amount: amount,
    //         trigger_time: parseInt(triggerTime)
    //     };

    //     //Store paymentInfo on the chain
    //     await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(paymentDataObj)));
    //     /// trigger event
    //     await ctx.stub.setEvent('PaymentFlow', Buffer.from(JSON.stringify(paymentFlowEvent)));

    //     this.Debug.logDebug('paymentDataObj:', paymentDataObj);
    //     this.Debug.logDebug('paymentFlowEvent:', paymentFlowEvent);

    //     return true;
    // }

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

    async informationStorage(ctx, storageType, info, triggerTime) {
        this.Verify.checkFieldsNotEmpty({ storageType, info, triggerTime });
        // type: 1预授信信息上链  2预授信转账信息上链  3银行凭证信息上链  4交易所还款上链
        if (![STORAGE_CREDIT, STORAGE_TRANSFER, STORAGE_BANK, STORAGE_ACTIVATE].includes(storageType)) {
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `_informationStorage: Invalid type: ${storageType}`
            );
        }
        let infoObj;
        try {
            infoObj = JSON.parse(info);
        } catch (error) {
            throw this.ErrorObj.createError(
                contractCode.businessError.parse,
                `informationStorage: JSON parsing or object check failed: ${error.message}`
            );
        }
        this.Verify.checkObjectNotEmpty(infoObj, 'info object');
        if (storageType === STORAGE_CREDIT) {
            await this.Permission.checkAdminAndGetUserID(ctx);
            const { type, creditData } = infoObj;
            this.Verify.checkFieldsNotEmpty({ type, creditData });
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
            // this.Verify.validateStructure(creditDataObj, creditInfo);
            this.Verify.validateData(creditInfoSchema, creditDataObj);

            const { account, merchant_id, credit_limit, pledge_amount, assets_key, seq_no, merchant_name, org } = creditDataObj;
            const requiredFields = { account, merchant_id, credit_limit, assets_key, seq_no, merchant_name, org };
            this.Verify.checkFieldsNotEmpty(requiredFields);
            if (isNaN(credit_limit) || Number(credit_limit) < 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.numberError,
                    `storeCreditInfo: credit_limit ${Number(credit_limit)} cannot be empty and cannot be less than 0`
                );
            }

            const creditKey = creditPrefix + seq_no;
            // Check if seq_no already exists
            const serialKey = tradePrefix + seq_no;
            const serialExists = await ctx.stub.getState(serialKey);
            if (serialExists && serialExists.length > 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `storeCreditInfo: The serial number ${seq_no} has already been used`
                );
            }

            let storeCreditInfoEvent = {
                method_name: 'StoreCreditInfo',
                type,
                account,
                value: '',
                seq_no: seq_no,
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
                const creditInfo = {
                    type: TYPE_MODIFY_OR_NEW,
                    info: {
                        owner: account,
                        merchant_id: merchant_id,
                        credit_limit: credit_limit,
                        seq_no: seq_no,
                        assets_key: assets_key,
                        merchant_name: merchant_name,
                        org: org
                    }
                };

                this.Debug.logDebug('creditInfo:', creditInfo);
                storeCreditInfoEvent.value = credit_limit;
                await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(creditInfo)));
                this.Debug.logDebug('***************', creditInfo);
            }
            if (type === TYPE_ACTIVATE) {
                const credit = {
                    type: TYPE_MODIFY_OR_NEW,
                    info: {
                        owner: account,
                        merchant_id: merchant_id,
                        credit_limit: credit_limit,
                        seq_no: seq_no,
                        assets_key: assets_key,
                        merchant_name: merchant_name,
                        org: org
                    }
                };

                // Update the pledge amount
                storeCreditInfoEvent.value = pledge_amount;
                this.Debug.logDebug('Activated creditInfo:', credit);

                await ctx.stub.putState(creditKey, Buffer.from(JSON.stringify(credit)));
            }

            // Store seqNo to the blockchain
            await ctx.stub.putState(serialKey, Buffer.from('used'));
            // event
            await ctx.stub.setEvent('StoreCreditInfo', Buffer.from(JSON.stringify(storeCreditInfoEvent)));
        }
        if (storageType === STORAGE_TRANSFER) {
            await this.Permission.checkInitialized(ctx);
            const { from, to, creditData } = infoObj;
            this.Verify.checkFieldsNotEmpty({ from, to, creditData });
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
            // this.Verify.validateStructure(creditDataObj, transferInfo);
            this.Verify.validateData(transferInfoSchema, creditDataObj);

            // Deconstruct the creditData object
            // const { issuer_id, issuer_account, assetsKey, amount, tradeNo } = creditDataObj;
            const { issuer_id, issuer_account, receiver_id, receiver_account, assets_key, amount, trade_no, issuer_name, issuer_org, receiver_name, receiver_org, out_trade_no, goods_name, payment_time } = creditDataObj;

            // Check required fields
            const requiredFields = { issuer_id, issuer_account, receiver_id, receiver_account, assets_key, amount, trade_no, issuer_name, issuer_org, receiver_name, receiver_org, out_trade_no, goods_name, payment_time  };
            this.Verify.checkFieldsNotEmpty(requiredFields);

            // Check if trade_no already exists
            const transferCreditKey = transferCreditPrefix + trade_no;
            const serialKey = tradePrefix + trade_no;
            const serialExists = await ctx.stub.getState(serialKey);
            if (serialExists && serialExists.length > 0) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.conflict,
                    `transferCredit: The serial number ${trade_no} has already been used`
                );
            }

            // 创建一个新的对象，将新属性放在前面，然后合并原始对象
            const updatedCreditDataObj = {
                type: STORAGE_TRANSFER,
                info: {
                    issuer_id,
                    issuer_account,
                    receiver_id,
                    receiver_account,
                    assets_key,
                    amount,
                    trade_no,
                    issuer_name,
                    issuer_org,
                    receiver_name,
                    receiver_org,
                    out_trade_no,
                    goods_name,
                    payment_time
                }
            };

            // Store tradeNo to the blockchain
            await ctx.stub.putState(transferCreditKey, Buffer.from(JSON.stringify(updatedCreditDataObj)));
            await ctx.stub.putState(serialKey, Buffer.from('used'));

            // Triggering a transfer event
            const transferCreditEvent = {
                method_name: 'TransferCredit',
                from: receiver_account,
                to: issuer_account,
                value: amount,
                trade_no: trade_no,
                trigger_time: parseInt(triggerTime)
            };
            await ctx.stub.setEvent('TransferCredit', Buffer.from(JSON.stringify(transferCreditEvent)));

        }
        if (storageType === STORAGE_BANK) {
            this.Verify.validateData(paymentFlowInfoSchema, infoObj);
            const { transaction_serial_number, amount, creditor_id, bank_card_number, bank_name, corporation_id, trade_no, creditor_name, debtor_id, debtor_name, payment_time } = infoObj;
            // Check required fields
            const requiredFields = { transaction_serial_number, creditor_id, bank_card_number, bank_name, corporation_id, trade_no, creditor_name, debtor_id, debtor_name, payment_time };
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

            // 创建一个新的对象，将新属性放在前面，然后合并原始对象
            const updatedCreditDataObj = {
                type: STORAGE_BANK,
                info: {
                    transaction_serial_number,
                    amount,
                    creditor_id,
                    bank_card_number,
                    bank_name,
                    corporation_id,
                    trade_no,
                    creditor_name,
                    debtor_id,
                    debtor_name,
                    payment_time
                }
            };

            //Store paymentInfo on the chain
            await ctx.stub.putState(transactionKey, Buffer.from(JSON.stringify(updatedCreditDataObj)));
            // trigger event
            await ctx.stub.setEvent('PaymentFlow', Buffer.from(JSON.stringify(paymentFlowEvent)));
            this.Debug.logDebug('paymentDataObj:', infoObj);
            this.Debug.logDebug('paymentFlowEvent:', paymentFlowEvent);
        }

        return true;
    }

}

module.exports = trade;