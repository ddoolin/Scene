module.exports = function(app){
    console.log("--ROUTES--");

	app.get("/",function(req,res){
		res.render("index",{
			title : "title!!!"
		});
	});
	
	require("./user")(app);
	require("./event")(app);

    console.log("--ROUTES END--");
}