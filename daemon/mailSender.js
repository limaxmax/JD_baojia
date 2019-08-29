var nodemailer = require("nodemailer")

//发送邮件函数
//option  {"sku":1234,"url":"www.jd.com","name":"华为p30","price":"12.20","discount":"10.00","receiver":"12355@qq.com"}
var mailSender = (option) => {
  let transporter = nodemailer.createTransport({
    "service": "QQ",
    "port": 465,
    "secureConnection": true,
    "auth": {
      "user": "823348143@qq.com",
      //smtp授权码
      "pass": "uccqnmzqughubbeh"
    }
  });
  //
  let mailOptions = {
    "from": "823348143@qq.com",
    "to": option.receiver,
    //主题
    "subject": "降价通知",
    "html": '<h1>降价通知</h1><span>您关注的商品：<a href="' + option.url + '">' + option.name + '</a>降价了，当前价格￥' + option.price + '元，降价' + option.discount + '元</span>'
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId);
  })
}

module.exports = {
  "send": mailSender
}