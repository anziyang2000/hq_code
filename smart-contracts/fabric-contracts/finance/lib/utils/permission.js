/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { nameKey, lockKey, orgAdminMappingKey, contractCode } = require('../const/constants');
const verify = require('./verify');
const errorObj = require('./error');

class permission extends Contract {
    constructor() {
        super();
        this.Verify = new verify();
        this.ErrorObj = new errorObj();
    }

    /**
     * Set organization administrator.
     * Only admins under a specific org can call this function to add a new admin.
     *
     * @param {Object} ctx - Transaction context object
     * @param {string} org - Organization name
     * @param {string} admin - Administrator name
     * @returns {boolean} Returns true if operation succeeds
     * @throws {Error} If organization doesn't exist or admin already exists
     */
    async setOrgAdmin(ctx, org, admin) {
        this.Verify.checkFieldsNotEmpty({ org, admin });
        // Get the existing orgAdminMapping
        let orgAdminMapping = await this._getOrgAdminMapping(ctx);

        // Only admins under a certain org can call the add function
        const clientMSPID = ctx.clientIdentity.getMSPID();
        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this._parseX509String(x509ByteArray);
        const userID = x509Object[0].CN;
        await this._adminExistsInOrg(ctx, clientMSPID, userID);

        // If the organization does not exist in orgAdminMapping, initialize it to an empty array
        if (!orgAdminMapping[org]) {
            orgAdminMapping[org] = [];
        }

        // Add a new administrator to the admin array corresponding to the organization
        // Only add admin if it doesn't already exist in the array
        if (!orgAdminMapping[org].includes(admin)) {
            orgAdminMapping[org].push(admin);
        }

        // Write the updated orgAdminMapping back to the blockchain
        await ctx.stub.putState('orgAdminMapping', Buffer.from(JSON.stringify(orgAdminMapping)));

        return true;
    }

    /**
     * Get the mapping of all organization administrators.
     *
     * @param {Object} ctx - Transaction context object
     * @returns {Object} Object containing mapping of all organization admins
     */
    async getOrgAdmins(ctx) {
        return await this._getOrgAdminMapping(ctx);
    }

    /**
     * Get organization admin mapping.
     *
     * @param {Object} ctx - Transaction context object
     * @returns {Object} Object containing organization admin mapping, or empty object if none exists
     */
    async _getOrgAdminMapping(ctx) {
        const orgAdminMappingAsBytes = await ctx.stub.getState(orgAdminMappingKey);
        if (!orgAdminMappingAsBytes || orgAdminMappingAsBytes.length === 0) {
            return {};  // If it does not exist, return an empty object
        }
        return JSON.parse(orgAdminMappingAsBytes.toString());
    }

    /**
     * Check if the contract is initialized.
     * Throws an error if not initialized.
     *
     * @param {Object} ctx - Transaction context object
     * @throws {Error} If contract is not initialized
     */
    async checkInitialized(ctx) {
        const nameBytes = await ctx.stub.getState(nameKey);
        if (!nameBytes || nameBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.serviceError.init,
                'checkInitialized: Please call Initialize() to initialize the contract first'
            );
        }
    }

    async _parseX509String(str) {
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

    /**
     * Check if an admin exists in a specific organization.
     *
     * @param {Object} ctx - Transaction context object
     * @param {string} org - Organization name
     * @param {string} admin - Administrator name
     * @returns {boolean} Returns true if admin exists in the organization
     * @throws {Error} If organization doesn't exist or admin doesn't exist
     */
    async _adminExistsInOrg(ctx, org, admin) {
        this.Verify.checkFieldsNotEmpty({ org, admin });
        // Get the existing orgAdminMapping
        let orgAdminMapping = await this._getOrgAdminMapping(ctx);

        // Check if the organization exists
        if (!orgAdminMapping.hasOwnProperty(org)) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `_adminExistsInOrg: Organization ${org} does not exist`
            );
        }

        // Check if admin exists in the organization
        const admins = orgAdminMapping[org];
        if (admins.includes(admin)) {
            return true; // Admin exists in the organization
        } else {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                `_adminExistsInOrg: Admin ${admin} does not exist in the organization ${org}`
            );
        }
    }

    /**
     * Check if user is an admin and get user ID.
     * Requires checking contract initialization and contract lock status.
     *
     * @param {Object} ctx - Transaction context object
     * @throws {Error} If contract is not initialized, user is not admin, or contract is locked
     */
    async checkAdminAndGetUserID(ctx) {
        await this.checkInitialized(ctx);
        await this._checkLocked(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this._parseX509String(x509ByteArray);
        const userID = x509Object[0].CN;

        await this._adminExistsInOrg(ctx, clientMSPID, userID);
    }

    /**
     * Set the lock status of the contract.
     * Only authorized admins can call this function to lock or unlock the contract.
     *
     * @param {Object} ctx - Transaction context object
     * @returns {boolean} Returns true if successfully set lock status
     * @throws {Error} If contract is not initialized, user is not authorized, or operation cannot be executed
     */
    async setLock(ctx) {
        await this.checkInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        const orgAdminBytes = await ctx.stub.getState(orgAdminMappingKey);
        if (!orgAdminBytes || orgAdminBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.serviceError.init,
                'orgAdminMapping is not set. Please call Init first'
            );
        }
        const orgAdminMapping = JSON.parse(orgAdminBytes.toString());
        const authorizedAdmin = orgAdminMapping[clientMSPID];

        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this._parseX509String(x509ByteArray);
        const userID = x509Object[0].CN;
        if (!authorizedAdmin || !authorizedAdmin.includes(userID)) {
            throw this.ErrorObj.createError(
                contractCode.serviceError.identity,
                `user ${userID} is not authorized to lock`
            );
        }

        const lockBytes = await ctx.stub.getState(lockKey);
        let lockStatus = false;
        if (lockBytes && lockBytes.length > 0) {
            lockStatus = lockBytes.toString() === 'true';
        }

        const newLockStatus = !lockStatus;
        await ctx.stub.putState(lockKey, Buffer.from(newLockStatus.toString()));
        return true;
    }

    /**
     * Get the current lock status of the contract.
     *
     * @param {Object} ctx - Transaction context object
     * @returns {boolean} Returns true if contract is locked, false otherwise
     * @throws {Error} If unable to retrieve lock status
     */
    async getLock(ctx) {
        await this.CheckInitialized(ctx);

        const lockBytes = await ctx.stub.getState(lockKey);
        if (!lockBytes || lockBytes.length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notExist,
                'getLock: Lock status not available'
            );
        }

        const lockStatus = lockBytes.toString() === 'true';
        return lockStatus;
    }

    /**
     * Check if the contract is locked.
     * Throws an error if the contract is locked.
     *
     * @param {Object} ctx - Transaction context object
     * @throws {Error} If contract is locked
     */
    async _checkLocked(ctx) {
        const lockBytes = await ctx.stub.getState(lockKey);
        if (lockBytes && lockBytes.length > 0) {
            const lockStatus = lockBytes.toString();
            // TODO：改成布尔值
            if (lockStatus === 'true') {
                throw this.ErrorObj.createError(
                    contractCode.serviceError.lock,
                    '_checkLocked: Contract is being upgraded and cannot be called'
                );
            }
        }
    }

}

module.exports = permission;