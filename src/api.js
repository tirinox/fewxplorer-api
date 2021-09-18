const Koa = require('koa')
const KoaLogger = require('koa-logger')
const KoaRouter = require('koa-router')
const {readTotalSupply} = require("./smartcontract");

const prefix = process.env.API_PREFIX || '/fewpi'
console.log(`API prefix: ${prefix}`)
const router = KoaRouter({
    prefix
})

router
    .get('/', (ctx, next) => {
        ctx.body = 'Hello World!';
    })
    .get('/contract/total_supply', async (ctx, next) => {
        ctx.body = {
            total_supply: (await readTotalSupply())
        }
    })

function runServerAPI() {
    const app = new Koa();

    app.use(KoaLogger())
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
