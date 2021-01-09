const userModel = require('../lib/mysql.js');
const moment = require('moment');
const check = require('../middlewares/checkToken.js')
const qiniu = require('qiniu');
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

// 新增博客
exports.addBlog = async ctx => {
    await check.checkToken(ctx)
    let blog_id = null
    let createdate = moment().format('YYYY-MM-DD HH:mm:ss')
    let { blog_title, blog_content, user_id, photos, video } = ctx.query
    let value = [blog_id, blog_title, blog_content, user_id, photos, createdate, video]
    await userModel.addBlog(value).then(res => {
        console.log(res)
        ctx.body = {
            code: 200,
            message: '提交成功'
        }
    }).catch((err) => {
        console.log(err)
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
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
        return
    })
    await userModel.selectAllBlog(page).then(res => {
        console.log(res)
        if (res.length) {
            res.forEach(ele => {
                ele.photos = JSON.parse(JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(ele)).photos)))
                // console.log(ele)
            })
        }
        ctx.body = {
            code: 200,
            message: '查询成功',
            data: {
                result: res,
                total: total
            }
        }
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}

// 模糊搜索博客
exports.searchBlog = async ctx => {
    let val = ctx.query.keyword
    await userModel.searchBlog(val).then(res => {
        console.log(res)
        res.forEach(ele => {
            ele.photos = JSON.parse(JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(ele)).photos)))
            // console.log(ele)
        })
        ctx.body = {
            code: 200,
            message: '查询成功',
            result: res
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

// 通过用户ID查询用户信息
exports.selectUserInfoById = async ctx => {
    let user_id = ctx.query.user_id
    if (!user_id) {
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
        return
    }
    await userModel.selectUserById(user_id).then(res => {
        ctx.body = {
            code: 200,
            message: '查询成功',
            result: res
        }
    }).catch(err => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}

// 评论博客
exports.commentBlog = async ctx => {
    await check.checkToken(ctx)
    let comment_id = null
    let createdate = moment().format('YYYY-MM-DD HH:mm:ss')
    let { blog_id, user_id, content } = ctx.query
    if (!blog_id || !user_id || !content) {
        ctx.body = {
            code: 500,
            message: '参数异常，请重试'
        }
        return
    }
    let value = [comment_id, blog_id, user_id, content, createdate]
    await userModel.commentBlog(value).then(res => {
        console.log(res)
        ctx.body = {
            code: 200,
            message: '提交成功'
        }
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '提交异常，请重试'
        }
    })
}

// 查询评论
exports.getComments = async ctx => {
    let blog_id = ctx.query.blog_id
    if (!blog_id) {
        ctx.body = {
            code: 500,
            message: '缺少blog_id，请重试'
        }
        return
    }
    await userModel.getBlogComments(blog_id).then(res => {
        console.log(res)
        ctx.body = {
            code: 200,
            message: '查询成功',
            result: res
        }
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}

// 收藏博客
exports.saveBlogById = async ctx => {
    await check.checkToken(ctx)
    let id = null
    let { blog_id, user_id } = ctx.query
    let createdate = moment().format('YYYY-MM-DD HH:mm:ss')
    if (!blog_id || !user_id) {
        ctx.body = {
            code: 500,
            message: '参数异常，请重试'
        }
        return
    }
    let isSave = false
    await userModel.isSaveBlog(blog_id, user_id).then(res => {
        console.log(res[0], 'issave')
        if (res.length) {
            ctx.body = {
                code: 500,
                message: '重复收藏'
            }
            isSave = true
        }
    })
    if (!isSave) {
        let value = [id, blog_id, user_id, createdate]
        await userModel.saveBlogById(value).then(res => {
            console.log(res)
            ctx.body = {
                code: 200,
                message: '收藏成功'
            }
        }).catch((err) => {
            console.log(err)
            ctx.body = {
                code: 500,
                message: '提交异常，请重试'
            }
        })
    }
}

// 查询我的收藏
exports.getMySaves = async ctx => {
    const user_id = ctx.query.user_id
    await userModel.selectMySaves(user_id).then(res => {
        ctx.body = {
            code: 200,
            message: '查询成功',
            result: res
        }
    }).catch((err) => {
        console.log(err)
        ctx.body = {
            code: 500,
            message: '查询异常，请重试'
        }
    })
}

// 上传头像
exports.avatorUpload = async ctx => {
    await check.checkToken(ctx)
    let { user_id, username, avatorurl, avatorFile } = ctx.request.body
    // 将头像写入磁盘
    let base64Data = avatorFile.replace(/^data:image\/\w+;base64,/, ""),
    dataBuffer = Buffer.from(base64Data, 'base64'),
    getName = user_id + username,
    upload = await new Promise((resolve, reject) => {
        fs.writeFile('./assets/images/' + getName + '.png', dataBuffer, err => {
            if (err) {
                throw err;
                reject(false)
            };
            console.log('头像上传成功')
            resolve(true)
        });
    })
    if (upload) {
        let value = [user_id, username, avatorurl]
        if (!user_id || !username || !avatorurl) {
            ctx.body = {
                code: 500,
                message: '参数异常，请重试'
            }
            return
        }
        await userModel.avatorUpload(value).then(res => {
            console.log(res)
            ctx.body = {
                code: 200,
                message: '上传成功'
            }
        }).catch((err) => {
            console.log(err)
            ctx.body = {
                code: 500,
                message: '暂时无法更改头像'
            }
        })
    }
}

// 查询头像 这里存取头像不采用七牛云存储了，采用磁盘读写的方式
exports.getAvator = async ctx => {
    await check.checkToken(ctx)
    let { user_id, username } = ctx.query
    let hasAvator = false
    if (!user_id || !username) {
        ctx.body = {
            code: 500,
            message: '缺少参数，请重试'
        }
        return
    }
    await userModel.getAvator(user_id).then(res => {
        console.log(res)
        if (!res.length) {
            ctx.body = {
                code: 500,
                message: '未上传头像'
            }
        } else {
            hasAvator = true
        }
    }).catch(err => {
        ctx.body = {
            code: 500,
            message: '查询异常'
        }
    })
    if (hasAvator) {
         // 读取磁盘上的头像目录
        let readFile = await new Promise((resolve, reject) => {
            fs.readFile('./assets/images/'+ user_id + username + '.png', function (err, data) {
                if (err) {
                    throw err
                    reject(false)
                } else {
                    const imagePrefix = "data:image/bmp;base64,";
                    resolve(imagePrefix + data.toString('base64')) // 转为base64图片格式
                }
            });
        })
        ctx.body = {
            code: 200,
            message: '查询成功',
            avatorFile: readFile
        }
    }
}

// Node SDK 获取七牛token
exports.getQiniuTokenNodeSDK = async ctx => {
    const accessKey = 'rqJGdbSEFcvyV-8asJJMim27ZqVBWupM-kux9KZG';
    const secretKey = 'jsITz065NT0nVkuIwk9qmihogXNdc8sqDDLiL3Rk';
    const bucket = 'hgqweb';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const options = {
        scope: bucket,
        expires: 7200
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = await putPolicy.uploadToken(mac);
    ctx.body = {
        code: 200,
        error: 0,
        message: '返回token成功',
        data: uploadToken
    }
}