"use strict";
class Team{
	constructor(formation,field,name,side,colors,post,humanPlayerIndex,game){
		this.field=field;
		this.ball=this.field.ball;
		this.nm=name;
		this.side=side;
		this.players=[];
		this.colors=colors;
		this.subs=["K","CB","LB","RM","CM","LF","CF"];
		this.score=0;
		this.focusPlayer;
		this.post=post;
		this.mindset="";
		this.hasHumanController=false;
		this.game=game;

		this.callers=[];
		this.remotePlayers=[];

		this.opposition;
		this.posRatings=[];
		this.posFrequencies=[];

		this.mode;
		this.state="";
		this.mentality;
		this.objectives=[];
		this.formation=formation;
		for(var i=0; i<11; i++){
			//var newPlayer=new Player(field.xPos,field.yPos,field._length/50,field._width50, field,formation.getRoles()[i],side);
			var newPlayer=new Player(field.xPos,field.yPos,field._length/50,field._width/50, field,formation.getRoles()[i],side,this);
			this.players.push(newPlayer);
			//this.players[i]=newPlayer;

		}
		for (var i = this.players.length - 1; i >= 0; i--) {
			for (var j = this.players.length - 1; j >= 0; j--) {
				if(this.players[i]!=this.players[j]){
					this.players[i].teammates.push(this.players[j]);
				}

			};
		};

		

		// for (var i = this.subs.length - 1; i >= 0; i--) {
		// 	this.subs[i]=new Player(field.xPos,field.yPos,field._width/50,field._width/50, field,this.subs[i],side,this);
		// }

		this.outfieldplayers=this.getOutFieldPlayers();
		if (humanPlayerIndex!="none") {
			this.humanControlledPlayer=this.players[humanPlayerIndex];
			console.log("Team ",this.nm, " has human at ",this.humanControlledPlayer.position);
			this.hasHumanController=true;
		}
		else{
			this.humanControlledPlayer=0;
		}
		
		}
	animate(instructions,remoteInstructions){
		
		for (var i = this.players.length - 1; i >= 0; i--) {
			//thisgetAllPositionRatings();
			this.players[i].animate(this.colors);
		};
		this.executeObjective(instructions, remoteInstructions);
		

	}

	dumbAnimate(instructions,animationObjs,state,init){
		this.setState(state);
		 for (var i = this.players.length - 1; i >= 0; i--) {
		 	//if (this.humanControlledPlayer!=this.players[i]) {
		 		//console.log(animationObjs);
		 		//console.log(this.players[i]);
		 		this.players[i].dumbAnimate(animationObjs[this.players.length-i-1],init);
		 };
		 this.executeObjective(instructions);
		 


	}
	press(){
		var nearestPlayer=this.nearestPlayerToBall();
		nearestPlayer.chaseBall();
		//nearestPlayer.mark(this.players[10]);
		//nearestPlayer.dx+=1;

	}
	defend(){
		this.mindset="defending";
		if (this.inPossession()) {
				this.attack();
		}
		else{
			this.clearTeamMessages();
			this.setAllPlayerStates("n/a");
			this.nearestOutFieldPlayerToBall().chaseBall();
			for (var i = this.players.length - 1; i >= 0; i--) {

				if (this.nearestOutFieldPlayerToBall()!=this.players[i]) {
					this.players[i].moveToDefensivePosition();
				}

				}
				
			};
			
		}
	
	attack(){
		this.mindset="attacking";
		if (this.oppositionInPossesion()&&!this.inPossession()) {
				this.defend();
		}

		else if (this.focusPlayer()!=1&&this.focusPlayer()!=this.humanControlledPlayer&&!this.focusPlayer().isRemoteControlled()) {
		
			this.focusPlayer().choiceInPossession();
			for (var i = this.players.length - 1; i >= 0; i--) {
				if(this.players[i]!=this.focusPlayer()&&this.players[i]!=this.humanControlledPlayer&&!this.players[i].isRemoteControlled()){
					this.players[i].moveToAttackingPosition();
				}
			};
			if (this.focusPlayer()!=1&&this.focusPlayer().state=="passing"||this.focusPlayer().state=="shooting") {
				this.focusPlayer().moveToAttackingPosition();
			};

			
		}

		}

	receiveHumanInstructions(instructions){
		if (this.hasHumanController) {
			this.humanControlledPlayer.humanControl(instructions);
		};
		

	}

	processRemoteInput(instructionObj){
		//console.log(instructionObj);
		if (instructionObj.length>0) {
			//console.log("at team level we have instructions");
			//console.log(remoteInstructions);
			for (var i = instructionObj.length - 1; i >= 0; i--) {
				//console.log(instructionObj[i].ID.split(" ")[1]);
			var ID=instructionObj[i].ID.split(" ")[1];
			var instructions=instructionObj[i].instruction;

			//console.log("At Team level ",ID, "instructed to ", instructions);
			if (this.players[ID].isRemoteControlled()) {
				//console.log(ID, "is remote controlled");
				this.players[ID].humanControl(instructions);

			};
		
		};

		};
		
		

	}
		
	nearestPlayerToBall(){
		var nearestPlayer=this.players[0];
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i].distanceToBall()<nearestPlayer.distanceToBall()){
				nearestPlayer=this.players[i];

			}
			
		};
		
		return nearestPlayer;
	}

	nearestPlayerToGoal(){
		var nearestPlayer=this.players[0];
		for (var i = this.players.length - 1; i >= 0; i--) {
			if (this.players[i].distanceToGoal()<nearestPlayer.distanceToGoal()){
				nearestPlayer=this.players[i];


			}

		};
		return nearestPlayer;
	}

	nearestOutFieldPlayerToBall(){
		var outfieldplayers=this.getOutFieldPlayers();
		var nearestOutFieldPlayerToBall=outfieldplayers[0];
		for (var i = outfieldplayers.length - 1; i >= 0; i--) {
			if(outfieldplayers[i].distanceToBall()<nearestOutFieldPlayerToBall.distanceToBall()){
				nearestOutFieldPlayerToBall=outfieldplayers[i];
			}
		};
		return nearestOutFieldPlayerToBall;
	}

	executeObjective(instructions, remoteInstructions){

		if (this.game.isHost) {
			if (this.state=="play") {

			if(this.objectives.indexOf("attack")!==-1){
				this.attack();
				this.receiveHumanInstructions(instructions);
				this.processRemoteInput(remoteInstructions);

			}

			else if(this.objectives.indexOf("defend")!==-1){
				this.defend();
				this.receiveHumanInstructions(instructions);
				this.processRemoteInput(remoteInstructions);

			}

		}
		if (this.state=="kickoff") {
			this.setAllPlayerStates("n/a");
			this.moveToKickOffPosition();

		}
		if (this.state=="owngoalkick") {
			this.setAllPlayerStates("n/a");
			this.moveToKickOffPosition();
			//this.doGoalKick();
		}
		if (this.state=="owncorner") {
			this.setAllPlayerStates("n/a");
			this.moveToKickOffPosition();
		}
		if (this.state=="oppgoalkick") {
			this.setAllPlayerStates("n/a");
			this.moveToAttackingRegions();
		}
		if (this.state=="oppcorner") {
			this.setAllPlayerStates("n/a");
			
		}
		if (this.state=="ownthrowing") {
			//this.moveToKickOffPosition();
			this.setAllPlayerStates("n/a");
			this.doThrowing()
		};
		if (this.state=="oppthrowing") {
			//this.moveToKickOffPosition();
			this.setAllPlayerStates("n/a");
			this.stop();
		};

		if (this.state=="neutral") {
			//this.setAllPlayerStates("n/a");
			this.stop();
		};


		}
		else{
			if (this.state=="play") {
				this.receiveHumanInstructions(instructions);
			};
		}

	}
	changeFormation(newFormation){
		//needs to be changed
		this.formation=newFormation;
		for(var i=0; i<11; i++){
			var newPlayer=new Player(field.xPos,field.yPos,field._width/50,field._length/50,field,newFormation.getRoles()[i],side,this);
			this.players.push(newPlayer);
		}

	}

	hasBall(){
		var bool=false;
		for (var i = this.players.length - 1; i >= 0; i--) {
			bool=bool||this.players[i].hasBall();

		};
		return bool;
	}


	focusPlayer(){
		for (var i = this.players.length - 1; i >= 0; i--) {
			if (this.players[i].hasBall()) {
				return this.players[i];
			};
			
		};
		return 1;
	}

	oppositionhasBall(){
		return this.opposition.hasBall();
	}

	oppositionInPossesion(){
		return this.opposition.inPossession();

	}

	inPossession(){
		return (this.hasBall()||(!this.oppositionhasBall()&&this.field.lastPlayerInPossession.side==this.side));
	}

	ballIsInTeamThird(){
		
			return this.opposition.inPossession()&&this.ball.distanceTo(this.post.xPos,this.post.yPos)<this.field._width/3;
				
	}
	spread(){
		for (var i = this.players.length - 1; i >= 0; i--) {
			this.players[i].spread();
		};
	}

	setState(newstate){
		this.state=newstate;

	}

	stop(){
		for (var i = this.players.length - 1; i >= 0; i--) {
			this.players[i].stop();
		};
	}

   moveToKickOffPosition(){
   	
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		this.players[i].moveToKickOffPosition();
   	};
   }

   moveToAttackingRegions(){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		this.players[i].moveToDefaultPosition();
   	};
   }

   isInKickOffPosition(){
   	var bool=true;
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		bool=bool&&this.players[i].isInKickOffPosition();
   		
   			
   	};

   	return bool;

   }
   doThrowing(){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		if(this.players[i]!=this.nearestPlayerToBall()){
   			this.stop();

   		}
   	}
  
   	this.nearestPlayerToBall().chaseBall();
   	if (this.nearestPlayerToBall().distanceToBall()<2*this.nearestPlayerToBall()._length) {
   		this.ball.xPos=this.nearestPlayerToBall().xPos;
   		this.ball.yPos=this.nearestPlayerToBall().yPos;
   	};
   	if (this.focusPlayer()!=1) {
   		//console.log("THROW");
   		this.focusPlayer().passToBestOption();
   	};   	
   	
   		
   }
   isReadyForThrowing(){
   	return (this.state=="ownthrowing"&&this.hasBall())||(this.state=="oppthrowing" && this.isInDefaultPosition());
   		  	
   }
   isReadyForGoalKick(){
   	return this.isInDefaultPosition()||this.hasBall()||this.isInKickOffPosition();
   }

   changeTeamMorale(newMorale){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		this.players[i].morale=newMorale;
   	};
   }

   incrementTeamMorale(increment){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		this.players[i].incrementMorale(increment);
   	};

   }

   getTeamMorale(){
   	var teamMorale=0;
   	for (var i = this.players.length - 1; i >= 0; i--) {

   		teamMorale+=this.players[i].morale;
   	}	
   	return teamMorale/this.players.length;
   }

   isInDefaultPosition(){
   	var bool=true
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		bool=bool&&this.players[i].isInDefaultPosition();
   	};
   	return bool;
   }

   getOutFieldPlayers(){
   	var outfieldplayers=[];
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		if(this.players[i].position!="K"){
   			outfieldplayers.push(this.players[i]);

   		}
   	};
   	return outfieldplayers;
   }

   setAllPlayerStates(val){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		if (this.players[i].isWaiting()) {
   			this.players[i].state=val;
   		};	
   	}
   }

   getBestPositionRating(){
   	var best=this.players[0];
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		if(this.players[i].getAttackingPositionRating()>best.getAttackingPositionRating()){
   			best=this.players[i];
   		}
   	};
   	return Math.floor(best.getAttackingPositionRating());

   }

   getWorstPositionRating(){
   	var worst=this.players[0];
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		if(this.players[i].getAttackingPositionRating()<best.getAttackingPositionRating()){
   			worst=this.players[i];
   		}
   	};
   	return Math.floor(best.getAttackingPositionRating());

   }

   getAllPositionRatings(){
   	for (var i = this.players.length - 1; i >= 0; i--) {
   		var rating=this.players[i].getAttackingPositionRating();
   		rating=Math.floor(rating);
   		rating=10*Math.floor(rating/10)
   		if (numOccurencesInArray(rating,this.posRatings)==0) {
   			this.posRatings.push(rating);
   			this.posFrequencies.push(1);
   		}
   		else{
   			var index=getIndex(rating, this.posRatings);
   			this.posFrequencies[index]++;

   		}
   	};


   }

   clearTeamMessages(){
   	//list of players who call for the ball is emptied
   this.callers=[];
   }

   addRemotePlayer(playerIndex){
   	var remote=this.players[playerIndex];
   	this.remotePlayers.push(remote);


   }

 
}

function numOccurencesInArray(val, array){

	if (array.length==0) {
		return 0;
	};
	var count=0;
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i]==val){
			count++;
		}
	};
	return count;

}

function getIndex(val,array){
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i]==val){
			return i;
		}
	};
	return -1;

}