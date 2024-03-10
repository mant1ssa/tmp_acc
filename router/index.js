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

router.get('/a', authMethods.test);

router.route('/registration')
    .post((req, res, next) => 
        authMethods.signup(req.body))

module.exports = router;