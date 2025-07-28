/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const TicketFields = {
    ticketType: '',
    scenceInfo: {
        scenicName: '',
        rating: '',
        businessTime: '',
        location: '',
        enterpriseName: '',
        merchantId: ''
    },
    rules: {
        ticketingRules: {
            ticketingType: '',
            usageTimeAfterPurchase: '',
            ticketingPeriod: '',
            realNameVerification: '',
            realNameVerificationValidation:'',
            personalPurchaseRestriction: '',
            ticketIssuanceImmediateVerification: '',
            windowSaleOnly: ''
        },
        refundRules: {
            refundable: '',
            refundPeriodRate: ''
        },
        checkRules: {
            realNameVerificationIdMethod: '',
            checkpoint: '',
            passageWay: '',
            timedTicketReservation: ''
        }
    },
    productsItems: {
        products: {
            productType: '',
            productName: '',
            validDuration: '',
            firstDayActivation: '',
            daysValidForEntry: '',
            usageCount: '',
            sellByWeek: '',
            productsTimedReservation: '',
            entryStatistics: '',
            entryRequirements: ''
        },
        items: {
            itemName: '',
            ticketCategory: '',
            purchaseQuantityControl: ''
        },
        inventory: {
            totalInventory: '',
            timedInventory: '',
            purchaseValidityDate: '',
            entryValidityDate: ''
        }
    },
    prices: {
        initalInfo: {
            marketStandardPrice: '',
            specialDiscountRate: '',
            distributionDiscountRange: ''
        },
        pricingStrategy: {
            directSales: {
                directSinglePurchasePrice: '',
                directCombinedPurchasePrice: ''
            },
            agent: {
                agentSinglePurchasePrice: '',
                agentCombinedPurchasePrice: '',
                commissionRatio: ''
            },
            distributor: {
                productSalesPrice: '',
                itemSalesPrice: ''
            }
        }
    },
    ticketInfo: {
        ticketNumber: '',
        itemInfo: {
            sellingPrice: ''
        },
        numberOfPeople: '',
        userIdentityInfo: {
            userName: '',
            idNumber: ''
        },
        entryTime: '',
        ticketTimedReservation: '',
        ticketStatus: '',
        ticketReceiverInfo: {
            contactPerson: '',
            contactNumber: '',
            idCard: ''
        },
        verificationRecords: {
            verificationDeviceNameType: '',
            idCardRecognitionType: '',
            verificationTime: '',
            verificationCount: ''
        },
        refundRecords: {
            refundTime: '',
            refundReason: '',
            refundAmount: ''
        }
    }
};

module.exports = TicketFields;




