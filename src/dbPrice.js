const {nowTS} = require("./util");
const fs = require('fs').promises


class DBPrice {
    constructor(filePath) {
        this.filePath = filePath
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

    async saveNewPrices(newItems, idsRequested) {
        try {
            if (!newItems) {
                return
            }

            const now = nowTS()
            this.lastSuccessTS = now
            let nNewKeys = 0

            for (let key of Object.keys(newItems)) {
                newItems[key].lastUpdateTS = now
                ++nNewKeys
            }

            console.log(`saveNewPrices: newItems ${nNewKeys}`)
            for (const [k, v] of Object.entries(newItems)) {
                this.priceDB[k] = v
            }

            if (Array.isArray(idsRequested)) {
                const idsToRemove = []
                for (const id of idsRequested) {
                    if (!newItems[id]) {
                        if (this.priceDB[id]) {
                            delete this.priceDB[id]
                            idsToRemove.push(id)
                        }
                    }
                }
                if (idsToRemove.length > 0) {
                    console.info("I removed those ids: ", idsToRemove.join(', '))
                }
            }

            await fs.writeFile(this.filePath, JSON.stringify(this.priceDB))
        } catch (e) {
            console.error(`saveNewPrices: Error ${e}.`)
        }
    }

    async loadAllTokenPrices() {
        let data
        try {
            const raw = await fs.readFile(this.filePath)
            data = JSON.parse(raw)
            console.info(`DB loaded ${Object.keys(data).length} items`)
        } catch (e) {
            data = {}
            console.error(`error loading token price file: ${e}`)
        }
        this.priceDB = data
    }
}

module.exports = {
    DBPrice
}