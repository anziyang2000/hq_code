/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const AssetFields = {
    assetId: '',                // 资产ID
    assetType: '',              // 资产类型
    number: '',               // 数量（仅在发布数字资产时需要）
    status: '',                 // 资产状态，待审核、审核通过、审核驳回等
    paymentStatus: '',          // 交易收款状态，待确认、已确认等（仅在交易收款确认时需要）
    assetDetails: {},           // 资产详情 ？？
    transactionHistory: []      // 交易历史记录 ？？
};

module.exports = AssetFields;




