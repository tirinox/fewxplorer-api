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
            ctx.body = "This is FEWMan's API!"
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

function runServerAPI(dbPrice, dbTokensIds) {
    const app = new Koa();

    app.use(cors({
        origin: '*'
    }))

    app.use(KoaLogger())

    const router = setupRouter(dbPrice)
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
