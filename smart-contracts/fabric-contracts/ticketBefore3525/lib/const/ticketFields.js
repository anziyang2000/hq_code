/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// ================== Ticket Object ==========================

// 区块链门票铸造结构
const TicketInfo = {
    // 附加信息(可更新的字段)
    AdditionalInformation: {
        // 价格策略
        PriceInfo: [
            {
                // 价格详细信息
                PriceDetailedInfo: {
                    // 佣金比例
                    commission_rate: 0,
                    // 组合销售价
                    compose_price: 0,
                    // 分组
                    group: [''],
                    // 组合销售
                    is_compose: true,
                    // 价格 id
                    price_id: '',
                    // 销售价
                    sale_price: 0
                },
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: ''
            }
        ],
        // 核销信息集合
        TicketCheckData: [{}],
        // 出票信息
        TicketData:  {
            // 游客信息
            BuyerInfo: [
                {
                    // 姓名
                    buyerInfo_id_name: '',
                    // 身份证
                    id_number: ''
                }
            ],
            // 退订人数
            cancel_count: 0,
            // 已检票人数
            checked_num: 0,
            // 入园开始时段
            enter_begin_time: '',
            // 入园结束时段
            enter_end_time: '',
            // 入园时间
            enter_time: '',
            // 类型
            issuance_type: 0,
            // 组合订单id
            order_group_id: '',
            // 订单号
            order_id: '',
            // 过期时间
            overdue_time: '',
            // 联系人手机号
            phone:'',
            // 游玩人数
            player_num: 0,
            // 二维码
            print_encode: '',
            // 服务商id
            provider_id: '',
            // 销售渠道
            sale_channel: 0,
            // 实际售价
            selling_price: 0,
            // 门票状态
            status: 0,
            // 店铺id
            store_id: '',
            // 票号
            ticket_id: '',
            // 已使用次数
            used_count: 0,
            // 已入园天数
            used_days: 0
        }
    },
    // 基本信息(不变的字段)
    BasicInformation: {
        // 产品信息
        SimpleTicket: {
            // 库存信息
            TicketStock: {
                // 结算id
                account_id: '',
                // 景区批次号
                batch_id: '',
                // 每天库存
                nums: 0,
                // 购买有效开始时间
                purchase_begin_time: '',
                // 购买有效结束时间
                purchase_end_time: '',
                // 入园有效开始时间
                stock_enter_begin_time: '',
                // 入园有效结束时间
                stock_enter_end_time: '',
                // 服务商id
                stock_operator_id: '',
                // 景区id
                stock_scenic_id: '',
                // 景区名称
                stock_scenic_name: '',
                // 产品id
                stock_ticket_id: '',
                // 产品名称
                ticket_name: '',
                // 产品类型
                ticket_type: 0,
                // 总库存
                total_stock: 0,
            },
            // 可入园天数
            available_days: 0,
            // 首日激活（开/关）
            is_activate: 0,
            // 市场标准价格
            market_price: 0,
            // 服务商id
            operator_id: '',
            // 入园统计（开/关）
            park_statistic: 0,
            // 产品类型
            pro_type: 0,
            // 控制方式（不控制/按星期控制）
            restrict_type: 0,
            // 控制星期
            restrict_week: '',
            // 景区id
            scenic_id: '',
            // 景区名称
            scenic_name: '',
            // 产品名称
            simple_name: '',
            // 商品信息集合
            ticketGoods: [
                {
                    // 检票规则
                    RuleCheck: {
                        // 检票通行方式
                        adopt_type: 0,
                        // 检票点
                        check_point_ids: [''],
                        // 检票控制方式
                        control_type: 0,
                        // 身份识别类型
                        identity_type: '',
                        // 检票间隔时间
                        interval_time: 0,
                        // 检票规则名称
                        ruleCheck_name: '',
                        // 分时预约设置
                        time_share_book: 0
                    },
                    // 出票规则
                    RuleIssue: {
                        // 审批内容
                        approve_content: '',
                        // 审批id
                        approve_id: '',
                        // 实名方式
                        is_real_name: 0,
                        // 审批(开/关)
                        need_approval: 0,
                        // 限制本人购买
                        only_owner_buy: 0,
                        // 仅窗口售票(开/关)
                        only_window_sale: 0,
                        // 校验实名制
                        real_name_check: 0,
                        // 校验权益
                        rights_check: 0,
                        // 权益id
                        rights_id: '',
                        // 当天购票开始时间
                        ruleIssue_begin_time: '',
                        // 当天购票结束时间
                        ruleIssue_end_time: '',
                        // 出票规则名称
                        ruleIssue_name: '',
                        // 出票类型
                        ruleIssue_type: 0,
                        // 出票方式
                        ruleIssue_way: 0,
                        // 规则类型(权益票/权益卡/普通票)
                        rule_type: 0,
                        // 使用时间
                        use_time: ''
                    },
                    // 退票规划
                    RuleRetreat: {
                        // 默认退票费率
                        default_rate: 0,
                        // 可退票(开/关)
                        is_retreat: 0,
                        // 退票规则名称
                        ruleRetreat_name: ''
                    },
                    // 分销商开始折扣率
                    begin_discount: 0,
                    // 分销商结束折扣率
                    end_discount: 0,
                    // 商品名称
                    goods_name: '',
                    // 单次最大预订量
                    max_people: 0,
                    // 最小起订量
                    min_people: 0,
                    // 特殊折扣率
                    overall_discount: 0,
                    // 购买数量限制(开/关)
                    people_number: 0,
                    // 商品id
                    ticketGoods_id: '',
                    // 票种
                    ticketGoods_type: 0,
                    // 分时预约id
                    time_share_id: ''
                }
            ],
            // 分时预约集合
            timeSharing: [
                {
                    // 分时预约开始时间
                    timeSharing_begin_time: '',
                    // 分时预约结束时间
                    timeSharing_end_time: '',
                    // 分时预约id
                    timeSharing_id: ''
                }
            ],
            // 分时预约（开/关）
            time_restrict: 0,
            // 使用次数
            use_count: 0,
            // 使用方式（每天/一共）
            use_type: 0,
            // 使用有效期
            validity_day: 0
        },
        // 是否交易所发布
        is_exchange: 0
    }
};

// 一个核销信息的数据结构
const TicketCheck =  {
    //账户
    account: '',
    // 核销次数
    check_number: 0,
    // 检票类型
    check_type: 0,
    // 核销时间
    enter_time: '',
    // 检票设备 id
    equipment_id: '',
    // 检票设备名称
    equipment_name: '',
    // 检票设备类型
    equipment_type: '',
    // 身份证
    id_card: '',
    // 姓名
    id_name: '',
    // 组织
    org: '',
    // 检票点id
    point_id: '',
    // 检票点名称
    point_name: '',
    // 二维码
    qr_code: '',
    // 景区id
    scenic_id: '',
    // 库存批次号
    stock_batch_number: '',
    // 票号
    ticket_number: '',
    // 操作人员用户 id
    user_id: '',
    // 操作人员用户名
    username: ''
};

// 整个门票的数据结构
const tickets = {
    // 可使用的门票数量
    balance: '',
    // 门票URL等信息
    metadata: {
        description: '',
        token_url: ''
    },
    // 门票拥有者
    owner: '',
    // 区块链门票铸造结构
    slot: TicketInfo,
    // 记录库存
    stockBatchNumber: [],
    // 门票唯一标识符
    token_id: '',
    // 总的门票数量
    total_balance: ''
};

// 更新核销记录时，需要传递的数据结构
const VerifyTicket = {
    VerifyStatus: {
        // 门票状态
        status: 0,
        // 票号
        ticket_id: '',
        // 已检票人数
        checked_num: 0,
        // 已使用次数
        used_count: 0,
        // 已入园天数
        used_days: 0
    },
    VerifyInfo:  {
        //账户
        account: '',
        // 组织
        org: '',
        // 检票类型
        check_type: 0,
        // 票号
        ticket_number: '',
        // 库存批次号
        stock_batch_number: '',
        // 核销时间
        enter_time: '',
        // 核销次数
        check_number: 0,
        // 景区id
        scenic_id: '',
        // 姓名
        id_name: '',
        // 身份证
        id_card: '',
        // 二维码
        qr_code: '',
        // 检票点名称
        point_name: '',
        // 检票点id
        point_id: '',
        // 检票设备名称
        equipment_name: '',
        // 检票设备 id
        equipment_id: '',
        // 检票设备类型
        equipment_type: '',
        // 操作人员用户 id
        user_id: '',
        // 操作人员用户名
        username: ''
    }
};

// 生成票号、二维码、签名的时，需要传递的数据结构
const GenerateTicketNumberInfo = {
    //游玩时间
    enter_time : '',
    //游玩人数
    player_num : 0,
    //RSA证书
    certificate : '',
    //流水号（票号后四位）
    rand : '',
    //景区id
    scenic_id : '',
    //产品类型
    pro_type : 0,
    //分时预约id
    time_share_id : 0,
    //分时预约检票设置
    time_share_book : 0,
    //分时预约开始时间
    begin_time : '',
    //分时预约结束时间
    end_time : '',
    //检票点id集合
    check_point_ids : [1,2,3],
    //随机数(8位)
    uuid : ''
};

// 生成票号的时候需要记录的从哪个库存分割出来的
const TokenIds = [
    {
        stock_batch_number: '',
        sender: '',
        amount: 0
    }
];

const UpdatedFields ={
    TicketData:{
        // 游客信息
        BuyerInfo: [
            {
                // 姓名
                buyerInfo_id_name: '',
                // 身份证
                id_number: ''
            }
        ],
        // 联系人手机号
        phone:'',
        // 销售渠道
        sale_channel: 0,
        // 订单号
        order_id: '',
        // 组合订单id
        order_group_id: '',
        // 游玩人数
        player_num: 0,
        // 类型
        issuance_type: 0,
        // 门票状态
        status: 0,
        // 票号
        ticket_id: '',
        // 二维码
        print_encode: '',
        // 入园开始时段
        enter_begin_time: '',
        // 入园结束时段
        enter_end_time: '',
        // 过期时间
        overdue_time: '',
        // 服务商id
        provider_id: '',
        // 店铺id
        store_id: '',
        // 实际售价
        selling_price: 0,
        // 退订人数
        cancel_count: 0,
        // 入园时间
        enter_time: '',
        // 已检票人数
        checked_num: 0,
        // 已使用次数
        used_count: 0,
        // 已入园天数
        used_days: 0
        // // 购买账号
        // account: '',
        // // 购买组织
        // org: ''
    },
    PriceInfo:[
        {
            // 分销商
            distributor_id: '',
            // 商品 id
            goods_id: '',
            // 价格详细信息
            PriceDetailedInfo: {
                // 价格 id
                price_id: '',
                // 销售价
                sale_price: 0,
                // 组合销售价
                compose_price: 0,
                // 佣金比例
                commission_rate: 0,
                // 组合销售
                is_compose: true,
                // 分组
                group: ['']
            }
        }
    ],
    TicketCheckData: [
        {
            //账户
            account: '',
            // 组织
            org: '',
            // 检票类型
            check_type: 0,
            // 票号
            ticket_number: '',
            // 库存批次号
            stock_batch_number: '',
            // 核销时间
            enter_time: '',
            // 核销次数
            check_number: 0,
            // 景区id
            scenic_id: '',
            // 姓名
            id_name: '',
            // 身份证
            id_card: '',
            // 二维码
            qr_code: '',
            // 检票点名称
            point_name: '',
            // 检票点id
            point_id: '',
            // 检票设备名称
            equipment_name: '',
            // 检票设备 id
            equipment_id: '',
            // 检票设备类型
            equipment_type: '',
            // 操作人员用户 id
            user_id: '',
            // 操作人员用户名
            username: ''
        }
    ]
};

// 更新价格策略的数据结构
const PriceInfo = {
    // 分销商
    distributor_id: '',
    // 商品 id
    goods_id: '',
    // 价格详细信息
    PriceDetailedInfo: {
        // 价格 id
        price_id: '',
        // 销售价
        sale_price: 0,
        // 组合销售价
        compose_price: 0,
        // 佣金比例
        commission_rate: 0,
        // 组合销售
        is_compose: true,
        // 分组
        group: {
            add_group_id: [''],
            del_group_id: [''],
            group_id: ['']
        }
    }
};

// 过期门票推送的数据结构
const TimerUpdateTickets = {
    // 门票状态
    status: 0,
    // 票号
    ticket_id: ''
};

// ================== Ticket Object Schema ==========================

const PriceInfoSchema = {
    type: 'object',
    properties: {
        distributor_id: { type: 'string' },
        goods_id: { type: 'string' },
        PriceDetailedInfo: {
            type: 'object',
            properties: {
                price_id: { type: 'string' },
                sale_price: { type: 'number' },
                compose_price: { type: 'number' },
                commission_rate: { type: 'number' },
                is_compose: { type: 'boolean' },
                group: {
                    type: 'object',
                    properties: {
                        add_group_id: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        del_group_id: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        group_id: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    },
                    required: ['add_group_id', 'del_group_id', 'group_id'],
                    additionalProperties: false
                }
            },
            required: ['price_id', 'sale_price', 'compose_price', 'commission_rate', 'is_compose', 'group'],
            additionalProperties: false
        }
    },
    required: ['distributor_id', 'goods_id', 'PriceDetailedInfo'],
    additionalProperties: false
};

module.exports = {
    tickets,
    TicketCheck,
    VerifyTicket,
    GenerateTicketNumberInfo,
    TokenIds,
    UpdatedFields,
    PriceInfo,
    TimerUpdateTickets,
    TicketInfo,
    PriceInfoSchema
};
