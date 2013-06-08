var _ = require("underscore");
var async = require("async");
module.exports = function(mongoose){
	
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;
	var Event = new Schema({
		_creator : { type: ObjectId, ref: 'User' },
		name : String,
		duration : {
			starttime : { type:Date },
			endtime   : { type:Date }
		},
		location : {
			longitude : {type:Number},
			latitude  : {type:Number},
		},
		address : String,
		description : String,
		image : String
	});
	
	Event.index ({
		location : "2d"
	});
	
	Event.methods = {
		populatePhotos : function(cb){
			var self = this;
			return mongoose.models.Photo.find({
				_event : self.id
			},function(err,photos){
				var out = self.toJSON();
				out.photos = photos;
				console.log("+" ,out);
				cb(err,out);
			});
		}
	};
	
	Event.statics = {
		findAll : function(cb){
			return mongoose.models.Event.find({},cb);
		},
		findNearBy : function(spot,distance,cb){
			console.log(arguments);
		    return mongoose.models.Event.find({location : { 
					$near : [spot.longitude, 
							 spot.latitude],
			    	$maxDistance : distance/68.91
				}
			},cb);
		}
	}
	
	
	Event.statics.middleware = {
		findById : function(req,res,next){
			var id = req.param("id");
			mongoose.models.Event.findById(id,function(err,event){
				if (err) next(err);
				else if(!event) next(new Error("there is no collage with id",id));
				else {
					req.event = event;
					next();
				}
			});
		}
	};

	Event = mongoose.model('Event', Event);
	return Event;
}

