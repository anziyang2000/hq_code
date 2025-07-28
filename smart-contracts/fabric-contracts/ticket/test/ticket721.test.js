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
        token = new main('token-erc721');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#BalanceOf', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const mockResponse = [
                { key: 'balance_Alice_101', value: Buffer.from('\u0000') },
                { key: 'balance_Alice_102', value: Buffer.from('\u0000') }
            ];
            mockStub.getStateByPartialCompositeKey.resolves(new MockIterator(mockResponse));

            const response = await token.BalanceOf(ctx, 'Alice');
            expect(response).to.equals(2);
        });
    });

    describe('#OwnerOf', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('nft_101');
            const nft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Bob',
                tokenURI: 'DummyURI'
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.OwnerOf(ctx, '101');
            expect(response).to.equal('Alice');
        });
    });

    describe('#TransferFrom', () => {
        it('should transfer ownership successfully when the sender is the current owner', async () => {
            // Set up current NFT state
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'noIssued'
                    }
                }
            };

            // Updated NFT state after transfer
            const updatedNft = {
                tokenId: 101,
                owner: 'Bob',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'noIssued'
                    }
                }
            };

            // Stub createCompositeKey to return appropriate composite keys
            sinon.stub(token, 'IsApprovedForAll').resolves(true);
            // Stub createCompositeKey to return appropriate composite keys
            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');
            mockStub.createCompositeKey.withArgs('balance', ['Bob', '101']).returns('balance_Bob_101');

            // Stub getState to simulate initialized contract options
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Stub getID to return sender's identity
            mockClientIdentity.getID.returns('Alice');

            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Perform TransferFrom operation
            const response = await token.TransferFrom(ctx, 'Alice', 'Bob', '101');

            // Assertions
            sinon.assert.calledWith(mockStub.putState, 'nft_101', Buffer.from(JSON.stringify(updatedNft)));
            sinon.assert.calledWith(mockStub.putState, 'balance_Bob_101', Buffer.from('\u0000'));

            expect(response).to.equals(true);
        });

        it('should transfer ownership successfully when the sender is the current owner and the ticket status is not completed', async () => {
            // Set up current NFT state
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            // Updated NFT state after transfer
            const updatedNft = {
                tokenId: 101,
                owner: 'Bob',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            sinon.stub(token, 'IsApprovedForAll').resolves(true);
            // Stub createCompositeKey to return appropriate composite keys
            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');

            // Stub getState to simulate initialized contract options
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Stub getID to return sender's identity
            mockClientIdentity.getID.returns('Alice');

            // Perform TransferFrom operation
            const response = await token.TransferFrom(ctx, 'Alice', 'Bob', '101');

            // Assertions
            sinon.assert.calledWith(mockStub.putState, 'nft_101', Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);
        });

        it('should transfer ownership successfully when the sender is the approved client for this token and the ticket status is not completed', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            const updatedNft = {
                tokenId: 101,
                owner: 'Bob',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            sinon.stub(token, 'IsApprovedForAll').resolves(true);
            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');
            mockStub.createCompositeKey.withArgs('balance', ['Bob', '101']).returns('balance_Bob_101');
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Charlie');

            const response = await token.TransferFrom(ctx, 'Alice', 'Bob', '101');
            sinon.assert.calledWith(mockStub.putState, 'nft_101', Buffer.from(JSON.stringify(updatedNft)));
            sinon.assert.calledWith(mockStub.putState, 'balance_Bob_101', Buffer.from('\u0000'));
            expect(response).to.equals(true);
        });

        it('should transfer ownership successfully when the sender is an authorized operator and the ticket status is not completed', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            const updatedNft = {
                tokenId: 101,
                owner: 'Bob',
                approved: '',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');
            mockStub.createCompositeKey.withArgs('balance', ['Alice', '101']).returns('balance_Alice_101');
            mockStub.createCompositeKey.withArgs('balance', ['Bob', '101']).returns('balance_Bob_101');
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Dave');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            const response = await token.TransferFrom(ctx, 'Alice', 'Bob', '101');
            sinon.assert.calledWith(mockStub.putState, 'nft_101', Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);
        });

        it('should throw an error when the sender is invalid', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Eve');
            sinon.stub(token, 'IsApprovedForAll').resolves(false);

            await expect(token.TransferFrom(ctx, 'Alice', 'Bob', '101'))
                .to.be.rejectedWith(Error, 'The sender undefined is not allowed to transfer the non-fungible token owned by Alice');
        });

        it('should throw an error when the current owner does not match', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Dave');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            await expect(token.TransferFrom(ctx, 'Charlie', 'Bob', '101'))
                .to.be.rejectedWith(Error, 'The from is not the current owner.');
        });

        it('should throw an error when the ticket status is completed', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Alice');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            await expect(token.TransferFrom(ctx, 'Alice', 'Bob', '101'))
                .to.be.rejectedWith(Error, 'The ticket status is completed and cannot be sold');
        });

        it('should throw an error when the recipient does not exist', async () => {
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Charlie',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));
            mockClientIdentity.getID.returns('Alice');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            await expect(token.TransferFrom(ctx, 'Alice', '', '101'))
                .to.be.rejectedWith(Error, 'The recipient  does not exist.');
        });

    });

    describe('#Approve', () => {
        it('should work with the token owner', async () => {
            mockClientIdentity.getID.returns('Alice');
            const currentNft = {
                tokenId: 101,
                owner: 'Alice',
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            sinon.stub(token, 'IsApprovedForAll').resolves(true);
            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');

            const response = await token.Approve(ctx, 'Bob', '101');
            const updatedNft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Bob'
            };
            sinon.assert.calledWith(mockStub.putState, 'nft_101', Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);
        });
    });

    describe('#SetApprovalForAll', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            //Simulation returns the identity of the current user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Simulate creating a composite key
            mockStub.createCompositeKey.withArgs('approval', ['Alice', 'Bob']).returns('approval_Alice_Bob');

            //Call the SetApprovalForAll function
            const response = await token.SetApprovalForAll(ctx, 'Bob', true);

            //Create the desired authorization object
            const approval = {
                owner: 'Alice',
                operator: 'Bob',
                approved: true
            };

            // Assert that the putState function was called correctly
            sinon.assert.calledWith(mockStub.putState, 'approval_Alice_Bob', Buffer.from(JSON.stringify(approval)));

            // Assert that response is true
            expect(response).to.equals(true);
        });
    });

    describe('#GetApproved', () => {
        it('should work', async () => {
            const nft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Bob',
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.GetApproved(ctx, '101');
            expect(response).to.equals('Bob');
        });
    });

    describe('#IsApprovedForAll', () => {
        it('should work', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockStub.createCompositeKey.withArgs('approval', ['Alice', 'Bob']).returns('approval_Alice_Bob');
            const approval = {
                owner: 'Alice',
                operator: 'Bob',
                approved: true
            };
            mockStub.getState.withArgs('approval_Alice_Bob').resolves(Buffer.from(JSON.stringify(approval)));

            const response = await token.IsApprovedForAll(ctx, 'Alice', 'Bob');
            expect(response).to.equals(true);
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

    describe('#TokenURI', () => {
        it('should work', async () => {
            const nft = {
                tokenId: 101,
                owner: 'Alice',
                tokenURI: 'DummyURI'
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.TokenURI(ctx, '101');
            expect(response).to.equal('DummyURI');
        });
    });

    describe('#TotalSupply', () => {
        it('should work', async () => {
            // Simulate initialized contract options
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

    describe('#Burn', () => {
        it('should work', async () => {
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Bob::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const nft = {
                tokenId: 101,
                owner: 'Bob',
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');
            mockStub.createCompositeKey.withArgs('balance', ['Bob', '101']).returns('balance_Bob_101');

            const response = await token.Burn(ctx, '101');
            sinon.assert.calledWith(mockStub.deleteState.getCall(0), 'nft_101');
            sinon.assert.calledWith(mockStub.deleteState.getCall(1), 'balance_Bob_101');
            expect(response).to.equals(true);
        });
    });

    describe('#ReadNFT', () => {
        it('should work', async () => {
            mockStub.createCompositeKey.returns('nft_101');
            const nft = {
                tokenId: 101,
                owner: 'Alice',
                approved: 'Bob',
                tokenURI: 'DummyURI'
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            const response = await token.ReadNFT(ctx, '101');
            expect(response).to.deep.equal(nft);
        });
    });

    describe('#Mint', () => {
        it('should work for authorized client', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _nftExists method to simulate token not already existing
            sinon.stub(token, '_nftExists').resolves(false);

            const tokenId = '101';
            const to = 'Alice';
            const metadata = JSON.stringify({ tokenURI: 'URI' });
            const ticketFields = JSON.stringify({ name: 'aaa', price: '1000' });

            const expectedNFT = {
                tokenId: '101',
                owner: 'Alice',
                tokenURI: 'URI' ,
                ticketFields: { name: 'aaa', price: '1000' }
            };

            // Simulate the created 'nft_101' first and then call it
            mockStub.createCompositeKey.withArgs('nft', ['101']).returns('nft_101');
            // 注：`createCompositeKey` 方法的第二个参数应该是一个数组，而不是分开的参数
            mockStub.createCompositeKey.withArgs('balance', ['Alice', '101']).returns('balance_Alice_101');

            const response = await token.Mint(ctx, tokenId, to, metadata, ticketFields);

            sinon.assert.calledWith(ctx.stub.putState, 'nft_101', Buffer.from(JSON.stringify(expectedNFT)));
            sinon.assert.calledWith(mockStub.setEvent, 'Transfer', Buffer.from(JSON.stringify({ from: '0x0', to: 'Alice', tokenId: '101' })));
            // Check if putState is called with the correct arguments
            sinon.assert.calledWith(mockStub.putState, 'balance_Alice_101', Buffer.from('\u0000'));
            // Check if setEvent is called with the correct arguments
            sinon.assert.calledWith(mockStub.setEvent, 'Transfer', Buffer.from(JSON.stringify({ from: '0x0', to: 'Alice', tokenId: '101' })));

            // Check if the response matches the expected NFT
            expect(response).to.deep.equal(expectedNFT);
        });

        it('should throw error for unauthorized user', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate unauthorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=Alice::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.Mint(ctx, '101', 'Alice', { tokenURI: 'DummyURI' }, { event: 'Concert', date: '2024-03-30' }))
                .to.be.rejectedWith(Error, 'user is not authorized to mint new tokens');
        });

        it('should throw error for unauthorized client', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter2');
            // Stub client identity to simulate unauthorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            await expect(token.Mint(ctx, '101', 'Alice', { tokenURI: 'DummyURI' }, { event: 'Concert', date: '2024-03-30' }))
                .to.be.rejectedWith(Error, 'client is not authorized to mint new tokens');
        });

        it('should throw error if token already exists', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            // Stub client identity to simulate authorized user
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const metadata = JSON.stringify({ tokenURI: 'URI' });
            const ticketFields = JSON.stringify({ name: 'aaa', price: '1000' });

            // Stub _nftExists method to simulate token already existing
            sinon.stub(token, '_nftExists').resolves(true);

            await expect(token.Mint(ctx, '101', 'Alice', metadata, ticketFields))
                .to.be.rejectedWith(Error, 'The token 101 is already minted.');
        });
    });

    describe('#BatchMint', () => {
        it('should work for authorized client', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            const metadata1 = { tokenURI: 'URI' };
            const ticketFields1 = { name: 'aaa', price: '1000' };
            const metadata2 = { tokenURI: 'URI' };
            const ticketFields2 = { name: 'bbb', price: '2000' };

            const tokenArray = JSON.stringify([
                { TokenId: '101', Address: 'Alice', MetaData: metadata1, TicketFields: ticketFields1 },
                { TokenId: '102', Address: 'Bob', MetaData: metadata2, TicketFields: ticketFields2 }
            ]);

            const expectedNFTs = [
                { tokenId: '101', owner: 'Alice', tokenURI: 'URI', ticketFields: { name: 'aaa', price: '1000' } },
                { tokenId: '102', owner: 'Bob', tokenURI: 'URI', ticketFields: { name: 'bbb', price: '2000' } }
            ];

            // 重新包装 _nftExists 方法
            sinon.stub(token, '_nftExists').resolves(false);

            const response = await token.BatchMint(ctx, tokenArray);

            expect(response).to.deep.equal(expectedNFTs);
        });

        it('should throw error for unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser2::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const metadata1 = JSON.stringify({ tokenURI: 'URI' });
            const ticketFields1 = JSON.stringify({ name: 'aaa', price: '1000' });
            const metadata2 = JSON.stringify({ tokenURI: 'URI' });
            const ticketFields2 = JSON.stringify({ name: 'bbb', price: '2000' });

            const tokenArray = JSON.stringify([
                { tokenId: '101', to: 'Alice', metadata: metadata1, ticketFields: ticketFields1 },
                { tokenId: '102', to: 'Bob', metadata: metadata2, ticketFields: ticketFields2 }
            ]);

            await expect(token.BatchMint(ctx, tokenArray))
                .to.be.rejectedWith(Error, 'user is not authorized to mint new tokens');
        });

        it('should throw error for unauthorized client', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const metadata1 = { tokenURI: 'URI' };
            const ticketFields1 = { name: 'aaa', price: '1000' };
            const metadata2 = { tokenURI: 'URI' };
            const ticketFields2 = { name: 'bbb', price: '2000' };

            const tokenArray = JSON.stringify([
                { TokenId: '101', Address: 'Alice', MetaData: metadata1, TicketFields: ticketFields1 },
                { TokenId: '102', Address: 'Bob', MetaData: metadata2, TicketFields: ticketFields2 }
            ]);

            await expect(token.BatchMint(ctx, tokenArray))
                .to.be.rejectedWith(Error, 'client is not authorized to mint new tokens');
        });

        it('should throw error if token already exists', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            sinon.stub(token, '_nftExists').resolves(true);

            const metadata1 = { tokenURI: 'URI' };
            const ticketFields1 = { name: 'aaa', price: '1000' };
            const metadata2 = { tokenURI: 'URI' };
            const ticketFields2 = { name: 'bbb', price: '2000' };

            const tokenArray = JSON.stringify([
                { TokenId: '101', Address: 'Alice', MetaData: metadata1, TicketFields: ticketFields1 },
                { TokenId: '102', Address: 'Bob', MetaData: metadata2, TicketFields: ticketFields2 }
            ]);

            await expect(token.BatchMint(ctx, tokenArray))
                .to.be.rejectedWith(Error, 'The token 101 is already minted.');
        });
    });

    describe('#VerifyTicket', () => {
        beforeEach('Initialize token contract', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();
        });

        it('should return appropriate message when ticket status is "completed"', async () => {
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101'))
                .to.be.rejectedWith(Error, 'The ticket has been completed and cannot be verified again');
        });

        it('should return appropriate message when ticket status is "noIssued"', async () => {
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'noIssued'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101'))
                .to.be.rejectedWith(Error, 'Tickets have not been issued yet');
        });

        it('should update ticket status to "completed" and return appropriate message when ticket status is "notWrittenOff"', async () => {
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function
            const result = await token.VerifyTicket(ctx, '101', sinon.match({ ticketFields: { ticketInfo: { ticketStatus: 'completed' } } }));

            expect(result).to.equals(true);
        });

        it('should return appropriate message when ticket status is "refunded"', async () => {
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'refunded'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101'))
                .to.be.rejectedWith(Error, 'The ticket has been refunded and cannot be verified');
        });

        it('should return appropriate message when ticket status is unknown', async () => {
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'unknownStatus'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101'))
                .to.be.rejectedWith(Error, 'unknown status');
        });

        it('should throw error for unauthorized client', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101', sinon.match({ ticketFields: { ticketInfo: { ticketStatus: 'completed' } } })))
                .to.be.rejectedWith(Error, 'client is not authorized to verify ticket');
        });

        it('should throw error for unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser2::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(nft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            await expect(token.VerifyTicket(ctx, '101', sinon.match({ ticketFields: { ticketInfo: { ticketStatus: 'completed' } } })))
                .to.be.rejectedWith(Error, 'user is not authorized to verify ticket');
        });
    });

    describe('#UpdateTicketStatus', () => {
        beforeEach('Initialize token contract', async () => {
            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();
        });

        it('should throw error if client is not authorized to update ticket status', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'newStatus')).to.be.rejectedWith('client is not authorized to update ticket status');
        });

        it('should throw error if user is not authorized to update ticket status', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=UnauthorizedUserID::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'newStatus')).to.be.rejectedWith('user is not authorized to update ticket status');
        });

        it('should throw error if ticket status is already completed', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a completed ticket
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));


            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'newStatus')).to.be.rejectedWith('The ticket status is completed and cannot be modified.');
        });

        it('should update ticket status and return true', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT and _updateNFT methods
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    }
                }
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function
            const result = await token.UpdateTicketStatus(ctx, '101', 'refunded');

            expect(result).to.equals(true);
        });

        it('should throw error if trying to update to invalid status from noIssued', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a ticket with status noIssued
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'noIssued'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'completed')).to.be.rejectedWith('Invalid status transition. The status can only be updated to "notWrittenOff" from "noIssued".');
        });

        it('should throw error if trying to update to invalid status from notWrittenOff', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a ticket with status notWrittenOff
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'noIssued')).to.be.rejectedWith('Invalid status transition. The status can only be updated to "completed" or "refunded" from "notWrittenOff".');
        });

        it('should throw error if trying to update to completed status from notWrittenOff when ticket status is completed', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a ticket with status completed
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'completed')).to.be.rejectedWith('The ticket status is completed and cannot be modified.');
        });

        it('should throw error if trying to update to refunded status from notWrittenOff when ticket status is refunded', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a ticket with status refunded
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'refunded'
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function and expect it to throw an error
            await expect(token.UpdateTicketStatus(ctx, '101', 'refunded')).to.be.rejectedWith('The ticket status is refunded and cannot be modified.');
        });
    });

    describe('#UpdateTicketInfo', () => {
        it('should update ticket info successfully when updating some fields', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                ticketStatus: 'completed',
                ticketType: 'VIP'
            });

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notCompleted',
                        ticketType: 'General'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform UpdateTicketInfo operation
            const response = await token.UpdateTicketInfo(ctx, tokenId, ticketInfo);

            expect(response).to.deep.equal(true);
        });

        it('should update ticket info successfully when updating a field', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            const ticketNumber = '102';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketNumber: '101',
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform UpdateTicketInfo operation
            const response = await token.UpdateTicketInfo(ctx, tokenId, JSON.stringify(ticketNumber));

            expect(response).to.deep.equal(true);
        });

        it('should update ticket info successfully when updating the entire ticket field', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            // const ticketNumber = '102';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketNumber: '101',
                    }
                }
            };

            const aaa = {
                ticketType: '',
                scenceInfo: {
                    scenicName: '',
                    rating: '',
                    businessTime: '',
                    location: '',
                    enterpriseName: '',
                    merchantId: ''
                },
                rules: {
                    ticketingRules: {
                        ticketingType: '',
                        usageTimeAfterPurchase: '',
                        ticketingPeriod: '',
                        realNameVerification: '',
                        realNameVerificationValidation:'',
                        personalPurchaseRestriction: '',
                        ticketIssuanceImmediateVerification: '',
                        windowSaleOnly: ''
                    },
                    refundRules: {
                        refundable: '',
                        refundPeriodRate: ''
                    },
                    checkRules: {
                        realNameVerificationIdMethod: '',
                        checkpoint: '',
                        passageWay: '',
                        timedTicketReservation: ''
                    }
                },
                productsItems: {
                    products: {
                        productType: '',
                        productName: '',
                        validDuration: '',
                        firstDayActivation: '',
                        daysValidForEntry: '',
                        usageCount: '',
                        sellByWeek: '',
                        productsTimedReservation: '',
                        entryStatistics: '',
                        entryRequirements: ''
                    },
                    items: {
                        itemName: '',
                        ticketCategory: '',
                        purchaseQuantityControl: ''
                    },
                    inventory: {
                        totalInventory: '',
                        timedInventory: '',
                        purchaseValidityDate: '',
                        entryValidityDate: ''
                    }
                },
                prices: {
                    initalInfo: {
                        marketStandardPrice: '',
                        specialDiscountRate: '',
                        distributionDiscountRange: ''
                    },
                    pricingStrategy: {
                        directSales: {
                            directSinglePurchasePrice: '',
                            directCombinedPurchasePrice: ''
                        },
                        agent: {
                            agentSinglePurchasePrice: '',
                            agentCombinedPurchasePrice: '',
                            commissionRatio: ''
                        },
                        distributor: {
                            productSalesPrice: '',
                            itemSalesPrice: ''
                        }
                    }
                },
                ticketInfo: {
                    ticketNumber: '',
                    itemInfo: {
                        sellingPrice: ''
                    },
                    numberOfPeople: '',
                    userIdentityInfo: {
                        userName: '',
                        idNumber: ''
                    },
                    entryTime: '',
                    ticketTimedReservation: '',
                    ticketStatus: '',
                    ticketReceiverInfo: {
                        contactPerson: '',
                        contactNumber: '',
                        idCard: ''
                    },
                    verificationRecords: {
                        verificationDeviceNameType: '',
                        idCardRecognitionType: '',
                        verificationTime: '',
                        verificationCount: ''
                    },
                    refundRecords: {
                        refundTime: '',
                        refundReason: '',
                        refundAmount: ''
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform UpdateTicketInfo operation
            const response = await token.UpdateTicketInfo(ctx, tokenId, JSON.stringify(aaa));

            expect(response).to.deep.equal(true);
        });

        it('should update ticket info successfully when the incoming ticket field is empty', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketNumber: '101',
                    }
                }
            };

            const aaa = {};
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform UpdateTicketInfo operation
            const response = await token.UpdateTicketInfo(ctx, tokenId, JSON.stringify(aaa));

            expect(response).to.deep.equal(true);
        });

        it('should throw error for unauthorized client', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                ticketStatus: 'completed',
                ticketType: 'VIP'
            });

            await expect(token.UpdateTicketInfo(ctx, tokenId, ticketInfo))
                .to.be.rejectedWith(Error, 'client is not authorized to update ticket information');
        });

        it('should throw error for unauthorized user', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskstandarduser2::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub CheckInitialized method to simulate contract initialization
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();

            const tokenId = '101';

            const ticketInfo = JSON.stringify({
                ticketStatus: 'completed',
                ticketType: 'VIP'
            });

            await expect(token.UpdateTicketInfo(ctx, tokenId, ticketInfo))
                .to.be.rejectedWith(Error, 'User is not authorized to update ticket information');
        });
    });

    describe('#GetTicketInfo', () => {
        it('should return ticket info successfully when getting some fields', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed',
                        ticketType: 'VIP'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            // Perform GetTicketInfo operation
            const response = await token.GetTicketInfo(ctx, tokenId, 'ticketInfo');

            // Assertions
            const expectedTicketInfo = {
                ticketStatus: 'completed',
                ticketType: 'VIP'
            };
            expect(response).to.deep.equal(expectedTicketInfo);
        });

        it('should return ticket info successfully  when getting a field', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed',
                        ticketType: 'VIP'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));


            // Perform GetTicketInfo operation
            const response = await token.GetTicketInfo(ctx, tokenId, 'ticketStatus');

            expect(response).to.deep.equal('completed');
        });

        it('should fail if the nft ticketFields does not exist', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.GetTicketInfo(ctx, tokenId, 'ticketNumber'))
                .to.be.rejectedWith(Error, 'No ticket information found for Token 101');
        });

        it('should fail if a field content of nft TicketFields does not exist', async () => {
            // Simulate initialized contract options
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            const tokenId = '101';

            // Stub _readNFT to return current NFT state
            const currentNft = {
                tokenId: '101',
                owner: 'Alice',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed',
                        ticketType: 'VIP'
                    }
                }
            };
            // sinon.stub(token, '_readNFT').resolves(currentNft);
            mockStub.getState.resolves(Buffer.from(JSON.stringify(currentNft)));

            await expect(token.GetTicketInfo(ctx, tokenId, 'ticketNumber'))
                .to.be.rejectedWith(Error, 'Field ticketNumber not found in ticket information for Token 101');
        });
    });

    describe('#UpdateProductSalesPrice', () => {
        beforeEach('Initialize token contract', async () => {
            // mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();
        });

        it('should throw error if client is not authorized to update ticket status', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Stub client identity to return unauthorized user ID
            mockClientIdentity.getMSPID.returns('skdatacenter2');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');


            // Call the function and expect it to throw an error
            await expect(token.UpdateProductSalesPrice(ctx, '101', '200')).to.be.rejectedWith('client is not authorized to update product sales price');
        });

        it('should throw error if user is not authorized to update ticket status', async () => {
            ctx.stub.getState.resolves(Buffer.from('SomeValue'));

            // Stub client identity to return unauthorized user ID
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=UnauthorizedUserID::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');


            // Call the function and expect it to throw an error
            await expect(token.UpdateProductSalesPrice(ctx, '101', '200')).to.be.rejectedWith('User is not authorized to update product sales price');
        });

        it('should throw error if ticket status is already completed', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Stub _readNFT method to return a completed ticket
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'completed'
                    },
                    prices: {
                        pricingStrategy: {
                            distributor: {
                                productSalesPrice:'100'
                            }
                        }
                    }
                }
            };

            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function and expect it to throw an error
            await expect(token.UpdateProductSalesPrice(ctx, '101', '200')).to.be.rejectedWith('The ticket status is completed and cannot be modified.');
        });

        it('should update ticket status and return true', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');
            // Stub _readNFT and _updateNFT methods
            const nft = {
                tokenId: '101',
                ticketFields: {
                    ticketInfo: {
                        ticketStatus: 'notWrittenOff'
                    },
                    prices: {
                        pricingStrategy: {
                            distributor: {
                                productSalesPrice:'100'
                            }
                        }
                    }
                }
            };
            mockStub.getState.resolves(Buffer.from(JSON.stringify(nft)));

            // Call the function
            const result = await token.UpdateProductSalesPrice(ctx, '101', '200');

            expect(result).to.equals(true);
        });
    });

    describe('#SetAdmin', () => {
        beforeEach('Initialize token contract', async () => {
            // Mock CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();
        });

        it('should throw error if user is not super admin', async () => {
            ctx.clientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=SomeUserID::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function and expect it to throw an error
            await expect(token.SetAdmin(ctx, 'fe', 'newValue')).to.be.rejectedWith('Only super admin can set admin');
        });

        it('should throw error if trying to modify default super admin', async () => {
            ctx.clientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function and expect it to throw an error
            await expect(token.SetAdmin(ctx, 'sk', 'newValue')).to.be.rejectedWith('Cannot modify default super admin');
        });

        it('should set admin successfully', async () => {
            ctx.clientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function
            const res = await token.SetAdmin(ctx, 'fe', 'newValue');

            // Check if admin is updated successfully
            const admin = await token.GetAdmin();
            expect(admin.fe).to.equal('newValue');
            expect(res).to.equal(true);
        });

        it('should set new admin successfully', async () => {
            ctx.clientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            // Call the function
            const res = await token.SetAdmin(ctx, 'dx', '333');

            // Check if admin is updated successfully
            const admin = await token.GetAdmin();
            expect(admin).to.deep.equal({
                sk: '0xskadministrator1',
                ad:'111',
                fe:'222',
                dx:'333'
            });
            expect(res).to.equal(true);
        });
    });

    describe('#GetAdmin', () => {
        it('should return admin object successfully', async () => {
            // Call the function
            const admin = await token.GetAdmin();

            // Check if admin object is returned successfully
            expect(admin).to.deep.equal({
                sk: '0xskadministrator1',
                ad:'111',
                fe:'222'
            });
        });
    });

    describe('#SetMSPID', () => {
        beforeEach('Initialize token contract', async () => {
            // Mock CheckInitialized method to simulate contract initialization
            token.CheckInitialized = sinon.stub().resolves();
        });

        it('should throw error if user is not super MSPID', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter2');

            // Call the function and expect it to throw an error
            await expect(token.SetMSPID(ctx, 'fe', 'newValue')).to.be.rejectedWith('Only super MSPID can set MSPID');
        });

        it('should throw error if trying to modify default super MSPID', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');

            // Call the function and expect it to throw an error
            await expect(token.SetMSPID(ctx, 'org', 'newValue')).to.be.rejectedWith('Cannot modify default super MSPID');
        });

        it('should set MSPID successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');

            // Call the function
            const res = await token.SetMSPID(ctx, 'fe', 'newValue');

            // Check if MSPID is updated successfully
            const MSPID = await token.GetMSPID();
            expect(MSPID.fe).to.equal('newValue');
            expect(res).to.equal(true);
        });

        it('should set new MSPID successfully', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');

            // Call the function
            const res = await token.SetMSPID(ctx, 'dx', '333');

            // Check if admin is updated successfully
            const MSPID = await token.GetMSPID();
            expect(MSPID).to.deep.equal({
                org: 'skdatacenter1',
                dx:'333'
            });
            expect(res).to.equal(true);
        });
    });

    describe('#GetMSPID', () => {
        it('should return MSPID object successfully', async () => {
            // Call the function
            const MSPID = await token.GetMSPID();

            // Check if MSPID object is returned successfully
            expect(MSPID).to.deep.equal({
                org: 'skdatacenter1',
            });
        });
    });
});