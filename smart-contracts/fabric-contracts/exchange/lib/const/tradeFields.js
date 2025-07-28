/*
/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// 保存授信信息传参
const creditInfo = {
    // 账号
    account: '',
    // 商户号
    merchantId: '',
    // 授信的额度
    creditLimit: '',
    // 质押的金额
    pledgeAmount: '',
    // 资产key
    assetsKey: '',
    // 序列号
    seqNo: ''
};

// 授信交易传参
const transferInfo = {
    // 卖方商户号
    issuer_id: '',
    // 卖家web3地址
    issuer_account: '',
    // 买家 id
    receiver_id: '',
    // 买家web3地址
    receiver_account: '',
    // 资产key
    assetsKey: '',
    // 授信的额度
    amount: '',
    // 交易流水号
    tradeNo: ''
};

// 银行流水存证
const paymentFlowInfo = {
    // 用户名
    user_name: '',
    // 银行卡号
    bank_card_number: '',
    // 银行
    bank_name: '',
    // 流水号
    transaction_serial_number: '',
    // 数量
    amount: '',
    // 债权人 Id
    creditor_id: '',
    // 公司 Id
    corporation_id: ''
};

// ================== Trade Object Schema ==========================

const creditInfoSchema = {
    type: 'object',
    properties: {
        account: { type: 'string' },
        merchant_id: { type: 'string' },
        credit_limit: { type: 'string' },
        pledge_amount: { type: 'string' },
        assets_key: { type: 'string' },
        seq_no: { type: 'string' },
        merchant_name: { type: 'string' },
        org: { type: 'string' }
    },
    required: ['account', 'merchant_id', 'credit_limit', 'pledge_amount', 'assets_key', 'seq_no', 'merchant_name', 'org'],
    additionalProperties: false
};

const transferInfoSchema = {
    type: 'object',
    properties: {
        issuer_id: { type: 'string' },
        issuer_account: { type: 'string' },
        receiver_id: { type: 'string' },
        receiver_account: { type: 'string' },
        assets_key: { type: 'string' },
        amount: { type: 'string' },
        trade_no: { type: 'string' },
        issuer_name: { type: 'string' },
        issuer_org: { type: 'string' },
        receiver_name: { type: 'string' },
        receiver_org: { type: 'string' },
        out_trade_no: { type: 'string' },
        goods_name: { type: 'string' },
        payment_time: { type: 'string' }
    },
    required: ['issuer_id', 'issuer_account', 'receiver_id', 'receiver_account', 'assets_key', 'amount', 'trade_no', 'issuer_name', 'issuer_org', 'receiver_name', 'receiver_org', 'out_trade_no', 'goods_name', 'payment_time'],
    additionalProperties: false
};

const paymentFlowInfoSchema = {
    type: 'object',
    properties: {
        transaction_serial_number: { type: 'string' },
        amount: { type: 'string' },
        creditor_id: { type: 'string' },
        bank_card_number: { type: 'string' },
        bank_name: { type: 'string' },
        corporation_id: { type: 'string' },
        trade_no: { type: 'string' },
        creditor_name: { type: 'string' },
        debtor_id: { type: 'string' },
        debtor_name: { type: 'string' },
        payment_time: { type: 'string' }
    },
    required: ['transaction_serial_number', 'amount','creditor_id','bank_card_number','bank_name','corporation_id','trade_no','creditor_name','debtor_id','debtor_name','payment_time'],
    additionalProperties: false
};

module.exports = {
    creditInfo,
    transferInfo,
    paymentFlowInfo,
    creditInfoSchema,
    transferInfoSchema,
    paymentFlowInfoSchema
};