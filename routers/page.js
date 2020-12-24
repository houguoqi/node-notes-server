const router = require('koa-router')();
const controller = require('../controller/c-page')

router.get('/', (ctx) => {
    ctx.body = {
        code: 200,
        message: 'welcome'
    }
})
router.get('/add_blog', controller.addBlog)
router.get('/get_all_blogs', controller.selectAllBlog)
router.get('/get_my_blogs', controller.selectMyBlog)

module.exports = router