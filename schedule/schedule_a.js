const schedule = require('node-schedule');
const moment = require('moment');
//引入所需要的第三方包
const superagent= require('superagent'); // 第三方客户端请求代理模块，用他来请求目标页面
const cheerio = require('cheerio'); // node版jquery
const userModel = require('../lib/mysql.js');

exports.scheduleCronstyle = () => {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('30 1 1 * * *', async ()=>{
        console.log('scheduleCronstyle:' + new Date());
        let word, img
        await new Promise((resolve, reject) => {
            superagent.get('https://chp.shadiao.app/api.php').end((err, res) => { // 请求彩虹屁网址,这直接写死地址吧
            if (err) {
                console.log(`抓取失败 - ${err}`)
                reject(err)
            } else {
                    // 访问成功，请求https://chp.shadiao.app/页面所返回的数据会包含在res
                    word = res.text
                    resolve(word)
                }
            })
        })
        await new Promise((resolve, reject) => {
            superagent.get('https://www.qqtouxiang.com/katong/').end((err, res) => { // 请求彩虹屁网址,这直接写死地址吧
                if (err) {
                    console.log(`抓取失败 - ${err}`)
                    reject(err)
                } else {
                    let $ = cheerio.load(res.text);
                    const ran = Math.floor(Math.random()*20)
                    img = $($('img')[ran]).attr('data-original')
                    resolve(img)
                }
            });
        })
        console.log(word, img)
        // 自动存入数据库发表 以管理员admin的身份
        const blog_id = null
        const blog_title = '每日推送-此消息定时爬虫并发表'
        const blog_content = word
        const user_id = '705C9AD5F777BDD6'
        // const photos = '["' + img + '"]'
        const photos = JSON.stringify([img])
        console.log(photos)
        const createdate = moment().format('YYYY-MM-DD HH:mm:ss')
        const video = ''
        const value =  [blog_id, blog_title, blog_content, user_id, photos, createdate, video]
        userModel.addBlog(value).then(res => {
            console.log(res, '发送成功')
        }).catch(err => {
            console.log(err)
        })
    });
}