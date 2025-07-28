/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// ================== Finance Object ==========================
// 金融系统要上链的数据结构

// 完成信用评估后，信用评估结果上链
const CreditRating = {
    // 更新时间
    assessmentTime: '',
    // 企业名称
    legalName: '',
    // 等级
    level: '',
    // 企业统一信用代码
    registrationNumber: '',
    // 企业累计得分
    score: ''
};

// 贷款申请
const LoanApplication = {
    // 贷款申请单号
    applicationNo: '',
    // 企业经济类型
    businessEconomicType: '',
    // 企业邮箱
    businessEmail: '',
    // 企业传真
    businessFax: '',
    // 企业电话
    businessPhone: '',
    // 许可经营范围
    businessScope: '',
    // 申请时间
    createTime: '',
    // 申请金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 融资用途
    financingPurpose: '',
    // 企业名称
    legalName: '',
    // 信用等级
    level: '',
    // 所有者权益（万元）
    ownersEquity: '',
    // 拟授信额度
    proposedCreditLimit: ''
};

// 贷款审核（通过）
const LoanApproval = {
    // 贷款申请单号
    applicationNo: '',
    // 企业经济类型
    businessEconomicType: '',
    // 企业邮箱
    businessEmail: '',
    // 企业传真
    businessFax: '',
    // 企业电话
    businessPhone: '',
    // 许可经营范围
    businessScope: '',
    // 申请时间
    createTime: '',
    // 最大预授信额度（元）
    creditLine: '',
    // 审批结果
    creditStatus: '',
    // 申请金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 借款期限
    expiresTime: '',
    // 融资用途
    financingPurpose: '',
    // 企业名称
    legalName: '',
    // 信用等级
    level: '',
    // 审批时间
    modifyTime: '',
    // 每月还款日期
    monthlyRepaymentDay: '',
    // 逾期日利率
    overdueRate: '',
    // 所有者权益（万元）
    ownersEquity: '',
    // 期数
    periods: '',
    // 拟授信额度
    proposedCreditLimit: '',
    // 年利率
    rate: '',
    // 收款单位银行账号
    repaymentBankAccount: '',
    // 收款单位开户银行名称
    repaymentBankName: '',
    // 收款单位名称
    repaymentName: '',
    // 还款方式
    repaymentType: ''
};

// 贷款审核（不通过）
const LoanApprovalFailed = {
    // 贷款申请单号
    applicationNo: '',
    // 企业经济类型
    businessEconomicType: '',
    // 企业邮箱
    businessEmail: '',
    // 企业传真
    businessFax: '',
    // 企业电话
    businessPhone: '',
    // 许可经营范围
    businessScope: '',
    // 申请时间
    createTime: '',
    // 不通过原因：
    creditAuditRemark: '',
    // 审批结果
    creditStatus: '',
    // 申请金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 融资用途
    financingPurpose: '',
    // 企业名称
    legalName: '',
    // 信用等级
    level: '',
    // 审批时间
    modifyTime: '',
    // 所有者权益（万元）
    ownersEquity: '',
    // 拟授信额度
    proposedCreditLimit: ''
};

// 借款申请
const BorrowApplication = {
    // 申请时间
    applyTime: '',
    // 存缴履约保证金凭证
    cautionMoneyFileUrl: '',
    // 申请金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 交易所
    exchangeName: '',
    // 统一信用代码（交易所）
    exchangeRegistrationNumber: '',
    // 申请借款金额（元）
    loanAmount: '',
    // 商户订单号
    outTradeNo: '',
    // 受托支付单凭证
    paymentBookFileUrl: '',
    // 收款单位银行账号
    receiverBankAccountNo: '',
    // 收款单位开户银行名称
    receiverBankName: '',
    // 收款单位名称
    receiverCorporateName: '',
    // 交易订单凭证
    tradeOrderFileUrl: ''
};

// 借款审核
const BorrowApproval = {
    // 存缴履约保证金凭证
    cautionMoneyFileUrl: '',
    // 申请金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 交易所
    exchangeName: '',
    // 统一信用代码（交易所）
    exchangeRegistrationNumber: '',
    // 申请借款金额（元）
    loanAmount: '',
    // 商户订单号
    outTradeNo: '',
    // 审批时间
    payAuditTime: '',
    // 付款单位银行账号
    payBankAccountNo: '',
    // 付款单位开户银行名称
    payBankName: '',
    // 银行水单图片
    payBankSlipFileUrl: '',
    // 付款单位银行交易流水号
    payBankTradeNo: '',
    // 付款单位名称
    payCorporateName: '',
    // 受托支付单凭证
    paymentBookFileUrl: '',
    // 收款单位银行账号
    receiverBankAccountNo: '',
    // 收款单位开户银行名称
    receiverBankName: '',
    // 收款单位名称
    receiverCorporateName: '',
    // 交易订单凭证
    tradeOrderFileUrl: ''
};

// 还款单生成
const RepaymentOrder = {
    // 创建时间
    createTime: '',
    // 金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 年利率
    rate: '',
    // 商户订单号
    repaymentNo: '',
    // 还款方式
    repaymentType: '',
    // 贷款金额
    totalPrincipal: ''
};

// 还款申请
const RepaymentApplication = {
    // 当期还款金额
    amount: '',
    // 银行水单图片
    bankSlip: '',
    // 申请时间
    createTime: '',
    // 金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 是否逾期
    isOverdue: '',
    // 付款单位银行账号
    payBankAccountNo: '',
    // 付款单位开户银行名称
    payBankName: '',
    // 银行交易流水号
    payBankTradeNo: '',
    // 付款单位名称
    payUnitName: '',
    // 逾期金额
    penaltyInterest: '',
    // 期数
    periods: '',
    // 本金余额
    principal: '',
    // 年利率
    rate: '',
    // 收款单位银行账号
    repaymentBankAccount: '',
    // 收款单位开户银行名称
    repaymentBankName: '',
    // 当期还款日
    repaymentDate: '',
    // 收款单位名称
    repaymentName: '',
    // 商户订单号
    repaymentNo: '',
    // 还款方式
    repaymentType: '',
    // 贷款金额
    totalPrincipal: ''
};

// 还款审核（通过）
const RepaymentApproval = {
    // 当期还款金额
    amount: '',
    // 银行水单图片
    bankSlip: '',
    // 金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 是否逾期
    isOverdue: '',
    // 审批时间
    modifyTime: '',
    // 付款单位银行账号
    payBankAccountNo: '',
    // 付款单位开户银行名称
    payBankName: '',
    // 银行交易流水号
    payBankTradeNo: '',
    // 付款单位名称
    payUnitName: '',
    // 逾期金额
    penaltyInterest: '',
    // 期数
    periods: '',
    // 本金余额
    principal: '',
    // 年利率
    rate: '',
    // 收款单位银行账号
    repaymentBankAccount: '',
    // 收款单位开户银行名称
    repaymentBankName: '',
    // 当期还款日
    repaymentDate: '',
    // 收款单位名称
    repaymentName: '',
    // 商户订单号
    repaymentNo: '',
    // 审批结果
    repaymentStatus: '',
    // 还款方式
    repaymentType: '',
    // 贷款金额
    totalPrincipal: ''
};

// 还款审核（不通过）
const RepaymentApprovalFailed = {
    // 当期还款金额
    amount: '',
    // 银行水单图片
    bankSlip: '',
    // 金融机构
    creditorName: '',
    // 统一信用代码（金融机构）
    creditorRegistrationNumber: '',
    // 旅行商
    debtorName: '',
    // 统一信用代码（旅行商）
    debtorRegistrationNumber: '',
    // 是否逾期
    isOverdue: '',
    // 审批时间
    modifyTime: '',
    // 付款单位银行账号
    payBankAccountNo: '',
    // 付款单位开户银行名称
    payBankName: '',
    // 银行交易流水号
    payBankTradeNo: '',
    // 付款单位名称
    payUnitName: '',
    // 逾期金额
    penaltyInterest: '',
    // 期数
    periods: '',
    // 本金余额
    principal: '',
    // 年利率
    rate: '',
    // 不通过原因
    remark: '',
    // 收款单位银行账号
    repaymentBankAccount: '',
    // 收款单位开户银行名称
    repaymentBankName: '',
    // 当期还款日
    repaymentDate: '',
    // 收款单位名称
    repaymentName: '',
    // 商户订单号
    repaymentNo: '',
    // 审批结果
    repaymentStatus: '',
    // 还款方式
    repaymentType: '',
    // 贷款金额
    totalPrincipal: ''
};

// ================== Finance Object Schema ==========================

const CreditRatingSchema = {
    type: 'object',
    properties: {
        legalName: { type: 'string' },
        registrationNumber: { type: 'string' },
        score: { type: 'string' },
        level: { type: 'string' },
        assessmentTime: { type: 'string' }
    },
    required: ['legalName', 'registrationNumber', 'score', 'level', 'assessmentTime'],
    additionalProperties: false
};

const LoanApplicationSchema = {
    type: 'object',
    properties: {
        applicationNo: { type: 'string' },
        legalName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        ownersEquity: { type: 'string' },
        businessScope: { type: 'string' },
        businessEconomicType: { type: 'string' },
        businessPhone: { type: 'string' },
        businessFax: { type: 'string' },
        businessEmail: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        financingPurpose: { type: 'string' },
        level: { type: 'string' },
        proposedCreditLimit: { type: 'string' },
        createTime: { type: 'string' }
    },
    required: ['applicationNo', 'legalName', 'debtorRegistrationNumber', 'ownersEquity', 'businessScope', 'businessEconomicType', 'businessPhone', 'businessFax', 'businessEmail', 'creditorName', 'creditorRegistrationNumber', 'financingPurpose', 'level', 'proposedCreditLimit', 'createTime'],
    additionalProperties: false
};

const LoanApprovalSchema = {
    type: 'object',
    properties: {
        applicationNo: { type: 'string' },
        legalName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        ownersEquity: { type: 'string' },
        businessScope: { type: 'string' },
        businessEconomicType: { type: 'string' },
        businessPhone: { type: 'string' },
        businessFax: { type: 'string' },
        businessEmail: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        financingPurpose: { type: 'string' },
        level: { type: 'string' },
        proposedCreditLimit: { type: 'string' },
        createTime: { type: 'string' },
        creditStatus: { type: 'string' },
        creditLine: { type: 'string' },
        expiresTime: { type: 'string' },
        repaymentType: { type: 'string' },
        rate: { type: 'string' },
        periods: { type: 'string' },
        monthlyRepaymentDay: { type: 'string' },
        overdueRate: { type: 'string' },
        repaymentName: { type: 'string' },
        repaymentBankAccount: { type: 'string' },
        repaymentBankName: { type: 'string' },
        modifyTime: { type: 'string' }
    },
    required: ['applicationNo', 'legalName', 'debtorRegistrationNumber', 'ownersEquity', 'businessScope', 'businessEconomicType', 'businessPhone', 'businessFax', 'businessEmail', 'creditorName', 'creditorRegistrationNumber', 'financingPurpose', 'level', 'proposedCreditLimit', 'createTime', 'creditStatus', 'creditLine', 'expiresTime', 'repaymentType', 'rate', 'periods', 'monthlyRepaymentDay', 'overdueRate', 'repaymentName', 'repaymentBankAccount', 'repaymentBankName', 'modifyTime'],
    additionalProperties: false
};

const LoanApprovalFailedSchema = {
    type: 'object',
    properties: {
        applicationNo: { type: 'string' },
        legalName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        ownersEquity: { type: 'string' },
        businessScope: { type: 'string' },
        businessEconomicType: { type: 'string' },
        businessPhone: { type: 'string' },
        businessFax: { type: 'string' },
        businessEmail: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        financingPurpose: { type: 'string' },
        level: { type: 'string' },
        proposedCreditLimit: { type: 'string' },
        createTime: { type: 'string' },
        creditStatus: { type: 'string' },
        creditAuditRemark: { type: 'string' },
        modifyTime: { type: 'string' }
    },
    required: ['applicationNo', 'legalName', 'debtorRegistrationNumber', 'ownersEquity', 'businessScope', 'businessEconomicType', 'businessPhone', 'businessFax', 'businessEmail', 'creditorName', 'creditorRegistrationNumber', 'financingPurpose', 'level', 'proposedCreditLimit', 'createTime', 'creditStatus', 'creditAuditRemark', 'modifyTime'],
    additionalProperties: false
};

const BorrowApplicationSchema = {
    type: 'object',
    properties: {
        outTradeNo: { type: 'string' },
        loanAmount: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        exchangeName: { type: 'string' },
        exchangeRegistrationNumber: { type: 'string' },
        receiverCorporateName: { type: 'string' },
        receiverBankAccountNo: { type: 'string' },
        receiverBankName: { type: 'string' },
        tradeOrderFileUrl: { type: 'string' },
        cautionMoneyFileUrl: { type: 'string' },
        paymentBookFileUrl: { type: 'string' },
        applyTime: { type: 'string' }
    },
    required: ['outTradeNo', 'loanAmount', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'exchangeName', 'exchangeRegistrationNumber', 'receiverCorporateName', 'receiverBankAccountNo', 'receiverBankName', 'tradeOrderFileUrl', 'cautionMoneyFileUrl', 'paymentBookFileUrl', 'applyTime'],
    additionalProperties: false
};

const BorrowApprovalSchema = {
    type: 'object',
    properties: {
        outTradeNo: { type: 'string' },
        loanAmount: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        exchangeName: { type: 'string' },
        exchangeRegistrationNumber: { type: 'string' },
        receiverCorporateName: { type: 'string' },
        receiverBankAccountNo: { type: 'string' },
        receiverBankName: { type: 'string' },
        tradeOrderFileUrl: { type: 'string' },
        cautionMoneyFileUrl: { type: 'string' },
        paymentBookFileUrl: { type: 'string' },
        payBankSlipFileUrl: { type: 'string' },
        payBankTradeNo: { type: 'string' },
        payCorporateName: { type: 'string' },
        payBankAccountNo: { type: 'string' },
        payBankName: { type: 'string' },
        payAuditTime: { type: 'string' }
    },
    required: ['outTradeNo', 'loanAmount', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'exchangeName', 'exchangeRegistrationNumber', 'receiverCorporateName', 'receiverBankAccountNo', 'receiverBankName', 'tradeOrderFileUrl', 'cautionMoneyFileUrl', 'paymentBookFileUrl', 'payBankSlipFileUrl', 'payBankTradeNo', 'payCorporateName', 'payBankAccountNo', 'payBankName', 'payAuditTime'],
    additionalProperties: false
};

const RepaymentOrderSchema = {
    type: 'object',
    properties: {
        repaymentNo: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        totalPrincipal: { type: 'string' },
        repaymentType: { type: 'string' },
        rate: { type: 'string' },
        createTime: { type: 'string' }
    },
    required: ['repaymentNo', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'totalPrincipal', 'repaymentType', 'rate', 'createTime'],
    additionalProperties: false
};

const RepaymentApplicationSchema = {
    type: 'object',
    properties: {
        repaymentNo: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        totalPrincipal: { type: 'string' },
        principal: { type: 'string' },
        repaymentType: { type: 'string' },
        rate: { type: 'string' },
        periods: { type: 'string' },
        repaymentDate: { type: 'string' },
        isOverdue: { type: 'string' },
        penaltyInterest: { type: 'string' },
        amount: { type: 'string' },
        bankSlip: { type: 'string' },
        payBankTradeNo: { type: 'string' },
        payUnitName: { type: 'string' },
        payBankAccountNo: { type: 'string' },
        payBankName: { type: 'string' },
        repaymentName: { type: 'string' },
        repaymentBankAccount: { type: 'string' },
        repaymentBankName: { type: 'string' },
        createTime: { type: 'string' }
    },
    required: ['repaymentNo', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'totalPrincipal', 'principal', 'repaymentType', 'rate', 'periods', 'repaymentDate', 'isOverdue', 'penaltyInterest', 'amount', 'bankSlip', 'payBankTradeNo', 'payUnitName', 'payBankAccountNo', 'payBankName', 'repaymentName', 'repaymentBankAccount', 'repaymentBankName', 'createTime'],
    additionalProperties: false
};

const RepaymentApprovalSchema = {
    type: 'object',
    properties: {
        repaymentNo: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        totalPrincipal: { type: 'string' },
        principal: { type: 'string' },
        repaymentType: { type: 'string' },
        rate: { type: 'string' },
        periods: { type: 'string' },
        repaymentDate: { type: 'string' },
        isOverdue: { type: 'string' },
        penaltyInterest: { type: 'string' },
        amount: { type: 'string' },
        bankSlip: { type: 'string' },
        payBankTradeNo: { type: 'string' },
        payUnitName: { type: 'string' },
        payBankAccountNo: { type: 'string' },
        payBankName: { type: 'string' },
        repaymentName: { type: 'string' },
        repaymentBankAccount: { type: 'string' },
        repaymentBankName: { type: 'string' },
        repaymentStatus: { type: 'string' },
        modifyTime: { type: 'string' }
    },
    required: ['repaymentNo', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'totalPrincipal', 'principal', 'repaymentType', 'rate', 'periods', 'repaymentDate', 'isOverdue', 'penaltyInterest', 'amount', 'bankSlip', 'payBankTradeNo', 'payUnitName', 'payBankAccountNo', 'payBankName', 'repaymentName', 'repaymentBankAccount', 'repaymentBankName', 'repaymentStatus', 'modifyTime'],
    additionalProperties: false
};

const RepaymentApprovalFailedSchema = {
    type: 'object',
    properties: {
        repaymentNo: { type: 'string' },
        debtorName: { type: 'string' },
        debtorRegistrationNumber: { type: 'string' },
        creditorName: { type: 'string' },
        creditorRegistrationNumber: { type: 'string' },
        totalPrincipal: { type: 'string' },
        principal: { type: 'string' },
        repaymentType: { type: 'string' },
        rate: { type: 'string' },
        periods: { type: 'string' },
        repaymentDate: { type: 'string' },
        isOverdue: { type: 'string' },
        penaltyInterest: { type: 'string' },
        amount: { type: 'string' },
        bankSlip: { type: 'string' },
        payBankTradeNo: { type: 'string' },
        payUnitName: { type: 'string' },
        payBankAccountNo: { type: 'string' },
        payBankName: { type: 'string' },
        repaymentName: { type: 'string' },
        repaymentBankAccount: { type: 'string' },
        repaymentBankName: { type: 'string' },
        repaymentStatus: { type: 'string' },
        remark: { type: 'string' },
        modifyTime: { type: 'string' }
    },
    required: ['repaymentNo', 'debtorName', 'debtorRegistrationNumber', 'creditorName', 'creditorRegistrationNumber', 'totalPrincipal', 'principal', 'repaymentType', 'rate', 'periods', 'repaymentDate', 'isOverdue', 'penaltyInterest', 'amount', 'bankSlip', 'payBankTradeNo', 'payUnitName', 'payBankAccountNo', 'payBankName', 'repaymentName', 'repaymentBankAccount', 'repaymentBankName', 'repaymentStatus', 'remark', 'modifyTime'],
    additionalProperties: false
};

module.exports = {
    CreditRating,
    LoanApplication,
    LoanApproval,
    LoanApprovalFailed,
    BorrowApplication,
    BorrowApproval,
    RepaymentOrder,
    RepaymentApplication,
    RepaymentApproval,
    RepaymentApprovalFailed,
    CreditRatingSchema,
    LoanApplicationSchema,
    LoanApprovalSchema,
    LoanApprovalFailedSchema,
    BorrowApplicationSchema,
    BorrowApprovalSchema,
    RepaymentOrderSchema,
    RepaymentApplicationSchema,
    RepaymentApprovalSchema,
    RepaymentApprovalFailedSchema
};