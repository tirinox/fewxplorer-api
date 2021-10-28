const DotEnv = require('dotenv')
DotEnv.config()

const {runServerAPI} = require("./src/api");
const {OpenSeaJob} = require("./src/job");
const {DBPrice} = require("./src/dbPrice");
const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {Config} = require("./config");
const {FewmanContract, FewmanBreedContract} = require("./src/smartcontract");


async function main() {
    const dbPrice = new DBPrice(Config.PRICE_PATH, Config.SAVE_EVERY_SEC)
    await dbPrice.loadFromFile()

    const dbTokenIds = new DBTokenIds(Config.TOKEN_IDS_PATH, Config.SAVE_EVERY_SEC)
    await dbTokenIds.loadFromFile()

    const fewmanContract = new FewmanContract(Config.WEB3_URL, Config.FEWMAN_CONTRACT,
        Config.ABI_PATH)
    const fewmanBreedContract = new FewmanBreedContract(Config.WEB3_URL, Config.FEWMAN_BREED_CONTRACT,
        Config.BREED_ABI_PATH)
    const jobTokenIds = new JobTokenIds(
        dbTokenIds,
        fewmanContract,
        fewmanBreedContract,
        Config.TOKEN_IDS_DELAY_TICK,
        Config.TOKEN_IDS_BIG_SLEEP,
        Config.TOKEN_IDS_LAST_FEWMANS_SLEEP,
    )

    if(Config.RUN_TOKEN_ID_JOB) {
        jobTokenIds.run()
    }

    const jobOpenSeaPrices = new OpenSeaJob(dbPrice, dbTokenIds,
        Config.FEWMAN_CONTRACT,
        Config.BATCH_SIZE,
        Config.DELAY_OPENSEA,
        Config.OPEN_SEA_REST_AFTER_WORK,
        Config.OPEN_SEA_KEY
    )

    if(Config.RUN_PRICE_JOB) {
        jobOpenSeaPrices.run()
    }

    runServerAPI(dbPrice, dbTokenIds)
}

main().then(() => {
})
