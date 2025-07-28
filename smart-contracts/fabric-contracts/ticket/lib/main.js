/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ticket = require('./ticket/ticket');
const { balancePrefix, nftPrefix, approvalPrefix, nameKey, symbolKey } = require('../lib/const/constants');

class main extends Contract {
    constructor() {
        super();
        // Create an instance of the business module in the constructor
        this.Ticket = new ticket();
    }

    async BalanceOf(ctx, owner) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        // There is a key record for every non-fungible token in the format of balancePrefix.owner.tokenId.
        const iterator = await ctx.stub.getStateByPartialCompositeKey(balancePrefix, [owner]);

        // Count the number of returned composite keys
        let balance = 0;
        // Using a while loop, as long as result.done is not true (that is, the iterator has not ended), the code in the loop body is executed
        let result = await iterator.next();
        while (!result.done) {
            balance++;
            result = await iterator.next();
        }
        return balance;
    }

    async OwnerOf(ctx, tokenId) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);
        const nft = await this.Ticket.ReadNFT(ctx, tokenId);
        const owner = nft.owner;
        if (!owner) {
            throw new Error('No owner is assigned to this token');
        }

        return owner;
    }

    async TransferFrom(ctx, from, to, tokenId) {
        await this.Ticket.CheckInitialized(ctx);

        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);
        const sender = x509Object[0].CN;

        const nft = await this.Ticket.ReadNFT(ctx, tokenId);
        const owner = nft.owner;
        const tokenApproval = nft.approved;
        const operatorApproval = await this.IsApprovedForAll(ctx, owner, sender);

        if (owner !== sender && tokenApproval !== sender && !operatorApproval) {
            throw new Error(`The sender ${sender} is not allowed to transfer the non-fungible token owned by ${owner}`);
        }

        if (nft.ticketFields.ticketInfo && nft.ticketFields.ticketInfo.ticketStatus === 'completed') {
            throw new Error('The ticket status is completed and cannot be sold');
        }

        if (owner !== from) {
            throw new Error('The from is not the current owner.');
        }

        const toExists = !!(to && to.trim());
        if (!toExists) {
            throw new Error(`The recipient ${to} does not exist.`);
        }

        nft.approved = '';
        nft.owner = to;
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        const balanceKeyFrom = ctx.stub.createCompositeKey(balancePrefix, [from, tokenId]);
        await ctx.stub.deleteState(balanceKeyFrom);

        const balanceKeyTo = ctx.stub.createCompositeKey(balancePrefix, [to, tokenId]);
        await ctx.stub.putState(balanceKeyTo, Buffer.from('\u0000'));

        const transferEvent = { from: from, to: to, tokenId: tokenId };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async Approve(ctx, approved, tokenId) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const sender = x509Object[0].CN;

        const nft = await this.Ticket.ReadNFT(ctx, tokenId);

        // Check if the sender is the current owner of the non-fungible token or an authorized operator of the current owner
        const owner = nft.owner;
        const operatorApproval = await this.IsApprovedForAll(ctx, owner, sender);
        if (owner !== sender && !operatorApproval) {
            throw new Error('The sender is not the current owner nor an authorized operator');
        }

        // Update the approved client of the non-fungible token
        nft.approved = approved;
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // Emit the Approval event
        // const tokenIdInt = parseInt(tokenId);
        const approvalEvent = { owner: owner, approved: approved, tokenId: tokenId };
        ctx.stub.setEvent('Approval', Buffer.from(JSON.stringify(approvalEvent)));

        return true;
    }

    // async Approve(ctx, approved, tokenId, amount = null) {
    //     throw new Error('The Approve function is no longer supported.');
    //     // 如果有其他代码，它将不会被执行，因为在这之前就已经抛出了一个错误。    

    //     // Check contract options are already set first to execute the function
    //     await this.Ticket.CheckInitialized(ctx);
    
    //     const x509ByteArray = ctx.clientIdentity.getID();
    
    //     // Parse certificate string into object
    //     const x509Object = await this.Ticket.ParseX509String(x509ByteArray);
    
    //     // Get the CN value in the first object
    //     const sender = x509Object[0].CN;
    
    //     // Read the NFT from the ledger
    //     const nft = await this.Ticket.ReadNFT(ctx, tokenId);
    //     if (!nft || !nft.balance) {
    //         throw new Error(`No balance found for tokenId ${tokenId}`);
    //     }
    
    //     // Check if the sender is the current owner of the non-fungible token
    //     const owner = nft.owner;
    //     const operatorApproval = await this.IsApprovedForAll(ctx, owner, sender);
    //     if (owner !== sender && !operatorApproval) {
    //         throw new Error('The sender is not the current owner nor an authorized operator');
    //     }
    
    //     // Initialize approvedBalance to the current approved balance or zero
    //     let approvedBalance = nft.approvedBalance || 0;
    
    //     // If amount is not specified, approve the entire balance of the token
    //     if (amount === null) {
    //         // Update the approved client of the non-fungible token
    //         nft.approved = approved; // 授权给了谁
    //         approvedBalance += nft.balance; // 授权的余额增加为门票的总余额
    //     } else {
    //         const balance = parseInt(nft.balance);
    //         if (amount <= 0 || amount > balance) {
    //             throw new Error(`Invalid amount: ${amount}. The amount must be greater than 0 and less than or equal to the current balance: ${balance}`);
    //         }
    
    //         // Check if the amount to be approved is less than or equal to the remaining balance
    //         const remainingBalance = balance - approvedBalance;
    //         if (amount > remainingBalance) {
    //             throw new Error(`Invalid amount: ${amount}. The amount exceeds the remaining balance: ${remainingBalance}`);
    //         }
    
    //         // Update the approved client of the non-fungible token
    //         if (!nft.approvals) {
    //             nft.approvals = {};
    //         }
    //         nft.approvals[approved] = amount; // 授权给了谁和授权的余额
    //         approvedBalance += amount; // 更新授权的余额
    //     }
    
    //     // Update the approved balance in the NFT object
    //     nft.approvedBalance = approvedBalance;
    
    //     // Update the state of the NFT on the ledger
    //     const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
    //     await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));
    
    //     // Emit the Approval event
    //     const approvalEvent = { owner: owner, approved: approved, tokenId: tokenId, amount: amount || nft.balance };
    //     ctx.stub.setEvent('Approval', Buffer.from(JSON.stringify(approvalEvent)));
    
    //     return true;
    // }

    async SetApprovalForAll(ctx, operator, approved) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const sender = x509Object[0].CN;

        const approval = { owner: sender, operator: operator, approved: approved };
        const approvalKey = ctx.stub.createCompositeKey(approvalPrefix, [sender, operator]);
        await ctx.stub.putState(approvalKey, Buffer.from(JSON.stringify(approval)));

        // Emit the ApprovalForAll event
        const approvalForAllEvent = { owner: sender, operator: operator, approved: approved };
        ctx.stub.setEvent('ApprovalForAll', Buffer.from(JSON.stringify(approvalForAllEvent)));

        return true;
    }

    async GetApproved(ctx, tokenId) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const nft = await this.Ticket.ReadNFT(ctx, tokenId);
        return nft.approved;
    }

    async IsApprovedForAll(ctx, owner, operator) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const approvalKey = ctx.stub.createCompositeKey(approvalPrefix, [owner, operator]);
        const approvalBytes = await ctx.stub.getState(approvalKey);
        let approved;
        if (approvalBytes && approvalBytes.length > 0) {
            const approval = JSON.parse(approvalBytes.toString());
            approved = approval.approved;
        } else {
            approved = false;
        }

        return approved;
    }

    // ============== ERC721 metadata extension ===============

    async Name(ctx) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const nameAsBytes = await ctx.stub.getState(nameKey);
        return nameAsBytes.toString();
    }

    async Symbol(ctx) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const symbolAsBytes = await ctx.stub.getState(symbolKey);
        return symbolAsBytes.toString();
    }

    async TokenURI(ctx, tokenId) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const nft = await this.Ticket.ReadNFT(ctx, tokenId);
        return nft.tokenURI;
    }

    // ============== ERC721 enumeration extension ===============

    async TotalSupply(ctx) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        // There is a key record for every non-fungible token in the format of nftPrefix.tokenId.
        // TotalSupply() queries for and counts all records matching nftPrefix.*
        const iterator = await ctx.stub.getStateByPartialCompositeKey(nftPrefix, []);

        // Count the number of returned composite keys
        let totalSupply = 0;
        let result = await iterator.next();
        while (!result.done) {
            totalSupply++;
            result = await iterator.next();
        }
        return totalSupply;
    }

    // ============== Extended Functions for this sample ===============

    async Initialize(ctx, name, symbol) {
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.Ticket.CheckMSPIDAuthorization(clientMSPID, this.Ticket.MSPID)) {
            throw new Error('client is not authorized to initialize');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.Ticket.CheckAdminAuthorization(userID, this.Ticket.admin)) {
            throw new Error('user is not authorized to initialize');
        }

        // if (userID !== '0xskadministrator1') {
        //     throw new Error('user is not authorized to mint new tokens');
        // }

        // Check contract options are not already set, client is not authorized to change them once intitialized
        const nameBytes = await ctx.stub.getState(nameKey);
        if (nameBytes && nameBytes.length > 0) {
            throw new Error('contract options are already set, client is not authorized to change them');
        }

        await ctx.stub.putState(nameKey, Buffer.from(name));
        await ctx.stub.putState(symbolKey, Buffer.from(symbol));
        return true;
    }

    async Mint(ctx, tokenId, to, metadata, ticketFields) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.Ticket.CheckMSPIDAuthorization(clientMSPID, this.Ticket.MSPID)) {
            throw new Error('client is not authorized to mint new tokens');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.Ticket.CheckAdminAuthorization(userID, this.Ticket.admin)) {
            throw new Error('user is not authorized to mint new tokens');
        }

        // Convert metadata and ticketFields strings to objects
        const metadataObj = JSON.parse(metadata);
        const ticketFieldsObj = JSON.parse(ticketFields);


        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw new Error(`The token ${tokenId} is already minted.`);
        }

        // Get tokenURI from metadata
        const tokenURI = metadataObj.tokenURI;

        const nft = {
            tokenId: tokenId,
            owner: to,
            tokenURI: tokenURI,
            ticketFields: ticketFieldsObj
        };
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // A composite key would be balancePrefix.owner.tokenId, which enables partial
        // composite key query to find and count all records matching balance.owner.*
        // An empty value would represent a delete, so we simply insert the null character.
        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [to, tokenId]);
        await ctx.stub.putState(balanceKey, Buffer.from('\u0000'));

        // Emit the Transfer event
        const transferEvent = { from: '0x0', to: to, tokenId: tokenId };
        // 将 JavaScript 对象转换为 JSON 字符串
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return nft;
    }

    async BatchMint(ctx, tokenArray) {
        // Check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.Ticket.CheckMSPIDAuthorization(clientMSPID, this.Ticket.MSPID)) {
            throw new Error('client is not authorized to mint new tokens');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.Ticket.CheckAdminAuthorization(userID, this.Ticket.admin)) {
            throw new Error('user is not authorized to mint new tokens');
        }

        // Initialize an array to hold minted NFT objects
        const mintedNFTs = [];

        const tokenArrays = JSON.parse(tokenArray);

        // Iterate through each object in the tokenArrays
        for (const tokenData of tokenArrays) {
            const { TokenId, Address, MetaData, TicketFields } = tokenData;
            const metaDataString = JSON.stringify(MetaData);
            const ticketFieldsString = JSON.stringify(TicketFields);

            // Directly call the Mint method to complete the casting of a single NFT
            const nft = await this.Mint(ctx, TokenId, Address, metaDataString, ticketFieldsString);

            // Add the minted NFT object to the array
            mintedNFTs.push(nft);
        }

        return mintedNFTs;
    }

    async Burn(ctx, tokenId) {
        // check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const owner = x509Object[0].CN;

        // Check if a caller is the owner of the non-fungible token
        const nft = await this.Ticket.ReadNFT(ctx, tokenId);
        if (nft.owner !== owner) {
            throw new Error(`Non-fungible token ${tokenId} is not owned by ${owner}`);
        }

        // Delete the token
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.deleteState(nftKey);

        // Remove a composite key from the balance of the owner
        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [owner, tokenId]);
        await ctx.stub.deleteState(balanceKey);

        // Emit the Transfer event
        const transferEvent = { from: owner, to: '0x0', tokenId: tokenId };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async ReadNFT(ctx ,tokenId) {
        return await this.Ticket.ReadNFT(ctx, tokenId);
    }

    async _nftExists(ctx, tokenId) {
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        const nftBytes = await ctx.stub.getState(nftKey);
        return nftBytes && nftBytes.length > 0;
    }

    async ClientAccountBalance(ctx) {
        // check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        // Get ID of submitting client identity
        const x509ByteArray = ctx.clientIdentity.getID();
        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const clientAccountID = x509Object[0].CN;

        return this.BalanceOf(ctx, clientAccountID);
    }

    async ClientAccountID(ctx) {
        // check contract options are already set first to execute the function
        await this.Ticket.CheckInitialized(ctx);

        // Get ID of submitting client identity
        const x509ByteArray = ctx.clientIdentity.getID();
        // Parse certificate string into object
        const x509Object = await this.Ticket.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const clientAccountID = x509Object[0].CN;

        return clientAccountID;
    }

    // ============== Ticket business function ===============

    async VerifyTicket(ctx, tokenId) {
        return await this.Ticket.VerifyTicket(ctx, tokenId);
    }

    async UpdateTicketStatus(ctx, tokenId, newStatus) {
        return await this.Ticket.UpdateTicketStatus(ctx, tokenId, newStatus);
    }

    async UpdateTicketInfo(ctx, tokenId, updatedFields) {
        return await this.Ticket.UpdateTicketInfo(ctx, tokenId, updatedFields);
    }

    async GetTicketInfo(ctx, tokenId, ticketField){
        return await this.Ticket.GetTicketInfo(ctx, tokenId, ticketField);
    }

    async UpdateProductSalesPrice(ctx, tokenId, newPrice) {
        return await this.Ticket.UpdateProductSalesPrice(ctx, tokenId, newPrice);
    }

    async SetAdmin(ctx, key, value) {
        return await this.Ticket.SetAdmin(ctx, key, value);
    }

    async GetAdmin() {
        return await this.Ticket.GetAdmin();
    }

    async SetMSPID(ctx, key, value) {
        return await this.Ticket.SetMSPID(ctx, key, value);
    }

    async GetMSPID() {
        return await this.Ticket.GetMSPID();
    }
}

module.exports = main;