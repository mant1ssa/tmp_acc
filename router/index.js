const Router = require('express').Router;
const authMethods = require('../modules/auth.js');

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
    const authString = req.get('Authorization');

    const resu = authMethods.check(authString)
    resu
    .then(tokenData =>  {
        res.status(200).json(tokenData)
        console.log("here: ", tokenData)
    })
    .catch(error => { 
        console.log(error)
        res.status(500).json(error)
    })

    // console.log("resu: ", resu);
    // res.status(200).json(resu);
    // next()
}

router.route('/a/:userId')
    .get(async (req, res, next) => {
        const a = await authMethods.test(req.params.userId);
        res.status(200).json(a)
    })

router.route('/registration')
    .post((req, res, next) => 
        authMethods.signup(req.body, res))

router.route('/verification/')
    // .all(expressAuthCheck)
    .post((req, res, next) => 
        authMethods.verify(req.body, res))

router.route('/loginByPassword')
    // .all(expressAuthCheck)
    .post((req, res, next) => 
        authMethods.signinLogin(req.body, res))

router.route('/loginByPhone')
    .post(expressAuthCheck, (req, res, next) => 
        authMethods.signinLogin(req.body, res))

router.route('/passwordRecovery')
    .post((req, res, next) => 
        authMethods.passwordRecovery(req.body, res))

router.route('/passwordChange')
    .post((req, res, next) => 
        authMethods.passwordChange(req, res))

router.route('/code')
    // .all(expressAuthCheck)
    .post((req, res, next) => 
        authMethods.codeVerify(req.body, res))

router.route('/signout')
    // .all(expressAuthCheck)
    .post((req, res, next) => 
        authMethods.signout(req, res))

module.exports = router;