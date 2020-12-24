const userModel = require('../lib/mysql.js');
var common = require('../utils/common')
const md5 = require('md5')
const moment = require('moment');

exports.postRegUser = async ctx => {
    let uuid = common.uuid()
    let createdate = moment().format('YYYY-MM-DD HH:mm:ss')
    let { username, password } = ctx.request.body
    console.log(typeof password)
    await userModel.selectUser(username)
        .then(async (result) => {
            console.log(result)
            if (result.length > 0) {
                ctx.body = {
                    code: 403,
                    message: '用户名已存在'
                }
            } else {
                await userModel.userReg([uuid, username, md5(password), createdate])
                    .then(async (result) => {
                        console.log(result)
                        ctx.body = {
                            code:200,
                            message:'注册成功'
                        }
                    }).catch(() => {
                        ctx.body = {
                            code: 500,
                            message: '注册失败'
                        }
                    })
            }
        }).catch(() => {
            ctx.body = {
                code: 500,
                message: '注册异常，请重试'
            }
        })
}