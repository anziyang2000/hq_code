/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const config = require('../../config');

class debug extends Contract {
    constructor() {
        super();
    }

    logDebug(message, data = null) {
        if (config.debug) {
            if (data) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    }
}

module.exports = debug;