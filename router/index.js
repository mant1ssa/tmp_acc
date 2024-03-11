const Router = require('express').Router;
const authMethods = require('../modules/auth.js');
const User = require('../schemas/users_schema.js')

const router = new Router();


//  ПОТОМ ДОПИШУ КАК СТАНЕТ ЯСНО В КАКОЙ СРЕДЕ БУДЕТ ПРОЕКТ
// const testMiddleware = (req, res, next) => {
//     const {surname, name, patronymic, email_address, phone_number, password} = req.body;

//     const instanceOfData = new User(surname, name, patronymic, email_address, phone_number, password);
//     if(instanceOfData.hasNoEmptyField()){
//         if(instanceOfData.hasValidFields()){
//             next();
//         }
//         else{
//             throw new Error("No valid datafield")
//         }
//     }
//     else{
//         throw new Error("has empty field")
//     }

//     next()
// }

/**
 * Middleware проверки авторизации пользователя
 * @param {object} req - данные запроса, тело и строка
 * @param {object} res - ответ
 * @returns {object} next - ХЗ что
 */
const expressAuthCheck = (req, res, next) => {
    // console
}

router.route('/a/:userId')
    .get((req, res, next) => 
        authMethods.test(req.params.userId));

router.route('/registration')
    .post(expressAuthCheck, (req, res, next) => 
        authMethods.signup(req.body, res))

module.exports = router;