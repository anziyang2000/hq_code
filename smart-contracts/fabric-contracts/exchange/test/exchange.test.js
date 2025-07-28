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
    let exchange;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach('Sandbox creation', () => {
        sandbox = sinon.createSandbox();
        exchange = new main('exchange');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#StoreProjectBidding', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a projectBidding info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const ProjectBidding = {
                // 企业ID
                company_id: '1',
                // 交易所ID
                exchange_id: '2',
                // 节点描述 审核备注
                node_description: '3',
                // 父项目ID
                parent_project_id: '4',
                // 附件的文件ID集合,逗号隔开
                project_annex: '5',
                // 项目上链唯一id
                project_chain_unique_id: '6',
                // 项目详情
                project_description: '7',
                // 1拍，2拍，3拍
                project_grade: '8',
                //项目id
                project_id: '9',
                // 项目名称
                project_name: '10',
                // 项目编号
                project_number: '11',
                // 项目状态
                project_status: '12',
                // 项目类型
                project_type: '13',
                // 审核时间
                review_time: '14'
            };

            const response = await exchange.StoreProjectBidding(ctx, JSON.stringify(ProjectBidding));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreProjectBidding(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreProjectBidding: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreProjectBidding(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreProjectBidding info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const ProjectBidding = {
                // 企业ID
                // company_id: '1',
                // 交易所ID
                exchange_id: '2',
                // 节点描述 审核备注
                node_description: '3',
                // 父项目ID
                parent_project_id: '4',
                // 附件的文件ID集合,逗号隔开
                project_annex: '5',
                // 项目上链唯一id
                project_chain_unique_id: '6',
                // 项目详情
                project_description: '7',
                // 1拍，2拍，3拍
                project_grade: '8',
                //项目id
                project_id: '9',
                // 项目名称
                project_name: '10',
                // 项目编号
                project_number: '11',
                // 项目状态
                project_status: '12',
                // 项目类型
                project_type: '13',
                // 审核时间
                review_time: '14'
            };

            await expect(exchange.StoreProjectBidding(ctx, JSON.stringify(ProjectBidding)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'company_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            const ProjectBidding = {
                // 企业ID
                company_id: '1',
                // 交易所ID
                exchange_id: '2',
                // 节点描述 审核备注
                node_description: '3',
                // 父项目ID
                parent_project_id: '4',
                // 附件的文件ID集合,逗号隔开
                project_annex: '5',
                // 项目上链唯一id
                project_chain_unique_id: '6',
                // 项目详情
                project_description: '7',
                // 1拍，2拍，3拍
                project_grade: '8',
                //项目id
                project_id: '9',
                // 项目名称
                project_name: '10',
                // 项目编号
                project_number: '11',
                // 项目状态
                project_status: '12',
                // 项目类型
                project_type: '13',
                // 审核时间
                review_time: '14'
            };

            await expect(exchange.StoreProjectBidding(ctx, JSON.stringify(ProjectBidding)))
                .to.be.rejectedWith('StoreProjectBidding: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            const ProjectBidding = {
                // 企业ID
                company_id: '1',
                // 交易所ID
                exchange_id: '2',
                // 节点描述 审核备注
                node_description: '3',
                // 父项目ID
                parent_project_id: '4',
                // 附件的文件ID集合,逗号隔开
                project_annex: '5',
                // 项目上链唯一id
                project_chain_unique_id: '6',
                // 项目详情
                project_description: '7',
                // 1拍，2拍，3拍
                project_grade: '8',
                //项目id
                project_id: '9',
                // 项目名称
                project_name: '10',
                // 项目编号
                project_number: '11',
                // 项目状态
                project_status: '12',
                // 项目类型
                project_type: '13',
                // 审核时间
                review_time: '14'
            };

            await expect(exchange.StoreProjectBidding(ctx, JSON.stringify(ProjectBidding)))
                .to.be.rejectedWith('StoreProjectBidding: Transaction ID (projectBiddingKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreProjectBidding(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreProjectBidding(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreInstrument', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a instrument info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

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

            const response = await exchange.StoreInstrument(ctx, JSON.stringify(InstrumentTicket));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreInstrument(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreInstrument: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreInstrument(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreInstrument info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 标的票务信息
            const InstrumentTicket = {
                // 购买结束时间
                buy_end_date: '',
                // 购买开始时间
                buy_start_date: '',
                // 商品ID
                // goods_id: '',
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

            await expect(exchange.StoreInstrument(ctx, JSON.stringify(InstrumentTicket)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'goods_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

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

            await expect(exchange.StoreInstrument(ctx, JSON.stringify(InstrumentTicket)))
                .to.be.rejectedWith('StoreInstrument: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

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

            await expect(exchange.StoreInstrument(ctx, JSON.stringify(InstrumentTicket)))
                .to.be.rejectedWith('StoreInstrument: Transaction ID (instrumentKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreInstrument(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreInstrument(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreMarginOrder', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a instrument info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金订单上链
            const MarginOrder = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 订单创建时间
                        createTime: '',
                        // 订单号
                        orderId: ''
                    }
                }
            };

            const response = await exchange.StoreMarginOrder(ctx, JSON.stringify(MarginOrder));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreMarginOrder(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreMarginOrder: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreMarginOrder(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreMarginOrder info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金订单上链
            const MarginOrder = {
                // 公告 Id
                // projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 订单创建时间
                        createTime: '',
                        // 订单号
                        orderId: ''
                    }
                }
            };

            await expect(exchange.StoreMarginOrder(ctx, JSON.stringify(MarginOrder)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'projectId\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 保证金订单上链
            const MarginOrder = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 订单创建时间
                        createTime: '',
                        // 订单号
                        orderId: ''
                    }
                }
            };

            await expect(exchange.StoreMarginOrder(ctx, JSON.stringify(MarginOrder)))
                .to.be.rejectedWith('StoreMarginOrder: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 保证金订单上链
            const MarginOrder = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 订单创建时间
                        createTime: '',
                        // 订单号
                        orderId: ''
                    }
                }
            };

            await expect(exchange.StoreMarginOrder(ctx, JSON.stringify(MarginOrder)))
                .to.be.rejectedWith('StoreMarginOrder: Transaction ID (marginOrderKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreMarginOrder(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreMarginOrder(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreMarginPayment', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a instrument info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金支付成功上链
            const MarginPayment = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 竞买号
                        bidNumber: '',
                        // 支付号
                        paymentTradeNo: '',
                        // 支付时间
                        paymentTime: ''
                    }
                }
            };

            const response = await exchange.StoreMarginPayment(ctx, JSON.stringify(MarginPayment));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreMarginPayment(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreMarginPayment: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreMarginPayment(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreMarginPayment info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金支付成功上链
            const MarginPayment = {
                // 公告 Id
                // projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 竞买号
                        bidNumber: '',
                        // 支付号
                        paymentTradeNo: '',
                        // 支付时间
                        paymentTime: ''
                    }
                }
            };

            await expect(exchange.StoreMarginPayment(ctx, JSON.stringify(MarginPayment)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'projectId\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 保证金支付成功上链
            const MarginPayment = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 竞买号
                        bidNumber: '',
                        // 支付号
                        paymentTradeNo: '',
                        // 支付时间
                        paymentTime: ''
                    }
                }
            };

            await expect(exchange.StoreMarginPayment(ctx, JSON.stringify(MarginPayment)))
                .to.be.rejectedWith('StoreMarginPayment: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 保证金支付成功上链
            const MarginPayment = {
                // 公告 Id
                projectId: '',
                // 公告名称
                projectName: '',
                // 交易所信息
                exchange: {
                    // 交易所 Id
                    exchangeId: '',
                    // 交易所名称
                    exchangeName: ''
                },
                // 标的信息
                Instrument: {
                    // 标的物ID
                    instrumentId:'',
                    // 标的物名称
                    instrumentName:'',
                    // 委托方ID
                    sellerId:'',
                    // 委托方名称'
                    sellerName:'',
                    // 竞买人ID
                    buyerId:'',
                    // 竞买人名称
                    buyerName:'',
                    // 保证金信息
                    bidbond: {
                        // 保证金数额
                        bidbondAmount: '',
                        // 授权号
                        outTradeNo: '',
                        // 授权明细号
                        tradeNo: '',
                        // 竞买号
                        bidNumber: '',
                        // 支付号
                        paymentTradeNo: '',
                        // 支付时间
                        paymentTime: ''
                    }
                }
            };

            await expect(exchange.StoreMarginPayment(ctx, JSON.stringify(MarginPayment)))
                .to.be.rejectedWith('StoreMarginPayment: Transaction ID (marginPaymentKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreMarginPayment(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreMarginPayment(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreInstrumentOrder', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a instrument order info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 竞拍摘牌订单上链
            const InstrumentOrder = {
                // 订单ID
                trade_id: '',
                // 交易所id
                exchange_id: '',
                // 卖方ID
                seller_id: '',
                //买方ID
                buyer_id: '',
                //交易金额
                trade_amount: '',
                //交易类型
                trade_type: '',
                //交易状态
                trade_status: '',
                //交易时间
                trade_datetime: '',
                //创建时间
                create_time: '',
                //修改时间
                update_time: '',
                // 企业ID
                company_id: '',
                // 企业名称
                company_name: '',
                // 公告id
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所名称
                exchange_name: '',
                // 标的物id
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                //交易明细
                settlement_id: '',
                //支付渠道
                settlement_type: ''
            };

            const response = await exchange.StoreInstrumentOrder(ctx, JSON.stringify(InstrumentOrder));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreInstrumentOrder(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreInstrumentOrder: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreInstrumentOrder(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreInstrumentOrder info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 竞拍摘牌订单上链
            const InstrumentOrder = {
                // 订单ID
                // trade_id: '',
                // 交易所id
                exchange_id: '',
                // 卖方ID
                seller_id: '',
                //买方ID
                buyer_id: '',
                //交易金额
                trade_amount: '',
                //交易类型
                trade_type: '',
                //交易状态
                trade_status: '',
                //交易时间
                trade_datetime: '',
                //创建时间
                create_time: '',
                //修改时间
                update_time: '',
                // 企业ID
                company_id: '',
                // 企业名称
                company_name: '',
                // 公告id
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所名称
                exchange_name: '',
                // 标的物id
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                //交易明细
                settlement_id: '',
                //支付渠道
                settlement_type: ''
            };

            await expect(exchange.StoreInstrumentOrder(ctx, JSON.stringify(InstrumentOrder)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'trade_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 竞拍摘牌订单上链
            const InstrumentOrder = {
                // 订单ID
                trade_id: '',
                // 交易所id
                exchange_id: '',
                // 卖方ID
                seller_id: '',
                //买方ID
                buyer_id: '',
                //交易金额
                trade_amount: '',
                //交易类型
                trade_type: '',
                //交易状态
                trade_status: '',
                //交易时间
                trade_datetime: '',
                //创建时间
                create_time: '',
                //修改时间
                update_time: '',
                // 企业ID
                company_id: '',
                // 企业名称
                company_name: '',
                // 公告id
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所名称
                exchange_name: '',
                // 标的物id
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                //交易明细
                settlement_id: '',
                //支付渠道
                settlement_type: ''
            };

            await expect(exchange.StoreInstrumentOrder(ctx, JSON.stringify(InstrumentOrder)))
                .to.be.rejectedWith('StoreInstrumentOrder: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 竞拍摘牌订单上链
            const InstrumentOrder = {
                // 订单ID
                trade_id: '',
                // 交易所id
                exchange_id: '',
                // 卖方ID
                seller_id: '',
                //买方ID
                buyer_id: '',
                //交易金额
                trade_amount: '',
                //交易类型
                trade_type: '',
                //交易状态
                trade_status: '',
                //交易时间
                trade_datetime: '',
                //创建时间
                create_time: '',
                //修改时间
                update_time: '',
                // 企业ID
                company_id: '',
                // 企业名称
                company_name: '',
                // 公告id
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所名称
                exchange_name: '',
                // 标的物id
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                //交易明细
                settlement_id: '',
                //支付渠道
                settlement_type: ''
            };

            await expect(exchange.StoreInstrumentOrder(ctx, JSON.stringify(InstrumentOrder)))
                .to.be.rejectedWith('StoreInstrumentOrder: Transaction ID (instrumentOrderKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreInstrumentOrder(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreInstrumentOrder(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreConvertToInvoice', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a convertToInvoice info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金转为价款信息上链
            const ConvertToInvoice =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                // 状态：已转为价款
                status: '',
                // 更新时间
                update_time: ''
            };

            const response = await exchange.StoreConvertToInvoice(ctx, JSON.stringify(ConvertToInvoice));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreConvertToInvoice(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreConvertToInvoice: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreConvertToInvoice(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreConvertToInvoice info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金转为价款信息上链
            const ConvertToInvoice =  {
                // 公告ID
                // project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                // 状态：已转为价款
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreConvertToInvoice(ctx, JSON.stringify(ConvertToInvoice)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'project_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 保证金转为价款信息上链
            const ConvertToInvoice =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                // 状态：已转为价款
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreConvertToInvoice(ctx, JSON.stringify(ConvertToInvoice)))
                .to.be.rejectedWith('StoreConvertToInvoice: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 保证金转为价款信息上链
            const ConvertToInvoice =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                // 状态：已转为价款
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreConvertToInvoice(ctx, JSON.stringify(ConvertToInvoice)))
                .to.be.rejectedWith('StoreConvertToInvoice: Transaction ID (convertToInvoiceKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreConvertToInvoice(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreConvertToInvoice(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreRefundBalance', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a refundBalance info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金余款自动退回信息上链
            const RefundBalance =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            const response = await exchange.StoreRefundBalance(ctx, JSON.stringify(RefundBalance));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreRefundBalance(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreRefundBalance: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreRefundBalance(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreRefundBalance info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金余款自动退回信息上链
            const RefundBalance =  {
                // 公告ID
                // project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreRefundBalance(ctx, JSON.stringify(RefundBalance)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'project_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 保证金余款自动退回信息上链
            const RefundBalance =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreRefundBalance(ctx, JSON.stringify(RefundBalance)))
                .to.be.rejectedWith('StoreRefundBalance: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 保证金余款自动退回信息上链
            const RefundBalance =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //成交总金额
                transaction_amount: '',
                //保证金转为价款金额
                converted_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreRefundBalance(ctx, JSON.stringify(RefundBalance)))
                .to.be.rejectedWith('StoreRefundBalance: Transaction ID (refundBalanceKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreRefundBalance(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreRefundBalance(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreFullRefund', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a fullRefund info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金全额自动退回信息上链
            const FullRefund =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            const response = await exchange.StoreFullRefund(ctx, JSON.stringify(FullRefund));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreFullRefund(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreFullRefund: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreFullRefund(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreFullRefund info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 保证金全额自动退回信息上链
            const FullRefund =  {
                // 公告ID
                // project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreFullRefund(ctx, JSON.stringify(FullRefund)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'project_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 保证金全额自动退回信息上链
            const FullRefund =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreFullRefund(ctx, JSON.stringify(FullRefund)))
                .to.be.rejectedWith('StoreFullRefund: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 保证金全额自动退回信息上链
            const FullRefund =  {
                // 公告ID
                project_id: '',
                // 公告名称
                project_name: '',
                // 交易所ID
                exchange_id: '',
                // 交易所名称
                exchange_name: '',
                // 委托方ID
                seller_id: '',
                // 委托方名称
                seller_name: '',
                // 标的物ID
                instrument_id: '',
                // 标的物名称
                instrument_name: '',
                // 竞买人ID
                buyer_id: '',
                // 竞买人名称
                buyer_name: '',
                // 保证金金额
                bidbond_amount: '',
                //保证金退回金额
                refund_amount: '',
                // 状态：已退回
                status: '',
                // 更新时间
                update_time: ''
            };

            await expect(exchange.StoreFullRefund(ctx, JSON.stringify(FullRefund)))
                .to.be.rejectedWith('StoreFullRefund: Transaction ID (fullRefundKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreFullRefund(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreFullRefund(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });
    });

    describe('#StoreTradeCharge', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a fullRefund info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(exchange.Query, 'QueryProjectIdExists').resolves(true);
            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 交易服务费订单信息上链
            const TradeCharge  = {
                // 交易服务费订单号
                trade_charge_id: '',
                // 关联成交订单号
                trade_id: '',
                // 收费对象
                charge_object: '',
                // 企业名称
                company_name: '',
                // 服务费金额
                charge_amount: '',
                // 状态
                payment_status: '',
                // 创建时间
                create_time: '',
                // 到期时间
                expiry_datetime: '',
                // 收款单位名称
                payee_account_name: '',
                // 收款单位银行账号
                payee_account_number: '',
                // 收款单位开户银行名称
                payee_bank_name: '',
                // 银行交易流水号
                transaction_flow_id: '',
                // 付款单位名称
                payer_account_name: '',
                // 付款单位银行账号
                payer_account_number: '',
                // 付款单位开户银行名称
                payer_bank_name: '',
                // 银行水单（图片）
                file_url: '',
                // 提交验证时间
                submit_time: '',
                // 审核结果
                audit_result: '',
                // 不通过原因
                remark: '',
                // 审核时间
                audit_time: ''
            };

            const response = await exchange.StoreTradeCharge(ctx, JSON.stringify(TradeCharge));

            expect(response).to.deep.equal(true);
        });

        it('should throw an error when given invalid JSON data', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const invalidJson = '{invalid json'; // 这个 JSON 是不完整的

            await expect(exchange.StoreTradeCharge(ctx, invalidJson))
                .to.be.rejectedWith('contract_code":3003,"contract_msg":"StoreTradeCharge: JSON parsing or object check failed: Unexpected token i in JSON at position 1');
        });

        it('should throw an error when given an empty object', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const emptyObject = JSON.stringify({});

            await expect(exchange.StoreTradeCharge(ctx, emptyObject))
                .to.be.rejectedWith('contract_code":3005,"contract_msg":"checkObjectNotEmpty: dataInfo object should not be empty');
        });

        it('should store a StoreTradeCharge info fail', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            // 交易服务费订单信息上链
            const TradeCharge  = {
                // 交易服务费订单号
                // trade_charge_id: '',
                // 关联成交订单号
                trade_id: '',
                // 收费对象
                charge_object: '',
                // 企业名称
                company_name: '',
                // 服务费金额
                charge_amount: '',
                // 状态
                payment_status: '',
                // 创建时间
                create_time: '',
                // 到期时间
                expiry_datetime: '',
                // 收款单位名称
                payee_account_name: '',
                // 收款单位银行账号
                payee_account_number: '',
                // 收款单位开户银行名称
                payee_bank_name: '',
                // 银行交易流水号
                transaction_flow_id: '',
                // 付款单位名称
                payer_account_name: '',
                // 付款单位银行账号
                payer_account_number: '',
                // 付款单位开户银行名称
                payer_bank_name: '',
                // 银行水单（图片）
                file_url: '',
                // 提交验证时间
                submit_time: '',
                // 审核结果
                audit_result: '',
                // 不通过原因
                remark: '',
                // 审核时间
                audit_time: ''
            };

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify(TradeCharge)))
                .to.be.rejectedWith('contract_code":3006,"contract_msg":"validateData error: Property: , Message: must have required property \'trade_charge_id\'');
        });

        it('should throw an error if mergeDeep fails', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            sandbox.stub(exchange.Verify, 'mergeDeep').throws(new Error('mergeDeep failed'));

            // 交易服务费订单信息上链
            const TradeCharge  = {
                // 交易服务费订单号
                trade_charge_id: '',
                // 关联成交订单号
                trade_id: '',
                // 收费对象
                charge_object: '',
                // 企业名称
                company_name: '',
                // 服务费金额
                charge_amount: '',
                // 状态
                payment_status: '',
                // 创建时间
                create_time: '',
                // 到期时间
                expiry_datetime: '',
                // 收款单位名称
                payee_account_name: '',
                // 收款单位银行账号
                payee_account_number: '',
                // 收款单位开户银行名称
                payee_bank_name: '',
                // 银行交易流水号
                transaction_flow_id: '',
                // 付款单位名称
                payer_account_name: '',
                // 付款单位银行账号
                payer_account_number: '',
                // 付款单位开户银行名称
                payer_bank_name: '',
                // 银行水单（图片）
                file_url: '',
                // 提交验证时间
                submit_time: '',
                // 审核结果
                audit_result: '',
                // 不通过原因
                remark: '',
                // 审核时间
                audit_time: ''
            };

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify(TradeCharge)))
                .to.be.rejectedWith('StoreTradeCharge: mergeDeep failed');
        });

        it('should throw an error when getTxID returns empty', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('');

            // 交易服务费订单信息上链
            const TradeCharge  = {
                // 交易服务费订单号
                trade_charge_id: '',
                // 关联成交订单号
                trade_id: '',
                // 收费对象
                charge_object: '',
                // 企业名称
                company_name: '',
                // 服务费金额
                charge_amount: '',
                // 状态
                payment_status: '',
                // 创建时间
                create_time: '',
                // 到期时间
                expiry_datetime: '',
                // 收款单位名称
                payee_account_name: '',
                // 收款单位银行账号
                payee_account_number: '',
                // 收款单位开户银行名称
                payee_bank_name: '',
                // 银行交易流水号
                transaction_flow_id: '',
                // 付款单位名称
                payer_account_name: '',
                // 付款单位银行账号
                payer_account_number: '',
                // 付款单位开户银行名称
                payer_bank_name: '',
                // 银行水单（图片）
                file_url: '',
                // 提交验证时间
                submit_time: '',
                // 审核结果
                audit_result: '',
                // 不通过原因
                remark: '',
                // 审核时间
                audit_time: ''
            };

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify(TradeCharge)))
                .to.be.rejectedWith('StoreTradeCharge: Transaction ID (tradeChargeKey) is empty');
        });

        it('should throw an error if user has no admin permission', async () => {
            sandbox.stub(exchange.Permission, 'checkAdminAndGetUserID')
                .throws(new Error('User does not have admin rights'));

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify({})))
                .to.be.rejectedWith('User does not have admin rights');
        });

        it('should throw an error for an unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
        });

        it('should throw an error for organization does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization skdatacenter2 does not exist"}');
        });

        it('should throw an error for organization does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            ctx.stub.getState.withArgs('uuiduuid').resolves(false);

            await expect(exchange.StoreTradeCharge(ctx, JSON.stringify('Slot1'))).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization skdatacenter2 does not exist"}');
        });
    });

});