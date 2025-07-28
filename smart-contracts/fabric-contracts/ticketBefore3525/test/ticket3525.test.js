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

class MockIterator {
    constructor(data) {
        this.array = data;
        this.cur = 0;
    }
    next() {
        if (this.cur < this.array.length) {
            const value = this.array[this.cur];
            this.cur++;
            return Promise.resolve({ value: value });
        } else {
            return Promise.resolve({ done: true });
        }
    }
    close() {
        return Promise.resolve();
    }
}

describe('Chaincode', () => {
    let sandbox;
    let token;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach('Sandbox creation', () => {
        sandbox = sinon.createSandbox();
        token = new main('token-erc3525');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#BalanceOfValue', () => {
        it('should return balance for a valid token', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';
            const expectedBalance = 100;
            sinon.stub(token.Ticket, 'readNFT').resolves({ balance: expectedBalance });

            const balance = await token.BalanceOfValue(ctx, tokenId);

            sinon.assert.calledWith(token.Ticket.readNFT, ctx, tokenId);
            expect(balance).to.equal(expectedBalance);
        });

        it('should throw error for a token without a balance assigned', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '102';
            sinon.stub(token.Ticket, 'readNFT').resolves({ balance: undefined });

            await expect(token.BalanceOfValue(ctx, tokenId))
                .to.be.rejectedWith(Error, 'This token does not have a balance assigned');

            sinon.assert.calledWith(token.Ticket.readNFT, ctx, tokenId);
        });
    });

    describe('#OwnerOf', () => {
        it('should return owner for a valid token', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';
            const expectedOwner = 'Alice';
            sinon.stub(token.Ticket, 'readNFT').resolves({ owner: expectedOwner });

            const owner = await token.OwnerOf(ctx, tokenId);

            sinon.assert.calledWith(token.Ticket.readNFT, ctx, tokenId);
            expect(owner).to.equal(expectedOwner);
        });

        it('should throw error for a token without an owner assigned', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '102';
            sinon.stub(token.Ticket, 'readNFT').resolves({ owner: undefined });

            await expect(token.OwnerOf(ctx, tokenId))
                .to.be.rejectedWith(Error, 'No owner is assigned to this token');

            sinon.assert.calledWith(token.Ticket.readNFT, ctx, tokenId);
        });
    });

    describe('#SlotOf', () => {
        it('should return slot for a valid token', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';
            const expectedSlot = 'Slot1';
            sinon.stub(token.Ticket, 'readNFT').resolves({ slot: expectedSlot });

            const slot = await token.SlotOf(ctx, tokenId);

            sinon.assert.calledWith(token.Ticket.readNFT, ctx, tokenId);
            expect(slot).to.equal(expectedSlot);
        });

        it('should throw error for a token without a slot assigned', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '102';
            sinon.stub(token.Ticket, 'readNFT').resolves({ slot: undefined });

            await expect(token.SlotOf(ctx, tokenId))
                .to.be.rejectedWith(Error, 'This token does not have a slot assigned');
        });
    });

    describe('#Name', () => {
        it('should work', async () => {
            mockStub.getState.resolves('some state');

            const response = await token.Name(ctx);
            expect(response).to.equals('some state');
        });
    });

    describe('#Symbol', () => {
        it('should work', async () => {
            mockStub.getState.resolves('some state');

            const response = await token.Symbol(ctx);
            expect(response).to.equals('some state');
        });
    });

    describe('#TotalSupply', () => {
        it('should work', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const mockResponse = [
                { key: 'nft_101', value: Buffer.from(JSON.stringify({ tokenId: 101, owner: 'Alice' })) },
                { key: 'nft_102', value: Buffer.from(JSON.stringify({ tokenId: 102, owner: 'Bob' })) }
            ];
            mockStub.getStateByPartialCompositeKey.resolves(new MockIterator(mockResponse));

            const response = await token.TotalSupply(ctx);
            expect(response).to.equals(2);
        });
    });

    describe('#TokenURI', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('nft_101');
            const nft = {
                token_id: '101',
                owner: '',
                slot: {},
                balance: '',
                metadata: {
                    token_url: 'https://xxxxxx',
                    description: ''
                },
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.TokenURI(ctx, '101');
            expect(response).to.deep.equal('https://xxxxxx');
        });
    });

    // describe('#Mint', () => {
    //     beforeEach(() => {
    //         const orgAdminMapping = {
    //             skdatacenter1: ['0xskadministrator1']
    //         };

    //         ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
    //     });

    //     it('should mint a new token for an authorized client', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         sinon.stub(token, '_nftExists').resolves(false);

    //         const tokenId = '1';
    //         const to = 'Alice';
    //         const slot =  {
    //             // 基本信息(不变的字段)
    //             BasicInformation: {
    //                 // 产品信息
    //                 SimpleTicket: {
    //                     // 景区id
    //                     scenic_id: '',
    //                     // 景区名称
    //                     scenic_name: '',
    //                     // 产品名称
    //                     simple_name: '',
    //                     // 市场标准价格
    //                     market_price: 0,
    //                     // 产品类型
    //                     pro_type: 0,
    //                     // 使用方式（每天/一共）
    //                     use_type: 0,
    //                     // 分时预约（开/关）
    //                     time_restrict: 0,
    //                     // 控制方式（不控制/按星期控制）
    //                     restrict_type: 0,
    //                     // 控制星期
    //                     restrict_week: '',
    //                     // 使用有效期
    //                     validity_day: 0,
    //                     // 首日激活（开/关）
    //                     is_activate: 0,
    //                     // 使用次数
    //                     use_count: 0,
    //                     // 可入园天数
    //                     available_days: 0,
    //                     // 入园统计（开/关）
    //                     park_statistic: 0,
    //                     // 服务商id
    //                     operator_id: '',
    //                     // 分时预约集合
    //                     timeSharing: [
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: ''
    //                         },
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '111',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '222',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: '333'
    //                         }
    //                     ],
    //                     // 商品信息集合
    //                     ticketGoods: [
    //                         {
    //                             // 商品id
    //                             ticketGoods_id: '',
    //                             // 商品名称
    //                             goods_name: '',
    //                             // 分时预约id
    //                             time_share_id: '',
    //                             // 特殊折扣率
    //                             overall_discount: 0,
    //                             // 分销商开始折扣率
    //                             begin_discount: 0,
    //                             // 分销商结束折扣率
    //                             end_discount: 0,
    //                             // 票种
    //                             ticketGoods_type: 0,
    //                             // 购买数量限制(开/关)
    //                             people_number: 0,
    //                             // 最小起订量
    //                             min_people: 0,
    //                             // 单次最大预订量
    //                             max_people: 0,
    //                             // 出票规则
    //                             RuleIssue: {
    //                                 // 出票规则名称
    //                                 ruleIssue_name: '',
    //                                 // 出票方式
    //                                 ruleIssue_way: 0,
    //                                 // 出票类型
    //                                 ruleIssue_type: 0,
    //                                 // 实名方式
    //                                 is_real_name: 0,
    //                                 // 使用时间
    //                                 use_time: '',
    //                                 // 当天购票开始时间
    //                                 ruleIssue_begin_time: '',
    //                                 // 当天购票结束时间
    //                                 ruleIssue_end_time: '',
    //                                 // 校验实名制
    //                                 real_name_check: 0,
    //                                 // 限制本人购买
    //                                 only_owner_buy: 0,
    //                                 // 校验权益
    //                                 rights_check: 0,
    //                                 // 权益id
    //                                 rights_id: '',
    //                                 // 审批(开/关)
    //                                 need_approval: 0,
    //                                 // 审批id
    //                                 approve_id: '',
    //                                 // 审批内容
    //                                 approve_content: '',
    //                                 // 规则类型(权益票/权益卡/普通票)
    //                                 rule_type: 0,
    //                                 // 仅窗口售票(开/关)
    //                                 only_window_sale: 0
    //                             },
    //                             // 检票规则
    //                             RuleCheck: {
    //                                 // 身份识别类型
    //                                 identity_type: '',
    //                                 // 检票规则名称
    //                                 ruleCheck_name: '',
    //                                 // 检票控制方式
    //                                 control_type: 0,
    //                                 // 检票通行方式
    //                                 adopt_type: 0,
    //                                 // 检票间隔时间
    //                                 interval_time: 0,
    //                                 // 分时预约设置
    //                                 time_share_book: 0,
    //                                 // 检票点
    //                                 check_point_ids: ['']
    //                             },
    //                             // 退票规划
    //                             RuleRetreat: {
    //                                 // 退票规则名称
    //                                 ruleRetreat_name: '',
    //                                 // 可退票(开/关)
    //                                 is_retreat: 0,
    //                                 // 默认退票费率
    //                                 default_rate: 0
    //                             }
    //                         }
    //                     ],
    //                     // 库存信息
    //                     TicketStock: {
    //                         // 景区id
    //                         stock_scenic_id: '',
    //                         // 产品id
    //                         stock_ticket_id: '',
    //                         // 景区名称
    //                         stock_scenic_name: '',
    //                         // 产品名称
    //                         ticket_name: '',
    //                         // 购买有效开始时间
    //                         purchase_begin_time: '',
    //                         // 结算id
    //                         account_id: '',
    //                         // 服务商id
    //                         stock_operator_id: '',
    //                         // 购买有效结束时间
    //                         purchase_end_time: '',
    //                         // 入园有效开始时间
    //                         stock_enter_begin_time: '',
    //                         // 入园有效结束时间
    //                         stock_enter_end_time: '',
    //                         // 总库存
    //                         total_stock: 0,
    //                         // 产品类型
    //                         ticket_type: 0,
    //                         // 每天库存
    //                         nums: 0,
    //                         // 景区批次号
    //                         batch_id: ''
    //                     }
    //                 },
    //                 // 是否交易所发布
    //                 is_exchange: 0
    //             },
    //             // 附加信息(可更新的字段)
    //             AdditionalInformation: {
    //                 // 出票信息
    //                 TicketData:  {
    //                     // 游客信息
    //                     BuyerInfo: [
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         },
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         }
    //                     ],
    //                     // 联系人手机号
    //                     phone:'',
    //                     // 销售渠道
    //                     sale_channel: 0,
    //                     // 订单号
    //                     order_id: '',
    //                     // 组合订单id
    //                     order_group_id: '',
    //                     // 游玩人数
    //                     player_num: 0,
    //                     // 类型
    //                     issuance_type: 0,
    //                     // 门票状态
    //                     status: 800,
    //                     // 票号
    //                     ticket_id: '',
    //                     // 二维码
    //                     print_encode: '',
    //                     // 入园开始时段
    //                     enter_begin_time: '',
    //                     // 入园结束时段
    //                     enter_end_time: '',
    //                     // 过期时间
    //                     overdue_time: '',
    //                     // 服务商id
    //                     provider_id: '',
    //                     // 店铺id
    //                     store_id: '',
    //                     // 实际售价
    //                     selling_price: 0,
    //                     // 退订人数
    //                     cancel_count: 0,
    //                     // 入园时间
    //                     enter_time: '',
    //                     // 已检票人数
    //                     checked_num: 0,
    //                     // 已使用次数
    //                     used_count: 0,
    //                     // 已入园天数
    //                     used_days: 0,
    //                     // // 购买账号
    //                     // account: '',
    //                     // // 购买组织
    //                     // org: ''
    //                 },
    //                 // 价格策略
    //                 PriceInfo: [
    //                     {
    //                         // 分销商
    //                         distributor_id: '',
    //                         // 商品 id
    //                         goods_id: '',
    //                         // 价格详细信息
    //                         PriceDetailedInfo: {
    //                             // 价格 id
    //                             price_id: '',
    //                             // 销售价
    //                             sale_price: 0,
    //                             // 组合销售价
    //                             compose_price: 0,
    //                             // 佣金比例
    //                             commission_rate: 0,
    //                             // 组合销售
    //                             is_compose: true,
    //                             // 分组
    //                             group: ['']
    //                         }
    //                     }
    //                 ],
    //                 // 核销信息集合
    //                 TicketCheckData: [{}]
    //             }
    //         };
    //         const balance = '100';
    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         const expectedNFT = {
    //             token_id: '1',
    //             owner: 'Alice',
    //             slot: slot,
    //             balance: '100',
    //             total_balance: '100',
    //             metadata: {
    //                 token_url: '',
    //                 description: ''
    //             },
    //             stockBatchNumber: []
    //         };

    //         mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');

    //         const response = await token.Mint(ctx, tokenId, to, JSON.stringify(slot), balance, JSON.stringify(metadata), 'triggerTime');

    //         expect(response).to.deep.equal(expectedNFT);
    //     });

    //     it('should throw an error if there are more slots than presets', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         sinon.stub(token, '_nftExists').resolves(false);

    //         const tokenId = '1';
    //         const to = 'Alice';
    //         const slot =  {
    //             // 基本信息(不变的字段)
    //             BasicInformation: {
    //                 // 产品信息
    //                 SimpleTicket: {
    //                     // 景区id
    //                     scenic_id: '',
    //                     // 景区名称
    //                     scenic_name: '',
    //                     // 产品名称
    //                     simple_name: '',
    //                     // 市场标准价格
    //                     market_price: 0,
    //                     // 产品类型
    //                     pro_type: 0,
    //                     // 使用方式（每天/一共）
    //                     use_type: 0,
    //                     // 分时预约（开/关）
    //                     time_restrict: 0,
    //                     // 控制方式（不控制/按星期控制）
    //                     restrict_type: 0,
    //                     // 控制星期
    //                     restrict_week: '',
    //                     // 使用有效期
    //                     validity_day: 0,
    //                     // 首日激活（开/关）
    //                     is_activate: 0,
    //                     // 使用次数
    //                     use_count: 0,
    //                     // 可入园天数
    //                     available_days: 0,
    //                     // 入园统计（开/关）
    //                     park_statistic: 0,
    //                     // 服务商id
    //                     operator_id: '',
    //                     // 分时预约集合
    //                     timeSharing: [
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: ''
    //                         },
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '111',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '222',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: '333'
    //                         }
    //                     ],
    //                     // 商品信息集合
    //                     ticketGoods: [
    //                         {
    //                             // 商品id
    //                             ticketGoods_id: '',
    //                             // 商品名称
    //                             goods_name: '',
    //                             // 分时预约id
    //                             time_share_id: '',
    //                             // 特殊折扣率
    //                             overall_discount: 0,
    //                             // 分销商开始折扣率
    //                             begin_discount: 0,
    //                             // 分销商结束折扣率
    //                             end_discount: 0,
    //                             // 票种
    //                             ticketGoods_type: 0,
    //                             // 购买数量限制(开/关)
    //                             people_number: 0,
    //                             // 最小起订量
    //                             min_people: 0,
    //                             // 单次最大预订量
    //                             max_people: 0,
    //                             // 出票规则
    //                             RuleIssue: {
    //                                 // 出票规则名称
    //                                 ruleIssue_name: '',
    //                                 // 出票方式
    //                                 ruleIssue_way: 0,
    //                                 // 出票类型
    //                                 ruleIssue_type: 0,
    //                                 // 实名方式
    //                                 is_real_name: 0,
    //                                 // 使用时间
    //                                 use_time: '',
    //                                 // 当天购票开始时间
    //                                 ruleIssue_begin_time: '',
    //                                 // 当天购票结束时间
    //                                 ruleIssue_end_time: '',
    //                                 // 校验实名制
    //                                 real_name_check: 0,
    //                                 // 限制本人购买
    //                                 only_owner_buy: 0,
    //                                 // 校验权益
    //                                 rights_check: 0,
    //                                 // 权益id
    //                                 rights_id: '',
    //                                 // 审批(开/关)
    //                                 need_approval: 0,
    //                                 // 审批id
    //                                 approve_id: '',
    //                                 // 审批内容
    //                                 approve_content: '',
    //                                 // 规则类型(权益票/权益卡/普通票)
    //                                 rule_type: 0,
    //                                 // 仅窗口售票(开/关)
    //                                 only_window_sale: 0
    //                             },
    //                             // 检票规则
    //                             RuleCheck: {
    //                                 // 身份识别类型
    //                                 identity_type: '',
    //                                 // 检票规则名称
    //                                 ruleCheck_name: '',
    //                                 // 检票控制方式
    //                                 control_type: 0,
    //                                 // 检票通行方式
    //                                 adopt_type: 0,
    //                                 // 检票间隔时间
    //                                 interval_time: 0,
    //                                 // 分时预约设置
    //                                 time_share_book: 0,
    //                                 // 检票点
    //                                 check_point_ids: ['']
    //                             },
    //                             // 退票规划
    //                             RuleRetreat: {
    //                                 // 退票规则名称
    //                                 ruleRetreat_name: '',
    //                                 // 可退票(开/关)
    //                                 is_retreat: 0,
    //                                 // 默认退票费率
    //                                 default_rate: 0
    //                             }
    //                         }
    //                     ],
    //                     // 库存信息
    //                     TicketStock: {
    //                         // 景区id
    //                         stock_scenic_id: '',
    //                         // 产品id
    //                         stock_ticket_id: '',
    //                         // 景区名称
    //                         stock_scenic_name: '',
    //                         // 产品名称
    //                         ticket_name: '',
    //                         // 购买有效开始时间
    //                         purchase_begin_time: '',
    //                         // 结算id
    //                         account_id: '',
    //                         // 服务商id
    //                         stock_operator_id: '',
    //                         // 购买有效结束时间
    //                         purchase_end_time: '',
    //                         // 入园有效开始时间
    //                         stock_enter_begin_time: '',
    //                         // 入园有效结束时间
    //                         stock_enter_end_time: '',
    //                         // 总库存
    //                         total_stock: 0,
    //                         // 产品类型
    //                         ticket_type: 0,
    //                         // 每天库存
    //                         nums: 0,
    //                         // 景区批次号
    //                         batch_id: ''
    //                     }
    //                 },
    //                 // 是否交易所发布
    //                 is_exchange: 0
    //             },
    //             // 附加信息(可更新的字段)
    //             AdditionalInformation: {
    //                 // 出票信息
    //                 TicketData:  {
    //                     // 游客信息
    //                     BuyerInfo: [
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: '',
    //                             aaa: 5
    //                         },
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         }
    //                     ],
    //                     // 联系人手机号
    //                     phone:'',
    //                     // 销售渠道
    //                     sale_channel: 0,
    //                     // 订单号
    //                     order_id: '',
    //                     // 组合订单id
    //                     order_group_id: '',
    //                     // 游玩人数
    //                     player_num: 0,
    //                     // 类型
    //                     issuance_type: 0,
    //                     // 门票状态
    //                     status: 800,
    //                     // 票号
    //                     ticket_id: '',
    //                     // 二维码
    //                     print_encode: '',
    //                     // 入园开始时段
    //                     enter_begin_time: '',
    //                     // 入园结束时段
    //                     enter_end_time: '',
    //                     // 过期时间
    //                     overdue_time: '',
    //                     // 服务商id
    //                     provider_id: '',
    //                     // 店铺id
    //                     store_id: '',
    //                     // 实际售价
    //                     selling_price: 0,
    //                     // 退订人数
    //                     cancel_count: 0,
    //                     // 入园时间
    //                     enter_time: '',
    //                     // 已检票人数
    //                     checked_num: 0,
    //                     // 已使用次数
    //                     used_count: 0,
    //                     // 已入园天数
    //                     used_days: 0,
    //                     // // 购买账号
    //                     // account: '',
    //                     // // 购买组织
    //                     // org: ''
    //                 },
    //                 // 价格策略
    //                 PriceInfo: [
    //                     {
    //                         // 分销商
    //                         distributor_id: '',
    //                         // 商品 id
    //                         goods_id: '',
    //                         // 价格详细信息
    //                         PriceDetailedInfo: {
    //                             // 佣金比例
    //                             commission_rate: 0,
    //                             // 组合销售价
    //                             compose_price: 99999,
    //                             // 分组
    //                             group: [''],
    //                             // 组合销售
    //                             is_compose: true,
    //                             // 价格 id
    //                             price_id: '',
    //                             // 销售价
    //                             sale_price: 0
    //                         }
    //                     }
    //                 ],
    //                 // 核销信息集合
    //                 TicketCheckData: [],
    //                 aaa: ''
    //             }
    //         };
    //         const balance = '100';
    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft1');

    //         await expect(token.Mint(ctx, tokenId, to, JSON.stringify(slot), balance, JSON.stringify(metadata), 'triggerTime'), )
    //             .to.be.rejectedWith(Error, '{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at AdditionalInformation"}');
    //     });

    //     it('should throw an error if the slot is less than the default', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         sinon.stub(token, '_nftExists').resolves(false);

    //         const tokenId = '1';
    //         const to = 'Alice';
    //         const slot =  {
    //             // 基本信息(不变的字段)
    //             BasicInformation: {
    //                 // 产品信息
    //                 SimpleTicket: {
    //                     // 景区id
    //                     scenic_id: '',
    //                     // 景区名称
    //                     scenic_name: '',
    //                     // 产品名称
    //                     simple_name: '',
    //                     // 市场标准价格
    //                     market_price: 0,
    //                     // 产品类型
    //                     pro_type: 0,
    //                     // 使用方式（每天/一共）
    //                     use_type: 0,
    //                     // 分时预约（开/关）
    //                     time_restrict: 0,
    //                     // 控制方式（不控制/按星期控制）
    //                     restrict_type: 0,
    //                     // 控制星期
    //                     restrict_week: '',
    //                     // 使用有效期
    //                     validity_day: 0,
    //                     // 首日激活（开/关）
    //                     is_activate: 0,
    //                     // 使用次数
    //                     use_count: 0,
    //                     // 可入园天数
    //                     available_days: 0,
    //                     // 入园统计（开/关）
    //                     park_statistic: 0,
    //                     // 服务商id
    //                     operator_id: '',
    //                     // 分时预约集合
    //                     timeSharing: [
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: ''
    //                         },
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '111',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '222',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: '333'
    //                         }
    //                     ],
    //                     // 商品信息集合
    //                     ticketGoods: [
    //                         {
    //                             // 商品id
    //                             ticketGoods_id: '',
    //                             // 商品名称
    //                             goods_name: '',
    //                             // 分时预约id
    //                             time_share_id: '',
    //                             // 特殊折扣率
    //                             overall_discount: 0,
    //                             // 分销商开始折扣率
    //                             begin_discount: 0,
    //                             // 分销商结束折扣率
    //                             end_discount: 0,
    //                             // 票种
    //                             ticketGoods_type: 0,
    //                             // 购买数量限制(开/关)
    //                             people_number: 0,
    //                             // 最小起订量
    //                             min_people: 0,
    //                             // 单次最大预订量
    //                             max_people: 0,
    //                             // 出票规则
    //                             RuleIssue: {
    //                                 // 出票规则名称
    //                                 ruleIssue_name: '',
    //                                 // 出票方式
    //                                 ruleIssue_way: 0,
    //                                 // 出票类型
    //                                 ruleIssue_type: 0,
    //                                 // 实名方式
    //                                 is_real_name: 0,
    //                                 // 使用时间
    //                                 use_time: '',
    //                                 // 当天购票开始时间
    //                                 ruleIssue_begin_time: '',
    //                                 // 当天购票结束时间
    //                                 ruleIssue_end_time: '',
    //                                 // 校验实名制
    //                                 real_name_check: 0,
    //                                 // 限制本人购买
    //                                 only_owner_buy: 0,
    //                                 // 校验权益
    //                                 rights_check: 0,
    //                                 // 权益id
    //                                 rights_id: '',
    //                                 // 审批(开/关)
    //                                 need_approval: 0,
    //                                 // 审批id
    //                                 // approve_id: '',
    //                                 // 审批内容
    //                                 approve_content: '',
    //                                 // 规则类型(权益票/权益卡/普通票)
    //                                 rule_type: 0,
    //                                 // 仅窗口售票(开/关)
    //                                 only_window_sale: 0
    //                             },
    //                             // 检票规则
    //                             RuleCheck: {
    //                                 // 身份识别类型
    //                                 identity_type: '',
    //                                 // 检票规则名称
    //                                 ruleCheck_name: '',
    //                                 // 检票控制方式
    //                                 control_type: 0,
    //                                 // 检票通行方式
    //                                 adopt_type: 0,
    //                                 // 检票间隔时间
    //                                 interval_time: 0,
    //                                 // 分时预约设置
    //                                 time_share_book: 0,
    //                                 // 检票点
    //                                 check_point_ids: ['1']
    //                             },
    //                             // 退票规划
    //                             RuleRetreat: {
    //                                 // 退票规则名称
    //                                 ruleRetreat_name: '',
    //                                 // 可退票(开/关)
    //                                 is_retreat: 0,
    //                                 // 默认退票费率
    //                                 default_rate: 0
    //                             }
    //                         }
    //                     ],
    //                     // 库存信息
    //                     TicketStock: {
    //                         // 景区id
    //                         stock_scenic_id: '',
    //                         // 产品id
    //                         stock_ticket_id: '',
    //                         // 景区名称
    //                         stock_scenic_name: '',
    //                         // 产品名称
    //                         ticket_name: '',
    //                         // 购买有效开始时间
    //                         purchase_begin_time: '',
    //                         // 结算id
    //                         account_id: '',
    //                         // 服务商id
    //                         stock_operator_id: '',
    //                         // 购买有效结束时间
    //                         purchase_end_time: '',
    //                         // 入园有效开始时间
    //                         stock_enter_begin_time: '',
    //                         // 入园有效结束时间
    //                         stock_enter_end_time: '',
    //                         // 总库存
    //                         total_stock: 0,
    //                         // 产品类型
    //                         ticket_type: 0,
    //                         // 每天库存
    //                         nums: 0,
    //                         // 景区批次号
    //                         batch_id: ''
    //                     }
    //                 },
    //                 // 是否交易所发布
    //                 is_exchange: 0
    //             },
    //             // 附加信息(可更新的字段)
    //             AdditionalInformation: {
    //                 // 出票信息
    //                 TicketData:  {
    //                     // 游客信息
    //                     BuyerInfo: [
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         },
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         }
    //                     ],
    //                     // 联系人手机号
    //                     // phone:'',
    //                     // 销售渠道
    //                     sale_channel: 0,
    //                     // 订单号
    //                     order_id: '',
    //                     // 组合订单id
    //                     order_group_id: '',
    //                     // 游玩人数
    //                     player_num: 0,
    //                     // 类型
    //                     issuance_type: 0,
    //                     // 门票状态
    //                     status: 800,
    //                     // 票号
    //                     ticket_id: '',
    //                     // 二维码
    //                     print_encode: '',
    //                     // 入园开始时段
    //                     enter_begin_time: '',
    //                     // 入园结束时段
    //                     enter_end_time: '',
    //                     // 过期时间
    //                     overdue_time: '',
    //                     // 服务商id
    //                     provider_id: '',
    //                     // 店铺id
    //                     store_id: '',
    //                     // 实际售价
    //                     selling_price: 0,
    //                     // 退订人数
    //                     cancel_count: 0,
    //                     // 入园时间
    //                     enter_time: '',
    //                     // 已检票人数
    //                     checked_num: 0,
    //                     // 已使用次数
    //                     used_count: 0,
    //                     // 已入园天数
    //                     used_days: 0
    //                 },
    //                 // 价格策略
    //                 PriceInfo: [
    //                     {
    //                         // 分销商
    //                         distributor_id: '',
    //                         // 商品 id
    //                         goods_id: '',
    //                         // 价格详细信息
    //                         PriceDetailedInfo: {
    //                             // 佣金比例
    //                             commission_rate: 0,
    //                             // 组合销售价
    //                             compose_price: 99999,
    //                             // 分组
    //                             group: [''],
    //                             // 组合销售
    //                             is_compose: true,
    //                             // 价格 id
    //                             price_id: '',
    //                             // 销售价
    //                             sale_price: 0
    //                         }
    //                     }
    //                 ],
    //                 // 核销信息集合
    //                 TicketCheckData: []
    //             }
    //         };
    //         const balance = '100';
    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');
    //         mockStub.createCompositeKey.withArgs('userTokenIds', ['Alice']).returns('userTokenIds_Alice');
    //         mockStub.createCompositeKey.withArgs('balance', ['Alice', '1']).returns('balance_Alice_1');

    //         const emptyArray = [];
    //         ctx.stub.getState.withArgs('userTokenIds_Alice').resolves(Buffer.from(JSON.stringify(emptyArray)));

    //         await expect(token.Mint(ctx, tokenId, to, JSON.stringify(slot), balance, JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3006,"contract_msg":"validateStructure: Missing property phone at AdditionalInformation.TicketData"}');
    //     });

    //     it('should throw an error if the slot is inconsistent with the preset type', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         sinon.stub(token, '_nftExists').resolves(false);

    //         const tokenId = '1';
    //         const to = 'Alice';
    //         const slot =  {
    //             // 基本信息(不变的字段)
    //             BasicInformation: {
    //                 // 产品信息
    //                 SimpleTicket: {
    //                     // 景区id
    //                     scenic_id: '',
    //                     // 景区名称
    //                     scenic_name: '',
    //                     // 产品名称
    //                     simple_name: '',
    //                     // 市场标准价格
    //                     market_price: 0,
    //                     // 产品类型
    //                     pro_type: 0,
    //                     // 使用方式（每天/一共）
    //                     use_type: 0,
    //                     // 分时预约（开/关）
    //                     time_restrict: 0,
    //                     // 控制方式（不控制/按星期控制）
    //                     restrict_type: 0,
    //                     // 控制星期
    //                     restrict_week: '',
    //                     // 使用有效期
    //                     validity_day: 0,
    //                     // 首日激活（开/关）
    //                     is_activate: 0,
    //                     // 使用次数
    //                     use_count: 0,
    //                     // 可入园天数
    //                     available_days: 0,
    //                     // 入园统计（开/关）
    //                     park_statistic: 0,
    //                     // 服务商id
    //                     operator_id: '',
    //                     // 分时预约集合
    //                     timeSharing: [
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: '',
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: ''
    //                         },
    //                         {
    //                             // 分时预约id
    //                             timeSharing_id: '111',
    //                             // 分时预约开始时间
    //                             timeSharing_begin_time: 6,
    //                             // 分时预约结束时间
    //                             timeSharing_end_time: '333'
    //                         }
    //                     ],
    //                     // 商品信息集合
    //                     ticketGoods: [
    //                         {
    //                             // 商品id
    //                             ticketGoods_id: '',
    //                             // 商品名称
    //                             goods_name: '',
    //                             // 分时预约id
    //                             time_share_id: '',
    //                             // 特殊折扣率
    //                             overall_discount: 0,
    //                             // 分销商开始折扣率
    //                             begin_discount: 0,
    //                             // 分销商结束折扣率
    //                             end_discount: 0,
    //                             // 票种
    //                             ticketGoods_type: 0,
    //                             // 购买数量限制(开/关)
    //                             people_number: 0,
    //                             // 最小起订量
    //                             min_people: 0,
    //                             // 单次最大预订量
    //                             max_people: 0,
    //                             // 出票规则
    //                             RuleIssue: {
    //                                 // 出票规则名称
    //                                 ruleIssue_name: '',
    //                                 // 出票方式
    //                                 ruleIssue_way: 0,
    //                                 // 出票类型
    //                                 ruleIssue_type: 0,
    //                                 // 实名方式
    //                                 is_real_name: 0,
    //                                 // 使用时间
    //                                 use_time: '',
    //                                 // 当天购票开始时间
    //                                 ruleIssue_begin_time: '',
    //                                 // 当天购票结束时间
    //                                 ruleIssue_end_time: '',
    //                                 // 校验实名制
    //                                 real_name_check: 0,
    //                                 // 限制本人购买
    //                                 only_owner_buy: 0,
    //                                 // 校验权益
    //                                 rights_check: 0,
    //                                 // 权益id
    //                                 rights_id: '',
    //                                 // 审批(开/关)
    //                                 need_approval: 0,
    //                                 // 审批id
    //                                 approve_id: '',
    //                                 // 审批内容
    //                                 approve_content: '',
    //                                 // 规则类型(权益票/权益卡/普通票)
    //                                 rule_type: 0,
    //                                 // 仅窗口售票(开/关)
    //                                 only_window_sale: 0
    //                             },
    //                             // 检票规则
    //                             RuleCheck: {
    //                                 // 身份识别类型
    //                                 identity_type: '',
    //                                 // 检票规则名称
    //                                 ruleCheck_name: '',
    //                                 // 检票控制方式
    //                                 control_type: 0,
    //                                 // 检票通行方式
    //                                 adopt_type: 0,
    //                                 // 检票间隔时间
    //                                 interval_time: 0,
    //                                 // 分时预约设置
    //                                 time_share_book: 0,
    //                                 // 检票点
    //                                 check_point_ids: ['1']
    //                             },
    //                             // 退票规划
    //                             RuleRetreat: {
    //                                 // 退票规则名称
    //                                 ruleRetreat_name: '',
    //                                 // 可退票(开/关)
    //                                 is_retreat: 0,
    //                                 // 默认退票费率
    //                                 default_rate: 0
    //                             }
    //                         }
    //                     ],
    //                     // 库存信息
    //                     TicketStock: {
    //                         // 景区id
    //                         stock_scenic_id: '',
    //                         // 产品id
    //                         stock_ticket_id: '',
    //                         // 景区名称
    //                         stock_scenic_name: '',
    //                         // 产品名称
    //                         ticket_name: '',
    //                         // 购买有效开始时间
    //                         purchase_begin_time: '',
    //                         // 结算id
    //                         account_id: '',
    //                         // 服务商id
    //                         stock_operator_id: '',
    //                         // 购买有效结束时间
    //                         purchase_end_time: '',
    //                         // 入园有效开始时间
    //                         stock_enter_begin_time: '',
    //                         // 入园有效结束时间
    //                         stock_enter_end_time: '',
    //                         // 总库存
    //                         total_stock: 0,
    //                         // 产品类型
    //                         ticket_type: 0,
    //                         // 每天库存
    //                         nums: 0,
    //                         // 景区批次号
    //                         batch_id: ''
    //                     }
    //                 },
    //                 // 是否交易所发布
    //                 is_exchange: 0
    //             },
    //             // 附加信息(可更新的字段)
    //             AdditionalInformation: {
    //                 // 出票信息
    //                 TicketData:  {
    //                     // 游客信息
    //                     BuyerInfo: [
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         },
    //                         {
    //                             // 姓名
    //                             buyerInfo_id_name: 'aaaaaaaaaa123',
    //                             // 身份证
    //                             id_number: ''
    //                         }
    //                     ],
    //                     // 联系人手机号
    //                     phone:'',
    //                     // 销售渠道
    //                     sale_channel: 0,
    //                     // 订单号
    //                     order_id: '',
    //                     // 组合订单id
    //                     order_group_id: '',
    //                     // 游玩人数
    //                     player_num: 0,
    //                     // 类型
    //                     issuance_type: 0,
    //                     // 门票状态
    //                     status: 800,
    //                     // 票号
    //                     ticket_id: '',
    //                     // 二维码
    //                     print_encode: '',
    //                     // 入园开始时段
    //                     enter_begin_time: '',
    //                     // 入园结束时段
    //                     enter_end_time: '',
    //                     // 过期时间
    //                     overdue_time: '',
    //                     // 服务商id
    //                     provider_id: '',
    //                     // 店铺id
    //                     store_id: '',
    //                     // 实际售价
    //                     selling_price: 0,
    //                     // 退订人数
    //                     cancel_count: 0,
    //                     // 入园时间
    //                     enter_time: '',
    //                     // 已检票人数
    //                     checked_num: 0,
    //                     // 已使用次数
    //                     used_count: 0,
    //                     // 已入园天数
    //                     used_days: 0
    //                 },
    //                 // 价格策略
    //                 PriceInfo: [
    //                     {
    //                         // 分销商
    //                         distributor_id: '',
    //                         // 商品 id
    //                         goods_id: '',
    //                         // 价格详细信息
    //                         PriceDetailedInfo: {
    //                             // 佣金比例
    //                             commission_rate: 0,
    //                             // 组合销售价
    //                             compose_price: 99999,
    //                             // 分组
    //                             group: [''],
    //                             // 组合销售
    //                             is_compose: true,
    //                             // 价格 id
    //                             price_id: '',
    //                             // 销售价
    //                             sale_price: 0
    //                         }
    //                     }
    //                 ],
    //                 // 核销信息集合
    //                 TicketCheckData: ''
    //             }
    //         };
    //         const balance = '100';
    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');
    //         mockStub.createCompositeKey.withArgs('userTokenIds', ['Alice']).returns('userTokenIds_Alice');
    //         mockStub.createCompositeKey.withArgs('balance', ['Alice', '1']).returns('balance_Alice_1');

    //         const emptyArray = [];
    //         ctx.stub.getState.withArgs('userTokenIds_Alice').resolves(Buffer.from(JSON.stringify(emptyArray)));

    //         await expect(token.Mint(ctx, tokenId, to, JSON.stringify(slot), balance, JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at AdditionalInformation.TicketCheckData: expected object, got string"}');
    //     });

    //     it('should throw an error for an unauthorized user', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=others::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         await expect(token.Mint(ctx, 'Alice', JSON.stringify('Slot1'), '100', JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Admin others does not exist in the organization skdatacenter1"}');
    //     });

    //     it('should throw an error for an unauthorized client', async () => {
    //         mockClientIdentity.getMSPID.returns('Org3MSP');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         await expect(token.Mint(ctx, 'Alice', JSON.stringify('Slot1'), '100', JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization Org3MSP does not exist"}');
    //     });

    //     it('should throw an error if token already exists', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         sinon.stub(token, '_nftExists').resolves(true);

    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         const tokenId = '1';

    //         // const response = await token.Mint(ctx, tokenId, 'Alice', JSON.stringify('Slot1'), '100', JSON.stringify(metadata));
    //         // expect(response.message).to.equal('The token 1 is already minted.');

    //         await expect(token.Mint(ctx, tokenId, 'Alice', JSON.stringify('Slot1'), '100', JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3002,"contract_msg":"Mint: The token 1 is already minted"}');
    //     });

    //     it('should throw an error if recipient is not specified', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         const tokenId = '1';
    //         const to = '';

    //         await expect(token.Mint(ctx, tokenId, to, JSON.stringify('Slot1'), '100', JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, 'to should not be empty');
    //     });

    //     it('should throw an error if balance is not greater than 0', async () => {
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const metadata = {
    //             token_url: '',
    //             description: ''
    //         };

    //         const tokenId = '1';

    //         await expect(token.Mint(ctx, tokenId, 'Alice', JSON.stringify('Slot1'), '-5', JSON.stringify(metadata), 'triggerTime')).to.be.rejectedWith(Error, '{"contract_code":3001,"contract_msg":"Mint: balance -5 must be greater than 0"}');
    //     });
    // });

    describe('#Burn', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
        });

        it('should burn the entire token when no amount is specified', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(true);

            sinon.stub(token.Ticket, 'readNFT').resolves({
                owner: '0xskadministrator1',
                balance: '100'
            });

            const nft = {
                owner: '0xskadministrator1',
                balance: '100'
            };

            const tokenId = '1';

            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft1');
            ctx.stub.getState.withArgs('nft1').resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.Burn(ctx, tokenId);

            sinon.assert.calledWith(ctx.stub.deleteState, 'nft1');

            expect(response).to.be.true;
        });

        it('should burn a specified amount of the token', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(true);

            sinon.stub(token.Ticket, 'readNFT').resolves({
                owner: '0xskadministrator1',
                balance: '100'
            });

            const nft = {
                owner: '0xskadministrator1',
                balance: '100'
            };

            const tokenId = '1';
            const amount = '50';

            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft1');
            mockStub.createCompositeKey.withArgs('userTokenIds', ['0xskadministrator1']).returns('userTokenIds_0xskadministrator1');
            mockStub.createCompositeKey.withArgs('balance', ['0xskadministrator1', '1']).returns('balance_0xskadministrator1_1');

            ctx.stub.getState.withArgs('nft1').resolves(Buffer.from(JSON.stringify(nft)));

            const emptyArray = ['1'];
            ctx.stub.getState.withArgs('userTokenIds_0xskadministrator1').resolves(Buffer.from(JSON.stringify(emptyArray)));

            const response = await token.Burn(ctx, tokenId, amount);

            sinon.assert.calledWith(ctx.stub.putState, 'nft1', sinon.match.instanceOf(Buffer));

            expect(response).to.be.true;
        });

        it('should throw an error if the token does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft1');
            mockStub.createCompositeKey.withArgs('userTokenIds', ['0xskadministrator1']).returns('userTokenIds_0xskadministrator1');

            ctx.stub.getState.withArgs('nft1').resolves(null);

            const tokenId = '1';

            await expect(token.Burn(ctx, tokenId)).to.be.rejectedWith(Error, 'The token 1 does not exist.');
        });
    });

    // ================== Ticket ==========================
    describe('#UpdatePriceInfo', () => {
        it('should update ticket info successfully when updating some fields', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                // 价格详细信息
                PriceDetailedInfo: {
                    // 价格 id
                    price_id: '2',
                    // 销售价
                    sale_price: 888,
                    // 组合销售价
                    compose_price: 555,
                    // 佣金比例
                    commission_rate: 0,
                    // 组合销售
                    is_compose: false,
                    // 分组
                    group: {
                        add_group_id: ['1', '2', '3'],
                        del_group_id: ['15', '16', '17'],
                        group_id: ['10', '11', '1']
                    }
                },
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: '',
            });

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData: [
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '222'
                            },
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '111'
                            }
                        ],
                        // 价格策略
                        PriceInfo: [
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
                                    group: ['1', '2', '3']
                                }
                            },
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
                                    group: ['1', '2', '3']
                                }
                            },
                            {
                                // 分销商
                                distributor_id: '',
                                // 商品 id
                                goods_id: '',
                                // 价格详细信息
                                PriceDetailedInfo: {
                                    // 价格 id
                                    price_id: '2',
                                    // 销售价
                                    sale_price: 0,
                                    // 组合销售价
                                    compose_price: 0,
                                    // 佣金比例
                                    commission_rate: 0,
                                    // 组合销售
                                    is_compose: true,
                                    // 分组
                                    group: ['1', '2', '3']
                                }
                            },
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
                                    group: ['1', '2', '3']
                                }
                            }
                        ],
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };

            mockStub.getState.withArgs('nft101').resolves(Buffer.from(JSON.stringify(currentNft)));

            const response = await token.UpdatePriceInfo(ctx, tokenId, '', ticketInfo, 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: '',
                aaa: '',
                // 价格详细信息
                PriceDetailedInfo: {
                    // 价格 id
                    price_id: '1',
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
                        add_group_id: [],
                        del_group_id: [],
                        group_id: ['1','2','3']
                    }
                }
            });

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData: [
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '222'
                            },
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '111'
                            }
                        ],
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };
            mockStub.getState.withArgs('nft101').resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdatePriceInfo(ctx, tokenId, '0', ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: '',
                // 价格详细信息
                PriceDetailedInfo: {
                    // 价格 id
                    price_id: '1',
                    // 销售价
                    sale_price: 0,
                    // 组合销售价
                    compose_price: 0,
                    // 佣金比例
                    // commission_rate: 0,
                    // 组合销售
                    is_compose: true,
                    // 分组
                    group: {
                        add_group_id: [],
                        del_group_id: [],
                        group_id: ['1','2','3']
                    }
                }
            });

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData: [
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '222'
                            },
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '111'
                            }
                        ],
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };
            mockStub.getState.withArgs('nft101').resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdatePriceInfo(ctx, tokenId, '5', ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property commission_rate at PriceDetailedInfo"}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                // 分销商
                distributor_id: '',
                // 商品 id
                goods_id: '',
                // 价格详细信息
                PriceDetailedInfo: {
                    // 价格 id
                    price_id: '1',
                    // 销售价
                    sale_price: '',
                    // 组合销售价
                    compose_price: 0,
                    // 佣金比例
                    commission_rate: 0,
                    // 组合销售
                    is_compose: true,
                    // 分组
                    group: {
                        add_group_id: [],
                        del_group_id: [],
                        group_id: ['1','2','3']
                    }
                }
            });

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData: [
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '222'
                            },
                            {
                                // 游客信息
                                BuyerInfo: [
                                    {
                                        // 姓名
                                        buyerInfo_id_name: '',
                                        // 身份证
                                        id_number: ''
                                    }
                                ],
                                // 门票状态
                                status: 0,
                                ticket_id: '111'
                            }
                        ],
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };
            mockStub.getState.withArgs('nft101').resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdatePriceInfo(ctx, tokenId, '0', ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at PriceDetailedInfo.sale_price: expected number, got string"}');
        });

        it('should throw error if contract is not initialized', async () => {
            const tokenId = '123';
            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);
            // await expect(token.UpdatePriceInfo(ctx, ticketInfo)).to.be.rejectedWith('Please call Initialize() to initialize the contract first');
            await expect(token.UpdatePriceInfo(ctx, tokenId, '0', ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":4001,"contract_msg":"checkInitialized: Please call Initialize() to initialize the contract first"}');
        });

        it('should throw error if caller is not admin of any organization', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('nonExistingMSPID');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.UpdatePriceInfo(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization nonExistingMSPID does not exist"}');
        });
    });

    describe('#VerifyTicket', () => {
        it('should verify ticket info successfully', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        VerifyStatus: {
                            // 门票状态
                            status: 999,
                            // 票号
                            ticket_id: '111',
                            // 已检票人数
                            checked_num: 8888,
                            // 已使用次数
                            used_count: 66666,
                            // 已入园天数
                            used_days: 555555
                        },
                        VerifyInfo:  {
                            // 检票设备 id
                            equipment_id: '',
                            // 检票设备类型
                            equipment_type: '',
                            // 操作人员用户 id
                            user_id: '',
                            //账户
                            account: '',
                            // 核销次数
                            check_number: 0,
                            // 检票类型
                            check_type: 0,
                            // 票号
                            ticket_number: '00000',
                            // 组织
                            org: '',
                            // 库存批次号
                            stock_batch_number: '11111',
                            // 核销时间
                            enter_time: '2024-5-14',
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
                            // 操作人员用户名
                            username: ''
                        }
                    }
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
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
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            const response = await token.VerifyTicket(ctx, ticketInfo, 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        VerifyStatus: {
                            // 门票状态
                            status: 999,
                            // 票号
                            ticket_id: '111',
                            // 已检票人数
                            checked_num: 8888,
                            // 已使用次数
                            used_count: 66666,
                            // 已入园天数
                            used_days: 555555,
                            aaa: ''
                        },
                        VerifyInfo:  {
                            //账户
                            account: '',
                            // 组织
                            org: '',
                            // 检票类型
                            check_type: 0,
                            // 票号
                            ticket_number: '111',
                            // 库存批次号
                            stock_batch_number: '',
                            // 核销时间
                            enter_time: '',
                            // 核销次数
                            check_number: 0,
                            // 景区id
                            scenic_id: '',
                            // 姓名
                            // id_name: '',
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
                    }
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.VerifyTicket(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        VerifyStatus: {
                            // 门票状态
                            status: 999,
                            // 票号
                            ticket_id: '111',
                            // 已检票人数
                            checked_num: 8888,
                            // 已使用次数
                            used_count: 66666,
                            // 已入园天数
                            used_days: ''
                        },
                        VerifyInfo:  {
                            //账户
                            account: '',
                            // 组织
                            org: '',
                            // 检票类型
                            check_type: 0,
                            // 票号
                            ticket_number: '111',
                            // 库存批次号
                            stock_batch_number: '0000000',
                            // 核销时间
                            enter_time: '2024-02-11',
                            // 核销次数
                            check_number: 2,
                            // 景区id
                            scenic_id: '',
                            // 姓名
                            idName: '',
                            // 身份证
                            idCard: '',
                            // 二维码
                            qrCode: '',
                            // 检票点名称
                            pointName: '',
                            // 检票点id
                            pointId: '',
                            // 检票设备名称
                            equipmentName: '',
                            // 检票设备 id
                            equipmentId: '',
                            // 检票设备类型
                            equipmentType: '',
                            // 操作人员用户 id
                            userId: '',
                            // 操作人员用户名
                            username: ''
                        }
                    }
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.VerifyTicket(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at used_days: expected number, got string"}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        VerifyStatus: {
                            // 门票状态
                            status: 999,
                            // 票号
                            ticket_id: '111',
                            // 已检票人数
                            checked_num: 8888,
                            // 已使用次数
                            used_count: 66666,
                            // 已入园天数
                            // used_days: 555555
                        },
                        VerifyInfo:  {
                            //账户
                            account: '',
                            // 组织
                            org: '',
                            // 检票类型
                            check_type: 0,
                            // 票号
                            ticket_number: '111',
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
                            id_card: 888,
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
                    }
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.VerifyTicket(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property used_days at "}');
        });

        it('should throw error if contract is not initialized', async () => {
            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.VerifyTicket(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":4001,"contract_msg":"checkInitialized: Please call Initialize() to initialize the contract first"}');
        });

        it('should throw error if caller is not admin of any organization', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('nonExistingMSPID');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.VerifyTicket(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization nonExistingMSPID does not exist"}');
        });
    });

    describe('#UpdateIssueTickets', () => {
        it('should update ticket issue info successfully', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            token.CheckInitialized = sinon.stub().resolves();

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 游客信息
                        BuyerInfo: [
                            {
                                // 姓名
                                buyerInfo_id_name: '35353535',
                                // 身份证
                                id_number: '333333333'
                            },
                            {
                                // 姓名
                                buyerInfo_id_name: '5555',
                                // 身份证
                                id_number: '8989898989'
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
                        ticket_id: '101',
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
                        used_days: 0,
                        // // 购买账号
                        // account: '',
                        // // 购买组织
                        // org: ''
                    }
                ]
            );

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
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
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            const response = await token.UpdateIssueTickets(ctx, ticketInfo);

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            token.CheckInitialized = sinon.stub().resolves();

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 游客信息
                        BuyerInfo: [
                            {
                                // 姓名
                                buyerInfo_id_name: '35353535',
                                // 身份证
                                id_number: '333333333'
                            },
                            {
                                // 姓名
                                buyerInfo_id_name: '5555',
                                // 身份证
                                // id_number: '8989898989'
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
                        used_days: 0,
                        aaa: ''
                        // // 购买账号
                        // account: '',
                        // // 购买组织
                        // org: ''
                    }
                ]
            );

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaaa',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdateIssueTickets(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            token.CheckInitialized = sinon.stub().resolves();

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 游客信息
                        BuyerInfo: [
                            {
                                // 姓名
                                buyerInfo_id_name: '35353535',
                                // 身份证
                                id_number: '333333333'
                            },
                            {
                                // 姓名
                                buyerInfo_id_name: '5555',
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
                        // provider_id: '',
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
                        // // 购买账号
                        // account: '',
                        // // 购买组织
                        // org: ''
                    }
                ]
            );

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaaa',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdateIssueTickets(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property provider_id at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            token.CheckInitialized = sinon.stub().resolves();

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 游客信息
                        BuyerInfo: [
                            {
                                // 姓名
                                buyerInfo_id_name: '35353535',
                                // 身份证
                                id_number: '333333333'
                            },
                            {
                                // 姓名
                                buyerInfo_id_name: '5555',
                                // 身份证
                                id_number: '54865258659'
                            }
                        ],
                        // 联系人手机号
                        phone: 0,
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
                        used_days: 0,
                        // // 购买账号
                        // account: '',
                        // // 购买组织
                        // org: ''
                    }
                ]
            );

            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                            }
                        }
                    },
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaaa',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息
                        TicketCheck: {
                            // 检票方式
                            ticketCheck_way: ''
                        }
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.UpdateIssueTickets(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at phone: expected string, got number"}');
        });

        it('should throw error if contract is not initialized', async () => {
            token.CheckInitialized = sinon.stub().throws(new Error('Contract not initialized'));

            const ticketInfo = JSON.stringify([
                {
                    BuyerInfo: [
                        {
                            buyerInfo_id_name: '1111111',
                            id_number: '11'
                        },
                        {
                            buyerInfo_id_name: '1111111',
                            id_number: '11'
                        }
                    ],
                    status: 4,
                    ticket_id: '111'
                }
            ]);

            await expect(token.UpdateIssueTickets(ctx, ticketInfo)).to.be.rejectedWith('Please call Initialize() to initialize the contract first');
        });

        it('should throw error if caller is not admin of any organization', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('nonExistingMSPID');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify([
                {
                    BuyerInfo: [
                        {
                            buyerInfo_id_name: '1111111',
                            id_number: '11'
                        },
                        {
                            buyerInfo_id_name: '1111111',
                            id_number: '11'
                        }
                    ],
                    status: 4,
                    ticket_id: '111'
                }
            ]);

            await expect(token.UpdateIssueTickets(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization nonExistingMSPID does not exist"}');
        });
    });

    describe('#TimerUpdateTickets', () => {
        it('should TimerUpdate ticket info successfully', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 门票状态
                        status: 999,
                        // 票号
                        ticket_id: '111'
                    }
                ]
            );

            const currentNft = {
                token_id: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: [ '1', '2', '3' ]
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
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
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            const response = await token.TimerUpdateTickets(ctx, ticketInfo, 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 门票状态
                        status: 999,
                        // 票号
                        ticket_id: '111',
                        aaa: ''
                    }
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.TimerUpdateTickets(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 门票状态
                        // status: 999,
                        // 票号
                        ticket_id: '111'
                    }
                ]
            );

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.TimerUpdateTickets(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property status at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify(
                [
                    {
                        // 门票状态
                        status: 0,
                        // 票号
                        ticket_id: 111
                    },
                ]
            );

            const currentNft = {
                tokenId: '111',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: []
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            used_days: 0,
                            // 购买账号
                            account: '',
                            // 购买组织
                            org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                }
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.TimerUpdateTickets(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at ticket_id: expected string, got number"}');
        });

        it('should throw error if contract is not initialized', async () => {
            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.TimerUpdateTickets(ctx, ticketInfo, 'triggerTime')).to.be.rejectedWith('{"contract_code":4001,"contract_msg":"checkInitialized: Please call Initialize() to initialize the contract first"}');
        });

        it('should throw error if caller is not admin of any organization', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('nonExistingMSPID');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.VerifyTicket(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization nonExistingMSPID does not exist"}');
        });
    });

    describe('#UpdateTicketInfo', () => {
        it('should update ticket info successfully when updating some fields', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                TicketData:{
                    // 游客信息
                    BuyerInfo: {
                        chdabc5156154:{
                            // 姓名
                            buyerInfo_id_name: '',
                            // 身份证
                            id_number: '1301332xxxxxxxxxxxxxx'
                        }
                    },
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
                PriceInfo: {
                    // 分销商
                    distributor_id: '1',
                    // 商品 id
                    goods_id: '2',
                    // 价格详细信息
                    PriceDetailedInfo: {
                        // 销售价
                        sale_price: 3,
                        // 组合销售价
                        compose_price: 58,
                        // 佣金比例
                        commission_rate: 5,
                        // 组合销售
                        is_compose: false
                    }
                },
                TicketCheckData: {
                    777:{
                        //账户
                        account: 'lalalalalala',
                        // 组织
                        org: '',
                        // 检票类型
                        check_type: 2561568525,
                        // 票号
                        ticket_number: '130133xxxxx',
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
                }
            });

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                slot:  {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: 'aaa'
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: 'chdabc5156154'
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
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
                            },
                            {
                                //账户
                                account: '',
                                // 组织
                                org: '',
                                // 检票类型
                                check_type: 0,
                                // 票号
                                ticket_number: '777',
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
                    }
                }
            };
            mockStub.getState.withArgs('nft101').resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform UpdateTicketInfo operation
            const response = await token.UpdateTicketInfo(ctx, tokenId, ticketInfo);

            expect(response).to.deep.equal(true);
        });

        // it('should update ticket info successfully when the incoming ticket field is empty', async () => {
        //     // Simulate initialized contract options
        //     ctx.stub.getState.resolves(Buffer.from('SomeValue'));

        //     mockClientIdentity.getMSPID.returns('skdatacenter1');
        //     mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

        //     // Stub CheckInitialized method to simulate contract initialization
        //     token.CheckInitialized = sinon.stub().resolves();

        //     const tokenId = '101';

        //     // Stub _readNFT to return current NFT state
        //     const currentNft = {
        //         tokenId: '101',
        //         owner: 'Alice',
        //         slot:  {
        //             BasicInformation: {
        //                 // 产品信息
        //                 SimpleTicket: {
        //                     // 景区id
        //                     scenic_id: '',
        //                     // 库存信息
        //                     TicketStock: {
        //                         // 景区id
        //                         stock_scenic_id: '',
        //                     }
        //                 }
        //             },
        //             AdditionalInformation: {
        //                 // 出票信息
        //                 TicketData: [
        //                     {
        //                         // 游客信息
        //                         BuyerInfo: [
        //                             {
        //                                 // 姓名
        //                                 buyerInfo_id_name: '',
        //                                 // 身份证
        //                                 id_number: ''
        //                             }
        //                         ],
        //                         // 门票状态
        //                         status: 0,
        //                         ticket_id: '222'
        //                     }
        //                 ],
        //                 // 核销信息
        //                 TicketCheck: {
        //                     // 检票方式
        //                     ticketCheck_way: ''
        //                 }
        //             }
        //         }
        //     };

        //     const aaa = {};
        //     // sinon.stub(token, '_readNFT').resolves(currentNft);
        //     mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

        //     const fields = 'TicketData'; // 设置要更新的字段类型
        //     const ticketId = '222'; // 设置票号 ID

        //     // Perform UpdateTicketInfo operation
        //     const response = await token.UpdateTicketInfo(ctx, tokenId, fields, JSON.stringify(aaa), ticketId);

        //     expect(response).to.deep.equal(true);
        // });

        // it('should throw error for unauthorized client', async () => {
        //     mockClientIdentity.getMSPID.returns('skdatacenter2');
        //     mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
        //     // Stub CheckInitialized method to simulate contract initialization
        //     ctx.stub.getState.resolves(Buffer.from('SomeValue'));

        //     // Stub CheckInitialized method to simulate contract initialization
        //     token.CheckInitialized = sinon.stub().resolves();

        //     const tokenId = '101';

        //     const ticketInfo = JSON.stringify({
        //         ticketStatus: 'completed',
        //         ticketType: 'VIP'
        //     });
        //     const fields = 'TicketData';
        //     const ticketId = '111';

        //     await expect(token.UpdateTicketInfo(ctx, tokenId, fields, ticketInfo, ticketId))
        //         .to.be.rejectedWith(Error, 'client is not authorized to update ticket information');
        // });

        // it('should throw error for unauthorized user', async () => {
        //     mockClientIdentity.getMSPID.returns('skdatacenter1');
        //     mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser2::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
        //     // Stub CheckInitialized method to simulate contract initialization
        //     ctx.stub.getState.resolves(Buffer.from('SomeValue'));

        //     // Stub CheckInitialized method to simulate contract initialization
        //     token.CheckInitialized = sinon.stub().resolves();

        //     const tokenId = '101';

        //     const ticketInfo = JSON.stringify({
        //         ticketStatus: 'completed',
        //         ticketType: 'VIP'
        //     });
        //     const fields = 'TicketData';
        //     const ticketId = '111';

        //     await expect(token.UpdateTicketInfo(ctx, tokenId, fields, ticketInfo, ticketId))
        //         .to.be.rejectedWith(Error, 'User is not authorized to update ticket information');
        // });
    });

    describe('#ReadTicket', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('nft_101');
            const nft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Bob',
                token_url: 'DummyURI'
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.ReadTicket(ctx, '101');
            expect(response).to.deep.equal(nft);
        });
        it('The tokenId 101 is invalid. It does not exist', async () => {
            mockStub.createCompositeKey.returns('nft_101');
            mockStub.getState.resolves(null);

            await expect(token.ReadTicket(ctx, '104')).to.be.rejectedWith(Error, '{"contract_code":3008,"contract_msg":"readNFT: The tokenId 104 is invalid. It does not exist"}');
        });
    });

    // ================== Order ==========================
    describe('#CreateTicketId', () => {
        it('should create the ticket number, QR code, and signature, split ticket successfully', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            // ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));


            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const nft = {
                token_id: '1',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: []
                    }
                },
                balance: '10',
                total_balance: '10',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // Stub ReadNFT to resolve with a sample NFT
            // sinon.stub(token.Ticket, 'ReadNFT').resolves(nft);
            ctx.stub.getState.withArgs('nft123').resolves(Buffer.from(JSON.stringify(nft)));

            // Define input parameters
            const tokenId = JSON.stringify([
                {
                    stock_batch_number: '123',
                    sender: 'Alice',
                    amount: 2
                }
            ]);
            const ticketsDataObj =
                [
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 2,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [7,8],
                        //随机数(8位)
                        uuid : '88888888'
                    },
                    // {
                    //     //游玩时间
                    //     enter_time : '2024-05-09',
                    //     //游玩人数
                    //     player_num : 1,
                    //     //RSA证书
                    //     certificate : 'sczdgvfs',
                    //     //流水号（票号后四位）
                    //     rand : '0088',
                    //     //景区id
                    //     scenic_id : '123',
                    //     //产品类型
                    //     pro_type : 0,
                    //     //分时预约id
                    //     time_share_id : 789,
                    //     //分时预约检票设置
                    //     time_share_book : 123,
                    //     //分时预约开始时间
                    //     begin_time : '08:00',
                    //     //分时预约结束时间
                    //     end_time : '22:00',
                    //     //检票点id集合
                    //     check_point_ids : [1,2,3],
                    //     //随机数(8位)
                    //     uuid : '88888888'
                    // }
                ];

            const ticketsData = JSON.stringify(ticketsDataObj);

            // Stub _nftExists method to simulate token not already existing
            // sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft12320240509sczdgvfs0088').resolves(false);

            // Simulate the created 'nft_101' first and then call it
            // mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft123');
            // ctx.stub.getState.withArgs('nft123').resolves(Buffer.from(stockNft));

            // Call the IssueTickets function
            await token.CreateTicketId(ctx, tokenId, '0', ticketsData, 'triggerTime');

            // const expectRes = [
            //     {
            //         ticket_number: '12320240509sczdgvfs0088',
            //         sign: '12320240509sczdgvfs0088|20240509||7,8|1|88888888',
            //         print_encode: '073m+H4t2TmEGqiPIlpbuUsfS0pCJ8aj6QHVkDmsIxAXMinJkZfZtMlAB/xVF2p3cAXrFAg40neQjpin0xIU/Q=='
            //     },
            //     {
            //         ticket_number: '12320240509sczdgvfs0088',
            //         sign: '12320240509sczdgvfs0088|20240509||1,2,3|1|88888888',
            //         print_encode: '073m+H4t2TmEGqiPIlpbuUsfS0pCJ8aj6QHVkDmsIxA/ZvI4xDY1pkOCo3zywpY2DQrJ0Vqqbhcn4nJDd2GTrw=='
            //     }
            // ];

            // expect(response).to.deep.equal(expectRes);
        });

        it('should throw an error if there are more slots than presets', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            // ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));


            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const nft = {
                token_id: '1',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: [1]
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: []
                    }
                },
                balance: '10',
                total_balance: '10',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // Stub readNFT to resolve with a sample NFT
            sinon.stub(token.Ticket, 'readNFT').resolves(nft);

            // Define input parameters
            const tokenId = JSON.stringify([
                {
                    stock_batch_number: '123',
                    sender: 'Alice',
                    amount: 10
                }
            ]);
            const ticketsDataObj =
                [
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [7,8],
                        //随机数(8位)
                        uuid : '88888888',
                        aaa: ''
                    },
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [1,2,3],
                        //随机数(8位)
                        uuid : '88888888'
                    }
                ];
            const ticketsData = JSON.stringify(ticketsDataObj);

            // Stub _nftExists method to simulate token not already existing
            sinon.stub(token, '_nftExists').resolves(false);

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');

            await expect(token.CreateTicketId(ctx, tokenId, '0', ticketsData, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            // ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));


            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const nft = {
                token_id: '1',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: []
                    }
                },
                balance: '10',
                total_balance: '10',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // Stub ReadNFT to resolve with a sample NFT
            // sinon.stub(token.Ticket, 'ReadNFT').resolves(nft);
            ctx.stub.getState.withArgs('nft123').resolves(Buffer.from(JSON.stringify(nft)));


            // Define input parameters
            const tokenId = JSON.stringify([
                {
                    stock_batch_number: '123',
                    sender: 'Alice',
                    amount: 10
                }
            ]);
            const ticketsDataObj =
                [
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [7,8],
                        //随机数(8位)
                        // uuid : '88888888'
                    },
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [1,2,3],
                        //随机数(8位)
                        uuid : '88888888'
                    }
                ];
            const ticketsData = JSON.stringify(ticketsDataObj);

            // Stub _nftExists method to simulate token not already existing
            sinon.stub(token, '_nftExists').resolves(false);

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');

            await expect(token.CreateTicketId(ctx, tokenId, '0', ticketsData, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property uuid at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            // ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));


            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const nft = {
                token_id: '1',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 0,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: []
                    }
                },
                balance: '10',
                total_balance: '10',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // Stub ReadNFT to resolve with a sample NFT
            // sinon.stub(token.Ticket, 'ReadNFT').resolves(nft);
            ctx.stub.getState.withArgs('nft123').resolves(Buffer.from(JSON.stringify(nft)));

            // Define input parameters
            const tokenId = JSON.stringify([
                {
                    stock_batch_number: '123',
                    sender: 'Alice',
                    amount: 10
                }
            ]);
            const ticketsDataObj =
                [
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '0088',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [7,8],
                        //随机数(8位)
                        uuid : 88888888
                    },
                    {
                        //游玩时间
                        enter_time : '2024-05-09',
                        //游玩人数
                        player_num : 5,
                        //RSA证书
                        certificate : 'sczdgvfs',
                        //流水号（票号后四位）
                        rand : '8886',
                        //景区id
                        scenic_id : '123',
                        //产品类型
                        pro_type : 0,
                        //分时预约id
                        time_share_id : 789,
                        //分时预约检票设置
                        time_share_book : 123,
                        //分时预约开始时间
                        begin_time : '08:00',
                        //分时预约结束时间
                        end_time : '22:00',
                        //检票点id集合
                        check_point_ids : [1,2,3],
                        //随机数(8位)
                        uuid : '88888888',
                    }
                ];
            const ticketsData = JSON.stringify(ticketsDataObj);

            // Stub _nftExists method to simulate token not already existing
            sinon.stub(token, '_nftExists').resolves(false);

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('nft', ['1']).returns('nft_1');

            await expect(token.CreateTicketId(ctx, tokenId, '0', ticketsData, 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at uuid: expected string, got number"}');
        });

        it('should throw error if contract is not initialized', async () => {
            const tokenId = '123';
            const ticketsData = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.CreateTicketId(ctx, tokenId, '0', ticketsData, 'triggerTime')).to.be.rejectedWith('{"contract_code":4001,"contract_msg":"checkInitialized: Please call Initialize() to initialize the contract first"}');
        });

        it('should throw error if caller is not admin of any organization', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            // ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));


            mockClientIdentity.getMSPID.returns('nonExistingMSPID');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const ticketInfo = JSON.stringify([
                {
                    account: '123',
                    org: '456',
                    check_type: 2,
                    ticket_number: '111',
                    stock_batch_number: '0000000',
                    enter_time: '2024-02-11',
                    check_number: 2
                }
            ]);

            await expect(token.CreateTicketId(ctx, ticketInfo)).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"_adminExistsInOrg: Organization nonExistingMSPID does not exist"}');
        });
    });

    describe('#StoreOrder', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should mint a new token for an authorized client', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('orderId159').resolves(false);

            const data =  {
                // 主订单 id
                order_group_id: '159',
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
                        seller_id: 999,
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
                        user_id: '159',
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
                                        ticket_number: '123',
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

            const expectNft =  {
                token_id: '123',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                },
                stockBatchNumber: '123'
            };

            // mockStub.getState.withArgs('nft123').resolves(expectNft);
            ctx.stub.getState.withArgs('nft123').resolves(Buffer.from(JSON.stringify(expectNft)));

            const response = await token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const data =  {
                aaa: 787878,
                // 主订单 id
                order_group_id: '111111111',
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const data =  {
                // 主订单 id
                order_group_id: '111111111',
                // 订单状态
                // order_status: '',
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                // day: '',
                                // 分时预约 id
                                time_share_id: 0,
                                // 分时预约时间
                                time_share: '',
                                // 组合票产品 id
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property order_status at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const data =  {
                // 主订单 id
                order_group_id: '111111111',
                // 订单状态
                order_status: 5,
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                day: '5',
                                // 分时预约 id
                                time_share_id: 0,
                                // 分时预约时间
                                time_share: '',
                                // 组合票产品 id
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at order_status: expected string, got number"}');
        });
    });

    describe('#StoreRefund', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should mint a new token for an authorized client', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('orderId159').resolves(false);

            const data =   {
                // 退订单子表
                refundInfoToC: {
                    // 退订单 id
                    refund_id: '159',
                    // 主订单号
                    order_group_id: '123',
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
                    user_id: 88888,
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
                        ticket_number: '987654321',
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
                        refund_num: 45,
                        // 库存回退信息
                        stock_batch_info: [
                            {
                                stock_batch_number: '123',
                                sender: 'Alice',
                                amount: 100
                            },
                            {
                                stock_batch_number: '456',
                                sender: 'Alice',
                                amount: 48
                            },
                            {
                                stock_batch_number: '789',
                                sender: 'Alice',
                                amount: 28
                            }
                        ]
                    },
                    {
                        // 退订单 id
                        refund_id: '',
                        // 订单商品 id
                        order_product_id: 0,
                        // 票号
                        ticket_number: '987654321',
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
                        refund_num: 45,
                        // 库存回退信息
                        stock_batch_info: [
                            {
                                stock_batch_number: '123',
                                sender: 'Alice',
                                amount: 100
                            },
                            {
                                stock_batch_number: '456',
                                sender: 'Alice',
                                amount: 50
                            },
                            {
                                stock_batch_number: '789',
                                sender: 'Alice',
                                amount: 40
                            }
                        ]
                    }
                ]
            };

            const expectNft = {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: 0
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: {
                            // 分销商
                            distributor_id: '',
                            // 商品 id
                            goods_id: '',
                            // 价格详细信息
                            PriceDetailedInfo: {
                                // 销售价
                                sale_price: 0,
                                // 组合销售价
                                compose_price: 99999,
                                // 佣金比例
                                commission_rate: 0,
                                // 组合销售
                                is_compose: true
                            }
                        },
                        // 核销信息集合
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
                    }
                },
                balance: '200',
                total_balance: '200',
                metadata: {
                    token_url: '',
                    description: ''
                },
                stockBatchNumber: [
                    {
                        stock_batch_number: '123',
                        amount: 101
                    },
                    {
                        stock_batch_number: '456',
                        amount: 50
                    },
                    {
                        stock_batch_number: '789',
                        amount: 50
                    }
                ]
            };

            const expectOrder = {
                // 主订单 id
                order_group_id: '159',
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
                        seller_id: 999,
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
                        user_id: '159',
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
                                        ticket_number: '123',
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

            mockStub.getState.resolves(Buffer.from(JSON.stringify(expectNft)));
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(expectOrder)));

            const response = await token.StoreRefund(ctx, JSON.stringify(data), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should throw an error if there are more slots than presets', async () => {
            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Define input parameters
            const data =  {
                aaa: 787878,
                // 主订单 id
                order_group_id: '111111111',
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Unexpected property aaa at "}');
        });

        it('should throw an error if the slot is less than the default', async () => {
            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Define input parameters
            const data =  {
                // 主订单 id
                order_group_id: '111111111',
                // 订单状态
                // order_status: '',
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                // day: '',
                                // 分时预约 id
                                time_share_id: 0,
                                // 分时预约时间
                                time_share: '',
                                // 组合票产品 id
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Missing property order_status at "}');
        });

        it('should throw an error if the slot is inconsistent with the preset type', async () => {
            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Define input parameters
            const data =  {
                // 主订单 id
                order_group_id: '111111111',
                // 订单状态
                order_status: 5,
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
                OrderTab :[
                    {
                        // 订单 id
                        order_id: '',
                        // 订单类型
                        order_type: '',
                        // 卖方 id
                        seller_id: 0,
                        // 卖方名称
                        seller_name: 'hahahaha',
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
                                day: '5',
                                // 分时预约 id
                                time_share_id: 0,
                                // 分时预约时间
                                time_share: '',
                                // 组合票产品 id
                                parent_product_id: 56565656,
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
                                real_quantity: 0
                            }
                        ]
                    }
                ]
            };

            await expect(token.StoreOrder(ctx, JSON.stringify(data), 'triggerTime')).to.be.rejectedWith('{"contract_code":3006,"contract_msg":"validateStructure: Type mismatch at order_status: expected string, got number"}');
        });
    });

    describe('#DistributionOrder', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['Alice']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should transfer ownership of a token to another user in the case of pre-credit, if the receiver does not exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const orderData =  {
                // 主订单 id
                order_group_id: '159',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                total_balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '96',
                    // 预授信本金比例
                    available_ratio: '0.2',
                    // 当前批次可用的总数
                    available_total_num: '20'
                }
            ];

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('orderExists').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const response = await token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime');

            expect(response).to.equals(true);
        });

        it('should transfer ownership of a token to another user in the case of pre-credit, if the receiver exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const orderData =  {
                // 主订单 id
                order_group_id: '159',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                total_balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const expectNft2 =  {
                token_id: '987654321',
                owner: 'Bob',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '50',
                total_balance: '50',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '96',
                    // 预授信本金比例
                    available_ratio: '0.2',
                    // 当前批次可用的总数
                    available_total_num: '70'
                }
            ];

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft2)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('orderExists').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const response = await token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime');

            expect(response).to.equals(true);
        });

        it('should transfer ownership of a token to another user in the case of non-pre-credit, if the receiver does not exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const orderData =  {
                // 主订单 id
                order_group_id: '159',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                total_balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '19',
                    // 预授信本金比例
                    available_ratio: '0',
                    // 当前批次可用的总数
                    available_total_num: '19'
                }
            ];

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('orderExists').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const response = await token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime');

            expect(response).to.equals(true);
        });

        it('should transfer ownership of a token to another user in the case of non-pre-credit, if the receiver exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const orderData =  {
                // 主订单 id
                order_group_id: '159',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                total_balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const expectNft2 =  {
                token_id: '987654321',
                owner: 'Bob',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '50',
                total_balance: '50',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '96',
                    // 预授信本金比例
                    available_ratio: '0',
                    // 当前批次可用的总数
                    available_total_num: '146'
                }
            ];

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft2)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('orderExists').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const response = await token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime');

            expect(response).to.equals(true);
        });

        it('should throw an error if the order_group_id does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const orderData =  {
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    stockBatchNumber:'987654321',
                    from: 'Alice',
                    to: 'Bob',
                    amount: '96',
                    // 预授信本金比例
                    available_ratio: '0',
                    // 当前批次可用的总数
                    available_total_num: '69'
                }
            ];

            sinon.stub(token.Ticket, 'readNFT').resolves(expectNft);

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime')).to.be.rejectedWith(Error, 'order_group_id should not be empty');
        });

        it('should throw an error if insufficient balance', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('orderId159').resolves(false);

            const orderData =  {
                // 主订单 id
                order_group_id: '159',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '101',
                    // 预授信本金比例
                    available_ratio: '0',
                    // 当前批次可用的总数
                    available_total_num: '69'
                }
            ];

            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.DistributionOrder(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime')).to.be.rejectedWith(Error, 'Insufficient balance for tokenId 987654321Aliceskdatacenter1');
        });
    });

    describe('#DistributionRefund', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['Alice']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

        });

        it('should transfer ownership of a token to another user', async () => {
            // Stub client identity to simulate an authorized user
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('orderId357').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const orderData = {
                // 组退订表（暂时无用处）
                orderRefundGroup: [
                    {
                        // 组退订表 id
                        order_refund_group_id: '',
                        // 组订单 id
                        order_group_id: '123',
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
                        refund_id: '357',
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
                        user_id: '333333',
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

            const expectNft =  {
                token_id: '987654321',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '100',
                total_balance: '100',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            const datil = [
                {
                    // 发送者 Id
                    sender_stock_id: '987654321Aliceskdatacenter1',
                    // 接受者 Id
                    receive_stock_id: '987654321Bobskdatacenter1',
                    // 发送者
                    sender: 'Alice',
                    // 接收者
                    receive: 'Bob',
                    // 要转移的数量
                    amount: '88'
                }
            ];

            const expectOrder = {
                // 主订单 id
                order_group_id: '159',
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
                        seller_id: 55555,
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
                                batch_id: 0,
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
                                product_type: 0
                            }
                        ]
                    }
                ]
            };

            // Stub ReadNFT method to return NFT details
            ctx.stub.getState.withArgs('nft987654321Aliceskdatacenter1').resolves(Buffer.from(JSON.stringify(expectNft)));

            await token.Mint(ctx, '987654321', 'Alice', JSON.stringify(expectNft.slot), '100', JSON.stringify(expectNft.metadata), 'triggerTime');

            // 调用 TransferOwnership 之前把 调用者变成门票的所有者 Alice
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(expectOrder)));

            const response = await token.DistributionRefund(ctx, JSON.stringify(datil), JSON.stringify(orderData), 'triggerTime');

            expect(response).to.equals(true);
        });
    });

    describe('#ActivateTickets', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            const orgAdminMapping = {
                skdatacenter1: ['Alice']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should stock activation successful', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('111').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '999',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '16',
                    // 当前期数
                    periods: '5',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 96,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '0',
                total_balance: '215',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            const response = await token.ActivateTickets(ctx, JSON.stringify(activeInfo), '8451258161256126');

            expect(response).to.equals(true);
        });

        it('should stock activation successful if last activation', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('111').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '999',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '215',
                    // 当前期数
                    periods: '5',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 100000,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '0',
                total_balance: '215',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            const response = await token.ActivateTickets(ctx, JSON.stringify(activeInfo), 'triggerTime');

            expect(response).to.equals(true);
        });

        it('should throw an error if batch_id does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '360',
                    // 当前期数
                    periods: '5',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 1000,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '200',
                total_balance: '1000',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };


            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            await expect(token.ActivateTickets(ctx, JSON.stringify(activeInfo), 'triggerTime'))
                .to.be.rejectedWith(Error, 'batch_id should not be empty');
        });

        it('should throw an error if periods does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('111').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '999',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '360',
                    // 当前期数
                    periods: '',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 1000,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '200',
                total_balance: '1000',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            await expect(token.ActivateTickets(ctx, JSON.stringify(activeInfo), 'triggerTime'))
                .to.be.rejectedWith(Error, 'periods should not be empty');
        });

        it('should throw an error if batch_id does not match', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('111').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '888',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '360',
                    // 当前期数
                    periods: '5',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 1000,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '200',
                total_balance: '1000',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };


            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            await expect(token.ActivateTickets(ctx, JSON.stringify(activeInfo), 'triggerTime'))
                .to.be.rejectedWith(Error, 'Batch with id 888 not found in order 123');
        });

        it('should throw an error if available_total_num is different', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(false);
            ctx.stub.getState.withArgs('nft987654321Bobskdatacenter1').resolves(false);
            ctx.stub.getState.withArgs('111').resolves(false);

            const activeInfo = [
                {
                    // 订单 id
                    order_id: '123',
                    // 批次 id
                    batch_id: '999',
                    // 库存 id
                    token_id: '456',
                    //当前批次可用的总数
                    available_total_num: '1000',
                    // 当前期数
                    periods: '5',
                    // 总期数
                    total_periods: '5',
                    // 交易号
                    trade_no: '111',
                    // 当前还款金额
                    amount: '1000',
                    // 总还款金额
                    total_repayment: '1000000'
                }
            ];

            const orderData =  {
                // 主订单 id
                order_group_id: '123',
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
                                batch_id: '999',
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
                                num: 96,
                                // 产品类型
                                product_type: 0,
                                //预授信本金比例
                                available_ratio: '0.2',
                                //冻结数量
                                exchange_freeze_num: '',
                                //当前批次可用的总数
                                available_total_num: ''
                            }
                        ]
                    }
                ]
            };

            const expectNft =  {
                token_id: '456',
                owner: 'Alice',
                slot: {
                    // 基本信息(不变的字段)
                    BasicInformation: {
                        // 产品信息
                        SimpleTicket: {
                            // 景区id
                            scenic_id: '',
                            // 景区名称
                            scenic_name: '',
                            // 产品名称
                            simple_name: '',
                            // 市场标准价格
                            market_price: 0,
                            // 产品类型
                            pro_type: 0,
                            // 使用方式（每天/一共）
                            use_type: 0,
                            // 分时预约（开/关）
                            time_restrict: 0,
                            // 控制方式（不控制/按星期控制）
                            restrict_type: 0,
                            // 控制星期
                            restrict_week: '',
                            // 使用有效期
                            validity_day: 0,
                            // 首日激活（开/关）
                            is_activate: 0,
                            // 使用次数
                            use_count: 0,
                            // 可入园天数
                            available_days: 0,
                            // 入园统计（开/关）
                            park_statistic: 0,
                            // 服务商id
                            operator_id: '',
                            // 分时预约集合
                            timeSharing: [
                                {
                                    // 分时预约id
                                    timeSharing_id: '',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '',
                                    // 分时预约结束时间
                                    timeSharing_end_time: ''
                                },
                                {
                                    // 分时预约id
                                    timeSharing_id: '111',
                                    // 分时预约开始时间
                                    timeSharing_begin_time: '222',
                                    // 分时预约结束时间
                                    timeSharing_end_time: '333'
                                }
                            ],
                            // 商品信息集合
                            ticketGoods: [
                                {
                                    // 商品id
                                    ticketGoods_id: '',
                                    // 商品名称
                                    goods_name: '',
                                    // 分时预约id
                                    time_share_id: '',
                                    // 特殊折扣率
                                    overall_discount: 0,
                                    // 分销商开始折扣率
                                    begin_discount: 0,
                                    // 分销商结束折扣率
                                    end_discount: 0,
                                    // 票种
                                    ticketGoods_type: 0,
                                    // 购买数量限制(开/关)
                                    people_number: 0,
                                    // 最小起订量
                                    min_people: 0,
                                    // 单次最大预订量
                                    max_people: 0,
                                    // 出票规则
                                    RuleIssue: {
                                        // 出票规则名称
                                        ruleIssue_name: '',
                                        // 出票方式
                                        ruleIssue_way: 0,
                                        // 出票类型
                                        ruleIssue_type: 0,
                                        // 实名方式
                                        is_real_name: 0,
                                        // 使用时间
                                        use_time: '',
                                        // 当天购票开始时间
                                        ruleIssue_begin_time: '',
                                        // 当天购票结束时间
                                        ruleIssue_end_time: '',
                                        // 校验实名制
                                        real_name_check: 0,
                                        // 限制本人购买
                                        only_owner_buy: 0,
                                        // 校验权益
                                        rights_check: 0,
                                        // 权益id
                                        rights_id: '',
                                        // 审批(开/关)
                                        need_approval: 0,
                                        // 审批id
                                        approve_id: '',
                                        // 审批内容
                                        approve_content: '',
                                        // 规则类型(权益票/权益卡/普通票)
                                        rule_type: 0,
                                        // 仅窗口售票(开/关)
                                        only_window_sale: 0
                                    },
                                    // 检票规则
                                    RuleCheck: {
                                        // 身份识别类型
                                        identity_type: '',
                                        // 检票规则名称
                                        ruleCheck_name: '',
                                        // 检票控制方式
                                        control_type: 0,
                                        // 检票通行方式
                                        adopt_type: 0,
                                        // 检票间隔时间
                                        interval_time: 0,
                                        // 分时预约设置
                                        time_share_book: 0,
                                        // 检票点
                                        check_point_ids: ['']
                                    },
                                    // 退票规划
                                    RuleRetreat: {
                                        // 退票规则名称
                                        ruleRetreat_name: '',
                                        // 可退票(开/关)
                                        is_retreat: 0,
                                        // 默认退票费率
                                        default_rate: 0
                                    }
                                }
                            ],
                            // 库存信息
                            TicketStock: {
                                // 景区id
                                stock_scenic_id: '',
                                // 产品id
                                stock_ticket_id: '',
                                // 景区名称
                                stock_scenic_name: '',
                                // 产品名称
                                ticket_name: '',
                                // 购买有效开始时间
                                purchase_begin_time: '',
                                // 结算id
                                account_id: '',
                                // 服务商id
                                stock_operator_id: '',
                                // 购买有效结束时间
                                purchase_end_time: '',
                                // 入园有效开始时间
                                stock_enter_begin_time: '',
                                // 入园有效结束时间
                                stock_enter_end_time: '',
                                // 总库存
                                total_stock: 0,
                                // 产品类型
                                ticket_type: 0,
                                // 每天库存
                                nums: 0,
                                // 景区批次号
                                batch_id: ''
                            }
                        },
                        // 是否交易所发布
                        is_exchange: 0
                    },
                    // 附加信息(可更新的字段)
                    AdditionalInformation: {
                        // 出票信息
                        TicketData:  {
                            // 游客信息
                            BuyerInfo: [
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
                                    // 身份证
                                    id_number: ''
                                },
                                {
                                    // 姓名
                                    buyerInfo_id_name: 'aaaaaaaaaa123',
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
                            status: 800,
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
                            used_days: 0,
                            // // 购买账号
                            // account: '',
                            // // 购买组织
                            // org: ''
                        },
                        // 价格策略
                        PriceInfo: [
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
                                    group: []
                                }
                            }
                        ],
                        // 核销信息集合
                        TicketCheckData: [ ]
                    }
                },
                balance: '0',
                total_balance: '215',
                metadata: {
                    token_url: '',
                    description: ''
                }
            };

            // sinon.stub(token.Ticket, 'ReadNFT').resolves(expectNft);
            ctx.stub.getState.withArgs('orderId123').resolves(Buffer.from(JSON.stringify(orderData)));
            ctx.stub.getState.withArgs('nft456').resolves(Buffer.from(JSON.stringify(expectNft)));

            await expect(token.ActivateTickets(ctx, JSON.stringify(activeInfo), 'triggerTime'))
                .to.be.rejectedWith(Error, 'Updated balance 16 does not match available_total_num 1000');
        });
    });

    describe('#ReadOrder', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('orderId_1');
            const orderInfo ={
                // 主订单 id
                order_group_id: '1',
                // 订单状态
                order_status: '',
                // 订单类型
                order_type: '',
                // 订单金额
                total_amount: 0,
                // 支付金额
                pay_amount: 0,
                // 支付方式
                pay_type: 0
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(orderInfo)));

            const response = await token.ReadOrder(ctx, '1');
            expect(response).to.deep.equal(orderInfo);
        });
    });

    // ================== Access Permission ==========================
    describe('#SetOrgAdmin', () => {
        it('should add organization admin if caller is admin of any organization', async () => {
            // Simulate that the caller is an administrator of an organization
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Simulate the existing orgAdminMapping
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };
            ctx.stub.getState.withArgs('orgAdminMapping').returns(Buffer.from(JSON.stringify(orgAdminMapping)));

            // Call contract function
            const res = await token.SetOrgAdmin(ctx, 'newOrg', '0xnewAdmin');

            // Validation results
            expect(res).to.equal(true);

            const updatedMapping = JSON.parse(ctx.stub.putState.args[0][1].toString());
            expect(updatedMapping.newOrg).to.deep.equal(['0xnewAdmin']);
        });

        it('should throw error if caller is not admin of any organization', async () => {
            // The simulated caller is not an administrator of any organization
            mockClientIdentity.getMSPID.returns('nonAdminOrg');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.nonadminorg.fabric/OU=client/CN=0xnonadmin::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.nonadminorg.shukechain');

            // Simulate the existing orgAdminMapping
            ctx.stub.getState.withArgs('orgAdminMapping').returns(Buffer.from(JSON.stringify({})));

            // Verify whether calling the contract function will throw an error
            await expect(token.SetOrgAdmin(ctx, 'newOrg', '0xnewAdmin')).to.be.rejectedWith('_adminExistsInOrg: Organization nonAdminOrg does not exist');
        });
    });

    describe('#GetOrgAdmins', () => {
        it('should return the orgAdminMapping', async () => {
            // Simulate the existing orgAdminMapping
            const orgAdminMapping = {
                org1: ['0xadmin1', '0xadmin2'],
                org2: ['0xadmin3']
            };
            ctx.stub.getState.withArgs('orgAdminMapping').returns(Buffer.from(JSON.stringify(orgAdminMapping)));

            //Call contract function
            const res = await token.GetOrgAdmins(ctx);

            // Validation results
            expect(res).to.deep.equal(orgAdminMapping);
        });

        it('should return an empty object if orgAdminMapping does not exist', async () => {
            //Simulated orgAdminMapping does not exist
            ctx.stub.getState.withArgs('orgAdminMapping').returns(Buffer.from(''));

            //Call contract function
            const res = await token.GetOrgAdmins(ctx);

            // Validation results
            expect(res).to.deep.equal({});
        });
    });

    // ================== Exchange Finance ==========================
    describe('#StoreCreditInfo', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should credit line added successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('trade456').resolves(false);
            mockStub.getState.withArgs('trade66666').resolves(false);

            const creditUpdateData = {
                owner: 'Bob',
                merchant_id: '123',
                credit_limit: '0',
                pledge_amount: '100',
                seq_no: '456'
            };
            mockStub.getState.withArgs('credit99999999').resolves(Buffer.from(JSON.stringify(creditUpdateData)));

            const creditUpdateData2 = {
                account: 'Alice',
                merchantId: '456',
                creditLimit: '8000000',
                pledgeAmount: '9999',
                assetsKey: '99999999',
                seqNo: '66666'
            };

            const response = await token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData2), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should credit limit modified successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('credit123').resolves(false);
            mockStub.getState.withArgs('trade456').resolves(false);

            const creditData = {
                owner: 'Bob',
                merchant_id: '123',
                credit_limit: '200',
                pledge_amount: '0',
                assetsKey: '123',
                seqNo: '456'
            };

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '0',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            ctx.stub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(creditData)));

            const response = await token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should credit line activated successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // mockStub.getState.withArgs('credit123').resolves(false);
            mockStub.getState.withArgs('trade456').resolves(false);

            const creditData = {
                account: 'Bob',
                merchant_id: '123',
                credit_limit: '200',
                pledge_amount: '0',
                assetsKey: '123',
                seqNo: '456'
            };

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '800',
                pledgeAmount: '0',
                assetsKey: '123',
                seqNo: '456'
            };

            ctx.stub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(creditData)));

            const response = await token.StoreCreditInfo(ctx, '3', JSON.stringify(creditUpdateData), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should fail if the merchant number does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('credit123').resolves(false);
            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '',
                creditLimit: '0',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            await expect(token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('merchantId should not be empty');
        });

        it('should fail if the account does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: '',
                merchantId: '123',
                creditLimit: '0',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            await expect(token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('account should not be empty');
        });

        it('should fail if the credit limit is increased, the creditLimit does not exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('credit123').resolves(false);
            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            await expect(token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('creditLimit should not be empty');
        });

        it('should fail if the credit limit is modified, the creditLimit does not exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            mockStub.getState.withArgs('creditBob').resolves(Buffer.from(JSON.stringify(creditUpdateData)));

            await expect(token.StoreCreditInfo(ctx, '2', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('creditLimit should not be empty');
        });

        it('should fail if the credit limit is activated, the credit limit exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '0',
                pledgeAmount: '100',
                assetsKey: '123',
                seqNo: '456'
            };

            mockStub.getState.withArgs('credit123').resolves(false);

            await expect(token.StoreCreditInfo(ctx, '3', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('The credit123 does not exist');
        });

        it('should fail if the credit limit is activated, the creditLimit does not exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('trade456').resolves(false);

            const creditUpdateData = {
                account: 'Bob',
                merchantId: '123',
                creditLimit: '100',
                pledgeAmount: '',
                assetsKey: '123',
                seqNo: '456'
            };

            mockStub.getState.withArgs('creditBob').resolves(Buffer.from(JSON.stringify(creditUpdateData)));

            await expect(token.StoreCreditInfo(ctx, '3', JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('pledgeAmount should not be empty');
        });
    });

    describe('#TransferCredit', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should transfer credit if buyer exists successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };
            const expectBuyer = {
                owner: '0xskadministrator2',
                merchant_id: '222',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(Buffer.from(JSON.stringify(expectBuyer)));
            mockStub.getState.withArgs('trade123456789').resolves(false);

            const response = await token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should transfer credit if buyer does not exist successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            const response = await token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should fail if tradeNo does exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '987654321'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade987654321').resolves(Buffer.from(JSON.stringify('used')));

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3002,"contract_msg":"transferCredit: The serial number 987654321 has already been used"}');
        });

        it('should fail if tradeNo does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: ''
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3005,"contract_msg":"checkFieldsNotEmpty: tradeNo should not be empty"}');
        });

        it('should fail if amount does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3005,"contract_msg":"checkFieldsNotEmpty: amount should not be empty"}');
        });

        it('should fail if from does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(false);
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3008,"contract_msg":"transferCredit: The credit account 123 does not exist"}');
        });

        it('should fail if from does not match', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator4',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3007,"contract_msg":"transferCredit: The trusted account 0xskadministrator1 is not authorized to perform this operation"}');
        });

        it('should fail if to does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3005,"contract_msg":"checkFieldsNotEmpty: to should not be empty"}');
        });

        it('should fail if buyerMerchantId does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '100',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3005,"contract_msg":"checkFieldsNotEmpty: issuer_id should not be empty"}');
        });

        it('should fail if insufficient credit limit for account from', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const expectSeller = {
                owner: '0xskadministrator1',
                merchant_id: '111',
                credit_limit: '100',
                pledge_amount: '0',
            };

            const to = '0xskadministrator2';
            const from = '0xskadministrator1';

            const creditUpdateData = {
                // 卖方商户号
                issuer_id: '111',
                // 卖家web3地址
                issuer_account: '0xskadministrator2',
                // 买方商户号
                receiver_id: '222',
                // 买家web3地址
                receiver_account: '0xskadministrator1',
                // 资产key
                assetsKey: '123',
                // 授信的额度
                amount: '500',
                // 交易流水号
                tradeNo: '123456789'
            };

            mockStub.getState.withArgs('credit123').resolves(Buffer.from(JSON.stringify(expectSeller)));
            mockStub.getState.withArgs('credit111').resolves(null);
            mockStub.getState.withArgs('trade123456789').resolves(false);

            await expect(token.TransferCredit(ctx, from, to, JSON.stringify(creditUpdateData), 'triggerTime')).to.be.rejectedWith('{"contract_code":3001,"contract_msg":"transferCredit: Insufficient credit limit for account 0xskadministrator1"}');
        });

    });

    describe('#PaymentFlow', () => {
        beforeEach(() => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });

        it('should store bank statements successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('transaction8402156523').resolves(false);

            const paymentInfo = {
                // 用户名
                user_name: 'aaa',
                // 银行卡号
                bank_card_number: '123456789',
                // 银行
                bank_name: 'xxx',
                // 流水号
                transaction_serial_number: '8402156523',
                // 数量
                amount: '1000',
                // 债权人 Id
                creditor_id: 'xxx',
                // 公司 Id
                corporation_id: 'xxx'
            };

            const response = await token.PaymentFlow(ctx, JSON.stringify(paymentInfo), 'triggerTime');

            expect(response).to.deep.equal(true);
        });

        it('should fail if any parameter does not exist', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.getState.withArgs('transaction8402156523').resolves(false);

            const paymentInfo = {
                // 用户名
                user_name: 'aaa',
                // 银行卡号
                bank_card_number: '123456789',
                // 银行
                bank_name: '',
                // 流水号
                transaction_serial_number: '8402156523',
                // 数量
                amount: '1000',
                // 债权人 Id
                creditor_id: 'xxx',
                // 公司 Id
                corporation_id: 'xxx'
            };

            await expect(token.PaymentFlow(ctx, JSON.stringify(paymentInfo), 'triggerTime')).to.be.rejectedWith('bank_name should not be empty');
        });

        it('should fail if transactionSerialNumber already exists', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const paymentInfo = {
                // 用户名
                user_name: 'aaa',
                // 银行卡号
                bank_card_number: '123456789',
                // 银行
                bank_name: 'xxx',
                // 流水号
                transaction_serial_number: '8402156523',
                // 数量
                amount: '1000',
                // 债权人 Id
                creditor_id: 'xxx',
                // 公司 Id
                corporation_id: 'xxx'
            };

            mockStub.getState.withArgs('transaction8402156523').resolves(Buffer.from(JSON.stringify(paymentInfo)));

            await expect(token.PaymentFlow(ctx, JSON.stringify(paymentInfo), 'triggerTime')).to.be.rejectedWith('The transaction serial number 8402156523 has already been stored');
        });
    });

});