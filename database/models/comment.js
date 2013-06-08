var mongoose = require('mongoose');

module.exports = function(mongoose)
{
	var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;
	var Comment = new Schema({
		_creator : { type: ObjectId, ref: 'User' },
		_photo  : { type: ObjectId, ref: 'Photo' },
		content : { type : String, default : "" }
	});
	Comment = mongoose.model('Comment', Comment);

	return Comment;
}


