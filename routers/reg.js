const router = require('koa-router')();
const controller = require('../controller/c-reg')

// 用户注册
router.post('/reg', controller.postRegUser)
router.get('/reg', async (ctx) => {
    ctx.body = {
        code: 403,
        message:'请使用POST方式'
    }
})

module.exports = router