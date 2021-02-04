var mysql = require('mysql');
const moment = require('moment')
var config = require('../config/default.js')

var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
});

let query = function( sql, values ) {

  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
        console.log(err)
      } else {
        console.log('连接数据库成功')
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
            console.log(err)
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })

}

let users =
    `create table if not exists users(
     id VARCHAR(100) NOT NULL,
     username VARCHAR(100) NOT NULL COMMENT '用户名',
     password VARCHAR(100) NOT NULL COMMENT '密码',
     createdate VARCHAR(100) NOT NULL COMMENT '注册时间',
     PRIMARY KEY ( id )
    );`

let blogs =
    `create table if not exists blogs(
        blog_id INT NOT NULL AUTO_INCREMENT,
        blog_title VARCHAR(100) NOT NULL COMMENT '标题',
        blog_content VARCHAR(100) NOT NULL COMMENT '内容',
        user_id VARCHAR(100) NOT NULL COMMENT '用户id',
        photos VARCHAR(2550) NOT NULL COMMENT '图片',
        video VARCHAR(2550) NOT NULL COMMENT '视频',
        createdate VARCHAR(100) NOT NULL COMMENT '发布时间',
        PRIMARY KEY ( blog_id )
    );`

let comments =
    `create table if not exists comments(
        comment_id INT NOT NULL AUTO_INCREMENT,
        blog_id INT NOT NULL COMMENT '博客ID',
        user_id VARCHAR(100) NOT NULL COMMENT '用户id',
        content VARCHAR(2550) NOT NULL COMMENT '评论内容',
        createdate VARCHAR(100) NOT NULL COMMENT '发布时间',
        PRIMARY KEY ( comment_id )
    );`

let saves =
    `create table if not exists saves(
        id INT NOT NULL AUTO_INCREMENT,
        blog_id INT NOT NULL COMMENT '博客ID',
        user_id VARCHAR(100) NOT NULL COMMENT '用户id',
        createdate VARCHAR(100) NOT NULL COMMENT '收藏时间',
        PRIMARY KEY ( id )
    );`

let avator =
    `create table if not exists avator(
        user_id VARCHAR(100) NOT NULL COMMENT '用户id',
        username VARCHAR(100) NOT NULL COMMENT '用户名',
        avatorurl VARCHAR(255) NOT NULL COMMENT '头像',
        PRIMARY KEY ( user_id )
    );`

let compressrecord =
  `create table if not exists compressrecord(
      id INT NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(100) NOT NULL COMMENT '用户id',
      username VARCHAR(100) NOT NULL COMMENT '用户名',
      count INT NOT NULL COMMENT '数量',
      createdate VARCHAR(100) NOT NULL COMMENT '压缩时间',
      PRIMARY KEY ( id )
  );`

let createTable = ( sql ) => {
    return query( sql, [] )
}

// 建表
createTable(users)
createTable(blogs)
createTable(comments)
createTable(saves)
createTable(avator)
createTable(compressrecord)


// 2020-12-18 NEW
// 用户注册
let userReg  = function(value) {
    let _sql = `insert into users set id=?,username=?,password=?,createdate=?;`
    return query( _sql, value )
}
// 用户登录
let userLogin = function(username) {
  let _sql = `select * from users where username="${username}";`
  return query( _sql )
}
// 查找用户(name)
let selectUser = function(name) {
    let _sql = `select * from users where username="${name}";`
    return query( _sql )
}
// 查找用户(ID)
let selectUserById = function(id) {
  let _sql = `select * from users where id="${id}";`
  return query( _sql )
}
// 删除用户
let deleteUser = function(id) {
    let _sql = `delete from users where id="${id}";`
    return query( _sql )
}
// 查询所有用户信息
let selectAllUser = function() {
  let _sql = `select * from users;`
  return query( _sql )
}
// 新增博客
let addBlog = function(value) {
  let _sql = `insert into blogs set blog_id=?,blog_title=?,blog_content=?,user_id=?,photos=?,createdate=?,video=?;`
  return query( _sql, value )
}
// 查询所有博客
let selectAllBlog = function(page) {
  let _sql = `select * from blogs order by createdate desc limit ${(page-1)*10},10;`
  return new Promise((resolve, reject) => {
    query( _sql ).then(res => {
        if (res.length) {
            let getPromiseAvator = []
            res.forEach(ele => {
                let _sql_ava = `select avatorurl from avator where user_id='${ele.user_id}';`
                getPromiseAvator.push(query( _sql_ava ))
            })
            Promise.all(getPromiseAvator).then(res2 => {
                console.log(res2 , '结果')
                res2.forEach((res2_ele, index) => {
                    res[index].avatorurl = res2_ele.length ? res2_ele[0].avatorurl : ''
                })
                let promiseSonSql = []
                // 遍历查询评论
                  res.forEach(ele2 => {
                      let _sql_son = `SELECT
                                        SQL_NO_CACHE a.*, b.username
                                      FROM
                                        comments a
                                      JOIN
                                        users b
                                      ON
                                        a.user_id = b.id
                                      WHERE
                                        a.blog_id='${ele2.blog_id}'`
                      promiseSonSql.push(query( _sql_son))
                  });
                  // 赋值评论
                  Promise.all(promiseSonSql).then(res_son => {
                      res.forEach((ele3, index3) => {
                          ele3.comments = res_son[index3]
                      })
                      resolve(res)
                  }).then(err =>{
                      console.log(err)
                      reject(err)
                  })
            })
        } else {
            resolve(res)
        }
    }).catch(err => {
        console.log(err, 'errerrerrerrerr')
        reject(err)
    })
  })
}
// 查询所有博客总数
let getTotalAllBlog = function() {
  let _sql = `select count(*) as total from blogs;`
  return query( _sql )
}
// 模糊搜索博客
let searchBlog = function(val) {
  let _sql = `select * from blogs where blog_title like '%${val}%' or blog_content like '%${val}%';`
  return query( _sql )
}
// 查询用户博客 id
let selectMyBlog = function(user_id, page) {
  let _sql = `select * from blogs where user_id="${user_id}" order by createdate desc limit ${(page-1)*10},10;`
  return query( _sql )
}
// 查询我的博客总数
let getTotalMyBlog = function(user_id) {
  let _sql = `select count(*) as total from blogs where user_id="${user_id};"`
  return query( _sql )
}
// 评论博客
let commentBlog = function(value) {
  let _sql = `insert into comments set comment_id=?,blog_id=?,user_id=?,content=?,createdate=?;`
  return query( _sql, value )
}
// 查询博客评论
let getBlogComments = function(blog_id) {
  let _sql = `SELECT
                SQL_NO_CACHE a.*, b.username
              FROM
                comments a
              JOIN
                users b
              ON
                a.user_id = b.id
              WHERE
                a.blog_id='${blog_id}'`
  return query( _sql )
}
// 查询是否收藏过
let isSaveBlog = function(blog_id, user_id) {
  let _sql = `select * from saves where blog_id='${blog_id}' and user_id='${user_id}';`
  return query( _sql )
}
// 收藏博客
let saveBlogById  = function(value) {
  let _sql = `insert into saves set id=?,blog_id=?,user_id=?,createdate=?;`
  return query( _sql, value )
}
// 查询我的收藏
let selectMySaves = function(user_id) {
  let _sql = `SELECT
                SQL_NO_CACHE a.blog_id, a.createdate, b.blog_title, (select username from users where id=b.user_id) author
              FROM
                saves a
              JOIN
                blogs b
              ON
                a.blog_id = b.blog_id
              WHERE
                a.user_id='${user_id}'`
  return query( _sql )
}

// 上传头像
let avatorUpload = function (value) {
    let _sql = `insert into avator set user_id=?,username=?,avatorurl=?;`
    return query( _sql, value )
}

// 查询头像
let getAvator = function(user_id) {
    let _sql = `select * from avator where user_id='${user_id}';`
    return query( _sql )
}

// 压缩记录
let compressImageRecord  = function(value) {
  let _sql = `insert into compressrecord set id=?,user_id=?,username=?,count=?,createdate=?;`
  return query( _sql, value )
}
// 查询压缩记录
let getCompressRecord = function() {
  let _sql = `select * from compressrecord order by createdate desc;`
  return query( _sql )
}

module.exports = {
    userReg,
    userLogin,
    selectUser,
    deleteUser,
    selectAllUser,
    selectUserById,
    addBlog,
    selectAllBlog,
    getTotalAllBlog,
    selectMyBlog,
    getTotalMyBlog,
    commentBlog,
    getBlogComments,
    saveBlogById,
    isSaveBlog,
    selectMySaves,
    searchBlog,
    avatorUpload,
    getAvator,
    compressImageRecord,
    getCompressRecord
}