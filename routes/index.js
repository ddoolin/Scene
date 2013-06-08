
module.exports = function(app){
    console.log("--ROUTES--");

	app.get("/",function(req,res){
		res.render("index",{
			title : "title!!!"
		});
	});

    console.log("--ROUTES END--");
}