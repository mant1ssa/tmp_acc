const dotenv = require("dotenv");
const { pool } = require("./base.js")
const service = require('../services/auth.service.js')

dotenv.config();

const foo = async () => {
    await service();
}

foo()