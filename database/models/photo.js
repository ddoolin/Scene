var mongoose = require('mongoose');

module.exports = function(mongoose)
{
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;
	var Photo = new Schema({
		_creator : { type: ObjectId, ref: 'User' },
		_event : { type: ObjectId, ref: 'Event' },
		size : {
			width  : {type : Number, default:50},
			height : {type : Number, default:50}
		},
		position : {
			x : {type : Number, default : 0},
			y : {type : Number, default : 0}
		},
		rotation : { type : Number,default : 0 },
		createdTime : { type: Date, default: Date.now },
		image : {type: String},
		comments : [
			{ type: ObjectId, ref: 'Comment' }
		]
	});
	
	Photo.methods = {
		addComment : function(comment,cb){
			comment._photo = this._id;
			this.comments.push(comment._id);
			return this.save(cb);
		}
	};
	
	Photo = mongoose.model('Photo', Photo);
	return Photo;
}


