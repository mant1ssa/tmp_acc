const dotenv = require("dotenv");
const { pool } = require("./base.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const tokenSchema = require("../schemas/tokens_schema.js")
// const json = require("json")

dotenv.config();




/**
 * Контроллер для
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function test(userId){

    console.log(userId)
    try{
        const aUser = await pool.query('SELECT * FROM users u WHERE u.user_id = $1', [userId]);
        console.log(JSON.stringify(aUser.rows[0]?.surname))
        return JSON.stringify(aUser.rows[0]?.surname);
    }catch(e){
        console.log(e);
    }

}



/**
 * Метод для регистрации нового аккаунта
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signup(body, res, next){

    console.log(body)
    const {surname, name, patronymic, email_address, phone_number, password} = body;
    try{
        // await connectDb();
        await pool.query("BEGIN");
        const isUserVerified = await pool.query('SELECT * FROM users u WHERE u.phone_number = $1 OR u.email_address = $2', [phone_number, email_address]);

        if(isUserVerified.rowCount > 0){
            throw new Error("Такой юзер уже есть")
        }

        const newUserInsert = await pool.query('INSERT INTO users (surname, name, patronymic, email_address, phone_number, password) VALUES ($1, $2, $3, $4, $5, $6)  RETURNING user_id', [surname, name, patronymic, email_address, phone_number, password]);
        await tokenSchema.saveToken(newUserInsert.rows[0].user_id, tokenSchema.generateToken({userId: newUserInsert.rows[0].user_id}));


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

    const { email, password } = req.body

    try{
        // await connectDb();
        isUserVerified = await pool.query('SELECT * FROM users u \
            WHERE u.email_address = $1 AND u.password = $2', [email, password])

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


module.exports = { test, signinLogin, signinPhone, signup }

