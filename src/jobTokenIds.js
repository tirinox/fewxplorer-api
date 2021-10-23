const {timeout} = require("./util");
const {gen0fewman, initialPersonalityArr} = require("./personality");


class JobTokenIds {
    constructor(db,
                contract, breedContract,
                delayTick = 1.0) {
        this.delayTick = delayTick

        this._currentTokenId = 0
        this._isScanning = false
        this._isRunning = false

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

    async _saveToken(tokenId, personality, owner, generation, disappeared) {
        const shortPersonality = personality.join('')
        await this.db.saveToken(tokenId, shortPersonality, owner, generation, disappeared)
        console.info(`JobTokenIds: Token #${tokenId} (Gen${generation}) saved. Dead = ${disappeared}. Owner = ${owner} `)
    }

    async _protectedJobTick() {
        const currId = this._currentTokenId
        try {
            const childTokenId = await this._breedContract.getChild(currId)
            if (+childTokenId !== 0) {
                // This fewman has a child, so it is out
                if (currId < 10000) {
                    await this._saveToken(currId, initialPersonalityArr(currId), '', 0, 1)
                }
            } else {
                const [personality, owner, generation] = await Promise.all([
                    this._contract.getPersonality(currId),
                    this._contract.getOwnerOf(currId),
                    this._breedContract.getGeneration(currId),
                ])

                // todo: if no token => stop scan

                await this._saveToken(currId, personality, owner, generation, 0)
            }
        } catch (e) {
            console.error(`Get Fewman #${currId} from contract failed: "${e}"! Moving to the next one...`)
        }

        this._currentTokenId++
    }

    async _job() {
        this.db.total = +(await this._contract.readTotalSupply())
        console.info(`JobTokenIds: Total supply: ${this.db.total} fewmans.`)

        this._isRunning = true
        this._currentTokenId = this.db.maximumTokenId

        console.info(`JobTokenIds: Starting job from Token #${this._currentTokenId}`)

        while (this._isRunning) {
            try {
                console.info('JobTokenIds: tick start')
                await this._protectedJobTick()
            } catch (e) {
                console.error(`JobTokenIds: tick failed: ${e}!`)
            }
            console.info(`JobTokenIds: Sleep for ${this.delayTick} sec...`)
            await this._delay(this.delayTick)
        }
    }

    async _delay(delay) {
        await timeout(delay * 1000.0)
    }
}

module.exports = {
    JobTokenIds
}
