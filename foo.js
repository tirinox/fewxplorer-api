const DotEnv = require('dotenv')
DotEnv.config()

const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {Config} = require("./config");
const {FewmanContract} = require("./src/smartcontract");
const {timeout} = require("./src/util");


async function main() {
    const dbTokenIds = new DBTokenIds(Config.TOKEN_IDS_PATH, Config.SAVE_EVERY_SEC)
    await dbTokenIds.loadFromFile()

    const fewmanContract = new FewmanContract(Config.WEB3_URL, Config.FEWMAN_CONTRACT, Config.ABI_PATH)
    const jobTokenIds = new JobTokenIds(
        dbTokenIds,
        fewmanContract,
        Config.TOKEN_IDS_DELAY_IDLE,
        Config.TOKEN_IDS_DELAY_TICK
    )
    await jobTokenIds.run()

    while (true) {
        console.log(dbTokenIds.allTokenIdList)
        await timeout(2 * 1000)
    }
}

main().then(() => {
})
