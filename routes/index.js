var mongoose = require("mongoose");

module.exports = function(app){
    console.log("  --ROUTES--  ");

	var Event = mongoose.models.Event;
	
	app.get("/",function(req,res){
		Event.findAll(function(err,events){
			res.render("index",{
				events : events
			});
		});
	});
	
	require("./user")(app);
	require("./event")(app);
	
	console.log("  --ROUTES END--  ");
}