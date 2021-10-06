const {timeout, simpleProgression} = require("./util");
const {decodePersonality} = require("./personality");


class JobTokenIds {
    constructor(db,
                contract,
                delayIdle = 60,
                delayTick = 1.0) {
        this.delayIdle = delayIdle
        this.delayTick = delayTick
        this.contract = contract

        this._currentNo = 0
        this._isScanning = false
        this._isRunning = false
        this._lastTotalSupply = 0

        this.db = db
        this._contract = contract
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
        console.info('OpenSeaJob stopped.')
    }

    async _test() {
        const n = await this._contract.readTotalSupply()
        console.log(`Fewman total supply: ${n}`)

        for(const i of simpleProgression(0, 5)) {
            const token = await this._contract.getTokenByIndex(i)

            const personality = await this._contract.getPersonality(token)
            const personalityDecoded = decodePersonality(token, personality)
            const pers = JSON.stringify(personalityDecoded)
            console.log(`Personality of #${token} is  [ ${pers} ]`)
        }
    }

    async _getTokenByIdProtected(id) {
        try {
            return await this._contract.getTokenByIndex(id)
        } catch (e) {
            return null
        }
    }

    async _saveToken(tokenNo, tokenId, personality) {
        const shortPersonality = personality.join('')
        await this.db.saveToken(tokenNo, tokenId, shortPersonality)
        console.info(`Token #${tokenNo} is ID=${tokenId} saved.`)
    }

    async _doScanTick() {
        const tokenId = await this._getTokenByIdProtected(this._currentNo)
        if(tokenId === null) {
            console.warn(`_doScanTick failed @ no ${this._currentNo}. sleeping...`)
            return
        }

        const personality = await this._contract.getPersonality(tokenId)
        await this._saveToken(this._currentNo, tokenId, personality)
        this._currentNo++
        if(this._currentNo >= this._lastTotalSupply) {
            this._isScanning = false
        }
    }

    async _protectedJobTick() {
        if(!this._isScanning) {
            const n = +(await this._contract.readTotalSupply())
            // if number of tokens changed after breading
            if(n !== this._lastTotalSupply) {
                this._isScanning = true
                this._currentNo = 0
                this._lastTotalSupply = n
                this.db.total = n
            }
        }

        while (this._isScanning) {
            await this._doScanTick()
        }
    }

    async _job() {
        this._isRunning = true
        while (this._isRunning) {
            await this._protectedJobTick()
            // try {
            //     console.info('JobTokenIds tick start')
            //     await this._protectedJobTick()
            // } catch (e) {
            //     console.error(`JobTokenIds tick failed: ${e}!`)
            //     await this._delay(this.delayIdle)
            //     continue  // try again the same page!
            // }
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
