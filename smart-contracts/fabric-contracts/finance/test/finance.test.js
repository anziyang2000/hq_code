/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { main } = require('..');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('Chaincode', () => {
    let sandbox;
    let finance;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach('Sandbox creation', () => {
        sandbox = sinon.createSandbox();
        finance = new main('finance');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#StoreCreditRating', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreCreditRating info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const CreditRating = {
                // 企业名称
                legalName: '',
                // 企业统一信用代码
                registrationNumber: '',
                // 企业累计得分
                score: '',
                // 等级
                level: '',
                // 更新时间
                assessmentTime: ''
            };

            const response = await finance.StoreCreditRating(ctx, JSON.stringify(CreditRating));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreCreditRating(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreCreditRating: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreCreditRating(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreCreditRating info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const CreditRating = {
                // 企业名称
                legalName: '',
                // 企业统一信用代码
                // registrationNumber: '',
                // 企业累计得分
                score: '',
                // 等级
                level: '',
                // 更新时间
                assessmentTime: ''
            };

            await expect(finance.StoreCreditRating(ctx, JSON.stringify(CreditRating)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'registrationNumber\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const CreditRating = {
                // 企业名称
                legalName: '',
                // 企业统一信用代码
                registrationNumber: '',
                // 企业累计得分
                score: '',
                // 等级
                level: '',
                // 更新时间
                assessmentTime: ''
            };

            await expect(finance.StoreCreditRating(ctx, JSON.stringify(CreditRating)))
                .to.be.rejectedWith('StoreCreditRating: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const CreditRating = {
                // 企业名称
                legalName: '',
                // 企业统一信用代码
                registrationNumber: '',
                // 企业累计得分
                score: '',
                // 等级
                level: '',
                // 更新时间
                assessmentTime: ''
            };

            await expect(finance.StoreCreditRating(ctx, JSON.stringify(CreditRating)))
                .to.be.rejectedWith('StoreCreditRating: Transaction ID (creditRatingKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreCreditRating(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreCreditRating(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreLoanApplication', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreLoanApplication info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            const response = await finance.StoreLoanApplication(ctx, JSON.stringify(LoanApplication));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreLoanApplication(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreLoanApplication: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreLoanApplication(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreLoanApplication info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApplication = {
                // 贷款申请单号
                // applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'applicationNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('StoreLoanApplication: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('StoreLoanApplication: Transaction ID (loanApplicationKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreLoanApplication(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreLoanApplication(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreLoanApproval', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreLoanApproval info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApproval = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 最大预授信额度（元）
                creditLine: '',
                // 借款期限
                expiresTime: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 每月还款日期
                monthlyRepaymentDay: '',
                // 逾期日利率
                overdueRate: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批时间
                modifyTime: ''
            };

            const response = await finance.StoreLoanApproval(ctx, JSON.stringify(LoanApproval));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreLoanApproval(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreLoanApproval: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreLoanApproval(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreLoanApproval info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApproval = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 最大预授信额度（元）
                creditLine: '',
                // 借款期限
                // expiresTime: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 每月还款日期
                monthlyRepaymentDay: '',
                // 逾期日利率
                overdueRate: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApproval(ctx, JSON.stringify(LoanApproval)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'expiresTime\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const LoanApproval = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 最大预授信额度（元）
                creditLine: '',
                // 借款期限
                expiresTime: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 每月还款日期
                monthlyRepaymentDay: '',
                // 逾期日利率
                overdueRate: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApproval(ctx, JSON.stringify(LoanApproval)))
                .to.be.rejectedWith('StoreLoanApproval: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const LoanApproval = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 最大预授信额度（元）
                creditLine: '',
                // 借款期限
                expiresTime: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 每月还款日期
                monthlyRepaymentDay: '',
                // 逾期日利率
                overdueRate: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApproval(ctx, JSON.stringify(LoanApproval)))
                .to.be.rejectedWith('StoreLoanApproval: Transaction ID (loanApprovalKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreLoanApproval(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreLoanApproval(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreLoanApprovalFailed', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreLoanApprovalFailed info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApprovalFailed = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 不通过原因：
                creditAuditRemark: '',
                // 审批时间
                modifyTime: ''
            };

            const response = await finance.StoreLoanApprovalFailed(ctx, JSON.stringify(LoanApprovalFailed));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreLoanApprovalFailed(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreLoanApprovalFailed: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreLoanApprovalFailed(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreLoanApprovalFailed info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApprovalFailed = {
                // 贷款申请单号
                // applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 不通过原因：
                creditAuditRemark: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApprovalFailed(ctx, JSON.stringify(LoanApprovalFailed)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'applicationNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const LoanApprovalFailed = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 不通过原因：
                creditAuditRemark: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApprovalFailed(ctx, JSON.stringify(LoanApprovalFailed)))
                .to.be.rejectedWith('StoreLoanApprovalFailed: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const LoanApprovalFailed = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: '',
                // 审批结果
                creditStatus: '',
                // 不通过原因：
                creditAuditRemark: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreLoanApprovalFailed(ctx, JSON.stringify(LoanApprovalFailed)))
                .to.be.rejectedWith('StoreLoanApprovalFailed: Transaction ID (loanApprovalFailedKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreLoanApprovalFailed(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreLoanApprovalFailed(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreLoanReApplication', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreLoanReApplication info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            const response = await finance.StoreLoanReApplication(ctx, JSON.stringify(LoanApplication));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreLoanReApplication(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreLoanReApplication: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreLoanReApplication(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreLoanReApplication info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const LoanApplication = {
                // 贷款申请单号
                // applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanReApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'applicationNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanReApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('StoreLoanReApplication: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const LoanApplication = {
                // 贷款申请单号
                applicationNo: '',
                // 企业名称
                legalName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 所有者权益（万元）
                ownersEquity: '',
                // 许可经营范围
                businessScope: '',
                // 企业经济类型
                businessEconomicType: '',
                // 企业电话
                businessPhone: '',
                // 企业传真
                businessFax: '',
                // 企业邮箱
                businessEmail: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 融资用途
                financingPurpose: '',
                // 信用等级
                level: '',
                // 拟授信额度
                proposedCreditLimit: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreLoanReApplication(ctx, JSON.stringify(LoanApplication)))
                .to.be.rejectedWith('StoreLoanReApplication: Transaction ID (loanApplicationKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreLoanReApplication(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreLoanReApplication(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreBorrowApplication', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreBorrowApplication info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const BorrowApplication = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 申请时间
                applyTime: ''
            };

            const response = await finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApplication));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreBorrowApplication(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreBorrowApplication: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreBorrowApplication(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreBorrowApplication info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const BorrowApplication = {
                // 商户订单号
                // outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 申请时间
                applyTime: ''
            };

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApplication)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'outTradeNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const BorrowApplication = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 申请时间
                applyTime: ''
            };

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApplication)))
                .to.be.rejectedWith('StoreBorrowApplication: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const BorrowApplication = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 申请时间
                applyTime: ''
            };

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApplication)))
                .to.be.rejectedWith('StoreBorrowApplication: Transaction ID (borrowApplicationKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreBorrowApproval', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreBorrowApproval info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const BorrowApproval = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            const response = await finance.StoreBorrowApproval(ctx, JSON.stringify(BorrowApproval));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreBorrowApproval(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreBorrowApproval: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreBorrowApproval(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreBorrowApproval info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const BorrowApproval = {
                // 商户订单号
                // outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'outTradeNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const BorrowApproval = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('StoreBorrowApproval: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const BorrowApproval = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('StoreBorrowApproval: Transaction ID (borrowApprovalKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreRepaymentOrder', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreRepaymentOrder info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentOrder = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 创建时间
                createTime: ''
            };

            const response = await finance.StoreRepaymentOrder(ctx, JSON.stringify(RepaymentOrder));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreBorrowApproval(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreBorrowApproval: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreBorrowApproval(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreBorrowApproval info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const BorrowApproval = {
                // 商户订单号
                // outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApplication(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'outTradeNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const BorrowApproval = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('StoreBorrowApproval: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const BorrowApproval = {
                // 商户订单号
                outTradeNo: '',
                // 申请借款金额（元）
                loanAmount: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 申请金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 交易所
                exchangeName: '',
                // 统一信用代码（交易所）
                exchangeRegistrationNumber: '',
                // 收款单位名称
                receiverCorporateName: '',
                // 收款单位银行账号
                receiverBankAccountNo: '',
                // 收款单位开户银行名称
                receiverBankName: '',
                // 交易订单凭证
                tradeOrderFileUrl: '',
                // 存缴履约保证金凭证
                cautionMoneyFileUrl: '',
                // 受托支付单凭证
                paymentBookFileUrl: '',
                // 银行水单图片
                payBankSlipFileUrl: '',
                // 付款单位银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payCorporateName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 审批时间
                payAuditTime: ''
            };

            await expect(finance.StoreBorrowApproval(ctx, JSON.stringify(BorrowApproval)))
                .to.be.rejectedWith('StoreBorrowApproval: Transaction ID (borrowApprovalKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreRepaymentOrder(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreRepaymentOrder(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreRepaymentApplication', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreRepaymentApplication info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            const response = await finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreRepaymentApplication(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreRepaymentApplication: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreRepaymentApplication(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreRepaymentApplication info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApplication = {
                // 商户订单号
                // repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'repaymentNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('StoreRepaymentApplication: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('StoreRepaymentApplication: Transaction ID (repaymentApplicationKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreRepaymentApproval', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreRepaymentApproval info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApproval = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批结果
                repaymentStatus: '',
                // 审批时间
                modifyTime: ''
            };

            const response = await finance.StoreRepaymentApproval(ctx, JSON.stringify(RepaymentApproval));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreRepaymentApproval(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreRepaymentApproval: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreRepaymentApproval(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreRepaymentApproval info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApproval = {
                // 商户订单号
                // repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批结果
                repaymentStatus: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify(RepaymentApproval)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'repaymentNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const RepaymentApproval = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批结果
                repaymentStatus: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify(RepaymentApproval)))
                .to.be.rejectedWith('StoreRepaymentApproval: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const RepaymentApproval = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 审批结果
                repaymentStatus: '',
                // 审批时间
                modifyTime: ''
            };

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify(RepaymentApproval)))
                .to.be.rejectedWith('StoreRepaymentApproval: Transaction ID (repaymentApprovalKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreRepaymentApprovalFailed', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreRepaymentApprovalFailed info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

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

            const response = await finance.StoreRepaymentApprovalFailed(ctx, JSON.stringify(RepaymentApprovalFailed));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreRepaymentApprovalFailed(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreRepaymentApprovalFailed: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreRepaymentApprovalFailed(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreRepaymentApprovalFailed info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApprovalFailed = {
                // 当期还款金额
                amount: '',
                // 银行水单图片
                // bankSlip: '',
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

            await expect(finance.StoreRepaymentApproval(ctx, JSON.stringify(RepaymentApprovalFailed)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'bankSlip\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

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

            await expect(finance.StoreRepaymentApprovalFailed(ctx, JSON.stringify(RepaymentApprovalFailed)))
                .to.be.rejectedWith('StoreRepaymentApprovalFailed: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

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

            await expect(finance.StoreRepaymentApprovalFailed(ctx, JSON.stringify(RepaymentApprovalFailed)))
                .to.be.rejectedWith('StoreRepaymentApprovalFailed: Transaction ID (repaymentApprovalFailedKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreRepaymentApprovalFailed(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreRepaymentApprovalFailed(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreReRepaymentApplication', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a StoreRepaymentApplication info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            const response = await finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(finance.StoreRepaymentApplication(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreRepaymentApplication: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(finance.StoreRepaymentApplication(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreRepaymentApplication info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const RepaymentApplication = {
                // 商户订单号
                // repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'repaymentNo\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(finance.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('StoreRepaymentApplication: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const RepaymentApplication = {
                // 商户订单号
                repaymentNo: '',
                // 旅行商
                debtorName: '',
                // 统一信用代码（旅行商）
                debtorRegistrationNumber: '',
                // 金融机构
                creditorName: '',
                // 统一信用代码（金融机构）
                creditorRegistrationNumber: '',
                // 贷款金额
                totalPrincipal: '',
                // 本金余额
                principal: '',
                // 还款方式
                repaymentType: '',
                // 年利率
                rate: '',
                // 期数
                periods: '',
                // 当期还款日
                repaymentDate: '',
                // 是否逾期
                isOverdue: '',
                // 逾期金额
                penaltyInterest: '',
                // 当期还款金额
                amount: '',
                // 银行水单图片
                bankSlip: '',
                // 银行交易流水号
                payBankTradeNo: '',
                // 付款单位名称
                payUnitName: '',
                // 付款单位银行账号
                payBankAccountNo: '',
                // 付款单位开户银行名称
                payBankName: '',
                // 收款单位名称
                repaymentName: '',
                // 收款单位银行账号
                repaymentBankAccount: '',
                // 收款单位开户银行名称
                repaymentBankName: '',
                // 申请时间
                createTime: ''
            };

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify(RepaymentApplication)))
                .to.be.rejectedWith('StoreRepaymentApplication: Transaction ID (repaymentApplicationKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(finance.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(finance.StoreRepaymentApplication(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreAAA', () => {
        it('should store a StoreRepaymentApplication info success', async () => {
            // mockClientIdentity.getMSPID.returns('skdatacenter1');
            // mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // ctx.stub.getTxID.returns('tx_id');
            // ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const TicketInfo = {
                // 附加信息(可更新的字段)
                AdditionalInformation: {
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
                    },
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

            const TicketInfoAfter = {
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

            console.log('###3###33', TicketInfo);
            const response = await finance.StoreAAA(TicketInfo);
            console.log('###2###55', response);

            expect(response).to.deep.equal(TicketInfo);
            expect(JSON.stringify(response)).to.equal(JSON.stringify(TicketInfoAfter));
        });
    });

});