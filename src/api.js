const Koa = require('koa')
const KoaLogger = require('koa-logger')
const KoaRouter = require('koa-router')
const cors = require('@koa/cors')
const {nowTS} = require("./util");
const {getTokensOfAddressAll} = require("./opensea");
const {Config} = require("../config");

function setupRouter(dbPrice, dbTokensIds) {
    const prefix = process.env.API_PREFIX || '/fewpi'

    console.log(`API prefix: ${prefix}`)

    const router = KoaRouter({
        prefix
    })

    router
        .get('/', (ctx, next) => {
            ctx.body = "This is FEWMan's API!"
        })
        .get('/opensea', async (ctx, next) => {
            ctx.body = {
                db: dbPrice.priceDB,
                now: nowTS(),
                lastSuccessAgoSec: dbPrice.lastSuccessAgoSec
            }
        })
        .get('/tokenids', async (ctx, next) => {
            ctx.body = {
                db: dbTokensIds.allData,
                now: nowTS(),
            }
        })
        .get('/address/:address', async (ctx, next) => {
            const address = ctx.params.address
            try {
                const tokensIds = await getTokensOfAddressAll(address, Config.FEWMAN_CONTRACT, Config.OPEN_SEA_KEY)
                ctx.body = {
                    tokensIds,
                    count: tokensIds.length,
                    now: nowTS(),
                }
            } catch (e) {
                ctx.body = {
                    tokensIds: [],
                    count: 0,
                    error: e.toString(),
                    now: nowTS(),
                }
            }
        })
    return router
}

function runServerAPI(dbPrice, dbTokensIds) {
    const app = new Koa();

    app.use(cors({
        origin: '*'
    }))

    app.use(KoaLogger())

    const router = setupRouter(dbPrice, dbTokensIds)
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
