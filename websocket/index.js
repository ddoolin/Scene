var socketIO = require("socket.io");
var Step     = require("step");
var util     = require("util");
var fs       = require('fs');
var path     = require("path");

var mongoose = require("mongoose");

module.exports = function(server){
    console.log("   --webSocket--  ");

    var io = socketIO.listen(server);
    io.of('/home').on('connection', function (socket) {
        socket.on('message', function (data) {
        });
        socket.on('disconnect', function () {
        });
        socket.on("User.addSpot",function(data){
            var User = mongoose.models.User;
            //data.user --> user id
            //data.spot --> {longitued,latitude,address}
            if(data && data.user && data.spot){
                User.findById(data.user,function(err,user){
                    if(err || !user){
                        console.log(err,user);
                    }
                    user.spots.push(data.spot);
                    user.save(function(err, user){
                        socket.emit("User.addSpot", data);
                    });
                });
            }
        });
        socket.on("User.attendEvent",function(data){
            //data.user -> user id
            //data.event -> event id
            var User = mongoose.models.User;
            if(data && data.user && data.event){
                User.findById(data.user,function(err,user){
                    if(err || !user){
                        console.log(err,user);
                    }
                    user.attended_events.push(data.event);
                    user.save(function(err,user){
                        socket.emit("User.attendEvent",data);
                    });
                });
            }
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

    var Photo = mongoose.models.Photo;

    io.of('/event').on('connection', function (socket) {
        socket.on('message', function (data) {

        });
        socket.on("joinRoom",function(data){
            socket.join(data.event);
            socket.event = data.event;
        });
        socket.on("Photo.create",function(data){
            data._event = socket.event;

            var photo = new Photo(data);
            photo.save(function(err,photo){
                //after saving it, now it has a id
                var imageName = photo.id + ".png";
                var targetPath = util.format("%s/../public/uploaded/%s",__dirname,imageName);
                fs.writeFile(targetPath, data.image.replace(/^data:image\/png;base64,/,""),'base64', function(err) {
                    console.log(err);
                    photo.image = "/uploaded/" + imageName;
                    photo.save(function(err,photo){
                        console.log(photo);
                        socket.emit("Photo.create",photo);
                        socket.broadcast.emit("Photo.create",photo);
                    });
                });
            });
        });

        socket.on("Photo.update",function(data){
            data._event = socket.event;

            var photo = new Photo(data);
            socket.broadcast.to(socket.event).emit('Photo.update', photo.toJSON() );
            //socket.emit('Photo.update', photo.toJSON());

            delete data._id;
            Photo.update({ _id: photo._id }, data, function (err, numberAffected, raw) {
                if (err) console.log(err);
            });
        });
    });
    console.log("   --webSocket end--  ");
};