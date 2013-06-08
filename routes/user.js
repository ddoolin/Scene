var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(app){
    console.log("   	--Event--");

	var User = mongoose.models.User;

	app.get("/users/:name",function(req,res){
	});

    console.log("   	--Event--");
};