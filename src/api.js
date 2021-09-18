const Koa = require('koa')
const KoaLogger = require('koa-logger')
const KoaRouter = require('koa-router')
const cors = require('@koa/cors')
const {nowTS} = require("./util");

function setupRouter(db) {
    const prefix = process.env.API_PREFIX || '/fewpi'

    console.log(`API prefix: ${prefix}`)

    const router = KoaRouter({
        prefix
    })

    router
        .get('/', (ctx, next) => {
            ctx.body = 'Hello World!';
        })
        .get('/opensea', async (ctx, next) => {
            ctx.body = {
                db: db.priceDB,
                now: nowTS(),
                lastSuccessAgoSec: db.lastSuccessAgoSec
            }
        })
    return router
}

function runServerAPI(db) {
    const app = new Koa();

    app.use(cors({
        origin: '*'
    }))

    app.use(KoaLogger())

    const router = setupRouter(db)
    app.use(router.routes()).use(router.allowedMethods())

    app.use(ctx => {
        ctx.body = 'Not found';
        ctx.status = 404
    });

    const port = process.env.API_PORT || 3033
    console.log(`Listening port ${port}`)
    app.listen(port);
}

module.exports = {
    runServerAPI
}



// const {FewmanContract} = require("./smartcontract");
// const INFURA_ID = process.env.INFURA_ID
// const FEWMAN_CONTRACT = process.env.CONTRACT || '0xad5f6cdda157694439ef9f6dd409424321c74628'
// const contract = new FewmanContract(INFURA_ID, FEWMAN_CONTRACT)


// .get('/contract/total_supply', async (ctx, next) => {
//     ctx.body = {
//         total_supply: (await contract.readTotalSupply())
//     }
// })
// .get('/opensea/tokens/:ids', async (ctx, next) => {
//     const ids = ctx.params.ids.split(',').map(s => s.trim()).filter(e => e)
//     const results = await getTokensOpenSea(ids)
//     ctx.body = {
//         tokens: results
//     }
// })
