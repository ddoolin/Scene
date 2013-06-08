
module.exports = function(mongoose){

	require("./user")(mongoose);
	require("./event")(mongoose);

	console.log(mongoose.models);
}