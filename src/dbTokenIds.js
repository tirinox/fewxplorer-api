const {nowTS, simpleProgression} = require("./util");
const fs = require('fs').promises

class DBTokenIds {
    constructor(filePath, saveEverySec = 10) {
        this.filePath = filePath
        this.tokenIds = {}  // tokenId -> { tokenId, personality, ownerAddress, gender }
        this.lastSavedTS = 0
        this.lastUpdatedTS = 0
        this.saveEverySec = saveEverySec
        this.total = 0
        this.maximumTokenId = -1
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

    findByTokenId(tokenId) {
        return this.tokenIds[tokenId]
    }

    get allData() {
        return {
            ids: this.tokenIds,
            lastSavedTS: this.lastSavedTS,
            lastUpdatedTS: this.lastUpdatedTS,
            total: this.total,
            maximumTokenId: this.maximumTokenId,
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
            this.lastSavedTS = +(data.lastSavedTS ?? 0)
            this.lastUpdatedTS = +(data.lastUpdatedTS ?? 0)
            this.total = +(data.total ?? 0)
            this.maximumTokenId = +(data.maximumTokenId ?? 0)
        }
    }

    async saveToken(tokenId, personality, owner, generation, disappeared) {
        tokenId = +tokenId
        this.tokenIds[tokenId] = [tokenId, personality, owner, +generation, disappeared]
        this.lastUpdatedTS = nowTS()
        this.maximumTokenId = Math.max(this.maximumTokenId, tokenId)
        await this._autoSave()
    }

    async updateOwner(tokenId, owner) {
        tokenId = +tokenId
        const fewman = this.tokenIds[tokenId]
        if(fewman) {
            fewman.owner = owner
            await this._autoSave()
        }
    }

    async _autoSave() {
        if (this.lastSaveSecAgo > this.saveEverySec) {
            this.lastSavedTS = nowTS()
            await this.saveToFile()
        }
    }
}

module.exports = {
    DBTokenIds
}
