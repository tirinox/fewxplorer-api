const {nowTS, simpleProgression} = require("./util");
const fs = require('fs').promises

class DBTokenIds {
    constructor(filePath, saveEverySec = 10) {
        this.filePath = filePath
        this.tokenIds = {}  // tokenNo -> { tokenId, personality, gender }
        this.lastSavedTS = 0
        this.lastUpdatedTS = 0
        this.saveEverySec = saveEverySec
        this.total = 0
    }

    async resetDB() {
        this.tokenIds = {}
        await this.saveToFile()
    }

    get lastSaveSecAgo() {
        return nowTS() - this.lastSavedTS
    }

    get lastUpdateSecAgo() {
        return nowTS() - this.lastUpdatedTS
    }

    get allTokenIdList() {
        if (!this.tokenIds) {
            return simpleProgression(0, 9999)
        } else {
            return Object.values(this.tokenIds).map((a) => +a[0])
        }
    }

    get allData() {
        return {
            ids: this.tokenIds,
            lastSavedTS: this.lastSavedTS,
            lastUpdatedTS: this.lastUpdatedTS,
            total: this.total,
        }
    }

    async saveToFile() {
        try {
            const stringData = JSON.stringify(this.allData, null, 2)
            await fs.writeFile(this.filePath, stringData)
            console.info(`DBTokenIds: saved to "${this.filePath}"!`)
        } catch (e) {
            console.error(`DBTokenIds: save error ${e}.`)
        }
    }

    async loadFromFile() {
        let data
        try {
            const raw = await fs.readFile(this.filePath)
            data = JSON.parse(raw)
        } catch (e) {
            data = {}
            console.error(`DBTokenIds: Error loading tokenIds DB file: ${e}`)
        }
        if (data) {
            if (data.ids) {
                this.tokenIds = data.ids
                console.info(`DBTokenIds: loaded ${Object.keys(this.tokenIds).length} items`)
            }
            if (data.lastSavedTS) {
                this.lastSavedTS = +data.lastSavedTS
            }
            if (data.lastUpdatedTS) {
                this.lastUpdatedTS = +data.lastUpdatedTS
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
        this.lastUpdatedTS = nowTS()
        await this._autoSave()
    }

    async _autoSave() {
        if (this.lastSaveSecAgo > this.saveEverySec) {
            this.lastSavedTS = nowTS()
            await this.saveToFile()
        }
    }

    async updateTotal(newTotal) {
        if (newTotal) {
            if(newTotal < this.total) {
                // truncate the DB
                const newTokenIds = {}
                for (const tokenNo of simpleProgression(0, newTotal)) {
                    newTokenIds[tokenNo] = this.tokenIds[tokenNo]
                }
                this.tokenIds = newTokenIds
            }
            this.total = newTotal
            await this._autoSave()
        }
    }
}

module.exports = {
    DBTokenIds
}
