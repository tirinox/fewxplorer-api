const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DB} = require("./src/db");

const db = new DB()

// todo: scan SmartContract to get the actial tokenId list (it will change when breeding starts)
const tokenIds = OpenSeaJob.simpleProgression(0, 9999)

const job = new OpenSeaJob(db, tokenIds, 30, 1.01)
job.run()

runServerAPI(db)
