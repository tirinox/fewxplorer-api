const {getTokensOpenSea} = require("./opensea");
const {timeout} = require("./util");


class OpenSeaJob {
    constructor(db, dbTokenIds, contract,
                batchSize = 50,
                delay = 1.01,
                restAfterWork = 60 * 15) {
        this.dbTokenIds = dbTokenIds
        this.batchSize = batchSize
        this.delay = delay
        this.restAfterWork = restAfterWork
        this.contract = contract

        this._tokenIdList = []

        this._currentIndex = 0
        this._isRunning = false

        this.db = db
    }

    rewind(p) {
        this._currentIndex = +p
        return this
    }

    run() {
        if (!this._isRunning) {
            this._takeTokenIds()
            this._isRunning = true
            console.info('OpenSeaJob: started.')
            this._job().then(() => {
                console.warn('OpenSeaJob: job ended!?')
            })
        }
    }

    stop() {
        this._isRunning = false
        console.info('OpenSeaJob: stopped.')
    }

    async _fetchOpenSea(batchIds) {
        let offset = 0
        const allResults = {}
        while (1) {
            const oneBatchResults = await getTokensOpenSea(this.contract, batchIds, offset)
            Object.assign(allResults, oneBatchResults)

            if(Object.keys(oneBatchResults).length < this.batchSize) {
                break
            }
            offset += this.batchSize
        }
        return allResults
    }

    async _checkTokenIdsSetChanges() {
        console.log(`this.dbTokenIds.allTokenIdList.length = ${this.dbTokenIds.allTokenIdList.length}`)
        console.log(`this._tokenIdList.length = ${this._tokenIdList.length}`)

        if(this.dbTokenIds.allTokenIdList.length !== this._tokenIdList.length) {
            console.log('OpenSeaJob: Heads up! Token list updated. I will restart the scanner!')
            this._takeTokenIds()
            this.rewind(0)
        }
    }

    async _job() {
        while (this._isRunning) {
            await this._checkTokenIdsSetChanges()

            console.log(`OpenSeaJob: tick. From ${this._currentIndex} ID to ${this._currentIndex + this.batchSize} ID`)

            try {
                const batchIds = this._tokenIdList.slice(this._currentIndex, this._currentIndex + this.batchSize)

                const tokenInfo = await this._fetchOpenSea(batchIds)

                await this.db.saveNewPricesToFile(tokenInfo, batchIds)
            } catch (e) {
                console.error(`OpenSeaJob: job tick failed: ${e}!`)
                await this._delay(this.delay)
                continue  // try again the same page!
            }

            this._currentIndex += this.batchSize
            if (this._currentIndex > this._tokenIdList.length) {
                this._currentIndex = 0
                console.info(`OpenSeaJob: finished scanning. Will rest for ${this.restAfterWork} sec...`)
                await this._delay(this.restAfterWork)
                this._takeTokenIds()
            }

            // todo: check (this._tokenIdList.len vs this.dbTokenIds.allTokenIdList.len) and reset scan when it changed
            await this._delay(this.delay)
        }
    }

    _takeTokenIds() {
        this._tokenIdList = this.dbTokenIds.allTokenIdList
        console.info(`OpenSeaJob: updated tokenIdList. There are ${this._tokenIdList.length} items.`)
    }

    async _delay(delay) {
        await timeout(delay * 1000.0)
    }
}

module.exports = {
    OpenSeaJob
}