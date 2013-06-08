var mongoose = require("mongoose");

module.exports = function(app){
	console.log(" --Events");
	var Event = mongoose.models.Event;

	app.get("/events/create",function(req,res){
		res.render("event/create");
	});
	app.post("/events",function(req,res){
		if (req.user) {
			var event = new Event({
				_creator : req.user.id,
				name : req.param("name"),
				duration : {
					starttime : req.param("duration.starttime"),
					endtime   : req.param("duration.endtime"),
				},
				location : {
					longitude : req.param("location.longitude"),
					latitude  : req.param("location.latitude"),
				},
				description : req.param("description"),
				image : req.param("image")
			});
			event.save(function(err,event){
				res.redirect("/events/",event.id);
			});
		} else {
			res.redirect("/auth/facebook");
		}
	});

	app.get("/events/:id",Event.middleware.findById,function(req,res){
		res.render("event/index",{
			event : req.event
		});
	});
}