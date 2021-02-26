const Koa=require('koa');
const path=require('path');
const bodyParser = require('koa-bodyparser');
const ejs=require('ejs');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js');
const router=require('koa-router');
const views = require('koa-views');
const staticCache = require('koa-static-cache');
const cors = require('koa2-cors');
// 引入https 以及 koa-ssl
const fs = require('fs');
const https = require('https');
const sslify = require('koa-sslify').default
// 引入定时任务
const scheduleCase = require('./schedule/schedule_a.js')
const app = new Koa();


// 路径为证书放置的位置
// const options = {
//     key: fs.readFileSync('./3_www.hgqweb.cn.key'),
//     cert: fs.readFileSync('./2_www.hgqweb.cn.crt'),
// }
// app.use(sslify())  // 使用ssl

// session存储配置
const sessionMysqlConfig= {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST,
}

// 配置session中间件
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore(sessionMysqlConfig)
}))

// 缓存
app.use(staticCache(path.join(__dirname, './public'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))

// 配置服务端模板渲染引擎中间件
app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs'
}))
app.use(bodyParser({
  formLimit: '1mb'
}))

// 设置跨域
app.use(cors({
    origin: function (ctx) {
        if (ctx.url === '/test') {
            return "*"; // 允许来自所有域名请求
        }
        // return 'http://localhost:8080'; 
	    return "*"
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

//  路由
app.use(require('./routers/reg.js').routes())
app.use(require('./routers/test.js').routes())
app.use(require('./routers/page.js').routes())
app.use(require('./routers/login.js').routes())

// 执行定时任务
// scheduleCase.scheduleCronstyle()

app.listen(2324, function () {
    console.log(`listening on port ${config.port} 端口`);
})

// https.createServer(options, app.callback()).listen(config.port, (err) => {
//     if (err) {
//         console.log('服务启动出错', err);
//     } else {
//         console.log(`listening on port ${config.port} 端口`);
//     }	
// });