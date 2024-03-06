const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require('cors');
const { signinLogin, signinPhone, signup } = require('./modules/auth.js');

// *********** Express *********** //

const app = express();

app.use(express.json());
app.use(cors());

// const expressJson = (req, res, next) => {
//     if (!req.is('json')) return next(ApiErrors.unexpectedContentType.describe("Expect: application/json"));
//     return express.json()(req, res, e => e === undefined ? next() : next(ApiErrors.badRequestBody));
// }

app.route('/auth/loginByPassword')
    .post((req, res, next) =>
        signinLogin(req, res, next)
    )

app.route('/auth/loginByPhone')
    .post((req, res, next) =>
        signinPhone(req, res, next)
    )

app.route('/auth/registration')
    .post((req, res, next) =>
        signup(req, res, next)
    )

/**
 * Точка входа
 */

const start = async () => {
    try{
        app.listen(process.env.PORT, () => console.log(`listening at ${process.env.PORT}`))
    }catch(e){
        console.log(e);
    }
}

start();