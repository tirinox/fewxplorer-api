const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DB} = require("./src/db");
const {simpleProgression} = require("./src/util");

async function main() {
    const db = new DB()
    await db.loadAllTokenPrices()

    // todo: scan SmartContract to get the actial tokenId list (it will change when breeding starts)
    const tokenIds = simpleProgression(0, 9999)

    const job = new OpenSeaJob(db, tokenIds, 30, 1.51)
    job.run()

    runServerAPI(db)
}

main().then(() => {})
