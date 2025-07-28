/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class errorObj extends Contract {
    constructor() {
        super();
    }

    createError(code, msg) {
        const errorObject = {
            contract_code: code,
            contract_msg: msg
        };
        return new Error(JSON.stringify(errorObject));
    }
}

module.exports = errorObj;