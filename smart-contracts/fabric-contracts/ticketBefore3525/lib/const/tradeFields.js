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

module.exports = {
    creditInfo,
    transferInfo,
    paymentFlowInfo
};