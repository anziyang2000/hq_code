/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Define objectType names for prefix
const nftPrefix = 'nft';
const approvalPrefix = 'approval';
const orderIdPrefix= 'orderId';
const listPrefix= 'listId';
const creditPrefix= 'credit';
const tradePrefix= 'trade';
const transactionPrefix= 'transaction';

// Define key names for options
const lockKey= 'lock';
const orgAdminMappingKey= 'orgAdminMapping';
const nameKey = 'name'; // TODO: 改成 contractName
const symbolKey = 'symbol';

// Define fields in business
const PURCHASE_ORDER = 'Purchase'; // B 端购票及订单上链
const REFUND_ORDER = 'Refund'; // B 端退票及退单上链
const AVAILABLE_RATIO = '0'; // B 端交易冻结比例
const Ticket_REFUND = 4; // 退票后票的状态
const NEW_PRICE_STRATEGY = '0'; // 设置价格策略-分销新增
const UPDATE_PRICE_STRATEGY = '1'; // 设置价格策略-分销修改
const NULL_STRING = ''; // 设置价格策略-直销
const ISSUANCE_TYPE_MULTIPLE = '1'; // 一票多人
const ISSUANCE_TYPE_SINGLE = '0';   // 一票一人
const TYPE_MODIFY_OR_NEW = '2'; // 预授信信息上链
const TYPE_ACTIVATE = '3';  // 预授信额度激活

// Return information code
const contractCode = {
    success: 2000,
    businessError: {
        numberError: 3001, // 数量错误（例如balance不够扣减）
        conflict: 3002, // 冲突错误（例如已经铸造的又铸造）
        parse: 3003, //解析对象错误
        store: 3004, //存储（上链）错误
        notFound: 3005, // 某个字段/对象为空错误
        type: 3006, // 类型错误（数据类型对不上，多传/少传
        notOwner: 3007, // 不是门票的所有者
        notExist: 3008, // 门票/订单不存在错误
    },
    serviceError: {
        init: 4001, // 初始化一次错误
        identity: 4002, // 调用者身份错误
        lock: 4003, // 暂停提供服务错误（锁合约）
    }
};

module.exports = {
    nftPrefix,
    approvalPrefix,
    orderIdPrefix,
    listPrefix,
    creditPrefix,
    tradePrefix,
    transactionPrefix,
    lockKey,
    orgAdminMappingKey,
    nameKey,
    symbolKey,
    PURCHASE_ORDER,
    REFUND_ORDER,
    AVAILABLE_RATIO,
    Ticket_REFUND,
    NEW_PRICE_STRATEGY,
    UPDATE_PRICE_STRATEGY,
    NULL_STRING,
    ISSUANCE_TYPE_MULTIPLE,
    ISSUANCE_TYPE_SINGLE,
    TYPE_MODIFY_OR_NEW,
    TYPE_ACTIVATE,
    contractCode
};