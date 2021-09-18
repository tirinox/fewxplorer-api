const Web3 = require("web3");
const abi = require("../data/fewman.abi.json");

const INFURA_ID = process.env.INFURA_ID
const FEWMAN_CONTRACT = process.env.CONTRACT || '0xad5f6cdda157694439ef9f6dd409424321c74628'

const w3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_ID}`)
const contract = new w3.eth.Contract(abi, FEWMAN_CONTRACT)

async function readTotalSupply() {
    return await contract.methods.totalSupply().call()
}

async function getTokenByIndex(i) {
    return await contract.methods.tokenByIndex(i).call()
}

module.exports = {
    readTotalSupply,
    getTokenByIndex
}
