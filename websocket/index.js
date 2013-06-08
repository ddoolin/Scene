var socketIO = require("socket.io");
var Step     = require("step");
var util     = require("util");
var fs       = require('fs');
var path     = require("path");

var mongoose = require("mongoose");

module.exports = function(server){
    console.log("	--webSocket--  ");

	var io = socketIO.listen(server);
	io.of('/home').on('connection', function (socket) {
		socket.on('message', function (data) {
			
        });
    	socket.on('disconnect', function () {
        
		});
		socket.on("Event.create",function(data){
			var Event = mongoose.models.Event;
			var event = new Event(data);
			event.save(function(err,event){
				socket.broadcast.emit("Event.create",event);
			});
		});
	});
	console.log("	--webSocket end--  ");
}