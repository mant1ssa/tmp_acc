const dotenv = require("dotenv");
const { pool } = require("./base.js");
const jwt = require("jsonwebtoken");

dotenv.config();


/**
 * Сохрананение refresh-токена у юзера с id = userId
 * @param {number} userId - id юзера
 * @param {string} token - refresh-токен
 */
const saveToken = async (userId, token) => {
    try{
        await pool.query("UPDATE users SET token = $1 WHERE user_id = $2", [token, userId]);
    }catch(e){
        console.log(e);

        throw new Error("Couldn't save token cause ", e);
    }
}

/**
 * Генерация пар токенов: accessToken и refreshToken
 * @param {object} body - данные запроса, тело и строка
 */
const createAndBindToken = async (payload) => {

    let accessToken, refreshToken
    try{
        const user_id = payload;

        // const accessToken = jwt.sign({ userId: user_id }, { expiresIn: process.env.TOKENS_SECRET })
        accessToken = jwt.sign({ userId: user_id }, process.env.ACCESS_TOKENS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });
        refreshToken = jwt.sign({ userId: user_id }, process.env.REFRESH_TOKEN_EXPIRES, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
    
        // Тут привязываемrefresh-токен к юзеру user_id
        await saveToken(user_id, refreshToken);
    }catch(e){
        console.log(e);

        throw new Error("Error at binding tokens, ", e);
    }

    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
}


/**
 * Достает информацию из токена bearer
 * @param {object} bearer - токен
 */
const getTokenData = (bearer) => {

    const tokenData = jwt.verify(bearer, process.env.ACCESS_TOKENS_SECRET);

    return tokenData;
}


/**
 * Генерация пар токенов: accessToken и refreshToken
 * @param {object} body - данные запроса, тело и строка
 */
const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.TOKENS_SECRET, {expiresIn: '1d'});

    return token;
}


module.exports = { createAndBindToken, getTokenData, generateToken };