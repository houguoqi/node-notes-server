const userModel = require('../lib/mysql.js');
var common = require('../utils/common')
const md5 = require('md5')
const moment = require('moment');

exports.selectAllUser = async ctx => {
    await userModel.selectAllUser().then(result => {
        console.log(result)
        ctx.body = {
            code: 200,
            message: '查询成功',
            data: result
        }
    }).catch( ctx => {
        ctx.body = {
            code: 500,
            message:'查询异常'
        }
    })
}

exports.deleteUser = async ctx => {
    let id = ctx.params.id
    console.log(id, 'ididdidididi')
    if (!id) {
        ctx.body = {
            code: 500,
            message: '缺少用户id'
        }
    } else {
        let allow = true
        await userModel.selectUserById(id).then((result) => {
            console.log(result)
            if (result.length < 1) {
                allow = false
                ctx.body = {
                    code: 500,
                    message: '用户不存在'
                }
            }
        })
        if (allow) {
            await userModel.deleteUser(id).then(result => {
                console.log(result)
                ctx.body = {
                    code: 200,
                    message: '删除成功'
                }
            }).catch( ctx => {
                ctx.body = {
                    code: 500,
                    message:'删除异常'
                }
            })
        }
    }
}