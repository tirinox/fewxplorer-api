const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DB} = require("./src/db");

const db = new DB()
const job = new OpenSeaJob(db, OpenSeaJob.simpleProgression(0, 9999), 30, 1.01)
job.run()

runServerAPI()
