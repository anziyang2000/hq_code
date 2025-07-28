/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const CryptoJS = require('crypto-js');

class createId extends Contract {
    constructor() {
        super();
        this.SECRET_BYTES = '5^6&7*81@2#3$4%9';
        this.UNDERLINE = '|';
    }

    async createId(scenicId, date, proTypeInt, rand) {
        // Remove hyphens "-" from the date string
        date = date.replace(/-/g, '');
        return scenicId + date + proTypeInt + rand;
    }

    async createSign(createId, enterTime, time, checkPointIds, certificate, playerNum, UUID) {
        const key = certificate ? CryptoJS.enc.Utf8.parse(certificate) : this.SECRET_BYTES;

        // Remove hyphens "-" from the date string
        enterTime = enterTime.replace(/-/g, '');
        let sb = createId + this.UNDERLINE + enterTime + this.UNDERLINE + time + this.UNDERLINE;

        const joiner = [];
        checkPointIds.forEach(a => {
            joiner.push(String(a));
        });
        sb += joiner.join(',') + this.UNDERLINE + playerNum + this.UNDERLINE;
        sb += UUID;

        const sign = sb.toString();
        const encode = CryptoJS.AES.encrypt(sb, key, {
            mode: CryptoJS.mode.ECB, // 注意：ECB模式通常不推荐用于加密，因为它不提供安全性。你可能需要改为CBC或其他模式
            padding: CryptoJS.pad.Pkcs7
        }).toString(); // 默认就是Base64

        return { sign, encode };
    }

    async getShareTime(timeShareId, timeShareBook, beginTime, endTime) {
        let time = '';
        if (timeShareId !== null) {
            switch (timeShareBook) {
            case 0:
                time = beginTime + '-' + endTime;
                break;
            case 1:
                time = '00:00-' + endTime;
                break;
            case 2:
                time = beginTime + '-23:59';
                break;
            case 3:
                time = '00:00-23:59';
                break;
            }
        } else {
            time = '00:00-23:59';
        }
        return time;
    }

    async createTicketId(ticketsData) {
        const ticketInfoArray = [];

        for (const ticketData of ticketsData) {
            const time = await this.getShareTime(ticketData.time_share_id , ticketData.time_share_book , ticketData.begin_time , ticketData.end_time );

            // Generate ticket ID
            const ticketId = await this.createId(ticketData.scenic_id , ticketData.enter_time , ticketData.certificate , ticketData.rand );

            // Generate signature and QR code
            const { sign, encode } = await this.createSign(ticketId, ticketData.enter_time, time, ticketData.check_point_ids , ticketData.certificate, ticketData.player_num , ticketData.uuid );

            // Add ticket information to the array
            ticketInfoArray.push({
                ticket_number: ticketId,
                sign: sign,
                print_encode: encode
            });
        }

        return ticketInfoArray;
    }

}

module.exports = createId;