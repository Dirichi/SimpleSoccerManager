"use strict";
class Game{
	constructor(xPos,yPos,_width,_length,isHost,humanPlayerIndex,passSound,shootSound){
		this.field=new Field(xPos,yPos,_width,_length, humanPlayerIndex,passSound,shootSound,this);
		this.ball=this.field.ball;
		this.teamA=this.field.teamA;
		this.teamB=this.field.teamB;
		this.timeElapsed=0;
		this.gameTime=0;
		this.allPlayers=this.field.allPlayers;
		this.winner="";
		this.yval=[];
		this.xval=[];
		this.isHost=isHost;
		this.gameStatus="event";
		this.animationTime=0;
		this.state="KICKOFF";
		this.teamAmorale=0;
		this.cumulativeTimeDelay=0;
		this.delay=0;
		this.delayUpdated=false;
		this.teamB.objectives=["defend"];
		this.teamA.objectives=["attack"];
		this.lastTimeBeforeGameEvent=0;
		this.halfTimeHappened=false;
		this.mostRecentEventTimeStop=0;
		this.mostRecentEventTimeStart=0;
		this.remotePlayers=[];
		


	}
	animate(gameInstructions,remoteInstructions){
		this.timeElapsed=millis();

		if (this.isFullTime()) {
			this.gameTime=90;
			this.lastTimeBeforeGameEvent=90;
			this.end();
		}
		else{
			if (this.gameEvent()) {
			
				if(this.isHalfTime()){
					this.lastTimeBeforeGameEvent=45;
					this.gameTime=45;
				}

				else{
					this.gameTime=this.lastTimeBeforeGameEvent;
				}
				this.delayUpdated=false;
		}
			else{
				this.updateCumulativeDelay();
				this.gameTime=Math.floor(this.timeElapsed/1000)-Math.floor(this.cumulativeTimeDelay/1000);
				this.delayUpdated=true;

			}
		}
		
		this.updateLastTimeBeforeGameEvent();		
		this.getMostRecentEventTimeStart();
		this.getMostRecentEventTimeStop();
		
		this.field.animate(gameInstructions,remoteInstructions);
		this.displayScore();
		this.displayTime();
		this.updateTeamMorale();
		}

	dumbAnimate(gameInstructions,animationObjs){
		 this.state=animationObjs.state;
		 this.gameTime=animationObjs.gameTime;
    	 //var fieldAnimationObjs=[animationObjs.teamA,animationObjs.teamB,animationObjs.ball,animationObjs.init];
    	 var fieldAnimationObjs={
    	 	teamAState: animationObjs.teamAState,
    	 	teamBState: animationObjs.teamBState,
    	 	ball: animationObjs.ball,
    	 	teamA: animationObjs.teamA,
    	 	teamB: animationObjs.teamB,
    	 	init: animationObjs.init
    	 };
		this.field.dumbAnimate(gameInstructions,fieldAnimationObjs);
		this.displayScore();
		this.displayTime();

	}


	displayScore(){
		push();
		fill(255);
		var scoreString=this.teamA.nm+" "+this.teamA.score+" : "+this.teamB.score+" "+this.teamB.nm;
		//var scoreString="Not for now"
		textSize(width/40);
		text(scoreString, width/48, height/20);
		pop();
	}

	displayTime(){
		push();
		fill(255);
		textSize(width/40);
		var timeString=this.gameTime+":00"
		text(timeString, 42*width/48, height/20);
		pop();

	}


	stateMachine(gameInstructions, animationObjs,remoteInstructions){
		

		if (this.isHost) {
			if (remoteInstructions.length>0) {
				if (remoteInstructions[0].instruction!="none") {
					console.log(remoteInstructions);

				};
				
			};
			this.animate(gameInstructions,remoteInstructions);
			this.updateState();
			this.updateScores();

				if (this.gameEvent()) {
					this.ball.stop();
					//if (this.timeElapsed%500==0) {
						this.displayGameStatus();
					//};
					
					this.restartGameFromState();
					}
				else if(!this.isFullTime()){
					this.animationTime=0;
					}

				else{
				this.end();
				}

		}
		else{
			this.dumbAnimate(gameInstructions,animationObjs);
			if (this.state!="PLAY") {
					this.displayGameStatus();
					}
							}
		
			}

	displaySubs(){

	}
	
	goalScored(){
		return this.leftGoalScored()||this.rightGoalScored();	
	}
	leftGoalScored(){
		return this.field.leftPost.contains(this.ball.xPos,this.ball.yPos);

	}
	rightGoalScored(){
		return this.field.rightPost.contains(this.ball.xPos,this.ball.yPos);

	}
	isCorner(){
		return this.isleftCorner()||this.isRightCorner();

	}
	isleftCorner(){
		return this.ball.xPos>this.field.xPos+this.field._width && this.field.lastPlayerInPossession.side=="right";	

	}
	isRightCorner(){
		return this.ball.xPos<this.field.xPos && this.field.lastPlayerInPossession.side=="left";		
	}
	isThrowing(){
	//	console.log(this.field.lastPlayerInPossession);
		return (this.ball.yPos<this.field.yPos || this.ball.yPos>this.field.yPos+this.field._length)||this.teamA.state=="ownthrowing"||this.teamA.state=="oppthrowing";
	}
	isRightThrowing(){
		return this.isThrowing() && this.field.lastPlayerInPossession.side=="left";

	}
	isLeftThrowing(){
		return this.isThrowing() && this.field.lastPlayerInPossession.side=="right";
	}
	isGoalKick(){
		return this.isLeftGoalKick()||this.isRightGoalKick()

	}
	isLeftGoalKick(){
		return this.ball.xPos<this.field.xPos && this.field.lastPlayerInPossession.side=="right";

	}
	isRightGoalKick(){
		return this.ball.xPos>this.field.xPos+this.field._width && this.field.lastPlayerInPossession.side=="left";

	}
	isHalfTime(){
		return this.gameTime==45&&!this.halfTimeHappened;
	}

	isFullTime(){
		return this.gameTime>=90;
	}

	isStarting(){
		return this.timeElapsed<5000;
	}
	

	kickOff(){

	}

	erasePlayerStates(){
		for (var i = this.allPlayers.length - 1; i >= 0; i--) {
			this.allPlayers[i].setState("");
		};
	}

	end(){
		this.erasePlayerStates();
		this.setTeamsToNeutral();
		this.ball.stop();
		 if (this.teamA.score>this.teamB.score) {
		 		this.winner=this.teamA;
		 	}
		 else if(this.teamB.score>this.teamA.score){
		 		this.winner=this.teamB;
		 	}
		

		if (this.winner!="") {
			this.state="GAME OVER, "+this.winner.nm+ " WINS";
			
			

		}
		else{
			this.state="GAME OVER, DRAW";


		}
		this.displayGameStatus();

		
		

	}


	getLastPlayerInPossession(){
		for (var i = this.allPlayers.length - 1; i >= 0; i--) {
			if (this.allPlayers[i].hasBall()) {
				return this.allPlayers[i];
			};
		};
		return 1;
	}


	displayGameStatus(){
		push();

		//if (this.timeElapsed%2==1) {
			fill(255);
			textAlign(CENTER);
			textSize(this.field._width/10);
			text(this.state,this.field.midx,this.field.midy);

		//};
		
		pop();

	}	
	gameEvent(){
		return this.isFullTime()||this.isThrowing()||this.isCorner()||this.isHalfTime()||this.goalScored()||this.isStarting()||this.state=="KICKOFF"||this.isGoalKick()||this.isPaused();
	}

	setTeamsToNeutral(){
		this.setTeamStates("neutral","neutral");
	}

	setTeamsToPlay(){
		this.setTeamStates("play","play");

	}

	restartGameFromThrowing(){
		var teamToRestart;
		this.ball.stop();
		if (this.field.lastPlayerInPossession.side=="right") {
			teamToRestart=this.teamA;
			this.setTeamStates("ownthrowing","oppthrowing");
			
		}
		else{
			teamToRestart=this.teamB;
			this.setTeamStates("oppthrowing","ownthrowing");
			
		}

		if (this.ball.yPos<this.field.midy){
			this.ball.yPos=this.field.yPos;
		}
		else{
			this.ball.yPos=this.field.yPos+this.field._length;

		}



		
		if (teamToRestart.isReadyForThrowing()) {
			teamToRestart.nearestPlayerToBall().passToBestOption();
			this.setState("PLAY");
			this.setTeamsToPlay();
			};


	}
	restartGameFromGoalKick(){

		//this.teamB.moveToAttackingRegions();
		//this.teamA.moveToAttackingRegions();
		if (this.isLeftGoalKick()) {
			this.setTeamStates("owngoalkick","oppgoalkick");			
			if (this.isReadyForGoalKick()) {
				this.ball.xPos=this.teamA.players[0].xPos;
				this.ball.yPos=this.teamA.players[0].yPos;
				this.setTeamsToPlay();


			};
		}
		else{
			this.setTeamStates("oppgoalkick","owngoalkick");

			if (this.isReadyForGoalKick()) {
				this.ball.xPos=this.teamB.players[0].xPos;
				this.ball.yPos=this.teamB.players[0].yPos;
				this.setTeamsToPlay();

			};	

		}

		

	}
	restartGameFromCorner(){
		if (this.isleftCorner()) {

		}
		else{

		}

	}
	restartGameFromKickOff(){
		this.setTeamStates("kickoff","kickoff");
		if (this.isReadyForKickOff()) {
				this.ball.xPos=this.field.midx;
				this.ball.yPos=this.field.midy;
				this.setTeamsToPlay();
				//console.log("start playing now");
				if (this.state=="HALF TIME") {
					this.halfTimeHappened=true;

				};
				this.setState("PLAY");
				
				

			}
			

	}

	restartGameFromState(){
		if (this.state=="THROWING") {
			this.restartGameFromThrowing();
		}
		else if (this.state=="GOALKICK") {
			this.restartGameFromGoalKick();

		}
		else if (this.state=="CORNER") {
			this.restartGameFromCorner();
		}
	
	
		else if (this.state=="GOAL"||this.state=="KICKOFF"||this.state=="HALF TIME") {
			this.restartGameFromKickOff();
			
		}
		else{
			//console.log(this.state+" state is not recognized");
		}
		//this.setState("PLAY");
		//this.setTeamsToPlay();
	}

	setState(newState){
		this.state=newState;
	}

	setTeamStates(stateA,stateB){
		this.teamA.setState(stateA);
		this.teamB.setState(stateB);

	}

	updateScores(){
		if (this.goalScored()) {
				if (this.animationTime==0) {
					if (this.leftGoalScored()) {
					this.teamB.score++;
				}else{
					this.teamA.score++;
				}

				};
				this.animationTime++;
				
			}
	}
	updateState(){
		if(!this.isFullTime()){
			if (this.goalScored()) {
			this.state="GOAL";
		};
			if (this.isCorner()) {
				this.state="CORNER";
			};
			if (this.isGoalKick()) {
				this.state="GOALKICK";
			};
			if (this.isHalfTime()) {
				this.state="HALF TIME";
			};
			if (this.isFullTime()) {
				this.state="FULL TIME";
			};
			if (this.isThrowing()) {
				this.state="THROWING";
			};
			if (!this.gameEvent()) {
				this.state="PLAY"
			};

		}
		
		else{
			this.state="FULL TIME";
		} 
		

	}
	isReadyForKickOff(){
		return this.teamA.isInKickOffPosition()&&this.teamB.isInKickOffPosition();

	}
	isReadyForGoalKick(){
		return this.teamA.isReadyForGoalKick()&&this.teamB.isReadyForGoalKick();

	}
	updateTeamMorale(){
		//var teamMoraleDepletion=map(this.gameTime,0,90,0,0.2/this.gameTime);
		var constantMoraleDepletion=0.2/900;

		if (!this.teamA.getTeamMorale()<constantMoraleDepletion) {
			this.teamA.incrementTeamMorale(-constantMoraleDepletion);
		};
		
	}

	pause(){
		this.setState("PAUSED")
		this.setTeamStates("neutral","neutral");
		this.ball.storeVelocity();
		this.ball.stop();

	}
	isPaused(){
		this.state=="PAUSED";
	}

	play(){
		this.ball.moveWithStoredVelocity();
		this.setTeamsToPlay();


	}

	updateDelay(){

		this.delay=millis();

	}
	updateCumulativeDelay(){
		if (!this.delayUpdated) {
			var interval=this.getCurrentDelayInterval();
			this.cumulativeTimeDelay+=interval;
			this.delayUpdated=true;
		};
		
		

	}
	handleHalfTimeTransition(){
		this.cumulativeTimeDelay-=0;
	}

	updateLastTimeBeforeGameEvent(){
		if (!this.gameEvent()) {
			this.lastTimeBeforeGameEvent=this.gameTime;

		};
	}

	getMostRecentEventTimeStop(){
		if (this.gameEvent()) {
			this.mostRecentEventTimeStop=millis();

		};

	}

	getMostRecentEventTimeStart(){
		if (!this.gameEvent()) {
			this.mostRecentEventTimeStart=millis();
		};

	}

	getCurrentDelayInterval(){
		var start=this.mostRecentEventTimeStart;
		var stop=this.mostRecentEventTimeStop;
		return stop-start;
	}

	getTeamARatings(){
		if (this.gameTime<=88) {
			this.yval=this.teamA.posRatings;
			this.xval=this.teamA.posFrequencies;
		};
	}

	sortTeamRatings(){


	}

	updateSpeedFactor(speedFactor){
		for (var i = this.allPlayers.length - 1; i >= 0; i--) {
			this.allPlayers[i].updateSpeedFactor(speedFactor);
		};
		this.ball.updateSpeedFactor(speedFactor);
	}

	addRemotePlayer(playerID){
		if (playerID[0]=="A") {
			this.teamA.addRemotePlayer(playerID.split(" ")[1]);
			//console.log(this.teamA.remotePlayers.length);
			//console.log(this.teamA.remotePlayers);
		}
		else if (playerID[0]=="B") {
			this.teamB.addRemotePlayer(playerID.split(" ")[1]);
			//console.log(this.teamB.remotePlayers);

		}

	}

	processRemoteInput(playerID, instruction){
		//console.log("At Game level ", playerID, "instructed to ", instruction);
			if (playerID[0]=="A") {
			this.teamA.processRemoteInput(playerID.split(" ")[1],instruction);
			//console.log(this.teamA.remotePlayers.length);
			//console.log(this.teamA.remotePlayers);
		}
		else if (playerID[0]=="B") {
			this.teamB.processRemoteInput(playerID.split(" ")[1],instruction);
			//console.log(this.teamB.remotePlayers);

		}



	}

}

