const {getTokensOpenSea} = require("./opensea");

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class OpenSeaJob {
    static simpleProgression(start, end) {
        return Array(end - start + 1)
            .fill(0)
            .map((element, index) => index + start)
    }

    constructor(db, allTokenIds, batchSize = 50,
                delay = 1.01) {
        this.allTokenIds = allTokenIds
        this.batchSize = batchSize
        this.delay = delay

        this._currentIndex = 0
        this._isRunning = false

        this.db = db
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

    async _job() {
        while (this._isRunning) {
            console.log(`OpenSeaJob tick. From ${this._currentIndex} ID to ${this._currentIndex + this.batchSize} ID`)

            try {
                const batchIds = this.allTokenIds.slice(this._currentIndex, this._currentIndex + this.batchSize)
                const tokenInfo = await getTokensOpenSea(batchIds)

                await this.db.saveNewPrices(tokenInfo)
            } catch (e) {
                console.error(`job tick failed: ${e}!`)
                await this._delay()
                continue  // try again the same page!
            }

            this._currentIndex += this.batchSize
            if (this._currentIndex > this.allTokenIds.length) {
                this._currentIndex = 0
            }
            await this._delay()
        }
    }

    async _delay() {
        await timeout(this.delay * 1000.0)
    }
}

module.exports = {
    OpenSeaJob
}