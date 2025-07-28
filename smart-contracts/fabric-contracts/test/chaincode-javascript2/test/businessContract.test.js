/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { BusinessContract } = require('..'); // 根据您的项目结构正确导入 BusinessContract 类
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('BusinessContract', () => {
    let sandbox;
    let businessContract;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach('Setup sandbox', () => {
        sandbox = sinon.createSandbox();
        businessContract = new BusinessContract(); // 使用正确的合约类名

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;

        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        mockClientIdentity.getID.returns('someClientID');
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Restore sandbox', () => {
        sandbox.restore();
    });

    describe('#CallMint', () => {
        it('should mint tokens successfully', async () => {
            const amount = '1000';

            // Stub initialize and mint responses
            const mintResponse = {
                status: 200
            };

            // Stub chaincode invoke responses
            mockStub.invokeChaincode.withArgs('tjs20-v8', ['Mint', amount], 'chan-travel', '1.0.0').resolves(mintResponse); // 使用正确的合约名称和版本

            // Invoke CallMint method
            await businessContract.CallMint(ctx, amount);

            // Verify chaincode invokes
            sinon.assert.calledWith(mockStub.invokeChaincode, 'tjs20-v8', ['Mint', amount], 'chan-travel', '1.0.0'); // 使用正确的合约名称和版本
        });

        it('should handle minting failure', async () => {
            const amount = '1000';

            // Stub mint response failure
            const mintResponse = {
                status: 500,
                message: 'Minting failed' // 实际错误消息
            };

            // Stub chaincode invoke responses
            mockStub.invokeChaincode.withArgs('tjs20-v8', ['Mint', amount], 'chan-travel', '1.0.0').resolves(mintResponse); // 使用正确的合约名称和版本

            // Invoke CallMint method
            await expect(businessContract.CallMint(ctx, amount)).to.be.rejectedWith(Error, 'Minting failed'); // 调整期望的错误消息
        });
    });
});

