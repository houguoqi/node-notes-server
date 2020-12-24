// 生成uuid
const uuid  = function(len = 16, radix = 16) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

// 获取时间并格式化
 
const formatDate = function (fmt = "yyyy-MM-dd HH:mm:ss") {
    var dateTime=new Date();
    var o = {
        "M+": dateTime.getMonth() + 1, //月份 
        "d+": dateTime.getDate(), //日 
        "H+": dateTime.getHours(), //小时 
        "m+": dateTime.getMinutes(), //分 
        "s+": dateTime.getSeconds(), //秒 
        "q+": Math.floor((dateTime.getMonth() + 3) / 3), //季度 
        "S": dateTime.getMilliseconds() //毫秒 
      };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (dateTime.getFullYear() + "").substr(4 - 	RegExp.$1.length));
    }
    for (var k in o){
        if (new RegExp("(" + k + ")").test(fmt)) 
        {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
  

module.exports = {
    uuid,
    formatDate
}