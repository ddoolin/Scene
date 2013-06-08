var mongoose = require("mongoose");

module.exports = function(app){
    console.log("  --ROUTES--  ");

	var Event = mongoose.models.Event;
	var User  = mongoose.models.User;

	app.get("/", function(req,res){
		Event.findAll(function(err,events){
			var user = req.user;
			if(user){
				user = new User(user);
				user.populateSpots(function(err,user){
					res.render("index",{
						events : events,
						user   : user
					});
				});
			} else {
				res.render("index",{
					events : events,
					user   : null
				});
			}
		});
	});

	require("./user")(app);
	require("./event")(app);

	console.log("  --ROUTES END--  ");
}