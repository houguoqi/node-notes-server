const jwt = require('jsonwebtoken'); // 生成token

module.exports = {
    checkToken (ctx) {
        let token = ctx.headers.authorization;
        if (token) {
            let message = ''
            jwt.verify(token, 'secret', (err, decoded) => {
                if (err) {
                    switch (err.name) {
                        case 'JsonWebTokenError':
                            message = '无效的token'
                            break;
                        case 'TokenExpiredError':
                            message = 'token过期'
                            break;
                    }
                    ctx.body = {
                        code: 403,
                        message: message
                    }
                    return false
                }
                return true
            })
        }
        return false
    }
}