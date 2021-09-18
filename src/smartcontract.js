const Web3 = require("web3");


class FewmanContract {
    constructor(infura_id, contract, abi_bath) {
        abi_bath = abi_bath || '../data/fewman.abi.json'
        const abi = require(abi_bath);
        this.w3 = new Web3(`https://mainnet.infura.io/v3/${infura_id}`)
        this.contract = new this.w3.eth.Contract(abi, contract)
    }

    async readTotalSupply() {
        return await this.contract.methods.totalSupply().call()
    }

    async getTokenByIndex(i) {
        return await this.contract.methods.tokenByIndex(i).call()
    }

    async getPersonality(tokenId) {
        return await this.contract.methods.personality(tokenId).call()
    }

    async addressBalance(address) {
        return await this.contract.methods.balanceOf(address).call()
    }

    async getOwnerOf(tokenId) {
        return await this.contract.methods.ownerOf(tokenId).call()
    }
}

module.exports = {
    FewmanContract
}
