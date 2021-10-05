const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DBPrice} = require("./src/dbPrice");
const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {PRICE_PATH, TOKEN_IDS_PATH, FEWMAN_CONTRACT, DELAY, REST_AFTER_WORK, INFURA_ID, BATCH_SIZE, ABI_PATH} = require("./config");
const {FewmanContract} = require("./src/smartcontract");


async function main() {
    const dbPrice = new DBPrice(PRICE_PATH)
    await dbPrice.loadAllTokenPrices()

    const dbTokenIds = new DBTokenIds(TOKEN_IDS_PATH)
    await dbTokenIds.loadAllTokens()

    const fewmanContract = new FewmanContract(INFURA_ID, FEWMAN_CONTRACT, ABI_PATH)
    const jobTokenIds = new JobTokenIds(dbTokenIds, fewmanContract, DELAY, REST_AFTER_WORK)
    jobTokenIds.run()

    const jobOpenSeaPrices = new OpenSeaJob(dbPrice, dbTokenIds, FEWMAN_CONTRACT, BATCH_SIZE, DELAY, REST_AFTER_WORK)
    jobOpenSeaPrices.run()

    runServerAPI(dbPrice, dbTokenIds)
}

main().then(() => {
})
