var ping = require('ping');
var iconv = require("iconv-lite");

var hosts = ["www.baidu.com", "www.jd.com", "112.91.125.129"];

hosts.forEach(function (host) {
  ping.promise.probe(host)
    .then(function (res) {
      console.log(res.output);
    });
});