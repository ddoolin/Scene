var fs = require("fs");
var mongoose = require("mongoose");

module.exports = function(app){
    console.log("   	--Event--");

	var User = mongoose.models.User;
	
	
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