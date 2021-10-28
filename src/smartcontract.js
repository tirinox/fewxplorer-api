const Web3 = require("web3");
const {MAX_GEN0_TOKEN_ID} = require("./personality");

const FEWMAN_DISAPPEARED = 'nonexistent'

class FewmanContract {
    constructor(web3_path, contract, abi_bath) {
        abi_bath = abi_bath || '../data/fewman.abi.json'
        const abi = require(abi_bath);
        this.w3 = new Web3(web3_path)
        this.contract = new this.w3.eth.Contract(abi, contract)
    }

    async readTotalSupply() {
        return +(await this.contract.methods.totalSupply().call())
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

    async getOwnerSafe(tokenId) {
        try {
            return await this.getOwnerOf(tokenId)
        } catch (e) {
            if(e.toString().includes('ERC721: owner query for nonexistent token')) {
                return FEWMAN_DISAPPEARED
            } else {
                return undefined
            }
        }
    }
}

class FewmanBreedContract {
    constructor(web3_path, contract, abi_bath) {
        abi_bath = abi_bath || '../data/breed.abi.json'
        const abi = require(abi_bath);
        this.w3 = new Web3(web3_path)
        this.contract = new this.w3.eth.Contract(abi, contract)
    }

    async getGeneration(tokenId) {
        if(tokenId <= MAX_GEN0_TOKEN_ID) {
            return 0
        } else {
            return await this.contract.methods.generation(tokenId).call()
        }
    }

    async getChild(tokenId) {
        return await this.contract.methods.childOf(tokenId).call()
    }
}

module.exports = {
    FewmanContract,
    FewmanBreedContract,
    FEWMAN_DISAPPEARED,
}
