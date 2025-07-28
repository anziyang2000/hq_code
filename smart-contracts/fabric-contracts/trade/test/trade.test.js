/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { trade } = require('..');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('TradeContract', () => {
    let sandbox;
    let tradeContract;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        tradeContract = new trade();

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#PublishAsset', () => {
        it('should publish asset successfully', async () => {
            // Mock the asset data
            const assetId = '101';
            const asset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            };

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');
            // Call the PublishAsset function
            const response = await tradeContract.PublishAsset(ctx, assetId, asset);

            // Assertions
            sinon.assert.calledWith(ctx.stub.putState, 'assetId_101', Buffer.from(JSON.stringify(asset)));
            sinon.assert.calledWith(mockStub.setEvent, 'PublishAssetEvent', Buffer.from(JSON.stringify({ assetId: assetId, action: '发布数字资产' })));
            expect(response).to.deep.equal(asset);
        });
    });

    describe('#AuditAsset', () => {
        it('should audit asset successfully', async () => {
            // Mock the input parameters
            const assetId = '101';
            const status = 'approved';
            const details = 'Audit details';

            // Mock the existing asset
            const mockAsset = {
                assetId: assetId,
                assetDetails: 'Asset details',
                status: 'pending'
            };
            const assetBytes = Buffer.from(JSON.stringify(mockAsset));

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return the existing asset
            mockStub.getState.withArgs('assetId_101').resolves(assetBytes);

            // Call the AuditAsset function
            const response = await tradeContract.AuditAsset(ctx, assetId, status, details);

            // Assertions
            sinon.assert.calledWith(mockStub.putState, 'assetId_101', Buffer.from(JSON.stringify({
                assetId: '101',
                assetDetails: 'Asset details',
                status: 'approved'
            })));

            sinon.assert.calledWith(ctx.stub.setEvent, 'AuditAssetEvent', Buffer.from(JSON.stringify({ assetId: assetId, action: '审核通过' })));

            expect(response).to.deep.equal({
                assetId: '101',
                assetDetails: 'Asset details',
                status: 'approved'
            });
        });

        it('should throw error if asset does not exist', async () => {
            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return null (asset not found)
            mockStub.getState.withArgs('assetId_101').resolves(null);

            // Call the AuditAsset function and expect it to throw an error
            await expect(tradeContract.AuditAsset(ctx, 'assetId_101', 'approved', 'Audit details'))
                .to.be.rejectedWith(Error, '数字资产 assetId_101 不存在');
        });
    });

    describe('#RejectAsset', () => {
        it('should reject asset successfully', async () => {
            // Mock the input parameters
            const assetId = '101';

            // Mock the existing asset
            const mockAsset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            };

            const assetBytes = Buffer.from(JSON.stringify(mockAsset));

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return the existing asset
            mockStub.getState.withArgs('assetId_101').resolves(assetBytes);

            // Call the RejectAsset function
            const response = await tradeContract.RejectAsset(ctx, assetId);

            // Assertions
            sinon.assert.calledWith(mockStub.putState, 'assetId_101', Buffer.from(JSON.stringify({
                assetId: '101',
                assetType: 'Type A',
                number: 10,
                status: 'rejected',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            })));

            sinon.assert.calledWith(ctx.stub.setEvent, 'RejectAssetEvent', Buffer.from(JSON.stringify({ assetId: assetId, action: '审核驳回' })));

            expect(response).to.deep.equal({
                assetId: '101',
                assetType: 'Type A',
                number: 10,
                status: 'rejected',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            });
        });

        it('should throw error if asset does not exist', async () => {
            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return null (asset not found)
            mockStub.getState.withArgs('assetId_101').resolves(null);

            // Call the AuditAsset function and expect it to throw an error
            await expect(tradeContract.RejectAsset(ctx, 'assetId_101'))
                .to.be.rejectedWith(Error, '数字资产 assetId_101 不存在');
        });
    });

    describe('#PendingAsset', () => {
        it('should pending asset successfully', async () => {
            // Mock the input parameters
            const assetId = '101';

            // Mock the existing asset
            const mockAsset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            };

            const assetBytes = Buffer.from(JSON.stringify(mockAsset));

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return the existing asset
            mockStub.getState.withArgs('assetId_101').resolves(assetBytes);

            // Call the PendingAsset function
            const response = await tradeContract.PendingAsset(ctx, assetId);

            // Assertions
            sinon.assert.calledWith(mockStub.putState, 'assetId_101', Buffer.from(JSON.stringify({
                assetId: '101',
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            })));

            sinon.assert.calledWith(ctx.stub.setEvent, 'PendingAssetEvent', Buffer.from(JSON.stringify({ assetId: assetId, action: '待审核' })));

            expect(response).to.deep.equal({
                assetId: '101',
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            });
        });

        it('should throw error if asset does not exist', async () => {
            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return null (asset not found)
            mockStub.getState.withArgs('assetId_101').resolves(null);

            // Call the AuditAsset function and expect it to throw an error
            await expect(tradeContract.PendingAsset(ctx, 'assetId_101'))
                .to.be.rejectedWith(Error, 'Digital assets assetId_101 does not exist');
        });
    });

    describe('#GetAsset', () => {
        it('should return asset successfully if it exists', async () => {
            // Mock the input parameters
            const assetId = '101';

            // Mock the existing asset
            const mockAsset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'approved',
                paymentStatus: 'paid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: [{ timestamp: '2024-04-17T09:00:00.000Z', action: 'approved' }]
            };

            const assetBytes = Buffer.from(JSON.stringify(mockAsset));

            // Simulate the created 'assetId_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return the existing asset
            mockStub.getState.withArgs('assetId_101').resolves(assetBytes);

            // Call the GetAsset function
            const response = await tradeContract.GetAsset(ctx, assetId);

            // Assertions
            expect(response).to.deep.equal(mockAsset);
        });

        it('should throw error if asset does not exist', async () => {
            // Mock the input parameters
            const assetId = '101';

            // Simulate the created 'assetId_101' first and then call it
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');

            // Stub getState to return null (asset not found)
            mockStub.getState.withArgs('assetId_101').resolves(null);

            // Call the GetAsset function and expect it to throw an error
            await expect(tradeContract.GetAsset(ctx, assetId))
                .to.be.rejectedWith(Error, '数字资产 101 不存在');
        });
    });

    describe('#confirmPayment', () => {
        beforeEach(() => {
            // Restore the original invokeChaincode method
            ctx.stub.invokeChaincode.restore();
        });

        it('should confirm payment and trigger NFT transfer successfully', async () => {
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Mock the input parameters
            const assetId = '101';
            const to = 'recipient';

            // Mock the asset data
            const asset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'unpaid',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            };

            const expectAsset = {
                assetId: assetId,
                assetType: 'Type A',
                number: 10,
                status: 'pending',
                paymentStatus: 'confirmed',
                assetDetails: { description: 'Asset details' },
                transactionHistory: []
            };

            // Stub getState to return the existing asset
            mockStub.createCompositeKey.withArgs('assetId', ['101']).returns('assetId_101');
            const assetBytes = Buffer.from(JSON.stringify(asset));

            // Stub getState to return the existing asset
            mockStub.getState.withArgs('assetId_101').resolves(assetBytes);

            // Stub invokeChaincode to resolve successfully
            sinon.stub(ctx.stub, 'invokeChaincode').resolves();
            // Call the confirmPayment function
            const response = await tradeContract.confirmPayment(ctx, assetId, to);

            console.log(asset.paymentStatus);

            // Assertions
            sinon.assert.calledOnce(ctx.stub.getState);
            sinon.assert.calledOnce(ctx.stub.putState);
            sinon.assert.calledOnce(ctx.stub.setEvent);

            const confirmEvent = { assetId: assetId, action: '确认收款' };
            sinon.assert.calledWith(ctx.stub.setEvent, 'ConfirmPaymentEvent', Buffer.from(JSON.stringify(confirmEvent)));

            // Verify NFT transfer invocation
            sinon.assert.calledWith(ctx.stub.invokeChaincode, 'ticket-v2', ['TransferFrom', 'Alice', 'recipient', sinon.match.string], 'chan-travel', '1.0.0');

            // Verify NFT transfer invocation count
            sinon.assert.callCount(ctx.stub.invokeChaincode, asset.number);

            // Verify response
            expect(response).to.deep.equal(expectAsset);
        });

        it('should throw error if asset does not exist', async () => {
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub getState to return null (asset not found)
            mockStub.getState.withArgs('assetId_101').resolves(null);

            // Call the confirmPayment function and expect it to throw an error
            await expect(tradeContract.confirmPayment(ctx, 'assetId_101', 'recipient'))
                .to.be.rejectedWith(Error, '数字资产 assetId_101 不存在');
        });
    });

    describe('#RecordTransaction', () => {
        it('should record transaction information successfully', async () => {
            // Mock the input parameters
            const transactionId = '101';
            const transactionCertificate = 'Transaction certificate';

            const transaction = {
                transactionId: transactionId,
                transactionCertificate: transactionCertificate
            };

            // Simulate the created 'transactionId_101' first and then call it
            mockStub.createCompositeKey.withArgs('transactionId', ['101']).returns('transactionId_101');

            // Call the RecordTransaction function
            const response = await tradeContract.RecordTransaction(ctx, transactionId, transactionCertificate);

            // Assertions
            sinon.assert.calledWith(ctx.stub.putState, 'transactionId_101', Buffer.from(JSON.stringify(transaction)));

            sinon.assert.calledWith(mockStub.setEvent, 'RecordTransactionEvent', Buffer.from(JSON.stringify({ transactionId: '101', action: '记录交易凭证' })));

            expect(response).to.deep.equal(transaction);
        });
    });

    // describe('#SetCreditInfo', () => {
    //     it('should successfully set user credit information', async () => {
    //         // 模拟客户端身份
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=user123::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         // 模拟输入参数
    //         const creditLimit = 5000;

    //         const creditInfo = {
    //             userId: 'user123',
    //             creditLimit: creditLimit,
    //         };

    //         // Simulate the created 'nft_101' first and then call it
    //         mockStub.createCompositeKey.withArgs('userId', ['user123']).returns('userId_user123');

    //         // 调用 SetCreditInfo 函数
    //         const response = await tradeContract.SetCreditInfo(ctx, creditLimit);

    //         // Assertions
    //         sinon.assert.calledWith(ctx.stub.putState, 'userId_user123', Buffer.from(JSON.stringify(creditInfo)));
    //         sinon.assert.calledWith(mockStub.setEvent, 'SetCreditInfoEvent', Buffer.from(JSON.stringify({ userId: 'user123', action: '设置用户预授信信息' })));
    //         // 断言
    //         expect(response).to.deep.equal({ userId: 'user123', creditLimit: creditLimit });
    //     });
    // });

    // describe('#UpdateCreditLimit', () => {
    //     it('should successfully update user credit limit', async () => {
    //         // 模拟客户端身份
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=user123::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         // 模拟存储的预授信信息
    //         const mockCreditInfo = { userId: 'user123', creditLimit: 5000 };
    //         const mockCreditInfo2 = { userId: 'user123', creditLimit: 8000 };
    //         const mockCreditInfoBytes = Buffer.from(JSON.stringify(mockCreditInfo));

    //         // 模拟调用 getState 返回存储的预授信信息
    //         ctx.stub.getState.resolves(Buffer.from(mockCreditInfoBytes));

    //         // 模拟输入参数
    //         const newCreditLimit = 8000;

    //         // Simulate the created 'nft_101' first and then call it
    //         mockStub.createCompositeKey.withArgs('userId', ['user123']).returns('userId_user123');

    //         // 调用 UpdateCreditLimit 函数
    //         const response = await tradeContract.UpdateCreditLimit(ctx, newCreditLimit);

    //         // Assertions
    //         sinon.assert.calledWith(ctx.stub.putState, 'userId_user123', Buffer.from(JSON.stringify(mockCreditInfo2)));
    //         sinon.assert.calledWith(mockStub.setEvent, 'UpdateCreditEvent', Buffer.from(JSON.stringify({ userId: 'user123', action: '修改用户预授信额度' })));
    //         expect(response).to.deep.equal({ userId: 'user123', creditLimit: newCreditLimit });
    //     });

    //     it('should throw error if user credit info does not exist', async () => {
    //         // 模拟客户端身份
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=user123::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const mockUserID = 'user123';

    //         // 模拟调用 getState 返回空值（用户预授信信息不存在）
    //         ctx.stub.getState.resolves(null);

    //         // 模拟输入参数
    //         const newCreditLimit = 8000;

    //         // 调用 UpdateCreditLimit 函数并期望抛出错误
    //         await expect(tradeContract.UpdateCreditLimit(ctx, newCreditLimit))
    //             .to.be.rejectedWith(Error, `用户 ${mockUserID} 的预授信信息不存在`);
    //     });
    // });

    // describe('#UploadTransactionRecord', () => {
    //     it('should successfully upload transaction record to the contract', async () => {
    //         // 模拟输入参数
    //         const transactionId = '123';
    //         const transactionRecord = {
    //             assetId: '101',
    //             buyerId: 'buyer123',
    //             purchaseAmount: 100,
    //             purchaseDate: '2024-04-17'
    //         };

    //         // 构建完整的交易记录对象
    //         const completeTransactionRecord = {
    //             transactionId: transactionId,
    //             assetId: transactionRecord.assetId,
    //             buyerId: transactionRecord.buyerId,
    //             purchaseAmount: transactionRecord.purchaseAmount,
    //             purchaseDate: transactionRecord.purchaseDate,
    //             status: 'purchased'
    //         };

    //         // 模拟创建 composite key
    //         mockStub.createCompositeKey.withArgs('transactionID', ['123']).returns('transactionID_123');

    //         // 调用 UploadTransactionRecord 函数
    //         const response = await tradeContract.UploadTransactionRecord(ctx, transactionId, transactionRecord);

    //         // 断言
    //         sinon.assert.calledWith(
    //             ctx.stub.putState,
    //             'transactionID_123',
    //             Buffer.from(JSON.stringify(completeTransactionRecord))
    //         );
    //         sinon.assert.calledWith(
    //             mockStub.setEvent,
    //             'UploadTransactionRecordEvent',
    //             Buffer.from(JSON.stringify({ transactionId: transactionId, action: '上传交易记录' }))
    //         );
    //         // 断言
    //         expect(response).to.deep.equal(completeTransactionRecord);
    //     });
    // });

    // describe('#QueryTransactionRecord', () => {
    //     it('should successfully query transaction record information', async () => {
    //         // 模拟输入参数
    //         const transactionId = '123';

    //         // 构建模拟的交易记录对象
    //         const mockTransactionRecord = {
    //             transactionId: transactionId,
    //             assetId: '101',
    //             buyerId: 'buyer123',
    //             purchaseAmount: 100,
    //             purchaseDate: '2024-04-17',
    //             status: 'purchased'
    //         };

    //         // 模拟创建 composite key
    //         mockStub.createCompositeKey.withArgs('transactionID', ['123']).returns('transactionID_123');
    //         // 模拟调用 getState 返回存储的预授信信息
    //         ctx.stub.getState.resolves(Buffer.from(JSON.stringify(mockTransactionRecord)));

    //         // 调用 QueryTransactionRecord 函数
    //         const response = await tradeContract.QueryTransactionRecord(ctx, transactionId);

    //         // 断言
    //         expect(response).to.deep.equal(mockTransactionRecord);
    //     });

    //     it('should throw an error if transaction record does not exist', async () => {
    //         // 模拟输入参数
    //         const transactionId = '123';

    //         // 模拟交易记录在区块链上不存在
    //         ctx.stub.getState.resolves(null);

    //         // 调用 QueryTransactionRecord 函数并期望抛出错误
    //         await expect(tradeContract.QueryTransactionRecord(ctx, transactionId)).to.be.rejectedWith(Error, `交易记录 ${transactionId} 不存在`);
    //     });
    // });
});
