const dotenv = require("dotenv");
const { pool } = require("./base.js")
const { createAndBindToken, getTokenData, generateToken } = require("./token.js");
const bcrypt = require("bcrypt");
const { response } = require("express");
const redis = require('../redis/index.js')
const { sendMail } = require('./mail.js')
const verificationModule = require("../verification");
const emailSend = require("../verification/adapters/methods");
const ApiErrors = require("./response.js");
// const defaultCoercers = require("../coercer")


dotenv.config();

// Coercers
// const signupCoercer = [
//     { field: 'email', coercer: defaultCoercers.email },
//     { field: 'phone', coercer: defaultCoercers.russianPhoneNumber },
//     { field: 'password', coercer: defaultCoercers.password },
//     { field: 'name', coercer: defaultCoercers.russianName },
//     { field: 'surname', coercer: defaultCoercers.russianName },
//     { field: 'patronymic', coercer: defaultCoercers.russianName, required: false, nullable: true, empty: true },
//     { field: 'agreement_accepted', coercer: new FieldCoercer(/^true$/) }
// ];



/**
 * Контроллер для
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function test(userId){

    console.log(userId)
    try{
        let payload = {
            user_id: userId
        }
        return createAndBindToken(payload);
    }catch(e){
        console.log(e);
    }

}


/**
 * Проверка валидности тоекна от пользователя
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function check(bearer){

    const { userId, iat, exp } = getTokenData(bearer);

    console.log(1)

}




/**
 * Верификация
 * @param {object} body - данные запроса, тело и строка
 */
async function verify(body, res){

    // Чтото типо костыля
    for(let data in body){ 
        if(!data){
            delete body.data
        }
    }

    // Проверяем, все ли поля заполнены, но тут вроде этого не надо, т.к. у меня есть Роберт
    if (!(body?.phone?.length ? 1 : 0) ^ (body?.email?.length ? 1 : 0)) {
        throw new Error('Для данной операции требуется ОДНО из полей (email, phone)');
    }

    let response;
    try {
        response = await verificationModule.verifyCredentials(body);

    } catch (e) {
        console.log(e);
    };
    console.log(response)

    res.status(200).json(response)

}


/**
 * Отправка кода из СМС/Почты
 * @param {object} body - данные запроса, тело и строка
 */
async function codeVerify(body, res){

    let userId;
    const { login, code } = body;

    try {
        userId = await pool.query('SELECT user_id FROM users WHERE email_address = $1', [login]);
    } catch (e) {
        console.log(e)
    }

    // Приставки к ключам
    let redisPasswordRecoverKey = "yurta:recover_password:";
    let userVerifyCodeKey = "Yurta:user:";

    userVerifyCodeKey = userVerifyCodeKey + userId.rows[0].user_id;
    const userVerifyCode = await redis.get(userVerifyCodeKey);

    redisPasswordRecoverKey = redisPasswordRecoverKey + userId.rows[0].user_id;
    const redisPasswordRecoverCode = await redis.get(redisPasswordRecoverKey);


    if(userVerifyCode){
        if(code == userVerifyCode){
            login.includes('@') ? await pool.query("UPDATE users SET is_email_address_verified = true WHERE email_address = $1", [login]) : await pool.query("UPDATE users SET is_phone_verified = true WHERE phone_number = $1", [login])
            const response = {
                message: "Правильный код",
                token: null
            }
            res.status(200).json(response);
        }else{
            res.status(500).json("wrong code")
        }
    }
    // else{    костыль пдзц
    //     res.status(500).json("Error happend")
    // }

    if(redisPasswordRecoverCode){
        if(code == redisPasswordRecoverCode){
            const response = {
                message: "Правильный код",
                token: null
            };
            res.status(200).json(response);
        }else{
            res.status(500).json("wrong code")
        }
    }
    // else{    костыль пздц
    //     res.status(500).json("Error happend")
    // }

}



/**
 * Метод для регистрации нового аккаунта
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signup(body, res, next){

    const {surname, name, patronymic, email_address, phone_number, password} = body;

    let userId, bearer;

    try{
        await pool.query("BEGIN");

        // В будущем обойдемся этим SELECT-ом если в БД поставить правило уникальности почты и/или номера телефона
        userId = await pool.query('SELECT * FROM users u WHERE u.phone_number = $1 OR u.email_address = $2', [phone_number, email_address]);
        if(userId.rowCount > 0){
            throw new Error("Такой юзер уже есть")
        }

        // Тут вставка нового юзера и привзяка ему токена, в Юрте там один токен без срока годности, хранят в Редисе
        userId = await pool.query('INSERT INTO users (surname, name, patronymic, email_address, phone_number, password) VALUES ($1, $2, $3, $4, $5, $6)  RETURNING user_id', [surname, name, patronymic, email_address, phone_number, password]);

        await pool.query("COMMIT");

    }catch(e){
        console.log(e)

        await pool.query("ROLLBACK");

        const error = {
            message: "Возникла ошибка регистрации, подробнее: " + e,
            token: null
        }
        res.status(500).json(error)
    }

    const result = {
        message: "Успешно добавлен пользователь",
        token: null
    }
    res.status(200).json(result)
}


/**
 * Метод для входа по логину
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signinLogin(req, res, next){

    let isUserVerified;
    let user;

    const { email, password } = req;

    try{
        // await connectDb();
        isUserVerified = await pool.query('SELECT * FROM users u \
            WHERE u.email_address = $1 AND u.password = $2', [email, password])

        // console.log("hello: ", isUserVerified)

        // if(isUserVerified.rowCount != 0){

        //     const bearer = await createAndBindToken(isUserVerified.rows[0].user_id);
        //     const result = {
        //         message: `Вы успешно вошли под именем: ${isUserVerified.rows[0].surname}`,
        //         token: bearer
        //     }

        //     res.json(result)
        // }else{
        //     throw ApiErrors.userNotFound;
        // }

    }catch(e){
        console.log(e)

        throw ApiErrors.userNotFound;
    }

    const bearer = await createAndBindToken(isUserVerified.rows[0].user_id);
    const result = {
        message: `Вы успешно вошли под именем: ${isUserVerified.rows[0].surname}`,
        token: bearer
    }

    res.json(result)

}



/**
 * Метод для входа по телефону
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signinPhone(req, res, next){

    let isUserVerified;
    let user;

    const { email, phone } = req.body

    try{
        // await connectDb();
        isUserVerified = await pool.query('SELECT * FROM users u \
            WHERE u.email_address = $1 AND u.phone_number = $2', [email, phone])

        if(isUserVerified.rowCount != 0){
            const result = {
                message: `Вы успешно вошли под именем: ${isUserVerified.rows[0].surname}`,
                token: null
            }

            res.json(result)
        }

    }catch(e){
        console.log(e)
    }

}


/**
 * Восстановление пароля (пока только почтой)
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function passwordRecovery(body, res){

    // Преобразуем дату
    // const data = apiCoercer(verificationCoercer, body);
    for(let data in body){  // Чтото типо костыля
        if(!data){
            delete body.data
        }
    }
    console.log("body: ", body)


    // Проверяем, все ли поля заполнены, но тут вроде этого не надо, т.к. у меня есть Роберт
    if (!(body?.phone?.length ? 1 : 0) ^ (body?.email?.length ? 1 : 0)) {
        throw new Error('Для данной операции требуется ОДНО из полей (email, phone)');
    }

    let response;
    try {
        response = await verificationModule.recoverPassword(body);
    } catch (e) {
        console.log(e);

        throw new Error(e)
    };
    console.log(response)

    res.status(200).json(response)

}

/**
 * Ввод нового пароля
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function passwordChange(req, res){

    /* Валидация и нормализация */  //будет потом
    // let data = apiCoercer(signinCoercer, rawData);

    // console.log("req Заголовоки: ", req.rawHeaders);
    console.log("req Тело: ", req.body);
    console.log("Auth token: ", req.headers.authorization);


    // const { Authorization } = req.query

    // const tokenData = getTokenData(Authorization);

    // res.status(200).json(tokenData);

}


/**W
 * Метод для выхода из аккаунта
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signout(req, res){

    console.log(req.query);

    const { Authorization } = req.query

    const tokenData = getTokenData(Authorization);

    await pool.query("UPDATE users SET token = \"\" WHERE user_id = $2", [tokenData,userId]);

    res.status(200).json(tokenData);
}


/**
 * Метод для восстановления пароля
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function aa(body, res, next){

    const {surname, name, patronymic, email_address, phone_number, password} = body;
    try{
        // await connectDb();
        await pool.query("BEGIN");

        // Можно обойтись без лишнего SELECT если в БД поставить правило уникальности почты и/или номера телефона
        const isUserVerified = await pool.query('SELECT * FROM users u WHERE u.phone_number = $1 OR u.email_address = $2', [phone_number, email_address]);
        if(isUserVerified.rowCount > 0){
            throw new Error("Такой юзер уже есть")
        }

        // /* Генерация и привязка токена */
        // const bearer = await createAndBindToken(userid);
        // Тут вставка нового юзера и привзяка ему токена, в Юрте там один токен без срока годности, хранят в Редисе
        const newUserInsert = await pool.query('INSERT INTO users (surname, name, patronymic, email_address, phone_number, password) VALUES ($1, $2, $3, $4, $5, $6)  RETURNING user_id', [surname, name, patronymic, email_address, phone_number, password]);
        await tokenSchema.saveToken(newUserInsert.rows[0].user_id, generateToken({userId: newUserInsert.rows[0].user_id}));


        await pool.query("COMMIT");

    }catch(e){
        console.log(e)

        await pool.query("ROLLBACK");

        const error = {
            message: "Возникла ошибка регистрации, подробнее: " + e,
            token: null
        }
        res.status(500).json(error)
    }

    const result = {
        message: "Успешно добавлен пользователь",
        token: null
    }
    res.status(200).json(result)
}




module.exports = { test, signinLogin, signinPhone, signup, verify, codeVerify, passwordRecovery, passwordChange, signout, check }

