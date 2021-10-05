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
            this._isRunning = true
            console.info('OpenSeaJob started.')
            this._job().then(() => {
                console.warn('job ended!?')
            })
        }
    }

    stop() {
        this._isRunning = false
        console.info('OpenSeaJob stopped.')
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

    _getAllTokenIds() {
        return this.dbTokenIds.getAll()
    }

    async _job() {
        while (this._isRunning) {
            console.log(`OpenSeaJob tick. From ${this._currentIndex} ID to ${this._currentIndex + this.batchSize} ID`)

            try {
                const batchIds = this._getAllTokenIds().slice(this._currentIndex, this._currentIndex + this.batchSize)

                const tokenInfo = await this._fetchOpenSea(batchIds)

                await this.db.saveNewPrices(tokenInfo, batchIds)
            } catch (e) {
                console.error(`job tick failed: ${e}!`)
                await this._delay(this.delay)
                continue  // try again the same page!
            }

            this._currentIndex += this.batchSize
            if (this._currentIndex > this.allTokenIds.length) {
                this._currentIndex = 0
                await this._delay(this.restAfterWork)
            }
            await this._delay(this.delay)
        }
    }

    async _delay(delay) {
        await timeout(delay * 1000.0)
    }
}

module.exports = {
    OpenSeaJob
}