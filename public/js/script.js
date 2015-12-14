

var gameCurrentlyRunning=false;
var uniqueGameIDs=[];

var uniqueGameObjs=[];

var availablePlayers=[];

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
var otherPlayerMorale=[10,255,0];
var otherPlayerMoraleLow=[255,0,0];
var tutorialOn=false;
var playerCalling=false;

var playerCanPass=false;
var playerCanCall=false;
var playerCanShoot=false;


var chaseBallText="Use direction buttons to move to the ball or Z to chase after it";
var passBallText= "Use A to pass the ball";
var callForBallText= "Also Use A to ask your teammate for the ball";
var saySthNiceText="Say something nice about your team to boost your teammate's morale and make him move faster. Say 'team', x ";
var shootText= "Use S to shoot the ball";

var allInstructions=[chaseBallText,passBallText,callForBallText,shootText,saySthNiceText];

var InchaseStage=false;
var InpassStage=false;
var IncallStage=false;
var InshootStage=false;
var saySthNiceText=false;

var allStages=[InchaseStage,InpassStage,IncallStage,InshootStage,saySthNiceText];



$("#playerNameInput").on("input", function(){
	name=$("#playerNameInput").val();
	//console.log(name);
	dx=0;
	dy=0;
});

$("#Enter").click(function(){
	if (!tutorialOn) {
		var playerName=$("#playerNameInput").val();
		//console.log(playerName);
		name=playerName;
		dx=0;
		dy=0;
		$("#playerNameInput").hide();
		
		tutorialOn=true;
		direction=1;
		startStage(0);
		$("#Enter").hide();

		$("#skip").show();
		//$("#Enter").text("SKIP TUTORIAL");

	}
	
	

})

$("#skip").click(function(){
	if (tutorialOn) {
		for (var i = allStages.length - 1; i >= 0; i--) {
			if(allStages[i]&&i+1<allStages.length){
				startStage(i+1);
				return;
			}
		};
		$("#skip").hide();
		loadExistingGames();
	};
	
	
	
});

$("#start").click(function(){
	$("#p5Space").empty();
	$("#start").hide();
	$("#controlsText").text("Select a position");
	if (uniqueGameObjs.length>0) {
		for (var i = uniqueGameObjs[0].availablePlayers.length - 1; i >= 0; i--) {
			console.log(uniqueGameObjs[0].availablePlayers[i]);
			var indexAndPosition=makePositionDescription(uniqueGameObjs[0].availablePlayers[i]);
			console.log(indexAndPosition);

			makePlayerPositionHTML(indexAndPosition[0],indexAndPosition[1]);
			
		};
		
	}
	else{
		for (var i = 10; i >= 0; i--) {
			var word="A"+" "+i;
			//console.log(word);
			var indexAndPosition=makePositionDescription(word);

			makePlayerPositionHTML(indexAndPosition[0],indexAndPosition[1]);
		};
		
	}

	
	
});

function makePlayerPositionHTML(index,position){
	var divID="A"+index;
	var html="";
	html+="<a class='position' href='/";
	html+=divID+"'>";
	html+="<h4>"+position+"</h4>";
	//html+="<h4>"+responsibility+"</h4>";
	html+="</a>";
	
	$("#availablePositions").append(html);
	var divIDval="#"+divID;
	$(divIDval).click(function(){
		//console.log(divID);

	});


}

function makePositionDescription(playerAddress){
	
	
	var index=playerAddress.split(" ")[1];
		position0="Keeper";
	
		 position1="Right center back";
		
		 position2="Left center back";
		 
		 position3="Right back";
		 
		 position4="Left back";
		 
		 position5="Right center midfield";
		 
		 position6="Attacking midfield";
		 
		 position7="Left center midfield";
		
		 position8="Left midfield";
		
		 position9="Right midfield";
		
		 position10="Center Forward";
		
	var positionArray=[position0,position1,position2,position3,position4,position5,position6,position7,position8,position9,position10];
	return[index, positionArray[index]];


	//switch(index){
		
		//case 0:

		
		

		

	
	
		

}


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
				for (var i = resp.length - 1; i >= 0; i--) {
				//console.log(resp[i])

				//console.log(numOccurencesInArray(resp[i].doc.key,uniqueGameIDs), " at ", i);
				if (numOccurencesInArray(resp[i].doc.key,uniqueGameIDs)<1) {
					//console.log('not unique at ', i )
					uniqueGameIDs.push(resp[i].doc.key);
					//console.log(uniqueGameIDs)
					uniqueGameObjs.push(resp[i].doc);
					//console.log(uniqueGameObjs);

				}
				else{

					var index=uniqueGameIDs.indexOf(resp[i].doc.key);
					//console.log(uniqueGameObjs[index]);

					if (resp[i].doc.time>uniqueGameObjs[index].time) {
						uniqueGameObjs[index].availablePlayers=resp[i].doc.availablePlayers;
						uniqueGameObjs[index].teamAScore=resp[i].doc.teamAScore;
						uniqueGameObjs[index].teamBScore=resp[i].doc.teamBScore;
						uniqueGameObjs[index].time=resp[i].doc.time;

					}
					
				}


				
		
		}
		for (var i = uniqueGameObjs.length - 1; i >= 0; i--) {
			if (uniqueGameObjs[i].time>80) {
				var index=uniqueGameObjs.indexOf(uniqueGameObjs[i]);
				uniqueGameObjs.splice(index,1);
			};
			
		};

		makeGameInfoHTML(uniqueGameObjs.length>0);

		

		

		
	}

});
}

function makeGameInfoHTML(bool){
	if (!bool) {
		$("#controlsText").text("There are no currently running games. Start a new one");
		//$("#Enter").text("START");
		$("#skip").hide();
		$("#start").show();


	}
	else{
		$("#controlsText").text("There are spaces available in the current game");
		//$("#Enter").text("JOIN");
		$("#skip").hide();
		$("#start").show();



	}


}

function determineAvailableGames(resp){
			console.log(uniqueGameIDs);
			console.log(uniqueGameObjs);
		
		

}

// function joinGame(gameCode){
// 	console.log("joining game "+gameCode);
// 	$.ajax({
// 		url: "/allgames",
// 		type: "GET",
// 		data: JSON,
// 		error: function (resp) {
// 			console.log(resp);
// 			// Add an error message before the new note form.
// 		},
// 		success: function (resp) {
// 			console.log(resp);
// 			// Render the note
// 			var sorted = _.sortBy(resp, function (row) { return row.doc.created_at;});
// 			sorted.forEach(function (row) {
// 				console.log(row.doc);
// 			});
// 		}
// 	});

// }

function MakeExistingGameDivs(){

}



function generateUniqueKey(){
	var d= new Date();
	var time=d.getTime();
	return time;

}

$(document).ready(function(){
	//loadExistingGames();
	$("#start").hide();
	$("#skip").hide();
	$("#join").hide();
});


/-----------------TUTORIAL SECTION-------------------------------------------------------------------------------------------------/
function setup(){
	 if (annyang) {
      console.log("annyang bih");
     var commands = {
      'team *command': parseResult,  
      };
    }
    else{
      console.log("no annyang");
    }

 
  annyang.addCommands(commands);
  annyang.addCallback('result',function(userSaid){

    console.log(userSaid);
    annyang.start();

  });
  
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
	dy2slow=0.1;
}

function draw(){
	background(255);
	animate();
	

}

  function parseResult(term){
    var latestCommand='team '+term;
    console.log(latestCommand);
  
  // getAlchemySentiment(latestCommand);
    

  }

    function getAlchemySentiment (phrase) {
    $.ajax({
    url: 'https://gateway-a.watsonplatform.net/calls/text/TextGetTargetedSentiment',
    dataType: 'json',
    type: 'POST',
    data: {
      apikey: "aecc0ecac7927df0133924a891a4d05072af19dd",
      text: phrase,
      targets: "team",
      outputMode: 'json'

    },
    error: function (data) {
      console.log("error");
    },
    success: function (data) {
      var sentimentScore=data.results[0].sentiment.score;
      dy2slow+=sentimentScore*0.2;
      //otherPlayerMoraleLow[0]
    }
  })
}


function animate(){


	fill(255,255,0);
	ellipse(xPos,yPos,windowWidth/32, windowWidth/32);
	fill(0,255,0);
	ellipse(xPos,yPos,windowWidth/64,windowWidth/64);
	updatePos();
	fill(244,67,54);
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
        		//$("#Enter").show();


			};
			if (teammatehasBall()||ballBehindTeammate()) {
				startStage(4);

			};
			
		};

		if (allStages[4]) {
			otherPlayerColor=[255,255,0];
			otherPlayerMorale=otherPlayerMoraleLow;
			otherPlayerName="teammate";
			showTeamMateAt(0.75*windowWidth,yPos2);
			updatePos2Slow();
			keeperMovement();
		};


	};
	

}

function updatePos2(){

	yPos2+=dy2*direction2;
}

function updatePos2Slow(){
	yPos2+=dy2slow*direction2;
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
function ballBehindTeammate(){
	return ballXPos>xPos2+windowWidth/32;

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
	fill(otherPlayerMorale);
	ellipse(xPos2, yPos2, windowWidth/64, windowWidth/64);
	fill(244,67,54);
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

/----------------------------SHOULD MAKE A SEPARATE FILE FOR THIS--------------------------------------------------------/

function numOccurencesInArray(val, array){
	var count=0;
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i]==val){
			count++;
		}
	};
	return count;

}