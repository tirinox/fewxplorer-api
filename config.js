const path = require('path')

const BATCH_SIZE = 30
const DELAY = 2.51 // sec
const REST_AFTER_WORK = 15 * 60 // 15 minute
const MAX_TOKEN_ID = 9999

const FEWMAN_CONTRACT = process.env.CONTRACT || '0xad5f6cdda157694439ef9f6dd409424321c74628'
const INFURA_ID = process.env.INFURA_ID
const ABI_PATH = path.resolve(process.env.ABI_PATH || './data/fewman.abi.json')

const DATA_PATH = process.env.DATA_PATH || './data/var'

const PRICE_PATH = path.resolve(DATA_PATH + '/' + 'prices.json')
const TOKEN_IDS_PATH = path.resolve(DATA_PATH + '/' + 'token_ids.json')

module.exports = {
    BATCH_SIZE, DELAY,
    REST_AFTER_WORK, MAX_TOKEN_ID,
    FEWMAN_CONTRACT, DATA_PATH,
    PRICE_PATH, TOKEN_IDS_PATH,
    INFURA_ID, ABI_PATH
}
