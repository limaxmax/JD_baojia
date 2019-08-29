const router = require('koa-router')()
const mapper = require("../dao/usersMapper");
router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get("/getUserById", async (ctx, next) => {
  //获取参数中的id
  var id = ctx.query.id;
  var results = await mapper.getUserById(id);
  console.log(results);
  next();
  ctx.response.body = results;
});
router.get("/insertGood", async (ctx, next) => {
  var paramObj = ctx.query;
  var good = {
    "sku": paramObj.sku,
    "name": paramObj.name,
    "price": paramObj.price,
    "desc": paramObj.desc
  };
  console.log(good)
  var results = await mapper.insertGood(good);
  console.log(results);
  next();
  ctx.response.body = results;
});
router.get("/insertScanJob", async (ctx, next) => {
  var job = ctx.query;
  // job的参数均为字符串，修改job
  job = {
    'sku': parseInt(job.sku),
    'start': parseInt(job.start.substr(0, 10)),
    'end': parseInt(job.end.substr(0, 10)),
    'rule': job.rule,
    'receiver': job.receiver
  }
  console.log(job)
  var results = await mapper.insertScanJob(job)
  console.log(results);
  next();
  ctx.response.body = { "iret": 0, "msg": "insert succ" };
});
router.get("/queryScanJob", async (ctx, next) => {
  var sku = ctx.query.sku;
  var resluts = await mapper.queryScanJob(sku);
  console.log(resluts);
  next();
  //ctx.response.body = { "iret": 0, "data": JSON.stringify(resluts[0]) }
  ctx.response.body = { "iret": 0, "data": resluts[0] ? resluts[0] : resluts }
})
router.get("/updateScanjob", async (ctx, next) => {
  var job = ctx.query;
  job = {
    'sku': parseInt(job.sku),
    'start': parseInt(job.start.substr(0, 10)),
    'end': parseInt(job.end.substr(0, 10)),
    'rule': job.rule,
    'receiver': job.receiver
  }
  console.log(job)
  var resluts = await mapper.updateScanJob(job);
  console.log(resluts)
  next();
  ctx.response.body = { "iret": 0, "data": resluts }

})
router.get("/queryGoods", async (ctx, next) => {
  var sku = ctx.query.sku;
  var results = await mapper.queryGoods(sku);
  next();
  ctx.response.body = results;
})
router.get("/querySchedule", async (ctx, next) => {
  var sku = ctx.query.sku;
  var results;
  if (!sku || sku === "all") {
    results = await mapper.querySchedule();
  } else {
    results = await mapper.querySchedule(sku);
  }
  next();
  ctx.response.body = results;
})
router.get("/getData", async (ctx, next) => {
  var key = ctx.query.key
  var data = ["北京市", "天津市", "上海市", "重庆市",
    "河北省", "辽宁省", "吉林省", "山西省",
    "黑龙江省", "江苏省", "浙江省",
    "安徽省", "福建省", "江西省", "山东省",
    "河南省", "湖北省", "湖南省", "广东省",
    "海南省", "台湾省",
    "四川省", "贵州省", "云南省",
    "陕西省", "甘肃省", "青海省",
    "内蒙古自治区", "广西壮族自治区", "西藏自治区",
    "宁夏回族自治区", "新疆维吾尔自治区", "香港特别行政区",
    "澳门特别行政区"];

  next();
  ctx.response.body = data.filter(item => {
    return item.indexOf(key.toLowerCase()) > -1;
  })
})

module.exports = router
