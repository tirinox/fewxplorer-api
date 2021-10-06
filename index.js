const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DBPrice} = require("./src/dbPrice");
const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {Config} = require("./config");
const {FewmanContract} = require("./src/smartcontract");


async function main() {
    const dbPrice = new DBPrice(Config.PRICE_PATH, Config.SAVE_EVERY_SEC)
    await dbPrice.loadFromFile()

    const dbTokenIds = new DBTokenIds(Config.TOKEN_IDS_PATH, Config.SAVE_EVERY_SEC)
    await dbTokenIds.loadFromFile()

    const fewmanContract = new FewmanContract(Config.INFURA_ID, Config.FEWMAN_CONTRACT, Config.ABI_PATH)
    const jobTokenIds = new JobTokenIds(
        dbTokenIds,
        fewmanContract,
        Config.TOKEN_IDS_DELAY_IDLE,
        Config.TOKEN_IDS_DELAY_TICK
    )
    jobTokenIds.run()

    const jobOpenSeaPrices = new OpenSeaJob(dbPrice, dbTokenIds,
        Config.FEWMAN_CONTRACT,
        Config.BATCH_SIZE,
        Config.DELAY_OPENSEA,
        Config.OPEN_SEA_REST_AFTER_WORK
    )
    jobOpenSeaPrices.run()

    runServerAPI(dbPrice, dbTokenIds)
}

main().then(() => {
})
