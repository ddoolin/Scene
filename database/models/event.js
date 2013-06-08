var _ = require("underscore");
var async = require("async");
module.exports = function(mongoose){
	
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;
	var Event = new Schema({
		_creator : { type: ObjectId, ref: 'User' },
		name : String,
		description : String,
		image : String
	});
	Event.methods = {};
	Event.statics.middleware = {
		findById : function(req,res,next){
			var id = req.param("id");
			Event.findById(id,function(err,event){
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

