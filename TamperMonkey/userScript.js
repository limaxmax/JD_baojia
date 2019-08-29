// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @grant        none
// @include      *.jd.com/*
// @require      http://code.jquery.com/jquery-1.8.2.js
// ==/UserScript==

// 先获取url
var url = window.location.href;

function confirmFn (content) {
  var result = confirm(content);
  if (result) {
    console.log("你点了确认")
  } else {
    console.log("你点了取消")
  }
}
window.confirmFn = confirmFn
function dateFormat(date){

    var dateObj;
    if(date instanceof Date){
      dateObj = date;
    }else if((typeof date) === "number"){
      dateObj = new Date(date);
    }else{
      dateObj = new Date()
    }

    let year = dateObj.getYear() + 1900;
    let month = (dateObj.getMonth() +1)<10?"0"+(dateObj.getMonth()+1):dateObj.getMonth()+1;
    let day = dateObj.getDate()<10?"0"+dateObj.getDate():dateObj.getDate()
    let hours = dateObj.getHours()<10?"0"+dateObj.getHours():dateObj.getHours()
    let min = dateObj.getMinutes()<10?"0"+dateObj.getMinutes():dateObj.getMinutes()
    let sec = dateObj.getSeconds()<10?"0"+dateObj.getSeconds():dateObj.getSeconds();
    var str = year+"-"+month+"-"+day+"T"+hours+":"+min+":"+sec;
    console.log(str);
    return  str
}



function showDlg(sku){
    window.sku =sku;
    //先判断该记录当前状态：加入扫描计划，扫描中，扫描完
     $.ajax({
             type: "GET",
             url: "http://localhost:3000/users/queryScanJob?sku="+sku,
             dataType: "json",
             success: function(data){
                        if(data.iret === 0 && data.data.length !==0){
                             console.log(data)
                            document.getElementById("starttime").value = dateFormat(data.data.start*1000);
                            document.getElementById("endtime").value = dateFormat(data.data.end*1000);
                            document.getElementById("cron").value = data.data.cron

                            document.getElementById("mb_btn_ok").onclick=updateGood;
                        }else{
                             document.getElementById("starttime").value = "";
                            document.getElementById("endtime").value = "";
                            document.getElementById("cron").value = "0 */4 * * *"
                            document.getElementById("mb_btn_ok").onclick=addGood;
                        }

                      },
             error:function(err){
                alert('提交异常，请重新提交')
                console.log(err)
             }
         })
    $("#dlg").css('display', 'block');
}
function hideDlg(){
   $("#dlg").css('display', 'none');
}
function addGood(){
   console.log(sku)
   var start = document.getElementById("starttime").value
   var end = document.getElementById("endtime").value
   var rule = document.getElementById("cron").value
   var job = {
      "start": start === '' ? new Date().getTime() : new Date(start).getTime(),
      "end": end === '' ? new Date().getTime() + 2592000000 : new Date(end).getTime(),
      "rule": rule,
      "sku": parseInt(window.sku)
   }
   $.ajax({
             type: "GET",
             url: "http://localhost:3000/users/insertScanJob",
             data: job,
             dataType: "json",
             success: function(data){
                        if(data.iret === 0){
                          $("#dlg").css('display', 'none')
                        }else {
                          alert('提交异常，请重新提交')
                        }
                      },
             error:function(err){
                alert('提交异常，请重新提交')
                console.log(err)
             }
         })
   // 发送ajax请求
   console.log(job)
}
function updateGood(){
   var start = document.getElementById("starttime").value
   var end = document.getElementById("endtime").value
   var rule = document.getElementById("cron").value
   var job = {
      "start": start === '' ? new Date().getTime() : new Date(start).getTime(),
      "end": end === '' ? new Date().getTime() + 2592000000 : new Date(end).getTime(),
      "rule": rule,
      "sku": parseInt(window.sku)
   }
   $.ajax({
             type: "GET",
             url: "http://localhost:3000/users/updateScanJob",
             data: job,
             dataType: "json",
             success: function(data){
                        if(data.iret === 0){
                          $("#dlg").css('display', 'none')
                        }else {
                          alert('提交异常，请重新提交')
                        }
                      },
             error:function(err){
                alert('提交异常，请重新提交')
                console.log(err)
             }
         })
   // 发送ajax请求
   console.log(job)
}
window.showDlg = showDlg
window.hideDlg = hideDlg
//window.addGood = addGood
var flag=0
var flag2=0
function searchPage () {
 //获取所有搜索结果商品的节点
  var itemList = document.getElementsByClassName("gl-item")
  for (let i = 0; i < itemList.length; i++) {
    let itemNode = itemList[i]
    let focusNode = itemNode.getElementsByClassName("p-focus");
    let sku = focusNode[0].getElementsByClassName("J_focus")[0].getAttribute("data-sku");
    focusNode[0].innerHTML += '<button type="button"  id="update" class="yh" sku="' + sku.toString() + '" onclick=showDlg('+sku.toString()+')>油猴</button>';
  }
 setTimeout(function(){
   var y = document.documentElement.scrollTop;
   if(y>2100){
   flag2=1
   for (let i = 30; i < itemList.length; i++) {
    let itemNode = itemList[i]
    let focusNode = itemNode.getElementsByClassName("p-focus");
    let sku = focusNode[0].getElementsByClassName("J_focus")[0].getAttribute("data-sku");
    focusNode[0].innerHTML += '<button type="button"  id="update" class="yh" sku="' + sku.toString() + '" onclick=showDlg('+sku.toString()+')>油猴</button>';
  }
   }
 },2000)

   }

var old_y=0
window.onscroll = function() {
    let y =  document.documentElement.scrollTop;

    if(y>2100 && flag ===0){
        flag=1
        console.log('yes')
         var itemList1 = document.getElementsByClassName("gl-item")
          for (let i = 30; i < itemList1.length; i++) {
    let itemNode = itemList1[i]
    let focusNode = itemNode.getElementsByClassName("p-focus");
    let sku = focusNode[0].getElementsByClassName("J_focus")[0].getAttribute("data-sku");
    focusNode[0].innerHTML += '<button type="button"  id="update" class="yh" sku="' + sku.toString() + '" onclick=showDlg('+sku.toString()+')>油猴</button>';
  }
    }

    if(old_y-y>4500){
      flag=0;
        var itemList2 = document.getElementsByClassName("gl-item")

  for (let i = 0; i < itemList2.length; i++) {

    let itemNode = itemList2[i]
    console.log(i)
    let focusNode = itemNode.getElementsByClassName("p-focus");
    let sku = focusNode[0].getElementsByClassName("J_focus")[0].getAttribute("data-sku");

    focusNode[0].innerHTML += '<button type="button"  id="update" class="yh" sku="' + sku.toString() + '" onclick=showDlg('+sku.toString()+')>油猴</button>';
  }
    }
    old_y=y


}


function itemPage () {
}

// 根据url，在不同的元素添加操作标签
if (url.indexOf("search.jd.com") !== -1) {
  console.log(url);
  searchPage();
} else if (url.indexOf("item.jd.com") !== -1) {
  console.log(url)
  itemPage();
} else {
  console.log("url err")
}


/*
$(".yh").bind("click", function () {
  // 弹窗设置属性为block
  $("#mb_box,#mb_con").css('display', 'block');
  // 获取当前sku
  sku = $(this).attr("sku");
  //2.发起ajax请求，将job保存db表

  //$.MsgBox.Confirm(sku);
});

$("#mb_btn_ok").bind("click", function () {
  // 为提交按钮绑定事件
  // 先ajax
  // 在隐藏弹窗
  $("#mb_box,#mb_con").css('display', 'none');
  console.log(sku)
})
*/
  (function () {
    $.MsgBox = {
      Alert: function (title, msg) { //这个我不需要
        //GenerateHtml("alert", title, msg);
        btnOk(); //alert只是弹出消息，因此没必要用到回调函数callback
        btnNo();
      },
      Confirm: function (callback) {
        //GenerateHtml("confirm", title, msg);
        btnOk(callback);
        btnNo();
      }
    }
    //生成Html
    //var GenerateHtml = function (type, title, msg) {
    var url = window.location.href;

    var htmlStr = '<div id="dlg" style="display: none"><div id="mb_box"></div><div id="mb_con"><span id="mb_tit">提交</span>' +
      '<a id="mb_ico" onclick=hideDlg()>x</a><div id="mb_msg"><h3>URL:</h3><textarea id=url rows=5>' + url + '</textarea>' +
      '<h3>cron策略:</h3><span>起 始 时 间</span><input type="datetime-local" id="starttime" /><br>' +
      '<span>结 束 时 间</span><input type="datetime-local" id="endtime"  /><br><span>cron表达式</span>' +
      '<input type="text" value="0 */4 * * *" id="cron"/></div><div id="mb_btnbox"><input id="mb_btn_ok" type="button" value="确定"/>' +
      '<input id="mb_btn_no" type="button" value="取消" onclick=hideDlg() /></div></div></div>';


    //必须先将_html添加到body，再设置Css样式
    $("body").append(htmlStr);


    //生成Css
    var GenerateCss = function () {
      $("#mb_box").css({
        width: '100%',
        height: '100%',
        zIndex: '99999',
        position: 'fixed',
        filter: 'Alpha(opacity=60)',
        backgroundColor: 'black',
        top: '0',
        left: '0',
        opacity: '0.6'
      });
      $("#url").css({
        width: '100%',
        height: '100%'
      });

      $("#mb_con").css({
        zIndex: '999999',
        width: '400px',
        position: 'fixed',
        backgroundColor: 'White',
        borderRadius: '15px'
      });
      $("#mb_tit").css({
        display: 'block',
        fontSize: '14px',
        color: '#444',
        padding: '10px 15px',
        backgroundColor: '#DDD',
        borderRadius: '15px 15px 0 0',
        borderBottom: '3px solid #009BFE',
        fontWeight: 'bold'
      });
      $("#mb_msg").css({
        padding: '20px',
        lineHeight: '20px',
        borderBottom: '1px dashed #DDD',
        fontSize: '13px'
      });
      $("#mb_ico").css({
        display: 'block',
        position: 'absolute',
        right: '10px',
        top: '9px',
        border: '1px solid Gray',
        width: '18px',
        height: '18px',
        textAlign: 'center',
        lineHeight: '16px',
        cursor: 'pointer',
        borderRadius: '12px',
        fontFamily: '微软雅黑'
      });
      $("#mb_btnbox").css({
        margin: '15px 0 10px 0',
        textAlign: 'center'
      });
      $("#mb_btn_ok,#mb_btn_no").css({
        width: '85px',
        height: '30px',
        color: 'white',
        border: 'none'
      });
      $("#mb_btn_ok").css({
        backgroundColor: '#168bbb'
      });
      $("#mb_btn_no").css({
        backgroundColor: 'gray',
        marginLeft: '20px'
      });
      //右上角关闭按钮hover样式
      $("#mb_ico").hover(function () {
        $(this).css({
          backgroundColor: 'Red',
          color: 'White'
        });
      }, function () {
        $(this).css({
          backgroundColor: '#DDD',
          color: 'black'
        });
      });
      var _widht = document.documentElement.clientWidth; //屏幕宽
      var _height = document.documentElement.clientHeight; //屏幕高
      var boxWidth = $("#mb_con").width();
      var boxHeight = $("#mb_con").height();
      //让提示框居中
      $("#mb_con").css({
        top: (_height - boxHeight) / 2 + "px",
        left: (_widht - boxWidth) / 2 + "px"
      });
    }
    GenerateCss();
    //确定按钮事件
    var btnOk = function (callback) {
      //点击事件，发送后台请求
      $("#mb_btn_ok").click(function () {
        // 设置为隐藏
        $("#mb_box,#mb_con").css('display', 'none');
        //$("#mb_box,#mb_con").remove();
        if (typeof (callback) == 'function') {
          callback();
        };
        var sku = callback;
        var start = document.getElementById("starttime").value
        var end = document.getElementById("endtime").value
        var rule = document.getElementById("cron").value
        var job = {
          "start": start === '' ? new Date().getTime() : new Date(start).getTime(),
          "end": end === '' ? new Date().getTime() : new Date(end).getTime(),
          "rule": rule,
          "sku": sku
        }
        console.log(job)

      });
    }
    //取消按钮事件
    var btnNo = function () {
      $("#mb_btn_no,#mb_ico").click(function () {
        $("#mb_box,#mb_con").css('display', 'none');
      });
    }
  })();
