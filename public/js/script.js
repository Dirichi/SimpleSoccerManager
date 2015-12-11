var action="";
var xPos;
var yPos;
var xPos2;
var yPos2;
var ballXPos;
var ballYPos;
var dx;
var dy;
var dx2;
var dy2;
var ballDx;
var ballDy;
var direction;
var direction2;
var name="player name";

var otherPlayerName="teammate";
var otherPlayerColor=[255,255,0];
var tutorialOn=false;
var playerCalling=false;

var playerCanPass=false;
var playerCanCall=false;
var playerCanShoot=false;


var chaseBallText="Use direction buttons to move to the ball or Z to chase after it";
var passBallText= "Use A to pass the ball";
var callForBallText= "Also Use A to call for the ball";
var saySthNiceText="Say something nice to your teammate to boost his morale and make him move faster. Say 'teammate', x ";
var shootText= "Use S to shoot the ball";

var allInstructions=[chaseBallText,passBallText,callForBallText,shootText];

var InchaseStage=false;
var InpassStage=false;
var IncallStage=false;
var InshootStage=false;

var allStages=[InchaseStage,InpassStage,IncallStage,InshootStage];



$("#startGame").click(	function(){
		var key=generateUniqueKey();
		var game={
			id: key,
			status: "playing",
			teamA: "ARG",
			teamB: "BRA",
			scoreA: 0,
			scoreB: 0, 
			time: 0
		};
		console.log(game);
		createGame(game);
	});

$("#playerNameInput").on("input", function(){
	name=$("#playerNameInput").val();
	console.log(name);
	dx=0;
	dy=0;
});

$("#Enter").click(function(){
	var playerName=$("#playerNameInput").val();
	console.log(playerName);
	name=playerName;
	dx=0;
	dy=0;
	$("#playerNameInput").hide();
	
	tutorialOn=true;
	direction=1;
	startStage(0);
	// $("Enter").text("PROCEED");
})

function createGame (theData) {
	console.log("Trying to Post");
	$.ajax({
		url: "/create",
		contentType: "application/json",
		type: "POST",
		data: JSON.stringify(theData),
		error: function (resp) {
			console.log(resp);
			// Add an error message before the new note form.
		},
		success: function (resp) {
			console.log(resp);
			// Render the note
		}
	});
}


function loadExistingGames(){
	console.log("Loading Existing Games");
	$.ajax({
		url: "/allgames",
		type: "GET",
		data: JSON,
		error: function (resp) {
			console.log(resp);
			// Add an error message before the new note form.
		},
		success: function (resp) {
			console.log(resp);
			// Render the note
			var sorted = _.sortBy(resp, function (row) { return row.doc.created_at;});
			sorted.forEach(function (row) {
				console.log(row.doc);
			});
		}
	});

}

function joinGame(gameCode){
	console.log("joining game "+gameCode);
	$.ajax({
		url: "/allgames",
		type: "GET",
		data: JSON,
		error: function (resp) {
			console.log(resp);
			// Add an error message before the new note form.
		},
		success: function (resp) {
			console.log(resp);
			// Render the note
			var sorted = _.sortBy(resp, function (row) { return row.doc.created_at;});
			sorted.forEach(function (row) {
				console.log(row.doc);
			});
		}
	});

}

function MakeExistingGameDivs(){

}



function generateUniqueKey(){
	var d= new Date();
	var time=d.getTime();
	return time;

}

$(document).ready(function(){
	//loadExistingGames();
})



function setup(){
	var myCanvas=createCanvas(0.9875*windowWidth,windowWidth/8);
	myCanvas.parent('p5Space');
	xPos=windowWidth/2;
	yPos=windowWidth/16;
	xPos2=windowWidth/4;
	yPos2=windowWidth/16;
	ballXPos=xPos2;
	ballYPos=yPos2;
	direction=1;
	direction2=1;
	dx=1;
	dy=0;
	dy2=1;
}

function draw(){
	background(255);
	animate();
	

}

function animate(){


	fill(255,255,0);
	ellipse(xPos,yPos,windowWidth/32, windowWidth/32);
	fill(0,255,0);
	ellipse(xPos,yPos,windowWidth/64,windowWidth/64);
	updatePos();
	fill(41,182,246);
	textAlign(CENTER);
	textFont("Helvetica");
	text(name, xPos,yPos-windowWidth/32);
	fill(0)
	//ellipse(ballXPos,ballYPos,windowWidth/128,windowWidth/128);
	if (xPos>0.75*windowWidth||xPos<0.25*windowWidth) {
		reverseMovement();

	};

	if (tutorialOn) {
		if (allStages[0]) {
			showBall();
			//push();
			//pop();
			if (playerhasBall()) {
				startStage(1);
			};
		};

		if (allStages[1]) {
			// ballXPos=xPos;
			// ballYPos=yPos;
			
			showTeamMateAt(0.75*windowWidth,yPos2);
			fill(0);
			ellipse(ballXPos,ballYPos,windowWidth/128,windowWidth/128);
			if (playerCanPass) {
				playerPass();
			};
			if (teammatehasBall()) {
				startStage(2);
			};
			
		};

		if (allStages[2]) {
			showTeamMateAt(0.75*windowWidth,yPos2);
			fill(0);
			ellipse(ballXPos,ballYPos,windowWidth/128,windowWidth/128);
			if (playerCanCall) {
				teammatePass();
			};

			if (playerhasBall()) {
				startStage(3);
			};

		};

		if (allStages[3]) {
			otherPlayerName="keeper";
			otherPlayerColor=[0,0,255];
			showTeamMateAt(0.75*windowWidth,yPos2);
			showPost();
			fill(0);
			ellipse(ballXPos,ballYPos,windowWidth/128,windowWidth/128);
			updatePos2();
			keeperMovement();
			if (playerCanShoot) {
				ballXPos=lerp(ballXPos,0.8*windowWidth,0.05);
        		ballYPos=lerp(ballYPos,windowWidth/16, 0.05);

			};
			
		};

	};
	

}

function updatePos2(){

	yPos2+=dy2*direction2;
}

function keeperMovement(){
	if (yPos2<windowWidth/32||yPos2>3*windowWidth/32) {
		direction2=-direction2;
	}
	

}

function showPost(){
	push();
	fill(128,128,128);
	rect(0.8*windowWidth,windowWidth/64,0.005*windowWidth,3*windowWidth/32);
	pop();

}

function startStage(index){
	
	for (var i = allStages.length - 1; i >= 0; i--) {
		allStages[i]=false;
	};
	allStages[index]=true;
	$("#controlsText").text(allInstructions[index]);
}


function reverseMovement(){
	//if (xPos>windowWidth||xPos<0) {
		if (!tutorialOn) {
			direction=-direction;

		};
		
	//};
}

function updatePos(){
	xPos+=dx*direction;
	yPos+=dy;
}

function teammatePass(){
	ballXPos=lerp(ballXPos,xPos,0.05);
	ballYPos=lerp(ballYPos,yPos,0.05);
}

function teammatehasBall(){
	return isBallWithinRadiusOf(xPos2,yPos2,windowWidth/64);
}

function isBallWithinRadiusOf(x,y,radius){
	var distx=ballXPos-x;
	var disty=ballYPos-y;
	var dist=sqrt(sq(distx)+sq(disty));
	return dist<radius;


}

function playerhasBall(){
	
	return isBallWithinRadiusOf(xPos,yPos, windowWidth/64)
}

function callForBall(){
	playerCalling=true;
}

function playerPass(){
	ballXPos=lerp(ballXPos,xPos2,0.05);
	ballYPos=lerp(ballYPos,yPos2,0.05);

}

function showBall(){
	push();
	fill(0);
	ellipse(ballXPos,ballYPos,windowWidth/128,windowWidth/128);
	pop();

}
function showTeamMateAt(x,y){
	xPos2=x;
	yPos2=y;
	push();
	fill(otherPlayerColor);
	ellipse(xPos2, yPos2, windowWidth/32, windowWidth/32);
	fill(10,255,0);
	ellipse(xPos2, yPos2, windowWidth/64, windowWidth/64);
	fill(41,182,246);
	textAlign(CENTER);
	textFont("Helvetica");
	text(otherPlayerName,xPos2, yPos2-windowWidth/32);
	pop();
	

}
$(document).keydown(function(e) {
	if(tutorialOn){
		switch(e.which) {
        case 37: // left
        dx=-1;
        break;

        case 38: // up
        dy=-1;
        break;

        case 39: // right
        dx=1;
        break;

        case 40: // down
        dy=1;
        break;

        case 65:
        //playerPass();

       if (allStages[1]) {
       	playerCanPass=true;
       };

       if (allStages[2]) {
       	playerPass=false;
       	playerCanCall=true;

       };
       
        break;

        case 83:
        //humanInstruction="shoot";
        if (allStages[3]) {
        	playerCanShoot=true;
        };
        break;

        case 90:
        //humanInstruction="chase";
        if (allStages[0]) {
       	xPos=lerp(xPos,ballXPos,0.05);
       	yPos=lerp(yPos,ballYPos,0.05)

       };
        break;


        default: return; // exit this handler for other keys
    }

	}
   
    //console.log(humanInstruction);
    //e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup( function(e){
    //humanInstruction="none";
    if (tutorialOn) {
    	dx=0;
    	dy=0;

    };
    
});