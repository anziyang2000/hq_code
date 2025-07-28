/*
/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// 区块链c端 订单信息 的结构
const OrderInfo = {
    // 主订单 id
    order_group_id: '',
    // 订单状态
    order_status: '',
    // 订单类型
    order_type: '',
    // 订单金额
    total_amount: 0,
    // 支付金额
    pay_amount: 0,
    // 支付方式
    pay_type: 0,
    // 渠道
    source_type: 0,
    // 库存凭证
    stock_certificate: '',
    // 结算交易号
    trade_no: '',
    // 下单用户 id
    user_id: '',
    // 下单用户名称
    username: '',
    // 支付时间
    pay_time: '',
    // 用户手机号
    user_phone: '',
    // 子订单信息
    OrderTab:[
        {
            // 订单 id
            order_id: '',
            // 订单类型
            order_type: '',
            // 卖方 id
            seller_id: 0,
            // 卖方名称
            seller_name: '',
            // 订单金额
            total_amount: 0,
            // 支付方式
            pay_type: 0,
            // 渠道
            source_type: 0,
            // 订单状态
            order_status: '',
            // 结算交易号
            trade_no: '',
            // 平台商户编号
            merchant_id: '',
            // 店铺 id
            store_id: 0,
            // 代理商 id
            agent_id: 0,
            // 代理商名称
            agent_name: '',
            // 佣金结算类型
            commission_settled_type: 0,
            // 下单用户 id
            user_id: '',
            // 下单用户名称
            username: '',
            // 支付时间
            pay_time: '',
            // 更新时间
            modify_time: '',
            // 支付人数
            pay_people: 0,
            // 下单用户昵称
            nickname: '',
            // 个人商户号
            merchant_no: '',
            // 订单产品信息
            OrderProductTicketData: [
                {
                    // 景区 id
                    scenic_id: 0,
                    // 景区名称
                    scenic_name: '',
                    // 票种
                    ticket_type: 0,
                    // 游玩时间
                    day: '',
                    // 分时预约 id
                    time_share_id: 0,
                    // 分时预约时间
                    time_share: '',
                    // 组合票产品 id
                    parent_product_id: 0,
                    // 佣金类型
                    commission_type: 0,
                    // 佣金比例
                    commission_rate: 0,
                    // 佣金数量
                    commission_amount: 0,
                    // 实际佣金
                    actual_com_amount: 0,
                    // 账号
                    bds_account: '',
                    // 组织
                    bds_org: '',
                    // 票种 id
                    ticket_type_id: 0,
                    // 子产品 id
                    ticket_type_sub_id: 0,
                    // 游玩人数
                    real_quantity: 0,
                    //普通订单产品票务信息
                    OrderProductTicketRnData: [
                        {
                            //普通订单产品票务信息主键
                            id: 0,
                            //订单商品ID
                            order_product_id: 0,
                            //票号
                            ticket_number: '',
                            //票状态
                            ticket_status: 0,
                            //佣金结算统计状态0：未结， 1：已结
                            commission_settled_status: 0,
                            //是否上链(1是0否)
                            is_chain: 0,
                            //账单状态 （ 1 待生成 2 生成中 3 已生成 ）
                            bill_status: 0,
                            //出票类型 0、一票一人 1、一票多人
                            issue_ticket_type: 0
                        }
                    ]
                }
            ]
        }
    ]
};

// 采购订单 上链的结构
const DistributionOrderInfo  = {
    // 主订单 id
    order_group_id: '',
    // 订单状态
    order_status: '',
    // 订单类型
    order_type: '',
    // 订单金额
    total_amount: 0,
    // 支付方式
    pay_type: 0,
    // 渠道
    source_type: 0,
    // 库存品凭证
    stock_certificate: '',
    // 结算交易号
    trade_no: '',
    // 下单用户 id
    user_id: '',
    // 下单用户名称
    username: '',
    // 支付时间
    pay_time: '',
    // 凭证
    cert_id: '',
    // 用户手机
    user_phone: '',
    // 子订单信息
    orderTabToBData: [
        {
            // 订单号
            order_id: '',
            // 订单类型
            order_type: '',
            // 卖方 id
            seller_id: 0,
            // 卖方名称
            seller_name: '',
            // 订单金额
            total_amount: 0,
            // 支付金额
            pay_amount: 0,
            // 支付方式
            pay_type: 0,
            // 支付时间
            pay_time: '',
            // 渠道
            source_type: 0,
            // 订单状态
            order_status: '',
            // 结算订单号
            trade_no: '',
            // 平台商户编号
            merchant_id: '',
            // 店铺 id
            store_id: 0,
            // 代理商 id
            agent_id: 0,
            // 代理商名称
            agent_name: '',
            // 佣金结算类型
            commission_settled_type: 0,
            // 下单用户 id
            user_id: '',
            // 下单用户名称
            username: '',
            // 下单用户昵称
            nickname: '',
            // 个人商户号
            merchant_no: ''
        }
    ],
    // 分销订单信息
    orderTabDistributeData: [
        {
            // 订单 id
            order_id: '',
            // 买方公司 id
            buyer_id: 0,
            // 买方公司名称
            buyer_name: '',
            // 卖方公司 id
            seller_id: 0,
            // 卖方公司名称
            seller_name: '',
            // 服务商 id
            service_provider_id: 0,
            // 服务商名称
            service_provider_name: '',
            // 分销订单商品
            OrderProductDistributeData: [
                {
                    // 景区 id
                    scenic_id: 0,
                    // 景区名称
                    scenic_name: '',
                    // 分销产品配置 id
                    distributor_ticket_stock_id: 0,
                    // 批次号
                    batch_id: '',
                    // 票种
                    ticket_type: 0,
                    // 入园开始时间
                    day_begin: '',
                    // 入园结束时间
                    day_end: '',
                    // 分时预约时间
                    time_share: '',
                    // 可用数量
                    usable_num: 0,
                    // 订单&商品关联 id
                    order_product_id: 0,
                    // 订单 id
                    order_id: '',
                    // 产品 id
                    product_id: 0,
                    // 产品名称
                    product_name: '',
                    // 商品 id
                    product_sku_id: 0,
                    // 商品名称
                    product_sku_name: '',
                    // 产品价格
                    product_price: 0,
                    // 购买数量
                    num: 0,
                    // 产品类型
                    product_type: 0,
                    //预授信本金比例
                    available_ratio: '',
                    //冻结数量
                    exchange_freeze_num: '',
                    //当前批次可用的总数
                    available_total_num: ''
                }
            ]
        }
    ]
};

// 采购退单 上链的结构
const DistributeRefundInfo = {
    // 组退订表（暂时无用处）
    orderRefundGroup: [
        {
            // 组退订表 id
            order_refund_group_id: '',
            // 组订单 id
            order_group_id: '',
            // 退单 id
            order_refund_id: '',
            // 创建时间
            create_time: ''
        }
    ],
    // 退订主表
    orderRefund: [
        {
            // 退单 id
            refund_id: '',
            // 订单 id
            order_id: '',
            // 退款金额
            refund_amount: 0,
            // 退款手续费
            refund_fee: 0,
            // 退订状态
            refund_status: '',
            // 退订类别
            refund_type: '',
            // 结算单号
            trade_no: '',
            // 退订时间
            refund_time: '',
            // 创建时间
            create_time: '',
            // 退订原因
            remark: '',
            // 退款失败原因
            fail_message: '',
            // 退款人 id
            user_id: '',
            // 退款人名称
            username: '',
            // 佣金结算状态
            commission_settled_status: '',
            // 库存凭证
            stock_certificate: '',
            // 商品名称
            product_sku_name: ''
        }
    ],
    // 退单产品信息
    orderRefundProductDistribute: [
        {
            // 商品 id
            refund_id: '',
            // 订单&商品关联 id
            order_product_id: '',
            // 退票数量
            num: 0,
            // 产品 id
            product_id: '',
            // 产品名称
            product_name: '',
            // 商品 id
            product_sku_id: '',
            // 产品类型
            product_type: '',
            // 产品价格
            product_price: '',
            // 入园有效开始时间
            day_begin: '',
            // 入园有效结束时间
            day_end: '',
            // 分时预约 id
            time_share_id: '',
            // 分时预约时间
            time_share: '',
            // 景区 id
            scenic_id: '',
            // 景区名称
            scenic_name: '',
            // 批次 id
            batch_id: '',
            // 分销产品配置 id
            distribute_ticket_stock_id: ''
        }
    ]
};

// C端窗口退票
const OrderRefundInfoToC = {
    // 退订单子表
    refundInfoToC: {
        // 退订单 id
        refund_id: '',
        // 主订单号
        order_group_id: '',
        // 订单号
        order_id: '',
        // 退款金额
        refund_amount: 0,
        // 退款手续费
        refund_fee: 0,
        // 退票状态
        refund_status: '',
        // 退票类型
        refund_type: 0,
        // 退款结算交易单号
        trade_no: '',
        // 退款时间
        refund_time: '',
        // 退款原因
        remark: '',
        // 退款失败原因
        fail_message: '',
        // 佣金结算统计状态
        commission_settled_status: 0,
        // 退单库存凭证
        stock_certificate: '',
        // 商品名称
        product_sku_name: '',
        // 退款人 id
        user_id: 0,
        // 退款人名称
        username: '',
        // 账单状态
        bill_status: 0
    },
    // 退订单产品表
    refundProductTicketToC: [
        {
            // 退订单 id
            refund_id: '',
            // 订单商品 id
            order_product_id: 0,
            // 票号
            ticket_number: '',
            // 产品 id
            product_id: 0,
            // 产品名称
            product_name: '',
            // 商品 id
            product_sku_id: 0,
            // 商品类型
            product_type: 0,
            // 票种
            ticket_type: 0,
            // 入园时间
            day: '',
            // 实名人
            name: '',
            // 身份证号码
            identity: '',
            // 销售渠道
            source_type: 0,
            // 退款金额
            refund_amount: '',
            // 退款手续费
            refund_fee: '',
            // 退款数量
            refund_num: 0,
            // 库存回退信息
            stock_batch_info: [
                {
                    stock_batch_number: '',
                    sender: '',
                    amount: 0
                }
            ]
        }
    ]
};

// 解冻库存 的结构
const ActiveInfo = {
    // 订单 id
    order_id: '',
    // 批次 id
    batch_id: '',
    // 库存 id
    token_id: '',
    //当前批次可用的总数
    available_total_num: '',
    // 当前期数
    periods: '',
    // 总期数
    total_periods: '',
    // 结算交易号
    trade_no: '',
    // 当前还款金额
    amount: '',
    // 总还款金额
    total_repayment: ''
};

module.exports = {
    OrderInfo,
    DistributionOrderInfo,
    DistributeRefundInfo,
    OrderRefundInfoToC,
    ActiveInfo
};