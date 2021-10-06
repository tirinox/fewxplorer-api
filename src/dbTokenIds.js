const {nowTS, simpleProgression} = require("./util");
const fs = require('fs').promises

class DBTokenIds {
    constructor(filePath, saveEverySec = 10) {
        this.filePath = filePath
        this.tokenIds = {}  // tokenNo -> { tokenId, personality, gender }
        this.lastSuccessTS = 0
        this.saveEverySec = saveEverySec
        this.total = 0
    }

    async resetDB() {
        this.tokenIds = {}
        await this.saveToFile()
    }

    get lastSuccessSecAgo() {
        return nowTS() - this.lastSuccessTS
    }

    getAll() {
        if (!this.tokenIds) {
            return simpleProgression(0, 9999)
        } else {
            return Object.values(this.tokenIds).map((a) => +a[0])
        }
    }

    get allData() {
        return {
            ids: this.tokenIds,
            lastSuccessTS: this.lastSuccessTS,
            total: this.total,
        }
    }

    async saveToFile() {
        try {
            const oldTs = this.lastSuccessTS
            this.lastSuccessTS = nowTS()
            const stringData = JSON.stringify(this.allData, null, 2)
            await fs.writeFile(this.filePath, stringData)
            console.info(`DBTokenIds saved to "${this.filePath}"!`)
        } catch (e) {
            this.lastSuccessTS = oldTs
            console.error(`DBTokenIds save error ${e}.`)
        }
    }

    async loadFromFile() {
        let data
        try {
            const raw = await fs.readFile(this.filePath)
            data = JSON.parse(raw)
            console.info(`DBTokenIds loaded ${Object.keys(data).length} items`)
        } catch (e) {
            data = {}
            console.error(`DBTokenIds: Error loading tokenIds DB file: ${e}`)
        }
        if (data) {
            if (data.ids) {
                this.tokenIds = data.ids
            }
            if (data.lastSuccessTS) {
                this.lastSuccessTS = +data.lastSuccessTS
            }
            if (data.total) {
                this.total = +data.total
            }
        }
    }

    async saveToken(tokenNo, tokenId, personality) {
        // this.tokenIds[tokenNo] = {
        //     id: +tokenNo,
        //     personality,
        // }
        this.tokenIds[tokenNo] = [+tokenId, personality]

        if (this.lastSuccessSecAgo > this.saveEverySec) {
            await this.saveToFile()
        }
    }
}

module.exports = {
    DBTokenIds
}
