const userModel = require('../lib/mysql.js');
const moment = require('moment');
const check = require('../middlewares/checkToken.js')

// 新增博客
exports.addBlog = async ctx => {
    await check.checkToken(ctx)
    let blog_id = null
    let createdate = moment().format('YYYY-MM-DD HH:mm:ss')
    let { blog_title, blog_content, user_id } = ctx.query
    let value = [blog_id, blog_title, blog_content, user_id, createdate]
    await userModel.addBlog(value).then(res => {
        ctx.body = {
            code: 200,
            message: '提交成功'
        }
    }).catch(() => {
        ctx.body = {
            code: 500,
            message: '提交异常，请重试'
        }
    })
}

// 查询所有博客并分页
exports.selectAllBlog = async ctx => {
    let page = ctx.query.page
    if (!page) {
        ctx.body = {
            code: 500,
            message: '查询异常，缺少页码'
        }
        return
    }
    let total = 0
    await userModel.getTotalAllBlog().then(res => {
        total = res[0].total
    }).catch(() => {
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
        return
    })
    await userModel.selectAllBlog(page).then(res => {
        ctx.body = {
            code: 200,
            message: '查询成功',
            data: {
                result: res,
                total: total
            }
        }
    }).catch(() => {
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}

// 查询我的博客
exports.selectMyBlog = async ctx => {
    await check.checkToken(ctx)
    let user_id = ctx.query.user_id
    let page = ctx.query.page
    if(!user_id) {
        ctx.body = {
            code: 500,
            message: '缺少用户id'
        }
        return
    }
    if(!page) {
        ctx.body = {
            code: 500,
            message: '缺少页码'
        }
        return
    }
    let total = 0
    await userModel.getTotalMyBlog(user_id).then(res => {
        total = res[0].total
    }).catch(() => {
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
        return
    })
    await userModel.selectMyBlog(user_id, page).then(res => {
        ctx.body = {
            code: 200,
            message: '查询成功',
            data: {
                result: res,
                total: total
            }
        }
    }).catch(() => {
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}