import Web3 from "web3"
import DotEnv from "dotenv"
import abi from "./data/fewman.abi.json"

DotEnv.config()

const INFURA_ID = process.env.INFURA_ID
const FEWMAN_CONTRACT = '0xad5f6cdda157694439ef9f6dd409424321c74628'

const w3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_ID}`)

// w3.eth.getBlockNumber(function (error, result) {
//     console.log(result)
// })

const contract = new w3.eth.Contract(abi, FEWMAN_CONTRACT)


async function readTotalSupply() {
    return await contract.methods.totalSupply().call()
}

async function getTokenByIndex(i) {
    return await contract.methods.tokenByIndex(i).call()
}

getTokenByIndex(1).then(console.log)


