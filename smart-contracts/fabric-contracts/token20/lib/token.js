/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const { balancePrefix, allowancePrefix, nameKey, symbolKey, decimalsKey, totalSupplyKey, lockKey } = require('./const/constants');

class Token extends Contract {
    constructor() {
        super();
    }

    async TestTime (ctx) {
        const aaa = await ctx.stub.getTxTimestamp();
        return aaa
    }

    async TokenName(ctx) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        const nameBytes = await ctx.stub.getState(nameKey);

        return nameBytes.toString();
    }

    async Symbol(ctx) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        const symbolBytes = await ctx.stub.getState(symbolKey);
        return symbolBytes.toString();
    }

    async Decimals(ctx) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        const decimalsBytes = await ctx.stub.getState(decimalsKey);
        const decimals = parseInt(decimalsBytes.toString());
        return decimals;
    }

    async TotalSupply(ctx) {
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
        const totalSupply = parseInt(totalSupplyBytes.toString());
        return totalSupply;
    }

    async BalanceOf(ctx, owner) {
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [owner]);

        const balanceBytes = await ctx.stub.getState(balanceKey);
        if (!balanceBytes || balanceBytes.length === 0) {
            throw new Error(`the account ${owner} does not exist`);
        }
        const balance = parseInt(balanceBytes.toString());

        return balance;
    }

    async Transfer(ctx, to, value) {
        const from = await this.ClientAccountID(ctx);

        const transferResp = await this._transfer(ctx, from, to, value);
        if (!transferResp) {
            throw new Error('Failed to transfer');
        }

        // Emit the Transfer event
        const transferEvent = { from, to, value: parseInt(value) };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async TransferFrom(ctx, from, to, value) {
        const spender = await this.ClientAccountID(ctx);

        // Retrieve the allowance of the spender
        const allowanceKey = ctx.stub.createCompositeKey(allowancePrefix, [from, spender]);
        const currentAllowanceBytes = await ctx.stub.getState(allowanceKey);

        if (!currentAllowanceBytes || currentAllowanceBytes.length === 0) {
            throw new Error(`spender ${spender} has no allowance from ${from}`);
        }

        const currentAllowance = parseInt(currentAllowanceBytes.toString());

        // Convert value from string to int
        const valueInt = parseInt(value);

        // Check if the transferred value is less than the allowance
        if (currentAllowance < valueInt) {
            throw new Error('The spender does not have enough allowance to spend.');
        }

        const transferResp = await this._transfer(ctx, from, to, value);
        if (!transferResp) {
            throw new Error('Failed to transfer');
        }

        // Decrease the allowance
        const updatedAllowance = this.sub(currentAllowance, valueInt);
        await ctx.stub.putState(allowanceKey, Buffer.from(updatedAllowance.toString()));

        // Emit the Transfer event
        const transferEvent = { from, to, value: valueInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async _transfer(ctx, from, to, value) {
        if (from === to) {
            throw new Error('cannot transfer to and from same client account');
        }

        // Convert value from string to int
        const valueInt = parseInt(value);

        if (valueInt < 0) { // transfer of 0 is allowed in ERC20, so just validate against negative amounts
            throw new Error('transfer amount cannot be negative');
        }

        // Retrieve the current balance of the sender
        const fromBalanceKey = ctx.stub.createCompositeKey(balancePrefix, [from]);
        const fromCurrentBalanceBytes = await ctx.stub.getState(fromBalanceKey);

        if (!fromCurrentBalanceBytes || fromCurrentBalanceBytes.length === 0) {
            throw new Error(`client account ${from} has no balance`);
        }

        const fromCurrentBalance = parseInt(fromCurrentBalanceBytes.toString());

        // Check if the sender has enough tokens to spend.
        if (fromCurrentBalance < valueInt) {
            throw new Error(`client account ${from} has insufficient funds.`);
        }

        // Retrieve the current balance of the recepient
        const toBalanceKey = ctx.stub.createCompositeKey(balancePrefix, [to]);
        const toCurrentBalanceBytes = await ctx.stub.getState(toBalanceKey);

        let toCurrentBalance;
        // If recipient current balance doesn't yet exist, we'll create it with a current balance of 0
        if (!toCurrentBalanceBytes || toCurrentBalanceBytes.length === 0) {
            toCurrentBalance = 0;
        } else {
            toCurrentBalance = parseInt(toCurrentBalanceBytes.toString());
        }

        // Update the balance
        const fromUpdatedBalance = this.sub(fromCurrentBalance, valueInt);
        const toUpdatedBalance = this.add(toCurrentBalance, valueInt);

        await ctx.stub.putState(fromBalanceKey, Buffer.from(fromUpdatedBalance.toString()));
        await ctx.stub.putState(toBalanceKey, Buffer.from(toUpdatedBalance.toString()));

        return true;
    }

    async Approve(ctx, spender, value) {
        const owner = await this.ClientAccountID(ctx);

        const allowanceKey = ctx.stub.createCompositeKey(allowancePrefix, [owner, spender]);

        let valueInt = parseInt(value);
        await ctx.stub.putState(allowanceKey, Buffer.from(valueInt.toString()));

        // Emit the Approval event
        const approvalEvent = { owner, spender, value: valueInt };
        ctx.stub.setEvent('Approval', Buffer.from(JSON.stringify(approvalEvent)));

        return true;
    }

    async Allowance(ctx, owner, spender) {
        // Check contract options are already set first to execute the function
        await this.CheckInitialized(ctx);

        // 检查合约是否被锁定，如果被锁定则拒绝调用
        if (this.locked) {
            throw new Error('The contract is locked. Call not allowed.');
        }

        const allowanceKey = ctx.stub.createCompositeKey(allowancePrefix, [owner, spender]);

        const allowanceBytes = await ctx.stub.getState(allowanceKey);
        if (!allowanceBytes || allowanceBytes.length === 0) {
            throw new Error(`spender ${spender} has no allowance from ${owner}`);
        }

        const allowance = parseInt(allowanceBytes.toString());
        return allowance;
    }

    async Initialize(ctx, name, symbol, decimals, org, admin) {
        // 检查 contract options 是否已经设置，合约初始化后不允许再次设置
        const nameBytes = await ctx.stub.getState(nameKey);
        if (nameBytes && nameBytes.length > 0) {
            throw new Error('contract options are already set, client is not authorized to change them');
        }

        // 设置合约的名称、符号和小数位数
        await ctx.stub.putState(nameKey, Buffer.from(name));
        await ctx.stub.putState(symbolKey, Buffer.from(symbol));
        await ctx.stub.putState(decimalsKey, Buffer.from(decimals));
        // 初始化 Lock 的状态
        await ctx.stub.putState(lockKey, Buffer.from('false'));
        // 初始化对合约的操作者
        const orgAdminBytes = await ctx.stub.getState('orgAdminMapping');
        let orgAdminMapping;
        if (orgAdminBytes && orgAdminBytes.length > 0) {
            throw new Error('Contract options are already set, client is not authorized to change them');
        } else {
            orgAdminMapping = {};
        }

        if (!org) {
            throw new Error('Organization must be provided');
        }

        if (!admin) {
            throw new Error('Admin must be provided');
        }

        // 向该组织对应的 admin 数组中添加新的管理员
        orgAdminMapping[org] = [admin]; // 将 admin 初始化为数组

        // 将更新后的 orgAdminMapping 写回区块链
        await ctx.stub.putState('orgAdminMapping', Buffer.from(JSON.stringify(orgAdminMapping)));

        return true;
    }

    // async Init(ctx, org, admin) {
    //     // 检查是否已经设置了 org 和 admin
    //     const bytes = await ctx.stub.getState('orgAdminMapping');
    //     if (bytes && bytes.length > 0) {
    //         throw new Error('org and admin have been set up');
    //     }

    //     const orgAdminBytes = await ctx.stub.getState('orgAdminMapping');
    //     let orgAdminMapping;
    //     if (orgAdminBytes && orgAdminBytes.length > 0) {
    //         throw new Error('Contract options are already set, client is not authorized to change them');
    //     } else {
    //         orgAdminMapping = {};
    //     }

    //     if (!org) {
    //         throw new Error('Organization must be provided');
    //     }

    //     if (!admin) {
    //         throw new Error('Admin must be provided');
    //     }

    //     // 向该组织对应的 admin 数组中添加新的管理员
    //     orgAdminMapping[org] = [admin]; // 将 admin 初始化为数组

    //     // 将更新后的 orgAdminMapping 写回区块链
    //     await ctx.stub.putState('orgAdminMapping', Buffer.from(JSON.stringify(orgAdminMapping)));

    //     return true;
    // }

    async Mint(ctx, amount) {
        const minter = await this.ClientAccountID(ctx);

        // 获取 orgAdminMapping
        const orgAdminBytes = await ctx.stub.getState('orgAdminMapping');
        if (!orgAdminBytes || orgAdminBytes.length === 0) {
            throw new Error('orgAdminMapping is not set. Please call Init first');
        }
        const orgAdminMapping = JSON.parse(orgAdminBytes.toString());

        // 获取 org 和 admin
        const clientMSPID = ctx.clientIdentity.getMSPID();

        // 检查调用者是否有权限铸造新代币
        const authorizedAdmin = orgAdminMapping[clientMSPID];
        if (!authorizedAdmin || !authorizedAdmin.includes(minter)) {
            throw new Error('client is not authorized to mint new tokens');
        }

        const amountInt = parseInt(amount);
        if (amountInt <= 0) {
            throw new Error('mint amount must be a positive integer');
        }

        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [minter]);

        const currentBalanceBytes = await ctx.stub.getState(balanceKey);
        // If minter current balance doesn't yet exist, we'll create it with a current balance of 0
        let currentBalance;
        if (!currentBalanceBytes || currentBalanceBytes.length === 0) {
            currentBalance = 0;
        } else {
            currentBalance = parseInt(currentBalanceBytes.toString());
        }
        const updatedBalance = this.add(currentBalance, amountInt);

        await ctx.stub.putState(balanceKey, Buffer.from(updatedBalance.toString()));

        // Increase totalSupply
        const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
        let totalSupply;
        if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
            totalSupply = 0;
        } else {
            totalSupply = parseInt(totalSupplyBytes.toString());
        }
        totalSupply = this.add(totalSupply, amountInt);
        await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()));

        // Emit the Transfer event
        const transferEvent = { from: '0x0', to: minter, value: amountInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async Burn(ctx, amount) {
        const minter = await this.ClientAccountID(ctx);

        // 获取 orgAdminMapping
        const orgAdminBytes = await ctx.stub.getState('orgAdminMapping');
        if (!orgAdminBytes || orgAdminBytes.length === 0) {
            throw new Error('orgAdminMapping is not set. Please call Init first');
        }
        const orgAdminMapping = JSON.parse(orgAdminBytes.toString());

        // 获取 org 和 admin
        const clientMSPID = ctx.clientIdentity.getMSPID();

        // 检查调用者是否有权限燃烧代币
        const authorizedAdmin = orgAdminMapping[clientMSPID];
        if (!authorizedAdmin || !authorizedAdmin.includes(minter)) {
            throw new Error('client is not authorized to burn new tokens');
        }

        const amountInt = parseInt(amount);

        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [minter]);

        const currentBalanceBytes = await ctx.stub.getState(balanceKey);
        if (!currentBalanceBytes || currentBalanceBytes.length === 0) {
            throw new Error('The balance does not exist');
        }
        const currentBalance = parseInt(currentBalanceBytes.toString());
        const updatedBalance = this.sub(currentBalance, amountInt);

        await ctx.stub.putState(balanceKey, Buffer.from(updatedBalance.toString()));

        // Decrease totalSupply
        const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
        if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
            throw new Error('totalSupply does not exist.');
        }
        const totalSupply = this.sub(parseInt(totalSupplyBytes.toString()), amountInt);
        await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()));

        // Emit the Transfer event
        const transferEvent = { from: minter, to: '0x0', value: amountInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    async ClientAccountBalance(ctx) {
        const clientAccountID = await this.ClientAccountID(ctx);

        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [clientAccountID]);
        const balanceBytes = await ctx.stub.getState(balanceKey);
        if (!balanceBytes || balanceBytes.length === 0) {
            throw new Error(`the account ${clientAccountID} does not exist`);
        }
        const balance = parseInt(balanceBytes.toString());

        return balance;
    }

    async ClientAccountID(ctx) {
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const x509ByteArray = ctx.clientIdentity.getID();

        // Parse certificate string into object
        const x509Object = await this._parseX509String(x509ByteArray);

        // Get the CN value in the first object
        const clientAccountID = x509Object[0].CN;

        return clientAccountID;
    }

    async CheckInitialized(ctx){
        const nameBytes = await ctx.stub.getState(nameKey);
        if (!nameBytes || nameBytes.length === 0) {
            throw new Error('contract options need to be set before calling any function, call Initialize() to initialize contract');
        }
    }

    async CheckLocked(ctx) {
        const lockBytes = await ctx.stub.getState(lockKey);
        if (lockBytes && lockBytes.length > 0) {
            const lockStatus = lockBytes.toString();
            if (lockStatus === 'true') {
                throw new Error('The contract is locked. Call not allowed.');
            }
        }
    }

    add(a, b) {
        let c = a + b;
        if (a !== c - b || b !== c - a){
            throw new Error(`Math: addition overflow occurred ${a} + ${b}`);
        }
        return c;
    }

    sub(a, b) {
        let c = a - b;
        if (a !== c + b || b !== a - c){
            throw new Error(`Math: subtraction overflow occurred ${a} - ${b}`);
        }
        return c;
    }

    async Fee(ctx, user, feeAmount) {
        await this.CheckInitialized(ctx);
        await this.CheckLocked(ctx);

        // Convert fee amount from string to integer
        const fee = parseInt(feeAmount);

        // Check if fee amount is positive
        if (fee <= 0) {
            throw new Error('Fee amount must be a positive integer');
        }

        // Check if user has sufficient balance to cover the fee using BalanceOf function
        const userBalance = await this.BalanceOf(ctx, user);
        if (userBalance < fee) {
            throw new Error(`User ${user} has insufficient funds to cover the fee`);
        }

        // Deduct fee from user's balance and burn it
        const updatedUserBalance = this.sub(userBalance, fee);
        const userBalanceKey = ctx.stub.createCompositeKey(balancePrefix, [user]);
        await ctx.stub.putState(userBalanceKey, Buffer.from(updatedUserBalance.toString()));

        // Burn the fee
        await this.Burn(ctx, fee);

        return true;
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

    async SetLock(ctx) {
        await this.CheckInitialized(ctx);

        const clientMSPID = ctx.clientIdentity.getMSPID();
        const orgAdminBytes = await ctx.stub.getState('orgAdminMapping');
        if (!orgAdminBytes || orgAdminBytes.length === 0) {
            throw new Error('orgAdminMapping is not set. Please call Init first');
        }
        const orgAdminMapping = JSON.parse(orgAdminBytes.toString());
        const authorizedAdmin = orgAdminMapping[clientMSPID];

        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this._parseX509String(x509ByteArray);
        const userID = x509Object[0].CN;
        if (!authorizedAdmin || !authorizedAdmin.includes(userID)) {
            throw new Error('user is not authorized to lock');
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

    async GetLock(ctx) {
        await this.CheckInitialized(ctx);

        const lockBytes = await ctx.stub.getState(lockKey);
        if (!lockBytes || lockBytes.length === 0) {
            throw new Error('Lock status not available');
        }

        const lockStatus = lockBytes.toString() === 'true';
        return lockStatus;
    }

    // 向 orgAdminMapping 中添加属性
    async SetOrgAdmin(ctx, org, admin) {
        // 获取现有的 orgAdminMapping
        let orgAdminMapping = await this._getOrgAdminMapping(ctx);

        // 判断是某个 org 下的 admin 才可以调用增加函数
        const clientMSPID = ctx.clientIdentity.getMSPID();
        const x509ByteArray = ctx.clientIdentity.getID();
        const x509Object = await this._parseX509String(x509ByteArray);
        const userID = x509Object[0].CN;
        await this._adminExistsInOrg(ctx, clientMSPID, userID);

        // 如果 orgAdminMapping 中不存在该组织，则初始化为一个空数组
        if (!orgAdminMapping[org]) {
            orgAdminMapping[org] = [];
        }

        // 向该组织对应的 admin 数组中添加新的管理员
        if (admin) {
            // 仅在 admin 不存在于数组中时才添加
            if (!orgAdminMapping[org].includes(admin)) {
                orgAdminMapping[org].push(admin);
            }
        }

        // 将更新后的 orgAdminMapping 写回区块链
        await ctx.stub.putState('orgAdminMapping', Buffer.from(JSON.stringify(orgAdminMapping)));

        return true;
    }

    async GetOrgAdmins(ctx) {
        return await this._getOrgAdminMapping(ctx);
    }

    async _getOrgAdminMapping(ctx) {
        // 从区块链中获取 orgAdminMapping
        const orgAdminMappingAsBytes = await ctx.stub.getState('orgAdminMapping');
        if (!orgAdminMappingAsBytes || orgAdminMappingAsBytes.length === 0) {
            return {};  // 如果不存在，返回空对象
        }
        return JSON.parse(orgAdminMappingAsBytes.toString());
    }

    async _adminExistsInOrg(ctx, org, admin) {
        // 获取现有的 orgAdminMapping
        let orgAdminMapping = await this._getOrgAdminMapping(ctx);

        // 检查组织是否存在
        if (!orgAdminMapping.hasOwnProperty(org)) {
            throw new Error('Organization does not exist');
        }

        // 检查 admin 是否存在于组织中
        const admins = orgAdminMapping[org];
        if (admins.includes(admin)) {
            return true; // Admin exists in the organization
        } else {
            throw new Error('Admin does not exist in the organization');
        }
    }

    // async Test(ctx) {
    //     await ctx.stub.putState('value', Buffer.from('1'));
    //     return true;
    // }

    async TestMVCC(ctx) {
        // 读取当前存储的值
        const currentValueBytes = await ctx.stub.getState('value');
        let newValue = '1'; // 默认值
    
        if (currentValueBytes && currentValueBytes.length > 0) {
            const currentValue = currentValueBytes.toString();
            // 切换值
            newValue = currentValue === '1' ? '2' : '1';
        }
    
        // 存储新值
        await ctx.stub.putState('value', Buffer.from(newValue));
        return true;
    }

    async Test(ctx) {
        await ctx.stub.putState('value', Buffer.from('1'));
        return true;
    }
    
    async ReadValue(ctx) {
        // 读取当前存储的值
        const valueBytes = await ctx.stub.getState('value');
        
        if (!valueBytes || valueBytes.length === 0) {
            return 'No value found';
        }
    
        return valueBytes.toString();
    }
    
    

}

module.exports = Token;
