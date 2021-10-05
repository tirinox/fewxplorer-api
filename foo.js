const DotEnv = require('dotenv')
DotEnv.config()

const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {TOKEN_IDS_PATH, FEWMAN_CONTRACT, DELAY, REST_AFTER_WORK, INFURA_ID, ABI_PATH} = require("./config");
const {FewmanContract} = require("./src/smartcontract");


async function main() {
    const dbTokenIds = new DBTokenIds(TOKEN_IDS_PATH)
    await dbTokenIds.loadAllTokens()

    const fewmanContract = new FewmanContract(INFURA_ID, FEWMAN_CONTRACT, ABI_PATH)
    const jobTokenIds = new JobTokenIds(dbTokenIds, fewmanContract, DELAY, REST_AFTER_WORK)
    await jobTokenIds._job()
}

main().then(() => {
})
