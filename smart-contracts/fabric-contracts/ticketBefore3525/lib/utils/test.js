/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ticket = require('../ticket/ticket');
const { nftPrefix } = require('../const/constants');

class testObj extends Contract {
    constructor() {
        super();
        this.Ticket = new ticket();
    }

    async testMints(ctx, tokenId, to, balance) {
        const nft = {
            token_id: tokenId,
            owner: to,
            balance: balance,
            info: 'this is a new mint',
        };

        const nftKey = nftPrefix + tokenId;
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
        return nft;
    }

    // async testUpdate(ctx, tokenId, info){
    //     const nft = await this.Ticket.readNFT(ctx, tokenId);
    //     const nftKey = nftPrefix + tokenId;
    //     await ctx.stub.putState(nftKey+'.info', Buffer.from(JSON.stringify(info)));
    // }

}

module.exports = testObj;