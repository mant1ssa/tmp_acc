"use strict"

const verificationMethodsAdapters = require('../gateways');

module.exports = {
    ACCOUNT_AUTH: {
        SMS: (params) => verificationMethodsAdapters.MEGAFON.phoneVerification({ ...params }),
        MAIL: (params) => verificationMethodsAdapters.YANDEX_MAIL.mailVerification({ ...params })
    },
    PASSWORD_RECOVERY: {
        SMS: (params) => verificationMethodsAdapters.MEGAFON.recover({ ...params }),
        MAIL: (params) => verificationMethodsAdapters.YANDEX_MAIL.recover({ ...params })
    }
}