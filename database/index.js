var mongoose = require("mongoose");

module.exports = function(callback){
	mongoose.connect("mongodb://localhost/Scene");
	mongoose.set('debug', true);
	
	console.log("models -- ");
	require("./models")(mongoose);
	console.log("models -- ");

	callback(mongoose);
}
