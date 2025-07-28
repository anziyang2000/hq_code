/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { nftPrefix, nameKey } = require('../const/constants');

class ticket extends Contract {
    constructor() {
        super();
        this.MSPID = {
            org: 'skdatacenter1',
        };
        this.admin = {
            sk: '0xskadministrator1',
            ad:'111',
            fe:'222'
            // add more administrator information
        };
    }

    async SetAdmin(ctx, key, value) {
        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this.ParseX509String(x509ByteArray);
        const userID = x509Object[0].CN;

        if (userID !== this.admin.sk) {
            throw new Error('Only super admin can set admin');
        }

        if (key === 'sk') {
            throw new Error('Cannot modify default super admin');
        }

        this.admin[key] = value;

        // 发出 AdminSet 事件
        const adminSetEvent = { key: key, value: value };
        ctx.stub.setEvent('AdminSet', Buffer.from(JSON.stringify(adminSetEvent)));

        return true;
    }

    async GetAdmin() {
        return this.admin;
    }

    async SetMSPID(ctx, key, value) {
        const clientMSPID = ctx.clientIdentity.getMSPID();

        if (clientMSPID !== this.MSPID.org) {
            throw new Error('Only super MSPID can set MSPID');
        }

        if (key === 'org') {
            throw new Error('Cannot modify default super MSPID');
        }

        this.MSPID[key] = value;

        // 发出 MSPIDSet 事件
        const mspidSetEvent = { key: key, value: value };
        ctx.stub.setEvent('MSPIDSet', Buffer.from(JSON.stringify(mspidSetEvent)));

        return true;
    }

    async GetMSPID() {
        return this.MSPID;
    }

    async CheckInitialized(ctx) {
        const nameBytes = await ctx.stub.getState(nameKey);
        if (!nameBytes || nameBytes.length === 0) {
            throw new Error('contract options need to be set before calling any function, call Initialize() to initialize contract');
        }
    }

    async ReadNFT(ctx, tokenId) {
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`The tokenId ${tokenId} is invalid. It does not exist`);
        }
        // Parse the string into a JSON-formatted object. This is done to facilitate subsequent operations and access to the non-fungible token object.
        const nft = JSON.parse(nftBytes.toString());
        return nft;
    }

    async ParseX509String(str) {
        const obj = {};
        // Cut off prefix 'x509::'
        const content = str.slice(7);
        // Use '::' to split a string into two parts
        const segments = content.split('::');
        segments.forEach(segment => {
            const innerObj = {};
            // Use '/' to split the string into key-value pairs
            const innerSegments = segment.split('/');
            innerSegments.forEach(innerSegment => {
                const [key, ...valueParts] = innerSegment.split('=');
                const value = valueParts.join('=');
                innerObj[key] = value;
            });
            obj[segments.indexOf(segment)] = innerObj;
        });
        return obj;
    }

    async CheckAdminAuthorization(userID, adminObject) {
        const adminValues = Object.values(adminObject);
        if (adminValues.includes(userID)) {
            // 用户ID匹配其中一个管理员的值
            return true;
        } else {
            return false;
        }
    }

    async CheckMSPIDAuthorization(MSPIDID, MSPIDObject) {
        const MSPIDValues = Object.values(MSPIDObject);
        if (MSPIDValues.includes(MSPIDID)) {
            // 用户ID匹配其中一个管理员的值
            return true;
        } else {
            return false;
        }
    }

    // Update overall ticket information(内部调用)
    async UpdateNFT(ctx, tokenId, updatedNft) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.CheckMSPIDAuthorization(clientMSPID, this.MSPID)) {
            throw new Error('client is not authorized to verify ticket');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        // if (userID !== this.admin.sk) {
        //     throw new Error('user is not authorized to verify ticket');
        // }

        if (!await this.CheckAdminAuthorization(userID, this.admin)) {
            throw new Error('User is not authorized to verify ticket');
        }

        const ticketNft = await this.ReadNFT(ctx, tokenId);

        // Check if ticketNft or its properties are null or undefined before accessing ticketStatus
        if (!ticketNft.ticketFields.ticketInfo || !ticketNft.ticketFields.ticketInfo.ticketStatus) {
            const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(updatedNft)));
            // 触发更新票据信息事件
            const updateTicketEvent = { tokenId: tokenId, updatedNft: updatedNft };
            ctx.stub.setEvent('UpdateTicketEvent', Buffer.from(JSON.stringify(updateTicketEvent)));
        } else if (ticketNft.ticketFields.ticketInfo.ticketStatus === 'completed') {
            throw new Error('The ticket status is completed and cannot be modified.');
        } else {
            const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
            await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(updatedNft)));
            // 触发更新票据信息事件
            const updateTicketEvent = { tokenId: tokenId, updatedNft: updatedNft };
            ctx.stub.setEvent('UpdateTicketEvent', Buffer.from(JSON.stringify(updateTicketEvent)));
        }

        return true;
    }

    // Ticket verification function
    async VerifyTicket(ctx, tokenId) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.CheckMSPIDAuthorization(clientMSPID, this.MSPID)) {
            throw new Error('client is not authorized to verify ticket');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.CheckAdminAuthorization(userID, this.admin)) {
            throw new Error('user is not authorized to verify ticket');
        }

        // Read the NFT information
        const nft = await this.ReadNFT(ctx, tokenId);
        const ticketInfo = nft.ticketFields.ticketInfo;

        // Get the ticket status
        let ticketStatus = ticketInfo.ticketStatus;

        // throw new Error(`ticketStatus:${ticketStatus}`);

        switch (ticketStatus) {
        case 'completed':
            throw new Error('The ticket has been completed and cannot be verified again');
        case 'noIssued':
            throw new Error('Tickets have not been issued yet');
        case 'notWrittenOff':
            // Update ticket status to "已完成"
            ticketInfo.ticketStatus = 'completed';
            // Write updated ticket status back to the NFT
            return await this.UpdateNFT(ctx, tokenId, nft);
        case 'refunded':
            throw new Error('The ticket has been refunded and cannot be verified');
        default:
            throw new Error('unknown status');
        }
    }

    // Modification of ticket verification status
    // async UpdateTicketStatus(ctx, tokenId, newStatus) {
    //     // Check contract options are already set first to execute the function
    //     await CheckInitialized(ctx);

    //     // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
    //     const x509ByteArray = ctx.clientIdentity.getID();

    //     // Parse certificate string into object
    //     const x509Object = await ParseX509String(x509ByteArray);

    //     // Get the CN value in the first object
    //     const userID = x509Object[0].CN;

    //     if (userID !== '0xskadministrator1') {
    //         throw new Error('user is not authorized to update ticket status');
    //     }

    //     // Read the NFT information
    //     const nft = await ReadNFT(ctx, tokenId);

    //     // Check if ticketNft or its properties are null or undefined before accessing ticketStatus
    //     if (!nft.ticketFields.ticketInfo || !nft.ticketFields.ticketInfo.ticketStatus) {
    //         // Update the ticket status
    //         nft.ticketFields.ticketInfo.ticketStatus = newStatus;

    //         // Write updated ticket status back to the NFT
    //         return await UpdateNFT(ctx, tokenId, nft);
    //     } else if (nft.ticketFields.ticketInfo.ticketStatus === 'completed') {
    //         throw new Error('The ticket status is completed and cannot be modified.');
    //     } else {
    //         // Update the ticket status
    //         nft.ticketFields.ticketInfo.ticketStatus = newStatus;

    //         // Write updated ticket status back to the NFT
    //         return await UpdateNFT(ctx, tokenId, nft);
    //     }
    // }

    async UpdateTicketStatus(ctx, tokenId, newStatus) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.CheckMSPIDAuthorization(clientMSPID, this.MSPID)) {
            throw new Error('client is not authorized to update ticket status');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.CheckAdminAuthorization(userID, this.admin)) {
            throw new Error('user is not authorized to update ticket status');
        }

        // Read the NFT information
        const nft = await this.ReadNFT(ctx, tokenId);

        // Check if ticketNft or its properties are null or undefined before accessing ticketStatus
        // 问题：这里的 newStatus 不知道是否需要做判断，限制只能是那几个
        // 记得写 “日志” 激活状态和交易状态打不一样的日志
        if (!nft.ticketFields.ticketInfo || !nft.ticketFields.ticketInfo.ticketStatus) {
            // Update the ticket status
            nft.ticketFields.ticketInfo.ticketStatus = newStatus;

            // Write updated ticket status back to the NFT
            return await this.UpdateNFT(ctx, tokenId, nft);
        } else {
            // Get the current ticket status
            const currentStatus = nft.ticketFields.ticketInfo.ticketStatus;

            // Check for valid state transitions
            switch (currentStatus) {
            case 'noIssued':
                if (newStatus !== 'notWrittenOff') {
                    throw new Error('Invalid status transition. The status can only be updated to "notWrittenOff" from "noIssued".');
                }
                break;
            case 'notWrittenOff':
                if (newStatus !== 'completed' && newStatus !== 'refunded') {
                    throw new Error('Invalid status transition. The status can only be updated to "completed" or "refunded" from "notWrittenOff".');
                }
                break;
            case 'completed':
                throw new Error('The ticket status is completed and cannot be modified.');
            case 'refunded':
                throw new Error('The ticket status is refunded and cannot be modified.');
            default:
                throw new Error('Unknown ticket status.');
            }

            // Update the ticket status
            nft.ticketFields.ticketInfo.ticketStatus = newStatus;

            // Write updated ticket status back to the NFT
            return await this.UpdateNFT(ctx, tokenId, nft);
        }
    }

    // Update ticket information
    // 问题：这个目前没考虑到 “门票状态” 的判断，因为不知道业务是不是需要限制一些字段的更改
    async UpdateTicketInfo(ctx, tokenId, updatedFields) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.CheckMSPIDAuthorization(clientMSPID, this.MSPID)) {
            throw new Error('client is not authorized to update ticket information');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.CheckAdminAuthorization(userID, this.admin)) {
            throw new Error('User is not authorized to update ticket information');
        }

        // Read the NFT information
        const nft = await this.ReadNFT(ctx, tokenId);

        // Check if nft or its properties are null or undefined before accessing ticketStatus
        if (!nft.ticketFields || !nft.ticketFields.ticketInfo || !nft.ticketFields.ticketInfo.ticketStatus) {
            const updatedFieldsObj = JSON.parse(updatedFields);

            // Merge updated fields with existing ticket information
            // const updatedNft = {
            //     ...nft,
            //     ticketFields: {
            //         ...nft.ticketFields,
            //         ...updatedFieldsObj
            //     }
            // };
            // Merge updated fields with existing ticket information
            const updatedNft = Object.assign({}, nft, {
                ticketFields: Object.assign({}, nft.ticketFields, updatedFieldsObj)
            });

            // Write updated ticket information back to the NFT
            return await this.UpdateNFT(ctx, tokenId, updatedNft);
        } else {
            const ticketStatus = nft.ticketFields.ticketInfo.ticketStatus;

            if (ticketStatus === 'completed') {
                throw new Error('The ticket status is completed and cannot be modified.');
            } else {
                const updatedFieldsObj = JSON.parse(updatedFields);

                const updatedNft = Object.assign({}, nft, {
                    ticketFields: Object.assign({}, nft.ticketFields, updatedFieldsObj)
                });

                // Write updated ticket information back to the NFT
                return await this.UpdateNFT(ctx, tokenId, updatedNft);
            }
        }
    }

    async Search(object, field) {
        for (const key in object) {
            if (key === field) {
                return object[key];
            } else if (typeof object[key] === 'object') {
                const result = this.Search(object[key], field);
                if (result !== undefined) {
                    return result;
                }
            }
        }
        return undefined;
    }

    async GetTicketInfo(ctx, tokenId, ticketField) {
        // Check if the contract options have been set to execute the function
        await this.CheckInitialized(ctx);

        // Read NFT information
        const nft = await this.ReadNFT(ctx, tokenId);

        // Check if the TicketFields field exists in the ticket information
        if (!nft.ticketFields) {
            throw new Error(`No ticket information found for Token ${tokenId}`);
        }

        // Retrieve the value of the specified field from ticketFields
        const value = await this.Search(nft.ticketFields, ticketField);

        if (value === undefined) {
            throw new Error(`Field ${ticketField} not found in ticket information for Token ${tokenId}`);
        }

        return value;
    }

    async UpdateProductSalesPrice(ctx, tokenId, newPrice) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (!await this.CheckMSPIDAuthorization(clientMSPID, this.MSPID)) {
            throw new Error('client is not authorized to update product sales price');
        }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this.ParseX509String(x509ByteArray);

        // Get the CN value in the first object
        const userID = x509Object[0].CN;

        if (!await this.CheckAdminAuthorization(userID, this.admin)) {
            throw new Error('User is not authorized to update product sales price');
        }

        // Read the NFT information
        const nft = await this.ReadNFT(ctx, tokenId);

        // Check if nft or its properties are null or undefined before accessing ticketStatus
        if (!nft.ticketFields.ticketInfo || !nft.ticketFields.ticketInfo.ticketStatus) {
            // Update the product sales price
            nft.ticketFields.prices.pricingStrategy.distributor.productSalesPrice = newPrice;

            // Write updated ticket information back to the NFT
            return await this.UpdateNFT(ctx, tokenId, nft);
        } else if (nft.ticketFields.ticketInfo.ticketStatus === 'completed') {
            throw new Error('The ticket status is completed and cannot be modified.');
        } else {
            // Update the product sales price
            nft.ticketFields.prices.pricingStrategy.distributor.productSalesPrice = newPrice;

            // Write updated ticket information back to the NFT
            return await this.UpdateNFT(ctx, tokenId, nft);
        }
    }
}

module.exports = ticket;