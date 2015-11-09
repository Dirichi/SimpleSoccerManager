var allowedCommands=["attack","defend"];
var mySound;
var game;
var latestCommand="Say team [x]; x=attack/defend/you're awesome... etc";

function preload(){
	mySound = loadSound('data/punch.mp3');
	mySound.setVolume(0.05);

}




function setup() {
	createCanvas(windowWidth,windowHeight);

		
		game=new Game(width/5,height/5,3*width/5,3*height/5);
  		//myRec.onResult = parseResult; // recognition callback
  		if (annyang) {
  // Let's define our first command. First the text we expect, and then the function it should call
		 var commands = {
  		'team *command': parseResult};
  	}
  	else{
  		console.log("no annyang");
  	}

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening. You can call this here, or attach this call to an event, button, etc.
  annyang.start();

  for (var i = game.allPlayers.length - 1; i >= 0; i--) {
  	game.allPlayers[i].kickSound=mySound;
  };
}
	
	

	function draw() {


		background(255); 

		game.stateMachine();
		displayLatestCommand();
		showTeamMorales();
		
		//field.teamA.players[0].mark(field.teamA.players[10]);

	}


	function windowResized(){
		resizeCanvas(windowWidth, windowHeight);
		// game.field=new Field(width/5,height/5,3*width/5,3*height/5);
		game.field._width=3*width/5;
		game.field._length=3*height/5;
		game.field.xPos=width/5;
		game.field.yPos=height/5;


  	//redraw();
  }

  


  function parseResult(term)
  {
		// recognition system will often append words into phrases.
		// so hack here is to only use the last word:
		
		latestCommand=term;
		if (allowedCommands.indexOf(term)!=-1) {
			game.teamA.objectives[0]=latestCommand;

		}
		else{
			getSentiment(term);
		}
		
		//console.log(term);

		



	}


	function displayLatestCommand(){
		//put this function in game class

		push();
		fill(255);
		//rectMode(CENTER);
		rect(width/2-width/6,height/20-height/40,width/3,height/20);
		fill(127,127,130);
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
			if (morale<0.25) {
				fill(255,0,0);
			}
			if (morale>0.25&&morale<0.75) {
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

	// function mousePressed(){
	// 	var fs=fullScreen();
	// 	fullScreen(!fs);
	// }

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

	

