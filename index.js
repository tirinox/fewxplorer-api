const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");

runServerAPI()
