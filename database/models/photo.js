var mongoose = require('mongoose');

module.exports = function(mongoose)
{
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;
	var Photo = new Schema({
		_creator : { type: ObjectId, ref: 'User' },
		_collage : { type: ObjectId, ref: 'Event' },
		size : {
			width  : {type : Number},
			height : {type : Number}
		},
		position : {
			x : {type : Number},
			y : {type : Number}
		},
		rotation : { type : Number,default : 0 },
		createdTime : { type: Date, default: Date.now },
		image : {type: String}
	});
	
	Photo = mongoose.model('Photo', Photo);
	return Photo;
}


