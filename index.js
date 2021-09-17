import Web3 from "web3"
import DotEnv from "dotenv"
import abi from "./data/fewman.abi.json"
import axios from "axios";

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

async function getTokensOpenSea(ids) {
    let url = "https://api.opensea.io/wyvern/v1/orders?asset_contract_address=0xad5f6cdda157694439ef9f6dd409424321c74628&bundled=false&include_bundled=false&include_invalid=false&limit=30&offset=0&order_by=eth_price&order_direction=desc"
    for(const id of ids) {
        url += `&token_ids=${id}`
    }
    const data = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    console.log(data.data)
    return BigInt(data.current_price) / BigInt(Math.pow(10, 18))
}

// getTokenByIndex(1).then(console.log)

getTokensOpenSea([0]).then(console.log)

// https://api.opensea.io/wyvern/v1/orders?asset_contract_address=0xad5f6cdda157694439ef9f6dd409424321c74628&bundled=false&include_bundled=false&include_invalid=false&token_ids=0&token_ids=1&limit=20&offset=0&order_by=eth_price&order_direction=desc
