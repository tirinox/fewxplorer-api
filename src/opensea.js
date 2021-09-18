const axios = require("axios");

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
    console.log(data.data)
    return BigInt(data.current_price)
}

module.exports = {
    getTokensOpenSea
}

// example: getTokensOpenSea([0, 4]).then(console.log)
