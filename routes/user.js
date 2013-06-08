var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(app){
    console.log("   	--Event--");

	var Event = mongoose.models.Event;

	app.post("/events",function(req,res){
		var user = new User({
			name  	 : req.param("name"),
			email 	 : req.param("email"),
			password : req.param("password")
		});
		user.save(function(err,user){
			if(err) res.json(400,JSON.stringify(err));
			else {
				req.session.user = user;
				res.redirect("/");
			}
		});
	});
	
	app.get("/users/:name",function(req,res){
		User.findOne({name : req.param("name")})
			.exec(function(err,user){
				user.prepareForHome(function(err,user){
					if (err || !user ){
						res.send(400);
					} else {
						Collage.find({_creator : user._id},function(err,collages){
				            if(err){
				                res.send(401);
				            } else {
								console.log(collages);
								user = user.toJSON();
								user.collages = collages;
								res.render("user/index",{user : user});
				            }
				        });
					}
				})
			});
	});
	
    console.log("   	--Event--");
};