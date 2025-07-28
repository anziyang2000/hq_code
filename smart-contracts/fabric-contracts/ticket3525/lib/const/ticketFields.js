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
                    sale_price: 0,
                },
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: ''
            }
        ],
        // 可变的库存信息
        StockInfo: {
            // 购买有效开始时间
            purchase_begin_time: '',
            // 购买有效结束时间
            purchase_end_time: '',
            // 入园有效开始时间
            stock_enter_begin_time: '',
            // 入园有效结束时间
            stock_enter_end_time: '',
        },
        // 核销信息集合
        TicketCheckData: [
            {
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
            }
        ],
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
            used_days: 0,
            // 库存批次号
            stock_batch_number: '',
            // // 账户
            // account: '',
            // // 组织
            // org: '',
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

const ticketSplit = {
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
    slot: {},
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
        // 接收者 id
        user_id: '',
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
        used_days: 0,
        // 库存批次号
        stock_batch_number: '',
        // 账户
        account: '',
        // 组织
        org: '',
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

const TicketInfoSchema = {
    type: 'object',
    properties: {
        AdditionalInformation: {
            type: 'object',
            properties: {
                PriceInfo: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            PriceDetailedInfo: {
                                type: 'object',
                                properties: {
                                    commission_rate: { type: 'number' },
                                    compose_price: { type: 'number' },
                                    group: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    },
                                    is_compose: { type: 'boolean' },
                                    price_id: { type: 'string' },
                                    sale_price: { type: 'number' }
                                },
                                required: ['commission_rate', 'compose_price', 'group', 'is_compose', 'price_id', 'sale_price'],
                                additionalProperties: false
                            },
                            distributor_id: { type: 'string' },
                            goods_id: { type: 'string' }
                        },
                        required: ['PriceDetailedInfo', 'distributor_id', 'goods_id'],
                        additionalProperties: false
                    }
                },
                StockInfo: {
                    type: 'object',
                    properties: {
                        purchase_begin_time: { type: 'string' },
                        purchase_end_time: { type: 'string' },
                        stock_enter_begin_time: { type: 'string' },
                        stock_enter_end_time: { type: 'string' },
                    },
                    required: ['purchase_begin_time', 'purchase_end_time', 'stock_enter_begin_time', 'stock_enter_end_time'],
                    additionalProperties: false
                },
                TicketCheckData: {
                    type: 'array',
                    items: { type: 'object' }
                },
                TicketData: {
                    type: 'object',
                    properties: {
                        BuyerInfo: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    buyerInfo_id_name: { type: 'string' },
                                    id_number: { type: 'string' }
                                },
                                required: ['buyerInfo_id_name', 'id_number'],
                                additionalProperties: false
                            }
                        },
                        cancel_count: { type: 'number' },
                        checked_num: { type: 'number' },
                        enter_begin_time: { type: 'string' },
                        enter_end_time: { type: 'string' },
                        enter_time: { type: 'string' },
                        issuance_type: { type: 'number' },
                        order_group_id: { type: 'string' },
                        order_id: { type: 'string' },
                        overdue_time: { type: 'string' },
                        phone: { type: 'string' },
                        player_num: { type: 'number' },
                        print_encode: { type: 'string' },
                        provider_id: { type: 'string' },
                        sale_channel: { type: 'number' },
                        selling_price: { type: 'number' },
                        status: { type: 'number' },
                        store_id: { type: 'string' },
                        ticket_id: { type: 'string' },
                        used_count: { type: 'number' },
                        used_days: { type: 'number' },
                        stock_batch_number: { type: 'string' }
                    },
                    required: ['BuyerInfo', 'cancel_count', 'checked_num', 'enter_begin_time', 'enter_end_time', 'enter_time', 'issuance_type', 'order_group_id', 'order_id', 'overdue_time', 'phone', 'player_num', 'print_encode', 'provider_id', 'sale_channel', 'selling_price', 'status', 'store_id', 'ticket_id', 'used_count', 'used_days','stock_batch_number'],
                    additionalProperties: false
                }
            },
            required: ['PriceInfo', 'StockInfo', 'TicketCheckData', 'TicketData'],
            additionalProperties: false
        },
        BasicInformation: {
            type: 'object',
            properties: {
                SimpleTicket: {
                    type: 'object',
                    properties: {
                        TicketStock: {
                            type: 'object',
                            properties: {
                                account_id: { type: 'string' },
                                batch_id: { type: 'string' },
                                nums: { type: 'number' },
                                stock_operator_id: { type: 'string' },
                                stock_scenic_id: { type: 'string' },
                                stock_scenic_name: { type: 'string' },
                                stock_ticket_id: { type: 'string' },
                                ticket_name: { type: 'string' },
                                ticket_type: { type: 'number' },
                                total_stock: { type: 'number' }
                            },
                            required: ['account_id', 'batch_id', 'nums', 'stock_operator_id', 'stock_scenic_id', 'stock_scenic_name', 'stock_ticket_id', 'ticket_name', 'ticket_type', 'total_stock'],
                            additionalProperties: false
                        },
                        available_days: { type: 'number' },
                        is_activate: { type: 'number' },
                        market_price: { type: 'number' },
                        operator_id: { type: 'string' },
                        park_statistic: { type: 'number' },
                        pro_type: { type: 'number' },
                        restrict_type: { type: 'number' },
                        restrict_week: { type: 'string' },
                        scenic_id: { type: 'string' },
                        scenic_name: { type: 'string' },
                        simple_name: { type: 'string' },
                        ticketGoods: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    RuleCheck: {
                                        type: 'object',
                                        properties: {
                                            adopt_type: { type: 'number' },
                                            check_point_ids: {
                                                type: 'array',
                                                items: { type: 'string' },
                                                minItems: 1
                                            },
                                            control_type: { type: 'number' },
                                            identity_type: { type: 'string' },
                                            interval_time: { type: 'number' },
                                            ruleCheck_name: { type: 'string' },
                                            time_share_book: { type: 'number' }
                                        },
                                        required: ['adopt_type', 'check_point_ids', 'control_type', 'identity_type', 'interval_time', 'ruleCheck_name', 'time_share_book'],
                                        additionalProperties: false
                                    },
                                    RuleIssue: {
                                        type: 'object',
                                        properties: {
                                            approve_content: { type: 'string' },
                                            approve_id: { type: 'string' },
                                            is_real_name: { type: 'number' },
                                            need_approval: { type: 'number' },
                                            only_owner_buy: { type: 'number' },
                                            only_window_sale: { type: 'number' },
                                            real_name_check: { type: 'number' },
                                            rights_check: { type: 'number' },
                                            rights_id: { type: 'string' },
                                            ruleIssue_begin_time: { type: 'string' },
                                            ruleIssue_end_time: { type: 'string' },
                                            ruleIssue_name: { type: 'string' },
                                            ruleIssue_type: { type: 'number' },
                                            ruleIssue_way: { type: 'number' },
                                            rule_type: { type: 'number' },
                                            use_time: { type: 'string' }
                                        },
                                        required: ['approve_content', 'approve_id', 'is_real_name', 'need_approval', 'only_owner_buy', 'only_window_sale', 'real_name_check', 'rights_check', 'rights_id', 'ruleIssue_begin_time', 'ruleIssue_end_time', 'ruleIssue_name', 'ruleIssue_type', 'ruleIssue_way', 'rule_type', 'use_time'],
                                        additionalProperties: false
                                    },
                                    RuleRetreat: {
                                        type: 'object',
                                        properties: {
                                            default_rate: { type: 'number' },
                                            is_retreat: { type: 'number' },
                                            ruleRetreat_name: { type: 'string' }
                                        },
                                        required: ['default_rate', 'is_retreat', 'ruleRetreat_name'],
                                        additionalProperties: false
                                    },
                                    begin_discount: { type: 'number' },
                                    end_discount: { type: 'number' },
                                    goods_name: { type: 'string' },
                                    max_people: { type: 'number' },
                                    min_people: { type: 'number' },
                                    overall_discount: { type: 'number' },
                                    people_number: { type: 'number' },
                                    ticketGoods_id: { type: 'string' },
                                    ticketGoods_type: { type: 'number' },
                                    time_share_id: { type: 'string' }
                                },
                                required: ['RuleCheck', 'RuleIssue', 'RuleRetreat', 'begin_discount', 'end_discount', 'goods_name', 'max_people', 'min_people', 'overall_discount', 'people_number', 'ticketGoods_id', 'ticketGoods_type', 'time_share_id'],
                                additionalProperties: false
                            }
                        },
                        timeSharing: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    timeSharing_begin_time: { type: 'string' },
                                    timeSharing_end_time: { type: 'string' },
                                    timeSharing_id: { type: 'string' }
                                },
                                required: ['timeSharing_begin_time', 'timeSharing_end_time', 'timeSharing_id'],
                                additionalProperties: false
                            }
                        },
                        time_restrict: { type: 'number' },
                        use_count: { type: 'number' },
                        use_type: { type: 'number' },
                        validity_day: { type: 'number' }
                    },
                    required: ['TicketStock', 'available_days', 'is_activate', 'market_price', 'operator_id', 'park_statistic', 'pro_type','restrict_type', 'restrict_week', 'scenic_id', 'scenic_name', 'simple_name', 'ticketGoods', 'timeSharing', 'time_restrict', 'use_count', 'use_type', 'validity_day'],
                    additionalProperties: false
                },
                is_exchange: { type: 'number' }
            },
            required: ['SimpleTicket', 'is_exchange'],
            additionalProperties: false
        }
    },
    required: ['AdditionalInformation', 'BasicInformation'],
    additionalProperties: false
};

const MetadataSchema = {
    type: 'object',
    properties: {
        description: { type: 'string' },
        token_url: { type: 'string' }
    },
    required: ['description', 'token_url'],
    additionalProperties: false
};

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

const TicketDataSchema = {
    type: 'object',
    properties: {
        BuyerInfo: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    buyerInfo_id_name: { type: 'string' },
                    id_number: { type: 'string' }
                },
                required: ['buyerInfo_id_name', 'id_number'],
                additionalProperties: false
            }
        },
        cancel_count: { type: 'number' },
        checked_num: { type: 'number' },
        enter_begin_time: { type: 'string' },
        enter_end_time: { type: 'string' },
        enter_time: { type: 'string' },
        issuance_type: { type: 'number' },
        order_group_id: { type: 'string' },
        order_id: { type: 'string' },
        overdue_time: { type: 'string' },
        phone: { type: 'string' },
        player_num: { type: 'number' },
        print_encode: { type: 'string' },
        provider_id: { type: 'string' },
        user_id: { type: 'string' },
        sale_channel: { type: 'number' },
        selling_price: { type: 'number' },
        status: { type: 'number' },
        store_id: { type: 'string' },
        ticket_id: { type: 'string' },
        used_count: { type: 'number' },
        used_days: { type: 'number' },
        stock_batch_number: { type: 'string' },
        account: { type: 'string' },
        org: { type: 'string' }
    },
    required: [
        'BuyerInfo',
        'cancel_count',
        'checked_num',
        'enter_begin_time',
        'enter_end_time',
        'enter_time',
        'issuance_type',
        'order_group_id',
        'order_id',
        'overdue_time',
        'phone',
        'player_num',
        'print_encode',
        'provider_id',
        'user_id',
        'sale_channel',
        'selling_price',
        'status',
        'store_id',
        'ticket_id',
        'used_count',
        'used_days',
        'stock_batch_number',
        'account',
        'org'
    ],
    additionalProperties: false
};

const GenerateTicketNumberSchema = {
    type: 'object',
    properties: {
        enter_time: { type: 'string' },
        player_num: { type: 'number' },
        certificate: { type: 'string' },
        rand: { type: 'string' },
        scenic_id: { type: 'string' },
        pro_type: { type: 'number' },
        time_share_id: { type: 'number' },
        time_share_book: { type: 'number' },
        begin_time: { type: 'string' },
        end_time: { type: 'string' },
        check_point_ids: {
            type: 'array',
            items: { type: 'number' }
        },
        uuid: { type: 'string' }
    },
    required: [
        'enter_time',
        'player_num',
        'certificate',
        'rand',
        'scenic_id',
        'pro_type',
        'time_share_id',
        'time_share_book',
        'begin_time',
        'end_time',
        'check_point_ids',
        'uuid'
    ],
    additionalProperties: false
};

const VerifyTicketSchema = {
    type: 'object',
    properties: {
        VerifyStatus: {
            type: 'object',
            properties: {
                status: { type: 'number' },
                ticket_id: { type: 'string' },
                checked_num: { type: 'number' },
                used_count: { type: 'number' },
                used_days: { type: 'number' }
            },
            required: ['status', 'ticket_id', 'checked_num', 'used_count', 'used_days'],
            additionalProperties: false
        },
        VerifyInfo: {
            type: 'object',
            properties: {
                account: { type: 'string' },
                org: { type: 'string' },
                check_type: { type: 'number' },
                ticket_number: { type: 'string' },
                stock_batch_number: { type: 'string' },
                enter_time: { type: 'string' },
                check_number: { type: 'number' },
                scenic_id: { type: 'string' },
                id_name: { type: 'string' },
                id_card: { type: 'string' },
                qr_code: { type: 'string' },
                point_name: { type: 'string' },
                point_id: { type: 'string' },
                equipment_name: { type: 'string' },
                equipment_id: { type: 'string' },
                equipment_type: { type: 'string' },
                user_id: { type: 'string' },
                username: { type: 'string' }
            },
            required: [
                'account',
                'org',
                'check_type',
                'ticket_number',
                'stock_batch_number',
                'enter_time',
                'check_number',
                'scenic_id',
                'id_name',
                'id_card',
                'qr_code',
                'point_name',
                'point_id',
                'equipment_name',
                'equipment_id',
                'equipment_type',
                'user_id',
                'username'
            ],
            additionalProperties: false
        }
    },
    required: ['VerifyStatus', 'VerifyInfo'],
    additionalProperties: false
};

const TimerUpdateTicketsSchema = {
    type: 'object',
    properties: {
        status: { type: 'number' },
        ticket_id: { type: 'string' }
    },
    required: ['status', 'ticket_id'],
    additionalProperties: false
};

const TokenIdsSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            stock_batch_number: { type: 'string' },
            sender: { type: 'string' },
            amount: { type: 'number' }
        },
        required: ['stock_batch_number', 'sender', 'amount'],
        additionalProperties: false
    }
};

const stockInfoSchema = {
    type: 'object',
    properties: {
        purchase_begin_time: { type: 'string' },
        purchase_end_time: { type: 'string' },
        stock_enter_begin_time: { type: 'string' },
        stock_enter_end_time: { type: 'string' }
    },
    required: ['purchase_begin_time', 'purchase_end_time', 'stock_enter_begin_time', 'stock_enter_end_time'],
    additionalProperties: false
};

module.exports = {
    tickets,
    ticketSplit,
    TicketCheck,
    VerifyTicket,
    GenerateTicketNumberInfo,
    TokenIds,
    UpdatedFields,
    PriceInfo,
    TimerUpdateTickets,
    TicketInfo,
    PriceInfoSchema,
    TicketInfoSchema,
    MetadataSchema,
    TicketDataSchema,
    TokenIdsSchema,
    GenerateTicketNumberSchema,
    VerifyTicketSchema,
    TimerUpdateTicketsSchema,
    stockInfoSchema
};
