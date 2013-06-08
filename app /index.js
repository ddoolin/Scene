var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express();

var everyauth = require('everyauth');

module.exports = function(db, callback) {
    console.log("APP_START");
    app.db = db;

    app.configure(function() {
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(express.favicon());
        app.use(express.logger('dev'));
		app.use(express.cookieParser());
		app.use(express.session({
	       	secret: "d4SPw4mz2",
	        cookie: {
	            expires: false
	        }
	    }));
		
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        
		app.use(everyauth.middleware(app));
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
        app.set('port', 7777);
    });
    app.configure('production', function() {
        app.set('port', 80);
    });

    app.all('*', function(req, res, next) {
        res.charset = "UTF-8";
        next();
    });
    app.all('*.json', function(req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        next();
    });

    console.log("ROUTE_START");
    require('./routes')(app);
    console.log("ROUTE_END");

    console.log("APP_CREATE_SUCCESS");
	if(callback)
		callback(null, app);
		
	return app;
}
