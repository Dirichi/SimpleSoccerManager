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
var animationObjs="none";
var readyToStart=false;
var joined=false;
var gameSpeedFactor=1;
var augmentedGameSpeed;
var initialized=false;
var ID;

var remoteInstructions=[];

/*------------------------------------------------------------------------------------------------------------------------------*/

var globalGameCounter=0;
var humanInstruction="none";
var allowedCommands=["attack","defend"];
var game;
var latestCommand="Say 'team [x]'; x='attack','defend','you're awesome'... etc";

function preload(){
  passSound = loadSound('data/kick.wav');
  passSound.setVolume(0.1);
  shootSound=loadSound('data/kick.wav');
  shootSound.setVolume(0.3);
}


  function parseResult(term){
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
    fill(255,255,255);
    textSize(width/80);
    textAlign(CENTER);
    text(latestCommand, width/2, height/20);
    pop();
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
      game.teamA.incrementTeamMorale(sentimentScore*0.2)
    }
  })
}

/*-------------------------------------------------------------------------------------*/
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
}


function correctAnimationObjs(animationObjs){
  for (var i = animationObjs.teamA.length - 1; i >= 0; i--) {
    scaleAnimationObjToField(animationObjs.teamA[i]);
  };

  for (var i = animationObjs.teamB.length - 1; i >= 0; i--) {
    scaleAnimationObjToField(animationObjs.teamB[i]);
  };

  scaleAnimationObjToField(animationObjs.ball);

  return animationObjs;
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
    gameTime: game.gameTime,
    teamAState: game.teamA.state,
    teamBState: game.teamB.state
  };
  return theData;
}

function grabAndSendGuestInput(){
  var data={
    ID: ID,
    instruction: humanInstruction
  }

  socket.emit("guestInput",data);

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
  if (joined&&!game.isHost) {
    tempAnimationObjs=data;
    animationObjs=correctAnimationObjs(tempAnimationObjs);
    readyToStart=true;
   
  };
});

socket.on('startAsHost', function (data) {
  createCanvas(windowWidth,windowHeight);
  var playerID= data;
  game=new Game(0,0,width,height,true,playerID,passSound,shootSound);
    //for (var i = game.allPlayers.length - 1; i >= 0; i--) {
      
  //};
  joined=true;
  readyToStart=true; 
});

socket.on('joinAsGuest', function (data) {
  if(!joined){
    createCanvas(windowWidth,windowHeight);
     var playerID=data.playerID;
     ID=playerID;
     console.log(playerID);
     game=new Game(0,0,width,height,false,playerID,passSound,shootSound);
     tempAnimationObjs=data;
     animationObjs=correctAnimationObjs(tempAnimationObjs);
  }
     
     //joined=true;
});

socket.on('guestInput', function (data) {
  if (game.isHost) {
    //console.log(data);
    for (var i = remoteInstructions.length - 1; i >= 0; i--) {
      if(remoteInstructions[i].ID==data.ID){
        remoteInstructions[i].instruction=data.instruction;
      }
    };
    // remoteID=data.ID;
    // remoteInstruction=data.instruction;
  }; 
     //joined=true;
});

socket.on("newPlayerJoined", function(data){
  

  if (game.isHost) {
    var playerID=data;
   //game.remotePlayers.push(playerID);
    var remoteInstructionObj={
      ID: data,
      instruction: "none"
    }
    remoteInstructions.push(remoteInstructionObj);
    console.log(remoteInstructionObj);
    game.addRemotePlayer(playerID);
   
    var theData=createGameData();
    theData.init=true;
    theData.playerID=playerID;
    socket.emit('joinAsGuest',theData);
  };
});

function sendInputDataToHost(){

}




function gameChanged(){
  if (globalGameCounter%2==0) {
    return true;
  };
  return false;
}

function onGuestInput(){
  return !game.isHost&&joined&&readyToStart&&humanInstruction!="none";
}

function onReceivedGuestInput(){
  return game.isHost&&joined&&readyToStart&&remoteInstruction!="none"&&remoteID!="none";

}



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
    console.log(humanInstruction);
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup( function(e){
    humanInstruction="none";
});



/---------------------------------------------------------------------------------------------------------------------------/ 
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
  globalGameCounter++;  

    if(readyToStart){
      time=millis();
      background(255);
      game.stateMachine(humanInstruction,animationObjs,remoteInstructions);
      displayLatestCommand();
      computeGameSpeed();
      game.updateSpeedFactor(DESIRED_SPEED/gameSpeed); 
      if (gameChanged()) {
        grabDataAndSend();
      }; 
      if (!game.isHost) {
        grabAndSendGuestInput();
      };
      // if (onReceivedGuestInput()) {
      //   game.processRemoteInput(remoteID,remoteInstruction);
      //   remoteID="none";
      //   remoteInstruction="none";
      // };
      //game.processRemoteInput();
    }
    if (!joined&&animationObjs.init) {
      console.log("changing joined from ",joined," to ",animationObjs.init);
      game.stateMachine(humanInstruction,animationObjs,remoteInstructions);
      joined=true;
    };
   }

  function windowResized(){
    // resizeCanvas(windowWidth, windowHeight);
    // game.field._width=width;
    // game.field._length=height;
    // game.field.xPos=width;
    // game.field.yPos=height;
  }
  



