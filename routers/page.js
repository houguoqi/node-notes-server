const router = require('koa-router')();
const controller = require('../controller/c-page')

router.get('/', async (ctx) => {
    ctx.body = {
        code: 200,
        message: 'welcome'
    }
})
router.get('/add_blog', controller.addBlog)
router.get('/get_all_blogs', controller.selectAllBlog)
router.get('/get_my_blogs', controller.selectMyBlog)
router.get('/get_userinfo_id', controller.selectUserInfoById)
router.get('/get_token_node', controller.getQiniuTokenNodeSDK)
router.get('/comment_blog', controller.commentBlog)
router.get('/get_comments', controller.getComments)
router.get('/save_blog', controller.saveBlogById)
router.get('/get_my_save', controller.getMySaves)
router.get('/search_blog', controller.searchBlog)
router.post('/upload_avator', controller.avatorUpload)
router.get('/get_avator', controller.getAvator)
router.get('/compress_record', controller.compressImageRecord)
router.get('/get_compress_record', controller.getCompressRecord)
router.get('/add_learn_record', controller.addLearnRecord)
router.get('/get_learn_record', controller.getLearnRecord)

module.exports = router