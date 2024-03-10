const dotenv = require("dotenv");
const { pool } = require("./base.js")

dotenv.config();




/**
 * Тестовый контроллер
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function test(req, res, next){

    res.json("hello world!")

}



/**
 * Метод для регистрации нового аккаунта
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
async function signup(body, res, next){

    const {surname, name, patronymic, email_address, phone_number, password} = body;
    try{
        // await connectDb();
        const isUserVerified = await pool.query('SELECT * FROM users u WHERE u.phone_number = $1 OR u.email_address = $2', [phone_number, email_address]);

        if(isUserVerified.rowCount >= 1){
            
        }

        // newUserInsert = await pool.query('INSERT INTO users (surname, name, patronymic, email_address, phone_number, password) VALUES ($1, $2, $3, $4, $5, $6)', [surname, name, patronymic, email_address, phone_number, password]);

    }catch(e){
        console.log(e)

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

