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
    let evidence;
    let ctx;
    let mockStub;
    let mockClientIdentity;

    beforeEach('Sandbox creation', () => {
        sandbox = sinon.createSandbox();
        evidence = new main('evidence');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('#StoreEvidence', () => {
        beforeEach(() => {
            const orgAdminMapping = {
                skdatacenter1: ['0xskadministrator1']
            };

            ctx.stub.getState.resolves(Buffer.from(JSON.stringify(orgAdminMapping)));
        });
        it('should store a evidence info success', async () => {
            mockClientIdentity.getMSPID.returns('skdatacenter1');
            mockClientIdentity.getID.returns('x509::/C=CN/ST=Guangdong/L=Shenzhen/O=ca.skdatacenter1.fabric/OU=client/CN=0xskadministrator1::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=rca.ca.skdatacenter1.shukechain');

            ctx.stub.getTxID.returns('tx_id');
            ctx.stub.getState.withArgs('tx_id').resolves(Buffer.from(''));

            const fileHash = '文件哈希';
            const fileName = '文件名';
            const fileTime = '上传时间';
            const tokenId = '加密ID';
            const userId = '用户ID';
            const type = '类型';
            const name = '用户输入的名称';
            const contentUrl = '返回的CID';

            const response = await evidence.StoreEvidence(ctx, fileHash, fileName, fileTime, tokenId, userId, type, name, contentUrl);

            expect(response).to.deep.equal(true);
        });
    });

});