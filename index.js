const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require('cors');
const router = require('./router/index.js')

// *********** Express *********** //

const app = express();

app.use(express.json());
app.use(cors());
app.use('/v2/auth', router)





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