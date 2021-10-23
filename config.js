const path = require('path')

const DATA_PATH = process.env.DATA_PATH || './data/var'

const INFURA_ID = process.env.INFURA_ID
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_ID}`
const PUBLIC_WEB3_URL = 'https://main-light.eth.linkpool.io/'

const Config = {
    BATCH_SIZE: 30,
    DELAY_OPENSEA: 2.51,
    OPEN_SEA_REST_AFTER_WORK: 15 * 60,
    OPEN_SEA_KEY: (process.env.OPENSEA_KEY || null),
    // OPEN_SEA_REST_AFTER_WORK: 5,

    RUN_PRICE_JOB: false,  // fixme: debug
    RUN_TOKEN_ID_JOB: true,

    MAX_TOKEN_ID: 9999,

    WEB3_URL: INFURA_URL,
    INFURA_ID: process.env.INFURA_ID,

    FEWMAN_CONTRACT: process.env.CONTRACT || '0xad5f6cdda157694439ef9f6dd409424321c74628',
    FEWMAN_BREED_CONTRACT: process.env.BREED_CONTRACT || '0x7977eb2Ba4bE7CC4Bb747baF2eE9177CAdc96a02',

    ABI_PATH: path.resolve(process.env.ABI_PATH || './data/fewman.abi.json'),
    BREED_ABI_PATH: path.resolve(process.env.BREED_ABI_PATH || './data/breed.abi.json'),

    DATA_PATH: process.env.DATA_PATH || './data/var',

    PRICE_PATH: path.resolve(DATA_PATH + '/' + 'prices.json'),
    TOKEN_IDS_PATH: path.resolve(DATA_PATH + '/' + 'token_ids.json'),

    TOKEN_IDS_DELAY_TICK: 2.0,  // sec

    SAVE_EVERY_SEC: 15.0,
}

module.exports = {
    Config
}
