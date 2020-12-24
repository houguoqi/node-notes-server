const router = require('koa-router')();
const controller = require('../controller/c-test')

// 查询所有用户
router.get('/get_all_users', controller.selectAllUser)
router.get('/delete_user/:id', controller.deleteUser)

module.exports = router