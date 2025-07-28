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
                buy_end_date: '1',
                // 购买开始时间
                buy_start_date: '2',
                // 商品ID
                goods_id: '3',
                //  标的信息
                instrument: {
                    // 资产类型
                    asset_type: '4',
                    // 企业ID
                    company_id: '5',
                    // 联系人名称
                    contact_name: '6',
                    // 联系人电话
                    contact_phone: '7',
                    // 标的附件(文件IDs)
                    instrument_annex: '8',
                    // 标的规则
                    instrument_bidding_rule: {
                        // 加价或减价幅度
                        bidding_changes: '9',
                        // 成交规则
                        bidding_deal_rule: '10',
                        // 延时时间（秒）
                        bidding_delay_time: '11',
                        // 竞拍保证金
                        bidding_deposit: '12',
                        // 其他规则描述
                        bidding_description: '13',
                        // 竞价结束时间
                        bidding_end_time: '14',
                        // 拍卖起始价
                        bidding_start_price: '15',
                        // 竞价开始时间
                        bidding_start_time: '16',
                        // 拍卖类型
                        bidding_type: '17',
                        // 拍次 (1拍，2拍，3拍)
                        instrument_grade: '18',
                        // 标的ID
                        instrument_id: '19',
                        // 总数量
                        instrument_quantity: '20',
                    },
                    // 标的销售
                    instrument_bidding_sales: {
                        // 出价数量
                        bid_quantity: '21',
                        // 当前价
                        current_price: '22',
                        // 当前剩余数量，针对即刻拍
                        current_remaining_quantity: '23',
                        // 预计结束时间
                        estimated_end_time: '24',
                        // 预计开始时间
                        estimated_start_time: '25',
                        // 标的ID
                        instrument_id: '26',
                        // 围观次数
                        instrument_views: '27',
                        // 报名数
                        registration_quantity: '28',
                    },
                    // 标的描述
                    instrument_description: '29',
                    // 标的ID
                    instrument_id: '30',
                    // 宣传图片(文件IDs)
                    instrument_images: '31',
                    // 标的物名称
                    instrument_name: '32',
                    // 标的状态
                    instrument_status: '33',
                    // 标的类型
                    instrument_type: '34',
                    // 宣传视频
                    instrument_video: '35',
                    // 父标的ID
                    parent_instrument_id: '36',
                    // 项目ID
                    project_id: '37',
                },
                // 标的ID
                instrument_id: '38',
                // 项目上链唯一id
                project_chain_unique_id: '39',
                // 产品类型
                product_type: '40',
                // 景区所属区
                scenic_area_code: '41',
                // 景区所属市
                scenic_city_code: '42',
                // 景区ID
                scenic_id: '43',
                // 景区所属省
                scenic_province_code: '44',
                // 票种
                ticket_type: '45',
                // 入园结束时间
                use_end_date: '46',
                // 入园开始时间
                use_start_date: '47'
            };

            const response = await exchange.StoreInstrument(ctx, JSON.stringify(InstrumentTicket));

            expect(response).to.deep.equal(true);
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
    });

});