var util = require('./util');
var redis = require("redis")
var bluebird = require("bluebird")
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var option = {
  host: "127.0.0.1",
  port: 6379
}
client = redis.createClient(option);
client.on("error", (err) => {
  console.log("error:" + err)
})

var SCAN_TASK = "15175010547_p";



var fn_getUserById = async (id) => {

  //定义数据sql语句
  var sql = "select * from tasks where taskId=?"
  var sqlParms = [id]
  return await util.sqlExecutor(sql, sqlParms);
}
var fn_getUsersByGender = (gender) => {

}

/*
id	skuid price time name desc
*/
var fn_insertGood = async (good) => {

  //mysql插入语句
  var sql = "insert into goods(`sku`,`name`,`price`,`desc`) values(?,?,?,?)"
  var sqlParms = [
    good.sku,
    good.name,
    good.price,
    good.desc
  ];
  return await util.sqlExecutor(sql, sqlParms);
}

/*
+-----------+--------------+------+-----+---------------+-------+
| Field     | Type         | Null | Key | Default       | Extra |
+-----------+--------------+------+-----+---------------+-------+
| sku       | int(20)      | NO   | PRI | NULL          |       |
| scanRule  | varchar(100) | YES  |     | * * *\/4 * * *|       |
| scanStart | int(20)      | YES  |     | NULL          |       |
| scanStop  | int(20)      | YES  |     | NULL          |       |
| status    | int(1)       | NO   |     | 0             |       |
| mail      | int(1)       | NO   |     | 0             |       |
| p_want    | int(5)       | YES  |     | 0             |       |
| flag      | int(1)       | NO   |     | 0             |       |
+-----------+--------------+------+-----+---------------+-------+
*/

var fn_insertScanJob = async (job) => {
  //redis插入
  console.log("为啥没有receiver", job)
  client.hset(SCAN_TASK, job.sku, job.start + "_" + job.end + "_" + job.rule + "_" + job.receiver, (err, data) => {
    if (err) console.log(err);
    console.log(data)
  });
  var sql = "insert into scheduletasks(`sku`,`scanRule`,`scanStart`,`scanStop`,`receiver`) values(?,?,?,?,?); "
  var sqlParms = [
    parseInt(job.sku),
    job.rule,
    parseInt(job.start),
    parseInt(job.end),
    job.receiver
  ]
  return await util.sqlExecutor(sql, sqlParms)
}

var fn_queryScanJob = async (sku) => {
  var result = function () {
    return new Promise((resolve, reject) => {
      client.hget(SCAN_TASK, sku, (err, data) => {
        if (err) { reject(err) } else {
          resolve(data ? data : 0)
        };
      });
    });
  }
  var wrdObj = await result();
  if (wrdObj) {
    console.log("check redis")
    console.log(wrdObj)
    var resultArr = wrdObj.split("_");
    return { "sku": sku, "start": resultArr[0], "end": resultArr[1], "cron": resultArr[2], "receiver": resultArr[3] }
  } else {
    console.log("check mysql")
    var sql = "select `sku`,`scanStart` as `start`,`scanStop` as `end`,`scanRule` as `cron`,`receiver`,`flag` from scheduletasks where sku=?;"
    var sqlParms = [sku];
    return await util.sqlExecutor(sql, sqlParms)
  }

}
// 修改任务，redis和mysql可以异步执行
var fn_updateScanJob = async (job) => {
  //写redis
  console.log("为啥没有receiver", job)
  var hashValue = job.start + "_" + job.end + "_" + job.rule + "_" + job.receiver;
  client.hset(SCAN_TASK, job.sku, hashValue, (err, data) => {
    console.log(data)
  });
  var mails = job.receiver.split(",");
  mails.forEach(mail => {
    client.sadd("mail_" + sku, mail, (err) => {
      console.log(err)
    });
  });


  //写mysql
  var sql = "update scheduletasks set scanStart=?,scanStop=?,scanRule=?,receiver=? where sku=?;";
  var sqlParms = [job.start, job.end, job.rule, job.receiver, job.sku];
  return await util.sqlExecutor(sql, sqlParms)
}

var fn_queryGoods = async (sku) => {
  var sql = "select `name`,`price`,`createtime` from goods where sku=?";
  var sqlParms = [sku];
  return await util.sqlExecutor(sql, sqlParms)
}

var fn_querySchedule = async (sku) => {
  var sql = "select * from scheduleTasks where flag!=0";
  var sqlParms = [];
  if (sku) {
    sql = sql + " and sku=?;";
    sqlParms.push(sku);
  }
  return await util.sqlExecutor(sql, sqlParms)
}

module.exports = {
  "getUserById": fn_getUserById,
  "getUsersByGender": fn_getUsersByGender,
  'insertGood': fn_insertGood,
  'insertScanJob': fn_insertScanJob,
  'queryScanJob': fn_queryScanJob,
  'updateScanJob': fn_updateScanJob,
  'queryGoods': fn_queryGoods,
  'querySchedule': fn_querySchedule
}