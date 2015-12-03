var teamName;
var playerObjs=[];
var formation;
var teamNames=[];
var teamplayersURL="";
var socket = io();

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
  createCanvas(windowWidth,windowHeight);

    
    //game=new Game(width/5,height/5,3*width/5,3*height/5);
    game=new Game(0,0,width,height);

    //game=new Game(width/10,height/10,0.8*width,0.8*height,"human");
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

  for (var i = game.allPlayers.length - 1; i >= 0; i--) {
    game.allPlayers[i].passSound=passSound;
    game.allPlayers[i].shootSound=shootSound;
  };
}
  
  

  function draw() {
    globalGameCounter++;
    if (gameChanged()) {
      grabDataAndSend();
    };
    background(255); 
    game.stateMachine();
    displayLatestCommand();
    //showTeamMorales();
    //console.log(game.field.lastPlayerInPossession.position||true);
    if (receivedPlayers.length>0) {
      drawPlayers(receivedPlayers);  
    };
    
    

  }

  // function bestTeamAPassProb(){
  //  best=game.tea
  //  for (var i = game.teamA.players.length - 1; i >= 0; i--) {
  //    Things[i]
  //  };
  // }


  function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    game.field._width=3*width/5;
    game.field._length=3*height/5;
    game.field.xPos=width/5;
    game.field.yPos=height/5;
  }

  


  function parseResult(term)
  {
    
    latestCommand='team '+term;
    if (allowedCommands.indexOf(term)!=-1) {
      game.teamA.objectives[0]=term;

    }
    else{
      getSentiment(term);
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
    //put this function in game class

    push();
    fill(255,255,255,0);
    rect(width/2-width/6,height/20-height/40,width/3,height/20);
    fill(0,0,0);
    textSize(width/80);
    textAlign(CENTER);
    text(latestCommand, width/2, height/20);
    pop();
  }

  function showTeamMorales(){
    var xPos=0.5*width/5;
    var yPos=0.25*height;
    var currHeight=yPos;
    var statHeight=0.5*height/11;
    var statWidth=width/20;
    push();
    for (var i = this.game.teamA.players.length - 1; i >= 0; i--) {


      
      var morale=this.game.teamA.players[i].morale;
      moraleWeighted=map(morale,0,1,0,statWidth);
      fill(128,128,128);
      rect(xPos,currHeight,statWidth,statHeight-5);
      if (morale<=0.25) {
        fill(255,0,0);
      }
      else if (morale>0.25&&morale<0.75) {
        fill(255,255,0);
      }
      else{
        fill(0,255,0);
      }
      rect(xPos,currHeight,moraleWeighted,statHeight-5);

      currHeight+=statHeight;
      fill(0);
      textSize(width/90);
      textAlign(CENTER);
      text(this.game.teamA.players[i].position, 0.5*xPos, currHeight);
      
    };
    pop();
  }


  function getSentiment(command){
    var searchTermSend = encodeURIComponent(command);
    var sentiURL="http://www.sentiment140.com/api/classify?text=team+"+command+"&query=team";
    
    $.ajax({
      url: sentiURL,
      dataType: 'jsonp',
      type: 'GET',
      error: function(data){
        console.log("There is a problem bruv!");
        console.log(data);
        return -1;
    },
      success: function(data){
        console.log(data);
        sentimentPositivity=data["results"]["polarity"];
        console.log(sentimentPositivity);
        sentimentPositivity=map(sentimentPositivity,0,4,-0.2,0.1);
        game.teamA.incrementTeamMorale(sentimentPositivity);
        //return sentimentPositivity;
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

function drawPlayers(players){
  for (var i = players.length - 1; i >= 0; i--) {
    drawPlayer(players[i]);

  }

}

function movePlayer(player){
  player.corrXPos+=player.corrDx;
  player.corrYPos+=player.corrDy;


}

function drawBall(){}

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
    colors: playerObj.team.colors
  };

  return player;

}

function grabDataAndSend(){
  var allPlayers=[];
  for (var i = 0; i < game.allPlayers.length; i++) {
    var player=createPlayerObj(game.allPlayers[i]);
    allPlayers.push(player);
  };
  theData={
    speed: 0,
    players: allPlayers,
    state: game.state
  };

  socket.emit("changing",theData);

}

function computeGameSpeed(){

}

socket.on('news', function (data) {
  //console.log(data);
  capturePlayers(data.players);
});

function gameChanged(){
  if (globalGameCounter%10==0) {
    return true;
  };
  return false;
}

var direction=[0,0];
var playerSpeed=1;

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        direction=[-playerSpeed,0];
        break;

        case 38: // up
        direction=[0,-playerSpeed];
        break;

        case 39: // right
        direction=[playerSpeed,0];
        break;

        case 40: // down
        direction=[0,playerSpeed];
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});




  



