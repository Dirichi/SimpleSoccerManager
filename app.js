var allUsers=[];
var socketObjs=[];
var host;
var io;
var playerID="";
var humanControlledPlayers=[];

var dbRev; //database reversion version

var express = require("express");
var logger = require('morgan');
var Request = require('request');
var bodyParser = require('body-parser');
var socketOpened=false;

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

app.use(bodyParser.json());


var CLOUDANT_USERNAME="dirichi206";
// The name of your database
var CLOUDANT_DATABASE="soccer_multiverse";
// These two are generated from your Cloudant dashboard of the above database.
var CLOUDANT_KEY="theranedculdnewespontsee";
var CLOUDANT_PASSWORD="66b5a759d0e32870a80f6194a6888b80d4059bdc";

var CLOUDANT_URL = "https://" + CLOUDANT_USERNAME + ".cloudant.com/" + CLOUDANT_DATABASE;


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

	res.render('index');
});

app.get("/about", function(req, res){

	res.render('about');
});


app.post("/create", function (request, response) {
	console.log("Creating a Game!");
	//console.log(request.body);
	// Use the Request lib to POST the data to the CouchDB on Cloudant
	Request.post({
		url: CLOUDANT_URL,
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		},
		json: true,
		body: request.body
	},
	function (err, res, body) {
		if (res.statusCode == 201){
			console.log('Doc was saved!');
			console.log(res.body.rev);
			dbRev=res.body.rev;
			console.log("on create ", dbRev)
		}
		else{
			console.log('Error: '+ res.statusCode);
			console.log(body);
		}
	});
});


app.get("/api/allgames", function(request,response){
		console.log("getting all games");

		Request.get({
		url: CLOUDANT_URL+"/_all_docs?include_docs=true",
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		},
		json: true
	}, function (err, res, body){
		//Grab the rows
		var theData = body.rows;
		console.log(theData);


		if (theData){

			response.json(theData);
		}
		else{
			response.json({noData:true});
		}
	});

});

app.get("/api/allgames/ended/", function(request,response){
	
		Request.get({
		url: CLOUDANT_URL+"/_all_docs?include_docs=true",
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		},
		json: true
	}, function (err, res, body){
		var theData = body.rows;
		console.log(theData);
		if (theData){
			var filteredData = theData.filter(function (d) {
				//if (gameEnded) {
					return d.doc.time == 90;
			});

			response.json(filteredData);
		}
		else{
			response.json({noData:true});
		}
	});

});

app.get("/api/allgames/wonBy/:team", function(request,response){
	var teamName= request.params.team;
		

		Request.get({
		url: CLOUDANT_URL+"/_all_docs?include_docs=true",
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		},
		json: true
	}, function (err, res, body){
		var theData = body.rows;
		console.log(theData);
		if (theData){
			var filteredData = theData.filter(function (d) {
				if (teamName=="A") {
					return d.doc.time == 90 && d.doc.teamAScore>d.doc.teamBScore;
				}
				if(teamName=="B"){
					return d.doc.time==90 && d.doc.teamBScore>d.doc.teamAScore;
				}
			});

			response.json(filteredData);
		}
		else{
			response.json({noData:true});
		}
	});

});

app.get("/api/allgames/gameKey/:key", function(request,response){
	var gameKey= request.params.key;
		

		Request.get({
		url: CLOUDANT_URL+"/_all_docs?include_docs=true",
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		},
		json: true
	}, function (err, res, body){
		var theData = body.rows;
		//console.log(theData);
		if (theData){
			var filteredData = theData.filter(function (d) {
					return d.doc.key == gameKey;
				
			
			});

			response.json(filteredData);
		}
		else{
			response.json({noData:true});
		}
	});

});

app.get("/api", function(request,response){
	response.render('api');

});





app.get("/favicon.ico", function(req,res){
	console.log("favicon requested");
});

app.get("/:playerID", function(req, res){

	
	playerID=req.params.playerID[0]+" "+req.params.playerID.slice(1);
	if (playerID.length>4) {
		return;
	};
	console.log("req param is ", req.params.playerID);
	//openSocket();	
	//console.log('Express started on port ' + port);
	res.render('game');
	});



app.get("game/:code", function(request, response){
	console.log("trying to join game "+request.params.code);


})






function generateGameCode(){
 //generated game code will be used as socket room or namespace
}

function submitGameCodeToDb(){}

function openSocket(){
	if (!socketOpened) {
		io = require('socket.io')(server);

	};
	socketOpened=true;

}

var port=process.env.PORT||3000;
var server=app.listen(port);
io = require('socket.io')(server);

	io.on('connection', function (socket) {
		if(playerID!=""){
			//humanControlledPlayers.push(playerID);
			allUsers.push(socket);
		if (allUsers.length==1) {
			host=socket;
			socket.emit("startAsHost",playerID);
			console.log(" host ",playerID," is ready to start");
		}

		else{
			socket.broadcast.emit("newPlayerJoined",playerID);
			console.log(playerID," has joined ",allUsers.length);
			//console.log();
		}
	 	
		socket.on('changing', function (data) {
			if (socket==host && allUsers.length>1) {
				//console.log("the host about to spit fire");
				socket.broadcast.emit('news', data);
			}
	  	});
		socket.on("joinAsGuest",function(data){
			console.log("latest player has been given the go to join as guest");
			//console.log(data);
			socket.broadcast.emit("joinAsGuest",data);
		});

		socket.on("guestInput",function(data){
			//console.log("input from ",data);
			//console.log(data);
			socket.broadcast.emit("guestInput",data);
		});

		 socket.on('disconnect', function() {
      	 	console.log('Got disconnect!');
      		var i = allUsers.indexOf(socket);
      		// if (socket==host) {
      			//special case
      		// };
      		allUsers.splice(i, 1);

   });


		 playerID="";
		}
	
	});