var fs = require("fs")

var file = fs.readFileSync("C:\\Users\\lihongbing1\\Desktop\\redpackage.txt")
var redObject = JSON.parse(file.toString());

console.log(JSON.stringify(redObject))

var runningList = redObject.data.runningList;
var sum = 0;
var nowStamp = new Date().getTime()
runningList.forEach(element => {
  //红包的结束时间晚于当前时间，红包可用
  if (element.endTime >= nowStamp) {
    sum = sum + parseFloat(element.amount);
  }
});




console.log("流水总额：", sum, "总额：", redObject.data.balance)
if (sum === redObject.data.balance) {
  console.log("，一致")
} else {
  console.log("不一致")
}