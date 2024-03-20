"use strict"

const { MegafonSms } = require('@ao-brsc/megafon-api');
const dotenv = require("dotenv");

dotenv.config();

const megafon = new MegafonSms({
    endpoint: process.env.MEGAFON_ENDPOINT_URL,
    login: process.env.MEGAFON_LOGIN,
    password: process.env.MEGAFON_PASSWORD,
    sender: process.env.MEGAFON_SENDER,
    callback: process.env.MEGAFON_CALLBACK_PATH + "megafon"
});


/**
 * Верификация аккаунта по номеру телефона
 * @param {string} phone - данные запроса, тело и строка
 */
const reg = async (phone) => {  
    let userId;
    try {
        userId = await pool.query('SELECT user_id FROM users WHERE phone_number = $1', [phone]);
    } catch (e) {
        // if (e instanceof pgp.errors.QueryResultError && e.code === pgp.errors.queryResultErrorCode.noData) {
        //     throw new VerificationError(VerificationError.codes.noSuchUser);
        // }
        console.log(e)
    }

    const userVerifyCode = "Yurta:user:" + userId.rows[0].user_id;
    const isUserVerifyCode = await redis.get(userVerifyCode);

    if(!isUserVerifyCode){

        /** Код аутентификации */
        const verificationCode = verifyCodeGenerator();

        redis.set(userVerifyCode, userVerifyCode)

        /* Формирование и отправка сообщения */
        await megafon.sms({ to: parseInt(phone), message: "Тестовая отправка кода верификации: " + verificationCode });

        return `Выслан код на ${phone}`
    }else{
        return "Код уже выслан"
    }
}

/**
 * Аутентификация аккаунта по номеру телефона
 * @param {string} phone - данные запроса, тело и строка
 */
const auth = async (phone) => {
    let userId;
    try {
        userId = await pool.query('SELECT user_id FROM users WHERE phone_number = $1', [phone]);
    } catch (e) {
        // if (e instanceof pgp.errors.QueryResultError && e.code === pgp.errors.queryResultErrorCode.noData) {
        //     throw new VerificationError(VerificationError.codes.noSuchUser);
        // }
        console.log(e)
    }

    const userVerifyCode = "Yurta:user:" + userId.rows[0].user_id;
    const isUserVerifyCode = await redis.get(userVerifyCode);

    if(!isUserVerifyCode){

        /** Код аутентификации */
        const verificationCode = verifyCodeGenerator();

        redis.set(userVerifyCode, userVerifyCode)

        /* Формирование и отправка сообщения */
        await megafon.sms({ to: parseInt(phone), message: "Тестовая отправка кода для входа по телефону: " + verificationCode });

        return `Выслан код на ${phone}`
    }else{
        return "Код уже выслан"
    }
}


const phoneVerification = async ({ phone, code }) => {

    let response;
    if(!code){
        response = await reg(phone);
    }else{
        response = await auth(phone);
    }

    return response

}

module.exports = { phoneVerification }