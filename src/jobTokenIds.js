const {timeout} = require("./util");
const {initialPersonalityArr, MAX_GEN0_TOKEN_ID} = require("./personality");
const {FEWMAN_DISAPPEARED} = require("./smartcontract");

/*
       1) Job: every 24 hour (save/load last ts) - start from 0 and scan
       2) Job: get last known token ID and check next - if any
 */


class JobTokenIds {
    constructor(db,
                contract, breedContract,
                delayTick = 1.0,
                bigSleep = 60 * 60 * 4) {
        this.delayTick = delayTick

        this._currentTokenId = 0
        this._isScanning = false
        this._isRunning = false

        this.db = db
        this._contract = contract
        this._breedContract = breedContract

        this._errCounter = 0
        this._bigSleep = bigSleep
        this._step = 0
        this._checkLastEveryNSteps = 50
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

    rewindToStart() {
        this._currentTokenId = 0
        console.info('JobTokenIds: rewind to 0!')
    }

    async _getTokenByIdProtected(id) {
        try {
            return await this._contract.getTokenByIndex(id)
        } catch (e) {
            return null
        }
    }

    async _getPersonalityAndGenerationSmart(tokenId) {
        let personality, generation
        tokenId = +tokenId
        if (tokenId <= MAX_GEN0_TOKEN_ID) {
            personality = initialPersonalityArr(tokenId)
            generation = 0
        } else {
            [personality, generation] = await Promise.all([
                this._contract.getPersonality(tokenId),
                this._breedContract.getGeneration(tokenId),
            ])
        }

        return {
            personality, generation
        }
    }

    async _saveToken(tokenId, personality, owner, generation, disappeared) {
        const shortPersonality = personality.join('')
        if(owner === FEWMAN_DISAPPEARED) {
            owner = ''
        }
        await this.db.saveToken(tokenId, shortPersonality, owner, generation, disappeared)
        console.info(`JobTokenIds: Token #${tokenId} (Gen${generation}) saved. Dead = ${disappeared}. Owner = ${owner} `)
    }

    async _checkLastFewmans(lastId) {
        lastId = lastId !== undefined ? lastId : (this.db.maximumTokenId + 1)

        const teorLimitId = (MAX_GEN0_TOKEN_ID + 1) * 2 + 1
        while (lastId < teorLimitId) {
            const childTokenId = await this._breedContract.getChild(lastId)
            if (+childTokenId !== 0) {
                console.warn(`JobTokenIds: Oops #${lastId} has a child! Try next!`)
                lastId++
            } else {
                console.info(`JobTokenIds: Jeez #${lastId} has no child!`)
                break
            }
        }

        const owner = await this._contract.getOwnerSafe(lastId)
        if (owner && owner !== FEWMAN_DISAPPEARED) {
            const {personality, generation} = await this._getPersonalityAndGenerationSmart(lastId)
            await this._saveToken(lastId, personality, owner, generation, 0)
        }
    }

    async _checkLastFewmansSometimes() {
        // check the trail fewmans sometimes
        try {
            if (this._step % this._checkLastEveryNSteps === 0) {
                await this._checkLastFewmans()
            }
        } catch (e) {
            console.warn(`JobTokenIds: _checkLastFewmansSometimes failed with error!`)
        } finally {
            ++this._step
        }
    }

    _isFinished(tokenId, generation) {
        return (tokenId > MAX_GEN0_TOKEN_ID && +generation === 0)
    }

    async _protectedJobTick() {

        // current big job
        const currId = this._currentTokenId
        try {
            const owner = await this._contract.getOwnerSafe(currId)
            if (!owner) {
                console.warn(`JobTokenIds: error reading owner of #${currId}. Will try again...`)
                this._errCounter++
                if (this._errCounter > 5) {
                    this._errCounter = 0
                    this._currentTokenId++
                    console.error(`JobTokenIds: too many error for #${currId}. Move on across him...`)
                }
                return
            } else {
                const disappeared = owner === FEWMAN_DISAPPEARED ? 1 : 0
                if(!this.db.findByTokenId(currId)) {
                    const {personality, generation} = await this._getPersonalityAndGenerationSmart(currId)
                    await this._saveToken(currId, personality, owner, generation, disappeared)

                    if(this._isFinished(currId, generation)) {
                        console.log(`JobTokenIds: finished at #${currId}.`)
                        this._currentTokenId = 0
                        console.log(`JobTokenIds: big sleep ${this._bigSleep} seconds!`)
                        await this._delay(this._bigSleep)
                        return
                    }

                } else {
                    console.log(`JobTokenIds: #${currId} already saved. Updating owner only`)
                    await this.db.updateOwner(currId, owner)
                }

                if (disappeared) {
                    console.warn(`JobTokenIds: Fewman #${currId} disappeared.`)
                }
            }
        } catch (e) {
            console.error(`Get Fewman #${currId} from contract failed: "${e}"! Moving to the next one...`)
        }

        this._currentTokenId++
    }

    async _job() {
        // console.log(await this._getPersonalityAndGenerationSmart(10550))
        // return
        // ---------------

        this.db.total = +(await this._contract.readTotalSupply())
        console.info(`JobTokenIds: Total supply: ${this.db.total} fewmans.`)

        this._isRunning = true

        // on start:
        this._currentTokenId = 10540

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
