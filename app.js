var x=1;
var express = require("express");
var logger = require('morgan');
var Request = require('request');
var bodyParser = require('body-parser');

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

app.get("/allgames", function(request,response){
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
			// And then filter the results to match the desired key.
			var filteredData = theData.filter(function (d) {
				return d.doc.status == "playing";
			});
			// Now use Express to render the JSON.
			response.json(filteredData);
		}
		else{
			response.json({noData:true});
		}
	});

});

app.get("game/:code", function(request, response){
	console.log("trying to join game "+request.params.code);


})




app.post("/create", function (request, response) {
	console.log("Creating a Game!");
	console.log(request);
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
			//response.json(body);
		}
		else{
			console.log('Error: '+ res.statusCode);
			console.log(body);
		}
	});
});


function generateGameCode(){
 //generated game code will be used as socket room or namespace
}

function submitGameCodeToDb(){}

function getSlowestUser(socketObjs){
	var slowest=socketObjs[0];
	for (var i = socketObjs.length - 1; i >= 0; i--) {
		if (socketObjs[i].speed<slowest.speed) {
			slowest=socketObjs[i];
		};
		
	};
	return slowest;


}

function updateSocketObj(socketObj, socketObjArray){
	// console.log("array length: ",socketObjArray.length);
	for (var i = socketObjArray.length - 1; i >= 0; i--) {

		// console.log(socketObj.soc.id,socketObjArray[i].soc.id);
		if (socketObjArray[i].soc==socketObj.soc) {
			socketObjArray[i]=socketObj;
			// console.log("socket found")
			return 1; //success code

		};
		
	};
	// console.log("error, socket not found in array");
	socketObjArray.push(socketObj);
	// console.log("added to the array");
	// console.log("-------------------------------------------------------------")
	//console.log(socketObj.id, socketObjArray)
	return 0; //error code

}



var allUsers=[];
var socketObjs=[];
var slowestUser;
// var numUsers=0


var port=process.env.PORT||3000;
var server=app.listen(port);
var io = require('socket.io')(server);
var host;
console.log('Express started on port ' + port);

io.on('connection', function (socket) {
	allUsers.push(socket);
	if (allUsers.length==1) {
		host=socket;
		socket.emit("startAsHost",0);
		console.log(" host ",socket.id," is ready to start");
	}

	else{
		socket.broadcast.emit("newPlayerJoined",1);
		console.log("a new user has joined ",allUsers.length);
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
		console.log(data);
		socket.broadcast.emit("joinAsGuest",data);
	})
});