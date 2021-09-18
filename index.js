const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DB} = require("./src/db");
const {simpleProgression} = require("./src/util");

const BATCH_SIZE = 30
const DELAY = 2.51 // sec
const REST_AFTER_WORK = 15 * 60 // 15 minute
const MAX_TOKEN_ID = 9999

async function main() {
    const db = new DB()
    await db.loadAllTokenPrices()

    // todo: scan SmartContract to get the actial tokenId list (it will change when breeding starts)
    const tokenIds = simpleProgression(0, MAX_TOKEN_ID)

    const job = new OpenSeaJob(db, tokenIds, BATCH_SIZE, DELAY, REST_AFTER_WORK)
    job.run()

    runServerAPI(db)
}

main().then(() => {})
