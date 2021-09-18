const axios = require("axios");

const ETH_BIG_DIV = BigInt("1000000000000000000")
const ETH_PREC = BigInt("100000")

function convertEthToFloat(x) {
    return Number(BigInt(x) * ETH_PREC / ETH_BIG_DIV) / Number(ETH_PREC)
}

async function getTokensOpenSea(ids) {
    let url = "https://api.opensea.io/wyvern/v1/orders?asset_contract_address=0xad5f6cdda157694439ef9f6dd409424321c74628&bundled=false&include_bundled=false&include_invalid=false&limit=30&offset=0&order_by=eth_price&order_direction=desc"
    for(const id of ids) {
        url += `&token_ids=${id}`
    }
    const data = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
        }
    })

    const orders = data.data.orders

    const results = {}
    for(let order of orders) {
        const tokenId = order.asset.token_id
        const price = convertEthToFloat(order.current_price)
        const owner = order.asset.owner
        results[tokenId] = {
            tokenId,
            price,
            ownerAddress: owner.address,
            ownerName: owner.user.username
        }
    }
    return results
}

module.exports = {
    getTokensOpenSea
}

// example: getTokensOpenSea([0, 4]).then(console.log)
