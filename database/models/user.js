var mongoose = require("mongoose");
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
		profile : String
	});

	User.methods = {
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