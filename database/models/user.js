var mongoose = require("mongoose");
var async = require("async");

module.exports = function(){
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var User = new Schema({
	    name 	 : String,
		password : String,
		email 	 : String,
		auth_service : String,
		auth_id : String,
		auth_token : String,
		profile : String,
		created_events : [{ type: ObjectId, ref: 'Event' }],
		attended_events : [{ type: ObjectId, ref: 'Event' }],
		spots : [{ 
			longitude : {type:Number},
			latitude  : {type:Number},
			address : String
		}]
	});
	
	User.methods = {
		populateSpots : function(cb){
			console.log("populateSpots");
			var self = this;
			var Event = mongoose.models.Event;
			var out = this.toJSON();
			
			async.each(out.spots, function(spot,callback){
				Event.findNearBy(spot,0.01,function(err,events){
					spot.events = events;
					callback(err);
				});
			}, function(err){
				console.log(out);
				cb(err,out);
			});
		}
	};
	
	User.statics.middleware = {
		findByUsername : function(req,res,next){
			User.findOne({name : req.param("name")},function(err,user){
				if(err) { next(err); }
				else {
					req.user = user;
					next();
				}
			});
		}
	};

	User = mongoose.model('User', User);
	return User;
}