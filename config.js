const path = require('path')

const DATA_PATH = process.env.DATA_PATH || './data/var'

const Config = {
    BATCH_SIZE: 30,
    DELAY_OPENSEA: 2.51,
    OPEN_SEA_REST_AFTER_WORK: 15 * 60,
    // OPEN_SEA_REST_AFTER_WORK: 5,

    MAX_TOKEN_ID: 9999,

    FEWMAN_CONTRACT: process.env.CONTRACT || '0xad5f6cdda157694439ef9f6dd409424321c74628',
    INFURA_ID: process.env.INFURA_ID,
    ABI_PATH: path.resolve(process.env.ABI_PATH || './data/fewman.abi.json'),

    DATA_PATH: process.env.DATA_PATH || './data/var',

    PRICE_PATH: path.resolve(DATA_PATH + '/' + 'prices.json'),
    TOKEN_IDS_PATH: path.resolve(DATA_PATH + '/' + 'token_ids.json'),

    TOKEN_IDS_DELAY_IDLE: 60.0,  // sec
    TOKEN_IDS_DELAY_TICK: 2.0,  // sec

    SAVE_EVERY_SEC: 15.0,
}

module.exports = {
    Config
}
