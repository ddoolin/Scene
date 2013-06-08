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
				if(err){
					socket.emit("Event.create",{
						error : err
					});
				} else {
					socket.emit("Event.create",event);
					socket.broadcast.emit("Event.create",event);
				}
			});
		});
	});
	
	io.of('/event').on('connection', function (socket) {
		socket.on('message', function (data) { 
		
		});
		socket.on("joinRoom",function(data){
			socket.join(data.event);
			socket.event = data.event;
		});
		socket.on("Photo.create",function(data){
			var Photo = mongoose.models.Photo;
			var photo = new Photo(data);
			photo.save(function(err,photo){
				socket.emit("Photo.create",photo);
				socket.broadcast.emit("Photo.create",photo);
			});
		});
	});
	console.log("	--webSocket end--  ");
}