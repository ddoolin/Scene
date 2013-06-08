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
		
		socket.on("User.addSpot",function(data){
			var User = mongoose.models.User;
			User.findById(data.user,function(err,user){
				if(err || !user){
					console.log(err,user);
				}
				user.spots.push(data.spot);
				user.save(function(err,user){
					console.log(err,user);
				});
			});
			//data.user --> user id
			//data.spot --> { longitued,latitude}
			
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