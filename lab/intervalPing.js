var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var sendData = () => {

}

var intervalPing = (time) => {
  setInterval(sendData(), time);
}

module.exports = intervalPing