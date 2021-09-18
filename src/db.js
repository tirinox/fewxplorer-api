const fs = require('fs').promises


const DATA_PATH = process.env.DATA_PATH || '../data/var'

const PRICE_PATH = DATA_PATH + '/' + 'prices.json'

function nowTS() {
    return Math.floor((new Date()).getTime() / 1000)
}

class DB {
    constructor() {
        this.priceDB = {}
    }

    async resetDB() {
        this.priceDB = {}
        await this.saveNewPrices({})
    }

    async saveNewPrices(newItems) {
        try {
            const now = nowTS()
            let newKeys = 0
            for(let key of Object.keys(newItems)) {
                newKeys[key].lastUpdateTS = now
                ++newKeys
            }

            console.log(`saveNewPrices: newItems ${Object.keys(newItems).length}`)
            Object.assign(this.priceDB, newItems)

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
        } catch(e) {
            data = {}
            console.error(`error loading token price file: ${e}`)
        }
        return data
    }
}

module.exports = {
    DB
}
