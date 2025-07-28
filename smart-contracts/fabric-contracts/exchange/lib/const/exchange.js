/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// ================== Exchange Object ==========================
// 交易所要上链的数据结构

// 公告项目信息的数据结构
const ProjectBidding = {
    // 企业ID
    company_id: '',
    // 交易所ID
    exchange_id: '',
    // 节点描述 审核备注
    node_description: '',
    // 父项目ID
    parent_project_id: '',
    // 附件的文件ID集合,逗号隔开
    project_annex: '',
    // 项目上链唯一id
    project_chain_unique_id: '',
    // 项目详情
    project_description: '',
    // 1拍，2拍，3拍
    project_grade: '',
    //项目id
    project_id: '',
    // 项目名称
    project_name: '',
    // 项目编号
    project_number: '',
    // 项目状态
    project_status: '',
    // 项目类型
    project_type: '',
    // 审核时间
    review_time: ''
};

// 标的票务信息
const InstrumentTicket = {
    // 购买结束时间
    buy_end_date: '',
    // 购买开始时间
    buy_start_date: '',
    // 商品ID
    goods_id: '',
    //  标的信息
    instrument: {
        // 资产类型
        asset_type: '',
        // 企业ID
        company_id: '',
        // 联系人名称
        contact_name: '',
        // 联系人电话
        contact_phone: '',
        // 标的附件(文件IDs)
        instrument_annex: '',
        // 标的规则
        instrument_bidding_rule: {
            // 加价或减价幅度
            bidding_changes: '',
            // 成交规则
            bidding_deal_rule: '',
            // 延时时间（秒）
            bidding_delay_time: '',
            // 竞拍保证金
            bidding_deposit: '',
            // 保证金比例
            bidding_deposit_ratio: '',
            // 其他规则描述
            bidding_description: '',
            // 竞价结束时间
            bidding_end_time: '',
            // 拍卖起始价
            bidding_start_price: '',
            // 竞价开始时间
            bidding_start_time: '',
            // 拍卖类型
            bidding_type: '',
            // 拍次 (1拍，2拍，3拍)
            instrument_grade: '',
            // 标的ID
            instrument_id: '',
            // 总数量
            instrument_quantity: '',
            // 拍卖底价：针对降价拍
            lowest_price: '',
            // 市场价
            market_price: ''
        },
        // 标的销售
        instrument_bidding_sales: {
            // 出价数量
            bid_quantity: '',
            // 当前价
            current_price: '',
            // 当前剩余数量，针对即刻拍
            current_remaining_quantity: '',
            // 预计结束时间
            estimated_end_time: '',
            // 预计开始时间
            estimated_start_time: '',
            // 标的ID
            instrument_id: '',
            // 围观次数
            instrument_views: '',
            // 报名数
            registration_quantity: '',
        },
        // 标的描述
        instrument_description: '',
        // 标的ID
        instrument_id: '',
        // 宣传图片(文件IDs)
        instrument_images: '',
        // 标的物名称
        instrument_name: '',
        // 标的状态
        instrument_status: '',
        // 标的类型
        instrument_type: '',
        // 宣传视频
        instrument_video: '',
        // 父标的ID
        parent_instrument_id: '',
        // 项目ID
        project_id: '',
    },
    // 标的ID
    instrument_id: '',
    // 项目上链唯一id
    project_chain_unique_id: '',
    // 产品类型
    product_type: '',
    // 景区所属区
    scenic_area_code: '',
    // 景区所属市
    scenic_city_code: '',
    // 景区ID
    scenic_id: '',
    // 景区所属省
    scenic_province_code: '',
    // 票种
    ticket_type: '',
    // 入园结束时间
    use_end_date: '',
    // 入园开始时间
    use_start_date: ''
};

// 保证金订单上链
const MarginOrder = {
    // 标的信息
    Instrument: {
        // 保证金信息
        bidbond: {
            // 保证金数额
            bidbondAmount: '',
            // 订单创建时间
            createTime: '',
            // 订单号
            orderId: '',
            // 授权号
            outTradeNo: '',
            // 授权明细号
            tradeNo: '',
        },
        // 竞买人ID
        buyerId:'',
        // 竞买人名称
        buyerName:'',
        // 标的物ID
        instrumentId:'',
        // 标的物名称
        instrumentName:'',
        // 委托方ID
        sellerId:'',
        // 委托方名称'
        sellerName:''
    },
    // 交易所信息
    exchange: {
        // 交易所 Id
        exchangeId: '',
        // 交易所名称
        exchangeName: ''
    },
    // 公告 Id
    projectId: '',
    // 公告名称
    projectName: '',
};

// 保证金支付成功上链
const MarginPayment = {
    // 标的信息
    Instrument: {
        // 保证金信息
        bidbond: {
            // 竞买号
            bidNumber: '',
            // 保证金数额
            bidbondAmount: '',
            // 授权号
            outTradeNo: '',
            // 支付时间
            paymentTime: '',
            // 支付号
            paymentTradeNo: '',
            // 授权明细号
            tradeNo: '',
        },
        // 竞买人ID
        buyerId:'',
        // 竞买人名称
        buyerName:'',
        // 标的物ID
        instrumentId:'',
        // 标的物名称
        instrumentName:'',
        // 委托方ID
        sellerId:'',
        // 委托方名称'
        sellerName:''
    },
    // 交易所信息
    exchange: {
        // 交易所 Id
        exchangeId: '',
        // 交易所名称
        exchangeName: ''
    },
    // 公告 Id
    projectId: '',
    // 公告名称
    projectName: '',
};

// 竞拍摘牌订单上链
const InstrumentOrder = {
    //买方ID
    buyer_id: '',
    // 企业ID
    company_id: '',
    // 企业名称
    company_name: '',
    //创建时间
    create_time: '',
    // 交易所id
    exchange_id: '',
    // 交易所名称
    exchange_name: '',
    // 标的物id
    instrument_id: '',
    // 标的物名称
    instrument_name: '',
    // 公告id
    project_id: '',
    // 公告名称
    project_name: '',
    // 卖方ID
    seller_id: '',
    //交易明细
    settlement_id: '',
    //支付渠道
    settlement_type: '',
    //交易金额
    trade_amount: '',
    //交易时间
    trade_datetime: '',
    // 订单ID
    trade_id: '',
    //交易状态
    trade_status: '',
    //交易类型
    trade_type: '',
    //修改时间
    update_time: ''
};

// 保证金转为价款信息上链
const ConvertToInvoice =  {
    // 保证金金额
    bidbond_amount: '',
    // 竞买人ID
    buyer_id: '',
    // 竞买人名称
    buyer_name: '',
    //保证金转为价款金额
    converted_amount: '',
    // 交易所ID
    exchange_id: '',
    // 交易所名称
    exchange_name: '',
    // 标的物ID
    instrument_id: '',
    // 标的物名称
    instrument_name: '',
    // 公告ID
    project_id: '',
    // 公告名称
    project_name: '',
    // 委托方ID
    seller_id: '',
    // 委托方名称
    seller_name: '',
    // 状态：已转为价款
    status: '',
    //成交总金额
    transaction_amount: '',
    // 更新时间
    update_time: ''
};

// 保证金余款自动退回信息上链
const RefundBalance =  {
    // 保证金金额
    bidbond_amount: '',
    // 竞买人ID
    buyer_id: '',
    // 竞买人名称
    buyer_name: '',
    //保证金转为价款金额
    converted_amount: '',
    // 交易所ID
    exchange_id: '',
    // 交易所名称
    exchange_name: '',
    // 标的物ID
    instrument_id: '',
    // 标的物名称
    instrument_name: '',
    // 公告ID
    project_id: '',
    // 公告名称
    project_name: '',
    //保证金退回金额
    refund_amount: '',
    // 委托方ID
    seller_id: '',
    // 委托方名称
    seller_name: '',
    //成交总金额
    transaction_amount: '',
    // 状态：已退回
    status: '',
    // 更新时间
    update_time: ''
};

// 保证金全额自动退回信息上链
const FullRefund =  {
    // 保证金金额
    bidbond_amount: '',
    // 竞买人ID
    buyer_id: '',
    // 竞买人名称
    buyer_name: '',
    // 交易所ID
    exchange_id: '',
    // 交易所名称
    exchange_name: '',
    // 标的物ID
    instrument_id: '',
    // 标的物名称
    instrument_name: '',
    // 公告ID
    project_id: '',
    // 公告名称
    project_name: '',
    //保证金退回金额
    refund_amount: '',
    // 委托方ID
    seller_id: '',
    // 委托方名称
    seller_name: '',
    // 状态：已退回
    status: '',
    // 更新时间
    update_time: ''
};

// 交易服务费订单信息上链
const TradeCharge  = {
    // 审核结果
    audit_result: '',
    // 审核时间
    audit_time: '',
    // 服务费金额
    charge_amount: '',
    // 收费对象
    charge_object: '',
    // 企业名称
    company_name: '',
    // 创建时间
    create_time: '',
    // 到期时间
    expiry_datetime: '',
    // 银行水单（图片）
    file_url: '',
    // 收款单位名称
    payee_account_name: '',
    // 收款单位银行账号
    payee_account_number: '',
    // 收款单位开户银行名称
    payee_bank_name: '',
    // 付款单位名称
    payer_account_name: '',
    // 付款单位银行账号
    payer_account_number: '',
    // 付款单位开户银行名称
    payer_bank_name: '',
    // 状态
    payment_status: '',
    // 不通过原因
    remark: '',
    // 提交验证时间
    submit_time: '',
    // 交易服务费订单号
    trade_charge_id: '',
    // 关联成交订单号
    trade_id: '',
    // 银行交易流水号
    transaction_flow_id: ''
};

// ================== Exchange Object Schema ==========================

const ProjectBiddingSchema = {
    type: 'object',
    properties: {
        project_id: { type: 'string' },
        parent_project_id: { type: 'string' },
        project_type: { type: 'string' },
        project_number: { type: 'string' },
        exchange_id: { type: 'string' },
        company_id: { type: 'string' },
        project_name: { type: 'string' },
        project_grade: { type: 'string' },
        project_description: { type: 'string' },
        project_annex: { type: 'string' },
        project_status: { type: 'string' },
        project_chain_unique_id: { type: 'string' },
        node_description: { type: 'string' },
        review_time: { type: 'string' }
    },
    required: ['project_id', 'parent_project_id', 'project_type', 'project_number', 'exchange_id', 'company_id', 'project_name', 'project_grade', 'project_description', 'project_annex', 'project_status', 'project_chain_unique_id', 'node_description', 'review_time'],
    additionalProperties: false
};

const InstrumentTicketSchema = {
    type: 'object',
    properties: {
        buy_end_date: { type: 'string' },
        buy_start_date: { type: 'string' },
        goods_id: { type: 'string' },
        instrument_id: { type: 'string' },
        product_type: { type: 'string' },
        scenic_area_code: { type: 'string' },
        scenic_city_code: { type: 'string' },
        scenic_id: { type: 'string' },
        scenic_province_code: { type: 'string' },
        ticket_type: { type: 'string' },
        use_end_date: { type: 'string' },
        use_start_date: { type: 'string' },
        project_chain_unique_id: { type: 'string' },
        instrument: {
            type: 'object',
            properties: {
                instrument_id: { type: 'string' },
                project_id: { type: 'string' },
                parent_instrument_id: { type: 'string' },
                company_id: { type: 'string' },
                asset_type: { type: 'string' },
                instrument_type: { type: 'string' },
                instrument_name: { type: 'string' },
                instrument_images: { type: 'string' },
                instrument_video: { type: 'string' },
                instrument_description: { type: 'string' },
                instrument_annex: { type: 'string' },
                contact_name: { type: 'string' },
                contact_phone: { type: 'string' },
                instrument_status: { type: 'string' },
                instrument_bidding_rule: {
                    type: 'object',
                    properties: {
                        instrument_id: { type: 'string' },
                        instrument_grade: { type: 'string' },
                        bidding_start_time: { type: 'string' },
                        bidding_end_time: { type: 'string' },
                        bidding_delay_time: { type: 'string' },
                        bidding_type: { type: 'string' },
                        bidding_start_price: { type: 'string' },
                        bidding_deal_rule: { type: 'string' },
                        bidding_deposit: { type: 'string' },
                        bidding_changes: { type: 'string' },
                        instrument_quantity: { type: 'string' },
                        bidding_description: { type: 'string' },
                        market_price: { type: 'string' },
                        bidding_deposit_ratio: { type: 'string' },
                        lowest_price: { type: 'string' }
                    },
                    required: ['instrument_id', 'instrument_grade', 'bidding_start_time', 'bidding_end_time', 'bidding_delay_time', 'bidding_type', 'bidding_start_price', 'bidding_deal_rule', 'bidding_deposit', 'bidding_changes', 'instrument_quantity', 'bidding_description', 'market_price', 'bidding_deposit_ratio', 'lowest_price' ],
                    additionalProperties: false
                },
                instrument_bidding_sales: {
                    type: 'object',
                    properties: {
                        instrument_id: { type: 'string' },
                        instrument_views: { type: 'string' },
                        registration_quantity: { type: 'string' },
                        bid_quantity: { type: 'string' },
                        current_price: { type: 'string' },
                        current_remaining_quantity: { type: 'string' },
                        estimated_start_time: { type: 'string' },
                        estimated_end_time: { type: 'string' },
                    },
                    required: ['instrument_id', 'instrument_views', 'registration_quantity', 'bid_quantity', 'current_price', 'current_remaining_quantity', 'estimated_start_time', 'estimated_end_time'],
                    additionalProperties: false
                }
            },
            required: ['instrument_id', 'project_id', 'parent_instrument_id', 'company_id', 'asset_type', 'instrument_type', 'instrument_name', 'instrument_images', 'instrument_video', 'instrument_description', 'instrument_annex', 'contact_name', 'contact_phone', 'instrument_status', 'instrument_bidding_rule', 'instrument_bidding_sales'],
            additionalProperties: false
        }
    },
    required: [ 'buy_end_date', 'buy_start_date', 'goods_id', 'instrument_id', 'product_type', 'scenic_area_code', 'scenic_city_code', 'scenic_id', 'scenic_province_code', 'ticket_type', 'use_end_date', 'use_start_date', 'project_chain_unique_id', 'instrument' ],
    additionalProperties: false
};

const MarginOrderSchema = {
    type: 'object',
    properties: {
        projectId: { type: 'string' },
        projectName: { type: 'string' },
        exchange: {
            type: 'object',
            properties: {
                exchangeId: { type: 'string' },
                exchangeName: { type: 'string' }
            },
            required: ['exchangeId', 'exchangeName'],
            additionalProperties: false
        },
        Instrument: {
            type: 'object',
            properties: {
                instrumentId: { type: 'string' },
                instrumentName: { type: 'string' },
                sellerId: { type: 'string' },
                sellerName: { type: 'string' },
                buyerId: { type: 'string' },
                buyerName: { type: 'string' },
                bidbond: {
                    type: 'object',
                    properties: {
                        bidbondAmount: { type: 'string' },
                        outTradeNo: { type: 'string' },
                        tradeNo: { type: 'string' },
                        createTime: { type: 'string' },
                        orderId: { type: 'string' }
                    },
                    required: ['bidbondAmount', 'outTradeNo', 'tradeNo', 'createTime', 'orderId'],
                    additionalProperties: false
                },
            },
            required: ['instrumentId', 'instrumentName', 'sellerId', 'sellerName', 'buyerId', 'buyerName', 'bidbond'],
            additionalProperties: false
        },
    },
    required: ['projectId', 'projectName', 'exchange', 'Instrument' ],
    additionalProperties: false
};

const MarginPaymentSchema = {
    type: 'object',
    properties: {
        projectId: { type: 'string' },
        projectName: { type: 'string' },
        exchange: {
            type: 'object',
            properties: {
                exchangeId: { type: 'string' },
                exchangeName: { type: 'string' }
            },
            required: ['exchangeId', 'exchangeName'],
            additionalProperties: false
        },
        Instrument: {
            type: 'object',
            properties: {
                instrumentId: { type: 'string' },
                instrumentName: { type: 'string' },
                sellerId: { type: 'string' },
                sellerName: { type: 'string' },
                buyerId: { type: 'string' },
                buyerName: { type: 'string' },
                bidbond: {
                    type: 'object',
                    properties: {
                        bidbondAmount: { type: 'string' },
                        outTradeNo: { type: 'string' },
                        tradeNo: { type: 'string' },
                        bidNumber: { type: 'string' },
                        paymentTradeNo: { type: 'string' },
                        paymentTime: { type: 'string' }
                    },
                    required: ['bidbondAmount', 'outTradeNo', 'tradeNo', 'bidNumber', 'paymentTradeNo', 'paymentTime'],
                    additionalProperties: false
                },
            },
            required: ['instrumentId', 'instrumentName', 'sellerId', 'sellerName', 'buyerId', 'buyerName', 'bidbond'],
            additionalProperties: false
        },
    },
    required: ['projectId', 'projectName', 'exchange', 'Instrument' ],
    additionalProperties: false
};

const InstrumentOrderSchema = {
    type: 'object',
    properties: {
        trade_id: { type: 'string' },
        exchange_id: { type: 'string' },
        seller_id: { type: 'string' },
        buyer_id: { type: 'string' },
        trade_amount: { type: 'string' },
        trade_type: { type: 'string' },
        trade_status: { type: 'string' },
        trade_datetime: { type: 'string' },
        create_time: { type: 'string' },
        update_time: { type: 'string' },
        company_id: { type: 'string' },
        company_name: { type: 'string' },
        project_id: { type: 'string' },
        project_name: { type: 'string' },
        exchange_name: { type: 'string' },
        instrument_id: { type: 'string' },
        instrument_name: { type: 'string' },
        settlement_id: { type: 'string' },
        settlement_type: { type: 'string' }
    },
    required: ['trade_id', 'exchange_id', 'seller_id', 'buyer_id', 'trade_amount', 'trade_type', 'trade_status', 'trade_datetime', 'create_time', 'update_time', 'company_id', 'company_name', 'project_id', 'project_name', 'exchange_name', 'instrument_id', 'instrument_name', 'settlement_id', 'settlement_type' ],
    additionalProperties: false
};

const ConvertToInvoiceSchema = {
    type: 'object',
    properties: {
        project_id: { type: 'string' },
        project_name: { type: 'string' },
        exchange_id: { type: 'string' },
        exchange_name: { type: 'string' },
        seller_id: { type: 'string' },
        seller_name: { type: 'string' },
        instrument_id: { type: 'string' },
        instrument_name: { type: 'string' },
        buyer_id: { type: 'string' },
        buyer_name: { type: 'string' },
        bidbond_amount: { type: 'string' },
        transaction_amount: { type: 'string' },
        converted_amount: { type: 'string' },
        status: { type: 'string' },
        update_time: { type: 'string' }
    },
    required: ['project_id', 'project_name', 'exchange_id', 'exchange_name', 'seller_id', 'seller_name', 'instrument_id', 'instrument_name', 'buyer_id', 'buyer_name', 'bidbond_amount', 'transaction_amount', 'converted_amount', 'status', 'update_time' ],
    additionalProperties: false
};

const RefundBalanceSchema = {
    type: 'object',
    properties: {
        project_id: { type: 'string' },
        project_name: { type: 'string' },
        exchange_id: { type: 'string' },
        exchange_name: { type: 'string' },
        seller_id: { type: 'string' },
        seller_name: { type: 'string' },
        instrument_id: { type: 'string' },
        instrument_name: { type: 'string' },
        buyer_id: { type: 'string' },
        buyer_name: { type: 'string' },
        bidbond_amount: { type: 'string' },
        transaction_amount: { type: 'string' },
        converted_amount: { type: 'string' },
        refund_amount: { type: 'string' },
        status: { type: 'string' },
        update_time: { type: 'string' }
    },
    required: ['project_id', 'project_name', 'exchange_id', 'exchange_name', 'seller_id', 'seller_name', 'instrument_id', 'instrument_name', 'buyer_id', 'buyer_name', 'bidbond_amount', 'transaction_amount', 'converted_amount', 'refund_amount', 'status', 'update_time' ],
    additionalProperties: false
};

const FullRefundSchema = {
    type: 'object',
    properties: {
        project_id: { type: 'string' },
        project_name: { type: 'string' },
        exchange_id: { type: 'string' },
        exchange_name: { type: 'string' },
        seller_id: { type: 'string' },
        seller_name: { type: 'string' },
        instrument_id: { type: 'string' },
        instrument_name: { type: 'string' },
        buyer_id: { type: 'string' },
        buyer_name: { type: 'string' },
        bidbond_amount: { type: 'string' },
        refund_amount: { type: 'string' },
        status: { type: 'string' },
        update_time: { type: 'string' }
    },
    required: ['project_id', 'project_name', 'exchange_id', 'exchange_name', 'seller_id', 'seller_name', 'instrument_id', 'instrument_name', 'buyer_id', 'buyer_name', 'bidbond_amount', 'refund_amount', 'status', 'update_time' ],
    additionalProperties: false
};

const TradeChargeSchema = {
    type: 'object',
    properties: {
        trade_charge_id: { type: 'string' },
        trade_id: { type: 'string' },
        charge_object: { type: 'string' },
        company_name: { type: 'string' },
        charge_amount: { type: 'string' },
        payment_status: { type: 'string' },
        create_time: { type: 'string' },
        expiry_datetime: { type: 'string' },
        payee_account_name: { type: 'string' },
        payee_account_number: { type: 'string' },
        payee_bank_name: { type: 'string' },
        transaction_flow_id: { type: 'string' },
        payer_account_name: { type: 'string' },
        payer_account_number: { type: 'string' },
        payer_bank_name: { type: 'string' },
        file_url: { type: 'string' },
        submit_time: { type: 'string' },
        audit_result: { type: 'string' },
        remark: { type: 'string' },
        audit_time: { type: 'string' }
    },
    required: ['trade_charge_id', 'trade_id', 'charge_object', 'company_name', 'charge_amount', 'payment_status', 'create_time', 'expiry_datetime', 'payee_account_name', 'payee_account_number', 'payee_bank_name', 'transaction_flow_id', 'payer_account_name', 'payer_account_number', 'payer_bank_name', 'file_url', 'submit_time', 'audit_result', 'remark', 'audit_time' ],
    additionalProperties: false
};

module.exports = {
    ProjectBidding,
    ProjectBiddingSchema,
    InstrumentTicket,
    InstrumentTicketSchema,
    MarginOrder,
    MarginPayment,
    MarginOrderSchema,
    MarginPaymentSchema,
    InstrumentOrder,
    InstrumentOrderSchema,
    ConvertToInvoice,
    ConvertToInvoiceSchema,
    RefundBalance,
    RefundBalanceSchema,
    FullRefund,
    FullRefundSchema,
    TradeCharge,
    TradeChargeSchema
};