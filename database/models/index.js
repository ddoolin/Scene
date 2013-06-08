
module.exports = function(mongoose){

	require("./user")(mongoose);
	require("./event")(mongoose);
	require("./photo")(mongoose);

	console.log(mongoose.models);
}