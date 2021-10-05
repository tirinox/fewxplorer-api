const {nowTS, simpleProgression} = require("./util");
const fs = require('fs').promises


class DBTokenIds {
    constructor(filePath) {
        this.filePath = filePath
        this.tokenIds = {}
        this.lastSuccessTS = 0
    }

    async resetDB() {
        this.tokenIds = {}
        await this.save({})
    }

    get lastSuccessSecAgo() {
        return nowTS() - this.lastSuccessTS
    }

    getAll() {
        return simpleProgression(0, 9999)  // todo!!
    }

    async save(newItems) {
        try {
            if (!newItems) {
                return
            }

            this.lastSuccessTS = nowTS()

            await fs.writeFile(this.filePath, JSON.stringify(this.priceDB))
        } catch (e) {
            console.error(`save token ids: Error ${e}.`)
        }
    }

    async loadAllTokens() {
        let data
        try {
            const raw = await fs.readFile(this.filePath)
            data = JSON.parse(raw)
            console.info(`DB token ids loaded ${Object.keys(data).length} items`)
        } catch (e) {
            data = {}
            console.error(`error loading token price file: ${e}`)
        }
        this.priceDB = data
    }
}

module.exports = {
    DBTokenIds
}
