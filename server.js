var http = require("http"),
    Step = require("step"),
    util = require("util");
	
process.on('uncaughtException', function(err) {
    console.error(err.stack);
});

Step(function() {
    require("./database")(this);
}, function(err, db) {
	require("./app")(db, this);
}, function(err, app) {
    var httpServer = http.createServer(app);
	require("./websocket")(httpServer);
	httpServer.listen(app.get('port'), function(err) {
    	console.log("Express server listening on port " + app.get('port'));
    }); 
});
