var mongoose = require("mongoose");

module.exports = function(callback){
	mongoose.connect("mongodb://localhost/Scene");
	mongoose.set('debug', true);
		
//	require("./models")(mongoose);

	callback(mongoose);
}
