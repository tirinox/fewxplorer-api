const {nowTS} = require("./util");
const fs = require('fs').promises


const DATA_PATH = process.env.DATA_PATH || './data/var'

const PRICE_PATH = DATA_PATH + '/' + 'prices.json'


class DB {
    constructor() {
        this.priceDB = {}
        this.lastSuccessTS = 0
    }

    async resetDB() {
        this.priceDB = {}
        await this.saveNewPrices({})
    }

    get lastSuccessSecAgo() {
        return nowTS() - this.lastSuccessTS
    }

    async saveNewPrices(newItems) {
        try {
            if(!newItems) {
                return
            }

            const now = nowTS()
            this.lastSuccessTS = now
            let nNewKeys = 0
            for(let key of Object.keys(newItems)) {
                newItems[key].lastUpdateTS = now
                ++nNewKeys
            }

            console.log(`saveNewPrices: newItems ${nNewKeys}`)
            for(const [k, v] of Object.entries(newItems)) {
                this.priceDB[k] = v
            }

            await fs.writeFile(PRICE_PATH, JSON.stringify(this.priceDB))
        } catch(e) {
            console.error(`saveNewPrices: Error ${e}.`)
        }
    }

    async loadAllTokenPrices() {
        let data
        try {
            const raw = await fs.readFile(PRICE_PATH)
            data = JSON.parse(raw)
            console.info(`DB loaded ${Object.keys(data).length} items`)
        } catch(e) {
            data = {}
            console.error(`error loading token price file: ${e}`)
        }
        this.priceDB = data
    }
}

module.exports = {
    DB
}
