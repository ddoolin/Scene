var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express();

var everyauth = require('everyauth');

module.exports = function(db, callback) {
    console.log("APP_START");
    app.db = db;


	var User = require("mongoose").models.User;
	everyauth.everymodule.findUserById( function (userId, callback) {
		User.findById(userId, callback);
	});
	
	everyauth.facebook
	  .appId("465294270223068")
	  .appSecret("64a8f37531cb44f82d1e3ea188544f66")
	  .handleAuthCallbackError( function (req, res) {
	  })
	  .scope('email')
	  .fields('id,name,email,picture')
	  .findOrCreateUser( function (session, accessToken, accessTokExtra, fb_user) {
		  console.log(fb_user);
		  var promise = this.Promise();
		  User.findOne({
			  auth_service : "facebook",
			  auth_id : fb_user.id
		  },function(err,user){
			  if (err) return promise.fulfill([err]);
			  if (user){
				  promise.fulfill(user);
			  } else {
				  var user = new User({
					  name : fb_user.name,
					  email : fb_user.email,
					  profile : fb_user.picture.data.url,
					  auth_service : "facebook",
					  auth_id : fb_user.id,
					  auth_token : accessToken
				  });
				  user.save(function(err){
					  console.log("input : ",user);
 					  promise.fulfill(user);
				  });
			  }
		  });
		  return promise;
		 // find or create user logic goes here
	  })
	  .redirectPath('/');
	
	everyauth.password
		.loginWith('email')
		.getLoginPath('/login')
		.postLoginPath('/login')
	    .loginView('login.jade')
	    .authenticate( function (email, password) {
			var errors = [];
			if (!email) errors.push('Missing email');
			if (!password) errors.push('Missing password');
			if (errors.length) return errors;

			var promise = this.Promise();
			console.log(promise);
			User.findOne({ email: email,password:password }, function (err, user) {
				if (err) return promise.fulfill([err]);
				promise.fulfill(user);
			});
			return promise;
	    })
		.getRegisterPath('/register')
	    .postRegisterPath('/register')
	    .registerView('register.jade')
		.extractExtraRegistrationParams( function (req) {
			return {
			  name : req.param("name")
			};
		})
	    .registerUser( function (newUserAttributes) {
			console.log(newUserAttributes);
			var promise = this.Promise();
			var user = new User(newUserAttributes);
			user.save(function(err,user){
				console.log(user);
				if (err) return promise.fulfill([err]);
				promise.fulfill(user);	
			});
			return promise;
	    })
		.loginSuccessRedirect('/')
		.registerSuccessRedirect('/');

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
