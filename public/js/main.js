const DESIRED_SPEED=2.7;
const DELTA_TIME=100;
var teamName;
var playerObjs=[];
var formation;
var teamNames=[];
var teamplayersURL="";
var socket = io();
var time=0;
var oldTime=0;
var oldCount=0;
var newCount=0;
var gameSpeed=0;

var tempAnimationObjs;

var animationObjs;
var correctedAnimationObjs;

var readyToStart=false;

var gameSpeedFactor=1;

var augmentedGameSpeed;

var state=0;

function moveBack(){
	state--;
}

function moveFoward(){
	state++;
}

// if (state==0) {
// 	$('#action').text("Select A Team")

// };

function getDataFromURL(url, resultType){
   var soccerAPIURL=url;
  $.ajax({
      headers: { 'X-Auth-Token': 'ce9c0231018b49bbb409699476f2b638' },
      url: soccerAPIURL,
      dataType: 'json',
      type: 'GET',
      error: function(data){
        console.log("error");
        console.log(data);
      },
      success: function(data){
        //console.log(data);
        var result;
        if (resultType=="players") {
          result=data.players;
          for (var i = result.length - 1; i >= 0; i--) {
            //playerObjs[i]=createPlayerObj(result[i]);
          };
        };
        //console.log(playerObjs);
      }
    })


}

function getTeamPlayers(teamCode){
	 var soccerAPIURL='http://api.football-data.org/v1/teams/'+teamCode+'/players';
	$.ajax({
  		headers: { 'X-Auth-Token': 'ce9c0231018b49bbb409699476f2b638' },
  		url: soccerAPIURL,
  		dataType: 'json',
  		type: 'GET',
  		error: function(data){
  			console.log("error");
  			console.log(data);
  		},
  		success: function(data){
  			console.log(data);
  		}
		})
	}

function getTeams(leagueCode){
	 var soccerAPIURL='http://api.football-data.org/v1/soccerseasons/'+leagueCode+'/teams';
	$.ajax({
  		headers: { 'X-Auth-Token': 'ce9c0231018b49bbb409699476f2b638' },
  		url: soccerAPIURL,
  		dataType: 'json',
  		type: 'GET',
  		error: function(data){
  			console.log("error");
  			console.log(data);
  		},
  		success: function(data){
  			console.log(data)
  			var numTeams=data.teams.length;
  			for (var i = numTeams - 1; i >= 0; i--) {
  				makeTeamDivs(data.teams[i],i);
  			};
    
  		}
		})
}


function getLeagues(year){
	 var soccerAPIURL='http://api.football-data.org/v1/soccerseasons/?season='+year;
	$.ajax({
  		headers: { 'X-Auth-Token': 'ce9c0231018b49bbb409699476f2b638' },
  		url: soccerAPIURL,
  		dataType: 'json',
  		type: 'GET',
  		error: function(data){
  			console.log("error");
  			console.log(data);
  		},
  		success: function(data){
  			console.log(data);
  		}
		})
}


function makeTeamDivs(teamObj, id){
  teamNames[id]=teamObj.name;
	var teamDivHTML="";
	teamDivHTML+="<div class='teamDiv'>";
	teamDivHTML+="<button id='"+id+"'class='teamButton' value='"+teamObj._links.players.href+"'>";
	teamDivHTML+="<div class='teamCrest'>";
	teamDivHTML+="<img src='"+teamObj.crestUrl+"' width=35%/>";
	teamDivHTML+="</div>";
	teamDivHTML+="</button>";
	teamDivHTML+="</div>";
  var idVal="#"+id;

	$("#activityAreaDiv").append(teamDivHTML);
      $(idVal).click(
        function(){
          teamName=teamNames[id];
          teamplayersURL=$(idVal).val();
        });

  }


$("#next").click(
   function(){
    if (teamplayersURL!="") {
      getDataFromURL(teamplayersURL,"players");

    }
    else{
      // tell them to choose a team first
    }
     
    });




/*------------------------------------------------------------------------------------------------------------------------------*/

var globalGameCounter=0;


var humanInstruction="";

var allowedCommands=["attack","defend"];
var mySound;
var game;
var latestCommand="Say 'team [x]'; x='attack','defend','you're awesome'... etc";

function preload(){
  passSound = loadSound('data/kick.wav');
  passSound.setVolume(0.1);
  shootSound=loadSound('data/kick.wav');
  shootSound.setVolume(0.3);

}




function setup() {
      if (annyang) {
      //i can totally add the team and player names here
     var commands = {
      'team *command': parseResult,
      'game *command': parseGameCommand,
      'play *command': parsePlayerCommand
      };
    }
    else{
      console.log("no annyang");
    }

 
  annyang.addCommands(commands);
  annyang.addCallback('result',function(userSaid){

    console.log(userSaid);
    //latestCommand=userSaid[0];
    //console.log(commandText);
    //console.log(phrases);

  });
  annyang.start();


}
  
  

  function draw() {
   
    if(readyToStart){
      time=millis();
      globalGameCounter++;
      background(255); 
      game.stateMachine(humanInstruction,animationObjs);
      displayLatestCommand();
      // if (receivedPlayers.length>0) {
      //   drawPlayers(receivedPlayers);  
      // };

      computeGameSpeed();
      game.updateSpeedFactor(DESIRED_SPEED/gameSpeed); 
      if (gameChanged()) {
        grabDataAndSend();
      }; 

    }
    else{

    }
      

  }

  function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    game.field._width=width;
    game.field._length=height;
    game.field.xPos=width;
    game.field.yPos=height;
  }

  


  function parseResult(term)
  {
    
    latestCommand='team '+term;
    if (allowedCommands.indexOf(term)!=-1) {
      game.teamA.objectives[0]=term;

    }
    else{
      getAlchemySentiment(latestCommand);
    }

  }

  function parsePlayerCommand(term){
    latestCommand='play '+term;
    if (term=="forward") {
      game.teamA.players[0].setState("n/a");
      game.teamA.players[0].moveForward();
    }
    if (term=="backward") {
      game.teamA.players[0].setState("n/a");
      game.teamA.players[0].moveBackward();
    }
    if (term=="left") {
      game.teamA.players[0].setState("n/a");
      game.teamA.players[0].moveLeft();
    }
    if (term=="right") {
      game.teamA.players[0].setState("n/a");
      game.teamA.players[0].moveRight();
    }
    if (term=="chase") {
      game.teamA.players[0].setState("n/a");
      game.teamA.players[0].chaseBall();
    }

  }

  function parseGameCommand(term){
    latestCommand='game '+term;
    if (term=="pause") {
      game.pause();
    };

  }


  function displayLatestCommand(){
    push();
    fill(255,255,255,0);
    rect(width/2-width/6,height/20-height/40,width/3,height/20);
    fill(0,0,0);
    textSize(width/80);
    textAlign(CENTER);
    text(latestCommand, width/2, height/20);
    pop();
  }


  function getAlchemySentiment (phrase) {
  // body...
    $.ajax({
    url: 'https://gateway-a.watsonplatform.net/calls/text/TextGetTargetedSentiment',
    dataType: 'json',
    //jsonp: 'jsonp',
    type: 'POST',
    data: {
      apikey: "aecc0ecac7927df0133924a891a4d05072af19dd",
      text: phrase,
      targets: "team",
      outputMode: 'json'

    },
    error: function (data) {
      //console.log('alchemy ajax call error');
    },
    success: function (data) {
     // console.log('alchemy ajax call success');

      //alchemyConcept = data;
      var sentimentScore=data.results[0].sentiment.score;
      game.teamA.incrementTeamMorale(sentimentScore*0.2)
    }
  })
}


  

/*-------------------------------------------------------------------------------------*/

var receivedPlayers=[];


function capturePlayers(players){
  
 receivedPlayers=players;
}

function capturePlayer(player){

 
}

function drawPlayer(player){
   push();
  fill(player.colors[0],player.colors[1],player.colors[2],128);
  var playerXPos=(player.corrXPos*game.field._width)+game.field.xPos;
  var playerYPos=(player.corrYPos*game.field._length)+game.field.yPos;
  ellipse(playerXPos,playerYPos,game.teamA.players[0]._width,game.teamA.players[0]._width);
  pop();
  movePlayer(player);

}

function scaleAnimationObjToField(animationObj){
  //console.log(animationObj);
  var xPos=(animationObj.corrXPos*game.field._width)+game.field.xPos;
  var yPos=(animationObj.corrYPos*game.field._length)+game.field.yPos;
  var dx= (animationObj.corrDx*game.field._width)+game.field.xPos;
  var dy=(animationObj.corrDy*game.field._length)+game.field.yPos;
  animationObj.xPos=xPos;
  animationObj.yPos=yPos;
  animationObj.dx=dx;
  animationObj.dy=dy;
  //return [xPos,yPos,dx,dy];
}


function correctAnimationObjs(animationObjs){
  for (var i = animationObjs.teamA.length - 1; i >= 0; i--) {
    scaleAnimationObjToField(animationObjs.teamA[i]);
  };

  for (var i = animationObjs.teamB.length - 1; i >= 0; i--) {
    //console.log(tempAnimationObjs.teamB[i]);
    scaleAnimationObjToField(animationObjs.teamB[i]);
  };

  scaleAnimationObjToField(animationObjs.ball);

  return animationObjs;
}

function drawPlayers(players){
  for (var i = players.length - 1; i >= 0; i--) {
    drawPlayer(players[i]);

  }

}

function movePlayer(player){
  player.corrXPos+=player.corrDx;
  player.corrYPos+=player.corrDy;


}

function createPlayerObj(playerObj){
  var correctedXPos=map(playerObj.xPos,game.field.xPos,game.field.xPos+game.field._width,0,1);
  var correctedYPos=map(playerObj.yPos,game.field.yPos,game.field.yPos+game.field._length,0,1);
  var correctedDx=map(playerObj.dx,game.field.dx,game.field.xPos+game.field._width,0,1);
  var correctedDy=map(playerObj.dy,game.field.dy,game.field.yPos+game.field._length,0,1);
  var player={
    corrXPos: correctedXPos,
    corrYPos: correctedYPos,
    corrDx: correctedDx,
    corrDy: correctedDy,
    state: playerObj.state,
    morale: playerObj.morale,
    position: playerObj.position,
    colors: playerObj.team.colors,
    state: playerObj.state

  };
  return player;
}

function createGameBallObj(ball){
  var correctedXPos=map(ball.xPos,game.field.xPos,game.field.xPos+game.field._width,0,1);
  var correctedYPos=map(ball.yPos,game.field.yPos,game.field.yPos+game.field._length,0,1);
  var correctedDx=map(ball.dx,game.field.dx,game.field.xPos+game.field._width,0,1);
  var correctedDy=map(ball.dy,game.field.dy,game.field.yPos+game.field._length,0,1);

  var gameBall={
    corrXPos: correctedXPos,
    corrYPos: correctedYPos,
    corrDx: correctedDx,
    corrDy: correctedDy
  }
  return gameBall;

}

function createGameData(){
  //var allPlayers=[];
  var teamAPlayers=[];
  var teamBPlayers=[];
  var gameBall=createGameBallObj(game.ball);
  for (var i = game.teamA.players.length - 1; i >= 0; i--) {
    var player=createPlayerObj(game.teamA.players[i]);
    teamAPlayers.push(player);
  };
   for (var i = game.teamB.players.length - 1; i >= 0; i--) {
    var player=createPlayerObj(game.teamB.players[i]);
    teamBPlayers.push(player);
  };

  theData={
    speed: gameSpeed,
    state: game.state,
    teamA: teamAPlayers,
    teamB: teamBPlayers,
    ball: gameBall,
    gameTime: game.gameTime
  };

  return theData;

}




function grabDataAndSend(){
  var theData=createGameData();
  theData.init=false;
  socket.emit("changing",theData);

}

function computeGameSpeed(){
  if (time-oldTime>DELTA_TIME) {
    gameSpeed=globalGameCounter-oldCount;
    oldTime=time;
    oldCount=globalGameCounter;
  }; 
}



socket.on('news', function (data) {
  if (readyToStart&&!game.isHost) {
    tempAnimationObjs=data;
    animationObjs=correctAnimationObjs(tempAnimationObjs);
   
  };
  //console.log(data.speed);
  var d= new Date();
  var time=d.getTime();

  //console.log("my speed is ",gameSpeed, " and I am not the slowest as of ", time);
});

socket.on('startAsHost', function (data) {
  createCanvas(windowWidth,windowHeight);
  game=new Game(0,0,width,height,true);
  //game.isHost=true;
    for (var i = game.allPlayers.length - 1; i >= 0; i--) {
    game.allPlayers[i].passSound=passSound;
    game.allPlayers[i].shootSound=shootSound;
  };
  readyToStart=true;

 
});

socket.on('joinAsGuest', function (data) {
  if (!readyToStart) {
     createCanvas(windowWidth,windowHeight);
     game=new Game(0,0,width,height,false);
    for (var i = game.allPlayers.length - 1; i >= 0; i--) {
    game.allPlayers[i].passSound=passSound;
    game.allPlayers[i].shootSound=shootSound;
  };
     tempAnimationObjs=data;
     animationObjs=correctAnimationObjs(tempAnimationObjs);
     readyToStart=true;


  };
});

socket.on("newPlayerJoined", function(data){
  if (game.isHost) {
    var theData=createGameData();
    theData.init=true;
    socket.emit('joinAsGuest',theData);
  };

});



function gameChanged(){
  if (globalGameCounter%10==0) {
    return true;
  };
  return false;
}

// var direction=[0,0];
// var playerSpeed=1;

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        humanInstruction="backward";
        break;

        case 38: // up
        humanInstruction="left";
        break;

        case 39: // right
        humanInstruction="forward";
        break;

        case 40: // down
        humanInstruction="right";
        break;

        case 65:
        humanInstruction="pass";
        break;

        case 83:
        humanInstruction="shoot";
        break;

        case 90:
        humanInstruction="chase";
        break;


        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup( function(e){
  //if (humanInstruction!="pass"&&humanInstruction!="shoot") {
    humanInstruction="none";
  //}
  
})

function resetInstructions(){
  humanInstruction="none";
}




  



