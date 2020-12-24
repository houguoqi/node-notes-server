const router = require('koa-router')();
const controller = require('../controller/c-login')

router.get('/login', controller.getLoginUser)

module.exports = router