const {timeout} = require("./util");


class JobTokenIds {
    constructor(db,
                contract, breedContract,
                delayIdle = 60,
                delayTick = 1.0) {
        this.delayIdle = delayIdle
        this.delayTick = delayTick

        this._currentNo = 0
        this._isScanning = false
        this._isRunning = false
        this._lastTotalSupply = 0

        this.db = db
        this._contract = contract
        this._breedContract = breedContract

        this.alwaysScanDebug = false
    }

    run() {
        if (!this._isRunning) {
            console.info('JobTokenIds started.')
            this._job().then(() => {
                console.warn('JobTokenIds ended!?')
            })
        }
    }

    stop() {
        this._isRunning = false
        console.info('JobTokenIds stopped.')
    }

    async _getTokenByIdProtected(id) {
        try {
            return await this._contract.getTokenByIndex(id)
        } catch (e) {
            return null
        }
    }

    async _saveToken(tokenNo, tokenId, personality, owner, generation) {
        const shortPersonality = personality.join('')
        await this.db.saveToken(tokenNo, tokenId, shortPersonality, owner, generation)
        console.info(`JobTokenIds: Token #${tokenNo} is ID=${tokenId} (G${generation}) saved.`)
    }

    async _doScanTick() {
        const tokenId = await this._getTokenByIdProtected(this._currentNo)
        if (tokenId === null) {
            console.error(`JobTokenIds: _doScanTick failed @ no ${this._currentNo}. sleeping...`)
        } else {
            try {
                const [personality, owner, generation] = await Promise.all([
                    this._contract.getPersonality(tokenId),
                    this._contract.getOwnerOf(tokenId),
                    this._breedContract.getGeneration(tokenId),
                ])
                await this._saveToken(this._currentNo, tokenId, personality, owner, generation)
            } catch (e) {
                console.error(`Get Fewman ${this._currentNo} (#${tokenId}) from contract failed: "${e}"! Moving to the next one...`)
            }
        }

        this._currentNo++
        if (this._currentNo >= this._lastTotalSupply) {
            this._isScanning = false
        }
    }

    async _protectedJobTick() {
        if (!this._isScanning) {
            const n = +(await this._contract.readTotalSupply())

            console.log(`Fewman total supply: ${n}`)
            // if number of tokens changed after breading
            if (n !== this._lastTotalSupply || this.alwaysScanDebug) {
                console.log(`JobTokenIds: start scan. Supply changed from ${this._lastTotalSupply} to ${n}!`)
                this._isScanning = true
                this._currentNo = 0
                this._lastTotalSupply = n
                await this.db.updateTotal(n)
            }
        }

        let scanned = false
        while (this._isScanning) {
            await this._doScanTick()
            scanned = true
        }

        if(scanned) {
            console.log(`JobTokenIds: scan ended.`)
            await this.db.saveToFile()
        }
    }

    async _job() {
        this._lastTotalSupply = this.db.allTokenIdList.length  // if all scanned => no scan at startup
        this._isRunning = true
        while (this._isRunning) {
            try {
                console.info('JobTokenIds: tick start')
                await this._protectedJobTick()
            } catch (e) {
                console.error(`JobTokenIds: tick failed: ${e}!`)
            }
            console.info(`JobTokenIds: Sleep for ${this.delayIdle} sec...`)
            await this._delay(this.delayIdle)
        }
    }

    async _delay(delay) {
        await timeout(delay * 1000.0)
    }
}

module.exports = {
    JobTokenIds
}
