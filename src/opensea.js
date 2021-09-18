const axios = require("axios");
const SocksProxyAgent = require('socks-proxy-agent');
const PROXY_LIST = require('../data/proxy_list.json')
const UserAgent = require("user-agents");
const _ = require('underscore')

for(let proxy of PROXY_LIST) {
    const ua = new UserAgent()
    proxy.userAgent = ua.toString()
    const [user, password] = proxy.cred.split(':')
    proxy.user = user
    proxy.password = password
    const proxyString = `socks5://${proxy.ip}:${proxy.socks5_port}`
    proxy.httpsAgent = new SocksProxyAgent(proxyString);
}

const ETH_BIG_DIV = Math.pow(10, 18)
const ETH_PREC = 10000


function convertEthToFloat(x) {
    // return Number(BigInt(x) * ETH_PREC / ETH_BIG_DIV) / Number(ETH_PREC)
    return Math.round(Number(x) / ETH_BIG_DIV * ETH_PREC) / ETH_PREC
}

function getProxyConfig() {
    const proxy = _.sample(PROXY_LIST)
    console.info(`proxy ${proxy.ip}`)
    return {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': proxy.userAgent
        },
        httpAgent: proxy.httpsAgent
    }
}

async function getTokensOpenSea(ids) {
    let url = "https://api.opensea.io/wyvern/v1/orders?asset_contract_address=0xad5f6cdda157694439ef9f6dd409424321c74628&bundled=false&include_bundled=false&include_invalid=false&limit=30&offset=0&order_by=eth_price&order_direction=desc"
    for(const id of ids) {
        url += `&token_ids=${id}`
    }
    // console.info(url)
    const cfg = getProxyConfig()

    const data = await axios.get(url, cfg)

    const orders = data.data.orders

    const results = {}
    for(let order of orders) {
        const tokenId = order.asset.token_id
        const price = convertEthToFloat(order.current_price)
        const owner = order.asset.owner
        results[tokenId.toString()] = {
            tokenId,
            price,
            ownerAddress: owner.address,
            ownerName: (owner.user !== null ? owner.user.username : ''),
            buyNow: (order.side === 1)
        }
    }
    return results
}

module.exports = {
    getTokensOpenSea
}

// example: getTokensOpenSea([0, 4]).then(console.log)
