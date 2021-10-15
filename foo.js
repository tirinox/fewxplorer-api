const DotEnv = require('dotenv')
DotEnv.config()

const {DBTokenIds} = require("./src/dbTokenIds");
const {JobTokenIds} = require("./src/jobTokenIds");
const {Config} = require("./config");
const {FewmanContract, FewmanBreedContract} = require("./src/smartcontract");
const {timeout} = require("./src/util");


function makeContract() {
    return new FewmanContract(Config.WEB3_URL, Config.FEWMAN_CONTRACT, Config.ABI_PATH)
}

function makeBreedContract() {
    return new FewmanBreedContract(Config.WEB3_URL, Config.FEWMAN_BREED_CONTRACT, Config.BREED_ABI_PATH)
}


async function testTokenIdsJob() {
    const dbTokenIds = new DBTokenIds(Config.TOKEN_IDS_PATH, Config.SAVE_EVERY_SEC)
    await dbTokenIds.loadFromFile()

    const jobTokenIds = new JobTokenIds(
        dbTokenIds,
        makeContract(),
        makeBreedContract(),
        Config.TOKEN_IDS_DELAY_IDLE,
        Config.TOKEN_IDS_DELAY_TICK
    )
    await jobTokenIds.run()

    while (true) {
        console.log(dbTokenIds.allTokenIdList)
        await timeout(2 * 1000)
    }
}

async function testWeb3Provider() {
    const fewmanContract = makeContract()
    const fewmanBreedContract = makeBreedContract()

    const n = await fewmanContract.readTotalSupply()
    console.log(`Total supply is ${n}`)

    const index = 6

    const tokenId = await fewmanContract.getTokenByIndex(index)
    const gen = await fewmanBreedContract.getGeneration(tokenId)
    const owner = await fewmanContract.getOwnerOf(tokenId)
    console.log(`Fewman #${tokenId} has gen = ${gen}, owner = ${owner}`)
}

async function main() {
    await testWeb3Provider()
}

main().then(() => {
})
