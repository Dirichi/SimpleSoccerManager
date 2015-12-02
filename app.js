var express = require("express");
var logger = require('morgan');
var Request = require('request');

//Create an 'express' object
var app = express();

//Some Middleware - log requests to the terminal console
app.use(logger('dev'));

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));


// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

//  function corsEnable(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

app.get("/", function(req, res){
	// var dataForThePage = {
	// 	message: "Try adding a forward slash plus a word to the url",
	// 	search: false
	// };
	res.render('index');
});

app.get("/game", function(req, res){
	// var dataForThePage = {
	// 	message: "Try adding a forward slash plus a word to the url",
	// 	search: false
	// };
	res.render('game');
});

app.get("/select", function(req, res){
	// var dataForThePage = {
	// 	message: "Try adding a forward slash plus a word to the url",
	// 	search: false
	// };
	res.render('select');
});

app.get("/teams/:leagueCode", function(req,res){
	res.header('Access-Control-Allow-Origin', "*");
	var leagueCode=req.params.leagueCode;
	var requestURL='http://api.football-data.org/v1/soccerseasons/'+leagueCode+'/teams';

		Request(requestURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			var teams = JSON.parse(body);
			//console.log(teams);
			res.json(teams);
		}
	});

});

// app.get("/game/:gameCode", function(req,res){
// 	res.header('Access-Control-Allow-Origin', "*");
// 	var leagueCode=req.params.leagueCode;
// 	var requestURL='http://api.football-data.org/v1/soccerseasons/'+leagueCode+'/teams';

// 		Request(requestURL, function (error, response, body) {
// 		if (!error && response.statusCode == 200) {
// 			//console.log(body);
// 			var teams = JSON.parse(body);
// 			//console.log(teams);
// 			res.json(teams);
// 		}
// 	});

// });

var port=process.env.PORT||3000;
app.listen(port);

