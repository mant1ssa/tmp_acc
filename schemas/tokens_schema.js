const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { pool } = require("../modules/base.js");

dotenv.config();


/**
 * Модель данных `users`
 */
class Token {
    generateToken(payload){
        const token = jwt.sign(payload, process.env.TOKENS_SECRET, {expiresIn: '1d'});

        return token;
    }

    async saveToken(userId, token){
        // console.log("userId(INSIDE): ", userId)
        // const tokenData = pool.query("SELECT * FROM users u WHERE u.user_id = $1", [userId]);

        // if(tokenData){
        //     throw new Error("Данный юзер зарегестрирован!")
        // }

        await pool.query("UPDATE users SET token = $1 WHERE user_id = $2", [token, userId]);
    }
}

module.exports = new Token();