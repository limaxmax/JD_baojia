
var schedule = require('node-schedule');  //定时任务模块
var dbUtil = require("../dao/util")
var commonUtil = require("util")
var request = require("request")
var http = require("http")
var https = require("https")
var iconv = require("iconv-lite")
var mailSender = require("../daemon/mailSender");
var redis = require("redis")
var client = redis.createClient({ "host": "127.0.0.1", "port": 6379 });
client.on("error", (err) => {
  console.log("error:" + err)
})
var bluebird = require("bluebird")
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var clientAsync = redis.createClient({ "host": "127.0.0.1", "port": 6379 });
clientAsync.on("error", (err) => {
  console.log("error:" + err)
})



var requestProcessObj = (option) => {
  return new Promise((resolve, reject) => {
    //判断http和https协议，option可能为string和obj
    /* 判断逻辑：
    1.若为字符串，判断url中是否包含https，不包含默认使用http
    2.若为对象，判断protocol是否为http，包含则使用http
    3.若为对象，没有声明protocol，默认使用http
    */
    if (typeof option === "string" ? option.indexOf("https") < 0 : ((option.protocol === "http:") || (option.protocol ? 0 : 1))) {
      //使用http处理
      console.log("http processing...")
      var httpClient = http.request(option, (res) => {
        var chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk)
        });
        res.on("end", () => {
          let buff = Buffer.concat(chunks), headers = res.headers;
          let charset = headers['content-type'].split(";")[1].split("=")[1] || 'utf8';
          let body = iconv.decode(buff, charset)
          resolve(body)
        })
      });
      httpClient.on('error', (err) => {
        reject(err);
      });
      httpClient.end();
    } else {
      //使用https处理
      console.log("https processing...")
      var httpsClient = https.request(option, (res) => {
        var chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk)
        });
        res.on("end", () => {
          let buff = Buffer.concat(chunks), headers = res.headers;
          let charset = headers['content-type'].split(";")[1].split("=")[1] || "utf-8";
          let body = iconv.decode(buff, charset)
          resolve(body)
        })
      });
      httpsClient.on('error', (err) => {
        reject(err);
      });
      httpsClient.end();
    }
  })
}


/*
var testCase = async (option) => {
  if (option)
    var jieguo = await requestProcessObj(option);
  console.log(jieguo)
}

testCase({
  url: "https://c.3.cn/recommend?methods=accessories&cat=670%2C686%2C694&sku=1022958",
  hostname: "c.3.cn",
  method: "GET",
  path: "/recommend?methods=accessories&cat=670%2C686%2C694&sku=1022958",
  protocol: "https:"
})
*/
//发邮件，先从redis中查sku对应的mail地址，如果没有则查db，最后发邮件
var sendMail = (sku, skuPrice, skuOldPrice, skuName) => {
  let option = {
    "sku": sku,
    "url": "https://item.jd.com/" + sku + ".html",
    "name": skuName,
    "price": parseFloat(skuPrice),
    "discount": parseFloat(skuOldPrice) - parseFloat(skuPrice),
    "receiver": ""
  };
  client.smembers("mail_" + sku, (err, mails) => {
    mails.forEach(mail => {
      option.receiver = mail;
      mailSender.send(option);
    })
  });

  // 以下代码片段是查询db中的最小值后发送邮件，优先使用redis，
  /*
  var sql = "select min(cast(price as decimal(10,2))) as cheapestPrice from goods where sku=? ;"
  var param = [sku]
  dbUtil.pool.getConnection((error, connect) => {
    if (error) {
      return console.log(error)
    }
    connect.query(sql, param, (err, oldPrice) => {
      var cheapestPrice = oldPrice[0].cheapestPrice

      if (cheapestPrice > skuPrice) {
        //如果查出的价格比现有的最小的价格还小，说明降价了，发送邮件，查询邮件接收者
        let sql = "select receiver from scheduletasks where sku=?";
        let param = [sku];
        connect.query(sql, param, (err, result) => {
          //option  {"sku":1234,"url":"www.jd.com","name":"华为p30","price":"12.20","discount":"10.00","receiver":"12355@qq.com"}
          let option = {
            "sku": sku,
            "url": "https://item.jd.com/" + sku + ".html",
            "name": skuName,
            "price": skuPrice,
            "discount": cheapestPrice - skuPrice,
            "receiver": ""
          };
          //[ RowDataPacket { receiver: '1552593244@qq.com' } ]
          console.log(result[0].receiver)
          result[0].receiver.split(",").forEach(item => {
            option.receiver = item,
              mailSender.send(option);
          });
        })


      }
    })
    //这里一定要release链接，否则会一直占用链接，导致后来的请求无法执行
    connect.release();
  });*/
}



//根据sku获取商品信息，包含价格，商品名称，描述
var getGood = async (sku) => {
  //查询sku信息 p.3.cn/prices/mgets价格
  var getPriceUrl = "https://p.3.cn/prices/mgets?skuIds=J_" + sku;
  var reqResult = await requestProcessObj(getPriceUrl);
  var skuPrice = JSON.parse(reqResult)[0].p
  //查询sku信息 c.3.cn/recommend 名称
  var getNameUrl = "https://c.3.cn/recommend?methods=accessories&cat=670%2C686%2C694&sku=" + sku;
  reqResult = await requestProcessObj(getNameUrl);
  var skuName = JSON.parse(reqResult).accessories.data.wName
  // 发送邮件，先从redis中拿最便宜的价格，如果有问题就查db
  /* client.get(sku,(err,data)=>{
    //如果查询的结果比最小值还小
    if(data>skuPrice){
      client.set(sku,skuPrice,(err)=>{
        if(err){
          console.log("redis error :" ,err);
          console.log("dbing...")
          sendCheapMailDB(sku,skuPrice,skuName);
        }

        
      });
    }
  })*/
  return { "sku": sku, "price": skuPrice, "name": skuName, "desc": "" };

}

//根据flag查询，默认查询未进行scan的sku，并生成定时任务规则list
var getSchedules = async (flag) => {
  var nowtime = parseInt(new Date().getTime() / 1000);

  var sql = flag ? "select * from scheduletasks where flag=? and " + nowtime + " < scanstop" : "select * from scheduletasks where flag=0 and " + nowtime + " < scanstop";
  var sqlParms = [flag]
  var configList = await dbUtil.sqlExecutor(sql, sqlParms);
  return configList.map((item, index) => {
    return {
      start: item.scanStart,
      end: item.scanStop,
      rule: item.scanRule,
      sku: item.sku
    }
  });
}
//奖查询结果写入goods表
//不要每次查询的结果都写入db，先查redis，不一致时才写入db，redis记录最小值
var insertGood = async (good) => {
  var nowTimestamp = parseInt(new Date().getTime() / 1000);


  // string 记录最低价，如果是最低价，还要发邮件
  // set sku cheapestPirce
  client.get("cheapestPrice_" + good.sku, async (err, data) => {

    if (err || !data) {
      client.set("cheapestPrice_" + good.sku, good.price);
      return
    }
    if (parseFloat(data) > parseFloat(good.price)) {
      console.log(data)
      client.set("cheapestPrice_" + good.sku, good.price);
      sendMail(good.sku, good.price, data, good.name);
      // 流水落入db
      var sql = " insert into goods(`sku`,`name`,`price`,`desc`,`createtime`) values(?,?,?,?,?);"
      var sqlParms = [good.sku, good.name, good.price, good.desc || "", nowTimestamp];
      var result = await dbUtil.sqlExecutor(sql, sqlParms);
      console.log(" insert into goods(`sku`,`name`,`price`,`desc`) values(%s,%s,%s,%s);", sqlParms)
      if (result.affectedRows === 1 && result.insertId) {
        //修改task的监控状态 flag=1
        changeScanFlag(good.sku, 1).then(data => {

        }).catch(err => {
          console.log(err)
        });
      } else {
        console.log("insert fail")
      }
    }
  });
  // zset 记录查询结果，替换db流水 
  // zadd ${sku} ${timestamp} ${price}
  client.zadd("dyn_" + good.sku, nowTimestamp, nowTimestamp + good.price, (err) => {
    console.log("dyn_" + good.sku, nowTimestamp, nowTimestamp + good.price)
  });

}

var changeScanFlag = async (sku, flag) => {
  var sql = "update scheduletasks set flag=? where sku=?;"
  var sqlParms = [flag, sku]
  var result = await dbUtil.sqlExecutor(sql, sqlParms)

  return result;
}
//单个扫描任务
var runScan = (job) => {
  //第一个参数，jobid，以sku记录
  //第二个参数，jobrule，扫描规则配置
  //第三个参数，jobcallback，回调函数

  schedule.scheduleJob(job.sku.toString(), job.rule, async (execTime) => {
    // schedule.scheduleJob(job, async (execTime) => {
    //查询sku信息 p.3.cn/prices/mgets价格

    var good = await getGood(job.sku);
    insertGood(good)


  })
}



var scanDB = async (rule, flag) => {
  var scanedList = []
  schedule.scheduleJob("main", rule, async (execTime) => {
    // 将flag为0的sku加入扫描队列
    var configList = await getSchedules(flag);
    console.log(new Date(), "total:" + configList.length)
    configList.map((item, index) => {

      var startTime = item.start * 1000;
      var endTime = item.end * 1000;
      //需要判断当前时间是否在start和end时间段内，如果在才能开启计划，否则会在start前就开启很多计划， 造成多次重复发送的情况
      if (new Date().getTime() < endTime && scanedList.indexOf(item.sku) === -1) {
        console.log("start scan,option:", { sku: item.sku, rule: item.rule, start: startTime, end: endTime })
        scanedList.push(item.sku)
        runScan({ sku: item.sku, rule: item.rule, start: startTime, end: endTime })
        //更改扫描状态兜底
        changeScanFlag(item.sku, 1);
      }

    });
    // 将flag为1且扫描计划完成的sku，flag由1变为2

  });
}




let timeOffset = new Date().getTimezoneOffset() * 60 * 1000;
let startTime = new Date(Date.now());
let endTime = new Date(startTime.getTime() + 500000);

scanDB("*/10 * * * * *", 0)

