const {timeout, simpleProgression} = require("./util");
const {FewmanContract} = require("./smartcontract");
const {decodePersonality} = require("./personality");


class JobTokenIds {
    constructor(db,
                contract,
                delay = 1.01,
                restAfterWork = 60 * 15) {
        this.delay = delay
        this.restAfterWork = restAfterWork
        this.contract = contract

        this._currentIndex = 0
        this._isRunning = false

        this.db = db
        this._contract = contract
    }

    rewind(p) {
        this._currentIndex = +p
        return this
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

        for(const i of simpleProgression(0, 50)) {
            const token = await this._contract.getTokenByIndex(i)
            // console.log(`Token ${i} => ${token}`)

            const personality = await this._contract.getPersonality(token)
            const personalityDecoded = decodePersonality(token, personality)
            const pers = JSON.stringify(personalityDecoded)
            console.log(`Personality of #${token} is  [ ${pers} ]`)
        }
    }

    async _job() {
        this._isRunning = true

        await this._test()  // fixme: debug
        return  // todo!

        while (this._isRunning) {
            try {
                console.info('JobTokenIds tick start')
            } catch (e) {
                console.error(`JobTokenIds tick failed: ${e}!`)
                await this._delay(this.delay)
                continue  // try again the same page!
            }

            // todo: proceed forward

            await this._delay(this.delay)
        }
    }

    async _delay(delay) {
        await timeout(delay * 1000.0)
    }
}

module.exports = {
    JobTokenIds
}
