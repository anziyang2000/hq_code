/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const businessContract = require('./lib/businessContract.js');

module.exports.BusinessContract = businessContract;
module.exports.contracts = [businessContract];
