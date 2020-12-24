const userModel = require('../lib/mysql.js');
const moment = require('moment');
const jwt = require('jsonwebtoken'); // 生成token

exports.getLoginUser = async ctx => {
    let { username, password} = ctx.query
    if(!username || !password) {
        ctx.body = {
            code: 500,
            message: '用户名或密码未填写'
        }
        return
    }
    await userModel.userLogin(username, password).then(res => {
        if(password === res[0].password) {
            let token = ''
            //jwt生成加密token，username是公文，密钥是“secret”，1小时后过期
            token = jwt.sign({ username }, "secret", { expiresIn: 60 * 60 * 1 });
            ctx.body = {
                code: 200,
                message: '登录成功',
                token: token
            }
        } else {
            ctx.body = {
                code: 500,
                message: '账号或密码不正确'
            }
        }
    }).catch((err) => {
        ctx.body = {
            code: 500,
            message: '用户不存在'
        }
    })
}