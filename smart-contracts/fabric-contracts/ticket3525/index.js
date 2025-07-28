/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const main = require('./lib/main');
const ticket = require('./lib/ticket/ticket');

module.exports.main = main;
module.exports.ticket = ticket;
module.exports.contracts = [main, ticket];