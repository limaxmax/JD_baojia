// var redis = require("redis")
// var bluebird = require("bluebird")
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);
// var option = {
//   host: "127.0.0.1",
//   port: 6379
// }
// client = redis.createClient(option);
// client.on("error", (err) => {
//   console.log("error:" + err)
// })
/*
client.set("test", "1", redis.print);
client.hset("hashKey", "hashField1", "1", redis.print);
client.hset(["hashKey", "hashField2", "2"], redis.print)
client.hset(["hashKey", "hashField3", "1_2_* * *\/4 *"], redis.print)
client.hgetall("hashKey", (err, obj) => {
  console.log(obj)
})
client.lpush("list", "4", (err, data) => {
  console.log(data)
})
client.lrange('list', 0, -1, (err, data) => {
  console.log(data)
})
client.hget("hashKey", "hashField3", (err, data) => {
  console.log(data.split("_"))
})
*/

// var testFn = async (key) => {
//   var value = await client.getAsync(key);
//   console.log(value)
// }

// testFn("foo")

// var redisUtil = require("../dao/redisUtil")
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
var testFn = async (key, seconds, value) => {
  //var data = await redisUtil.set(key, value);
  // var data = await redisUtil.mget(keyValues)
  // var data = await redisUtil.setnx(key, value)
  // var data = await redisUtil.setex(key, seconds, value)
  // var data = await redisUtil.exists(key)
  // var data = await redisUtil.del(key)
  // var data = await redisUtil.expire(key, seconds)
  var data = await client.getAsync(key);
  console.log(data)
  // var getData = await redisUtil.get(key)
  // console.log(getData)
}
testFn("str3").catch((err) => {
  console.log(err)
})