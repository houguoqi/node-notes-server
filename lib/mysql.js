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
        createdate VARCHAR(100) NOT NULL COMMENT '发布时间',
        PRIMARY KEY ( blog_id )
    );`

let createTable = ( sql ) => {
    return query( sql, [] )
}

// 建表
createTable(users)
createTable(blogs)


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
  let _sql = `insert into blogs set blog_id=?,blog_title=?,blog_content=?,user_id=?,createdate=?;`
  return query( _sql, value )
}
// 查询所有博客
let selectAllBlog = function(page) {
  let _sql = `select * from blogs order by createdate desc limit ${(page-1)*10},10;`
  return query( _sql )
}
// 查询所有博客总数
let getTotalAllBlog = function() {
  let _sql = `select count(*) as total from blogs;`
  return query( _sql )
}
// 查询用户博客 id
let selectMyBlog = function(user_id, page) {
  let _sql = `select * from blogs where user_id=${user_id} order by createdate desc limit ${(page-1)*10},10;`
  return query( _sql )
}
// 查询我的博客总数
let getTotalMyBlog = function(user_id) {
  let _sql = `select count(*) as total from blogs where user_id=${user_id};`
  return query( _sql )
}

// 注册用户
let insertData = function( value ) {
  let _sql = "insert into users set name=?,pass=?,avator=?,moment=?;"
  return query( _sql, value )
}
// 删除用户
let deleteUserData = function( name ) {
  let _sql = `delete from users where name="${name}";`
  return query( _sql )
}
// 查找用户
let findUserData = function( name ) {
  let _sql = `select * from users where name="${name}";`
  return query( _sql )
}
// 发表文章
let insertPost = function( value ) {
  let _sql = "insert into posts set name=?,title=?,content=?,md=?,uid=?,moment=?,avator=?;"
  return query( _sql, value )
}
// 更新文章评论数
let updatePostComment = function( value ) {
  let _sql = "update posts set comments=? where id=?"
  return query( _sql, value )
}

// 更新浏览数
let updatePostPv = function( value ) {
  let _sql = "update posts set pv=? where id=?"
  return query( _sql, value )
}

// 发表评论
let insertComment = function( value ) {
  let _sql = "insert into comment set name=?,content=?,moment=?,postid=?,avator=?;"
  return query( _sql, value )
}
// 通过名字查找用户
let findDataByName = function ( name ) {
  let _sql = `select * from users where name="${name}";`
  return query( _sql)
}
// 通过文章的名字查找用户
let findDataByUser = function ( name ) {
  let _sql = `select * from posts where name="${name}";`
  return query( _sql)
}
// 通过文章id查找
let findDataById = function ( id ) {
  let _sql = `select * from posts where id="${id}";`
  return query( _sql)
}
// 通过评论id查找
let findCommentById = function ( id ) {
  let _sql = `select * FROM comment where postid="${id}";`
  return query( _sql)
}

// 查询所有文章
let findAllPost = function () {
  let _sql = ` select * FROM posts;`
  return query( _sql)
}
// 查询分页文章
let findPostByPage = function (page) {
  let _sql = ` select * FROM posts limit ${(page-1)*10},10;`
  return query( _sql)
}
// 查询个人分页文章
let findPostByUserPage = function (name,page) {
  let _sql = ` select * FROM posts where name="${name}" order by id desc limit ${(page-1)*10},10 ;`
  return query( _sql)
}
// 更新修改文章
let updatePost = function(values){
  let _sql = `update posts set  title=?,content=?,md=? where id=?`
  return query(_sql,values)
}
// 删除文章
let deletePost = function(id){
  let _sql = `delete from posts where id = ${id}`
  return query(_sql)
}
// 删除评论
let deleteComment = function(id){
  let _sql = `delete from comment where id=${id}`
  return query(_sql)
}
// 删除所有评论
let deleteAllPostComment = function(id){
  let _sql = `delete from comment where postid=${id}`
  return query(_sql)
}
// 查找评论数
let findCommentLength = function(id){
  let _sql = `select content from comment where postid in (select id from posts where id=${id})`
  return query(_sql)
}

// 滚动无限加载数据
let findPageById = function(page){
  let _sql = `select * from posts limit ${(page-1)*5},5;`
  return query(_sql)
}
// 评论分页
let findCommentByPage = function(page,postId){
  let _sql = `select * from comment where postid=${postId} order by id desc limit ${(page-1)*10},10;`
  return query(_sql)
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
	query,
	insertData,
  	deleteUserData,
  	findUserData,
	findDataByName,
  	insertPost,
  	findAllPost,
  	findPostByPage,
	findPostByUserPage,
	findDataByUser,
	findDataById,
	insertComment,
	findCommentById,
	updatePost,
	deletePost,
	deleteComment,
	findCommentLength,
	updatePostComment,
	deleteAllPostComment,
	updatePostPv,
	findPageById,
	findCommentByPage
}