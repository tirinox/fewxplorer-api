const {nowTS} = require("./util");
const fs = require('fs').promises


class DBPrice {
    constructor(filePath, saveEverySec) {
        this.filePath = filePath
        this.priceDB = {}
        this.lastSavedTS = 0
        this.saveEverySec = saveEverySec
    }

    async resetDB() {
        this.priceDB = {}
        await this.saveNewPricesToFile({})
    }

    get lastSuccessSecAgo() {
        return nowTS() - this.lastSavedTS
    }

    async saveNewPricesToFile(newItems, idsRequested) {
        try {
            if (!newItems) {
                return
            }

            const now = nowTS()

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

            if(this.lastSuccessSecAgo > this.saveEverySec) {
                await fs.writeFile(this.filePath, JSON.stringify(this.priceDB))
                this.lastSavedTS = now
            }
        } catch (e) {
            console.error(`saveNewPrices: Error ${e}.`)
        }
    }

    async loadFromFile() {
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
