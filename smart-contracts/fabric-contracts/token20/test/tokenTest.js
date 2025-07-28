/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const { Token } = require('..');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('Chaincode', () => {
    let sandbox;
    let token;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    let token_name = 'eth';
    let token_symbol = 'ETH';
    let token_decimals = '2';
    let token_org = 'skdatacenter1';
    let token_admin = '0xskadministrator1';

    beforeEach('Sandbox creation', async () => {
        sandbox = sinon.createSandbox();
        token = new Token('token-erc20');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;

        await token.Initialize(ctx, token_name, token_symbol, token_decimals, token_org, token_admin);

        ctx.clientIdentity.getMSPID.returns('skdatacenter1');
        // mockClientIdentity.getMSPID.returns('skdatacenter1');
        ctx.clientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

        const orgAdminMapping = {
            skdatacenter1: ['0xskadministrator1']
        };
        mockStub.getState.withArgs('orgAdminMapping').resolves(Buffer.from(JSON.stringify(orgAdminMapping)));

        mockStub.putState.resolves('some state');
        mockStub.setEvent.returns('set event');

    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#TokenName', () => {
        it('should work', async () => {
            mockStub.getState.resolves(token_name);

            const response = await token.TokenName(ctx);

            // sinon.assert.calledWith(mockStub.getState, 'name');
            expect(response).to.equals(token_name);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.TokenName(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Symbol', () => {
        it('should work', async () => {
            mockStub.getState.resolves(token_symbol);

            const response = await token.Symbol(ctx);

            // sinon.assert.calledWith(mockStub.getState, 'symbol');
            expect(response).to.equals(token_symbol);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Symbol(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Decimals', () => {
        it('should work', async () => {
            mockStub.getState.resolves(token_decimals);

            const response = await token.Decimals(ctx);
            // sinon.assert.calledWith(mockStub.getState, 'decimals');
            expect(response).to.equals(2);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Decimals(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#TotalSupply', () => {
        it('should work', async () => {
            mockStub.getState.resolves(Buffer.from('10000'));

            const response = await token.TotalSupply(ctx);
            sinon.assert.calledWith(mockStub.getState, 'totalSupply');
            expect(response).to.equals(10000);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.TotalSupply(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#BalanceOf', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.resolves(Buffer.from('1000'));

            const response = await token.BalanceOf(ctx, 'Alice');
            expect(response).to.equals(1000);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.BalanceOf(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#_transfer', () => {
        it('should fail when the sender and the receipient are the same', async () => {
            await expect(token._transfer(ctx, 'Alice', 'Alice', '1000'))
                .to.be.rejectedWith(Error, 'cannot transfer to and from same client account');
        });

        it('should fail when the sender does not have enough token', async () => {
            mockStub.createCompositeKey.withArgs('balance', ['Alice']).returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('500'));

            await expect(token._transfer(ctx, 'Alice', 'Bob', '1000'))
                .to.be.rejectedWith(Error, 'client account Alice has insufficient funds.');
        });

        it('should transfer to a new account when the sender has enough token', async () => {
            mockStub.createCompositeKey.withArgs('balance', ['Alice']).returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));

            mockStub.createCompositeKey.withArgs('balance', ['Bob']).returns('balance_Bob');
            mockStub.getState.withArgs('balance_Bob').resolves(null);

            const response = await token._transfer(ctx, 'Alice', 'Bob', '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('0'));
            sinon.assert.calledWith(mockStub.putState, 'balance_Bob', Buffer.from('1000'));
            expect(response).to.equals(true);
        });

        it('should transfer to the existing account when the sender has enough token', async () => {
            mockStub.createCompositeKey.withArgs('balance', ['Alice']).returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));

            mockStub.createCompositeKey.withArgs('balance', ['Bob']).returns('balance_Bob');
            mockStub.getState.withArgs('balance_Bob').resolves(Buffer.from('2000'));

            const response = await token._transfer(ctx, 'Alice', 'Bob', '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('0'));
            sinon.assert.calledWith(mockStub.putState, 'balance_Bob', Buffer.from('3000'));
            expect(response).to.equals(true);
        });

    });

    describe('#Transfer', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // mockClientIdentity.getID.returns('Alice');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_transfer').returns(true);

            const response = await token.Transfer(ctx, 'Bob', '1000');
            const event = { from: 'Alice', to: 'Bob', value: 1000 };
            sinon.assert.calledWith(mockStub.setEvent, 'Transfer', Buffer.from(JSON.stringify(event)));
            expect(response).to.equals(true);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Transfer(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#TransferFrom', () => {
        it('should fail when the spender is not allowed to spend the token', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // mockClientIdentity.getID.returns('Charlie');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Charlie::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.createCompositeKey.withArgs('allowance', ['Alice', 'Charlie']).returns('allowance_Alice_Charlie');
            mockStub.getState.withArgs('allowance_Alice_Charlie').resolves(Buffer.from('0'));

            await expect(token.TransferFrom(ctx, 'Alice', 'Bob', '1000'))
                .to.be.rejectedWith(Error, 'The spender does not have enough allowance to spend.');
        });

        it('should transfer when the spender is allowed to spend the token', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // mockClientIdentity.getID.returns('Charlie');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Charlie::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.createCompositeKey.withArgs('allowance', ['Alice', 'Charlie']).returns('allowance_Alice_Charlie');
            mockStub.getState.withArgs('allowance_Alice_Charlie').resolves(Buffer.from('3000'));

            sinon.stub(token, '_transfer').returns(true);

            const response = await token.TransferFrom(ctx, 'Alice', 'Bob', '1000');
            sinon.assert.calledWith(mockStub.putState, 'allowance_Alice_Charlie', Buffer.from('2000'));
            const event = { from: 'Alice', to: 'Bob', value: 1000 };
            sinon.assert.calledWith(mockStub.setEvent, 'Transfer', Buffer.from(JSON.stringify(event)));
            expect(response).to.equals(true);
        });

        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.TransferFrom(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Approve', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Dave::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.createCompositeKey.returns('allowance_Dave_Eve');

            const response = await token.Approve(ctx, 'Ellen', '1000');
            sinon.assert.calledWith(mockStub.putState, 'allowance_Dave_Eve', Buffer.from('1000'));
            expect(response).to.equals(true);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Approve(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Allowance', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('allowance_Dave_Eve');
            mockStub.getState.resolves(Buffer.from('1000'));

            const response = await token.Allowance(ctx, 'Dave', 'Eve');
            expect(response).to.equals(1000);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            token.locked = true;

            await expect(token.Allowance(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Initialize', () => {
        it('should work', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            mockStub.getState.withArgs('name').resolves(null);
            mockStub.getState.withArgs('orgAdminMapping').resolves(null);


            const response = await token.Initialize(ctx, 'eth', 'ETH', '2', 'skdatacenter1', '0xskadministrator1');
            sinon.assert.calledWith(mockStub.putState, 'name', Buffer.from('eth'));
            sinon.assert.calledWith(mockStub.putState, 'symbol', Buffer.from('ETH'));
            sinon.assert.calledWith(mockStub.putState, 'decimals', Buffer.from('2'));
            expect(response).to.equals(true);
        });

        it('should fail if client is not authorized to initialize contract', async () => {
            mockClientIdentity.getMSPID.returns('SomeOtherMSP');

            await expect(token.Initialize(ctx, 'eth', 'ETH', '2'))
                .to.be.rejectedWith(Error, 'Contract options are already set, client is not authorized to change them');
        });

        it('should fail if user is not authorized to initialize contract', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=SomeOther::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.Initialize(ctx, 'eth', 'ETH', '2'))
                .to.be.rejectedWith(Error, 'Contract options are already set, client is not authorized to change them');
        });

        it('should failed if called a second time', async () => {
            // 设置客户端MSPID为'Org1MSP'以通过授权检查
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            const nameKey = 'name';
            mockStub.getState.withArgs(nameKey).resolves(token_name);

            // We consider it has already been initialized in the before-each statement
            await expect(token.Initialize(ctx, token_name, token_symbol, token_decimals))
                .to.be.rejectedWith(Error, 'contract options are already set, client is not authorized to change them');
        });
    });

    describe('#Mint', () => {
        it('should add token to a new account and a new total supply', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(null);
            mockStub.getState.withArgs('totalSupply').resolves(null);

            const response = await token.Mint(ctx, '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('1000'));
            sinon.assert.calledWith(mockStub.putState, 'totalSupply', Buffer.from('1000'));
            expect(response).to.equals(true);
        });

        it('should add token to the existing account and the existing total supply', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));
            mockStub.getState.withArgs('totalSupply').resolves(Buffer.from('2000'));

            const response = await token.Mint(ctx, '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('2000'));
            sinon.assert.calledWith(mockStub.putState, 'totalSupply', Buffer.from('3000'));
            expect(response).to.equals(true);
        });

        it('should add token to a new account and the existing total supply', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(null);
            mockStub.getState.withArgs('totalSupply').resolves(Buffer.from('2000'));

            const response = await token.Mint(ctx, '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('1000'));
            sinon.assert.calledWith(mockStub.putState, 'totalSupply', Buffer.from('3000'));
            expect(response).to.equals(true);
        });

        it('should fail if client is not authorized to mint new tokens', async () => {
            mockStub.getState.resolves(token_name);
            mockClientIdentity.getMSPID.returns('SomeOtherMSP');

            await expect(token.Mint(ctx, '1000'))
                .to.be.rejectedWith(Error, 'client is not authorized to mint new tokens');
        });

        it('should fail if user is not authorized to mint new tokens', async () => {
            mockStub.getState.resolves(token_name);
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=SomeOtherMSP::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.Mint(ctx, '1000'))
                .to.be.rejectedWith(Error, 'client is not authorized to mint new tokens');
        });

        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Mint(ctx, '1000'))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Burn', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));
            mockStub.getState.withArgs('totalSupply').resolves(Buffer.from('2000'));

            const response = await token.Burn(ctx, '1000');
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice', Buffer.from('0'));
            sinon.assert.calledWith(mockStub.putState, 'totalSupply', Buffer.from('1000'));
            expect(response).to.equals(true);
        });

        it('should fail if client is not authorized to mint new tokens', async () => {
            mockStub.getState.resolves(token_name);
            mockClientIdentity.getMSPID.returns('SomeOtherMSP');

            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));
            mockStub.getState.withArgs('totalSupply').resolves(Buffer.from('2000'));

            await expect(token.Burn(ctx, '1000'))
                .to.be.rejectedWith(Error, 'client is not authorized to burn new tokens');
        });

        it('should fail if user is not authorized to mint new tokens', async () => {
            mockStub.getState.resolves(token_name);
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=SomeOtherMSP::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.withArgs('balance_Alice').resolves(Buffer.from('1000'));
            mockStub.getState.withArgs('totalSupply').resolves(Buffer.from('2000'));

            await expect(token.Burn(ctx, '1000'))
                .to.be.rejectedWith(Error, 'client is not authorized to burn new tokens');
        });

        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Burn(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#ClientAccountBalance', () => {
        it('should work', async () => {
            mockClientIdentity.getID.returns('Alice');
            mockStub.createCompositeKey.returns('balance_Alice');
            mockStub.getState.resolves(Buffer.from('1000'));

            const response = await token.ClientAccountBalance(ctx,);
            expect(response).to.equals(1000);
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.ClientAccountBalance(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#ClientAccountID', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // mockClientIdentity.getID.returns('x509::{subject DN}::{issuer DN}');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=ClientAccountID::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const response = await token.ClientAccountID(ctx);
            expect(response).to.equals('ClientAccountID');
        });
        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.ClientAccountID(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    describe('#Fee', () => {
        it('should deduct the fee from the user\'s account balance and burn it when the user has sufficient funds', async () => {
            // Simulate initialized contract options
            mockStub.getState.resolves(Buffer.from('SomeValue'));

            sinon.stub(token, 'BalanceOf').resolves(1500);
            sinon.stub(token, 'sub').returns(1000);
            sinon.stub(token, 'Burn').resolves(true);

            const response = await token.Fee(ctx, 'Alice', '500');

            // Make sure user account balance is updated
            sinon.assert.calledWith(mockStub.putState, sinon.match.any, sinon.match.any);
            sinon.assert.calledWith(token.sub, 1500, 500);
            sinon.assert.calledWith(token.Burn, ctx, 500);

            expect(response).to.equals(true);
        });

        it('should fail when contract options are not initialized', async () => {
            mockStub.getState.resolves(null);

            await expect(token.Fee(ctx, 'Alice', '1000'))
                .to.be.rejectedWith(Error, 'contract options need to be set before calling any function, call Initialize() to initialize contract');
        });

        it('should throw an error when the fee amount is not a positive integer', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const user = 'Alice';
            const feeAmount = '-500';

            await expect(token.Fee(ctx, user, feeAmount)).to.be.rejectedWith(Error, 'Fee amount must be a positive integer');
        });

        it('should throw an error when the user has insufficient funds to cover the fee', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const user = 'Alice';
            const feeAmount = '1500';
            const userBalance = 1000;

            // Simulate the BalanceOf function
            sinon.stub(token, 'BalanceOf').returns(userBalance);

            await expect(token.Fee(ctx, user, feeAmount)).to.be.rejectedWith(Error, 'User Alice has insufficient funds to cover the fee');
        });

        it('should throw an error if contract is locked', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Mock contract lock status
            ctx.stub.getState.withArgs('lock').resolves(Buffer.from('true'));

            await expect(token.Fee(ctx))
                .to.be.rejectedWith(Error, 'The contract is locked. Call not allowed.');
        });
    });

    // describe('#Lock', () => {
    //     it('should toggle contract lock status', async () => {
    //         // Simulate initialized contract options
    //         ctx.stub.getState.resolves(Buffer.from('SomeValue'));

    //         // Impersonate context and client identity
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         const responseBeforeToggle = await token.Lock(ctx);
    //         expect(responseBeforeToggle).to.equal(true);

    //         // Check whether the lock status is switched
    //         expect(token.locked).to.equal(true);

    //         const responseAfterToggle = await token.Lock(ctx);
    //         expect(responseAfterToggle).to.equal(true);

    //         // Check if the locked state is switched back
    //         expect(token.locked).to.equal(false);
    //     });

    //     it('should throw an error if client is not authorized to toggle lock status', async () => {
    //         // Impersonate context and client identity
    //         const ctx = {
    //             clientIdentity: {
    //                 getMSPID: sinon.stub().returns('AnotherMSPID'),
    //                 getID: sinon.stub().returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain')
    //             },
    //             stub: {
    //                 getState: sinon.stub().resolves(Buffer.from('SomeValue'))
    //             }
    //         };

    //         await expect(token.Lock(ctx)).to.be.rejectedWith(Error, 'client is not authorized to lock');
    //     });

    //     it('should throw an error if user is not authorized to toggle lock status', async () => {
    //         // Impersonate context and client identity
    //         const ctx = {
    //             clientIdentity: {
    //                 getMSPID: sinon.stub().returns('skdatacenter1'),
    //                 getID: sinon.stub().returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=NotAuthorized::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain')
    //             },
    //             stub: {
    //                 getState: sinon.stub().resolves(Buffer.from('SomeValue'))
    //             }
    //         };

    //         await expect(token.Lock(ctx)).to.be.rejectedWith(Error, 'user is not authorized to lock');
    //     });
    // });

    // describe('#SetAdmin', () => {
    //     it('should update contract MSPID and Admin values', async () => {
    //         // Simulate initialized contract options
    //         ctx.stub.getState.resolves(Buffer.from('SomeValue'));

    //         // Impersonate context and client identity
    //         mockClientIdentity.getMSPID.returns('skdatacenter1');
    //         mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

    //         // Update contract options
    //         const newMSPID = 'newMSPID';
    //         const newAdmin = 'newAdmin';

    //         const response = await token.SetAdmin(ctx, newMSPID, newAdmin);
    //         expect(response).to.equal(true);

    //         // Check whether contract options are updated correctly
    //         expect(token.MSPID).to.equal(newMSPID);
    //         expect(token.Admin).to.equal(newAdmin);
    //     });

    //     it('should throw an error if client is not authorized to update contract options', async () => {
    //         // Impersonate context and client identity
    //         const ctx = {
    //             clientIdentity: {
    //                 getMSPID: sinon.stub().returns('AnotherMSPID'),
    //                 getID: sinon.stub().returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain')
    //             },
    //             stub: {
    //                 getState: sinon.stub().resolves(Buffer.from('SomeValue'))
    //             }
    //         };

    //         // Attempt to update contract options
    //         const newMSPID = 'newMSPID';
    //         const newAdmin = 'newAdmin';

    //         await expect(token.SetAdmin(ctx, newMSPID, newAdmin)).to.be.rejectedWith(Error, 'client is not authorized to update contract options');
    //     });

    //     it('should throw an error if user is not authorized to update contract options', async () => {
    //         // Impersonate context and client identity
    //         const ctx = {
    //             clientIdentity: {
    //                 getMSPID: sinon.stub().returns('skdatacenter1'),
    //                 getID: sinon.stub().returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=NotAuthorized::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain')
    //             },
    //             stub: {
    //                 getState: sinon.stub().resolves(Buffer.from('SomeValue'))
    //             }
    //         };

    //         // Attempt to update contract options
    //         const newMSPID = 'newMSPID';
    //         const newAdmin = 'newAdmin';

    //         await expect(token.SetAdmin(ctx, newMSPID, newAdmin)).to.be.rejectedWith(Error, 'user is not authorized to update contract options');
    //     });
    // });

    // describe('#GetAdmin', () => {
    //     it('should return contract MSPID and Admin values', async () => {
    //         // Impersonate context and client identity
    //         const ctx = {
    //             clientIdentity: {
    //                 getMSPID: sinon.stub().returns('skdatacenter1'),
    //                 getID: sinon.stub().returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain')
    //             },
    //             stub: {
    //                 getState: sinon.stub().resolves(Buffer.from('SomeValue'))
    //             }
    //         };

    //         // Call GetAdmin method
    //         const response = await token.GetAdmin(ctx);

    //         // Check whether the response contains the correct MSPID and Admin values
    //         expect(response).to.deep.equal({ MSPID: 'skdatacenter1', Admin: '0xskadministrator1' });
    //     });
    // });
});