"use strict";

class Ball extends Moveable{
	constructor(xPos,yPos,width,length,field){
		super(xPos,yPos,width,length,field);
		this.speed=this._width/2;
		// this.velocity=[];


	}
	animate(){
		push();
		fill(255);
		ellipse(this.xPos,this.yPos,this._width,this._length);
		this.updatePosition();
		pop();
	}

	dumbAnimate(animationObj,init){
		push();
		fill(255);
		if (init) {
			this.xPos=animationObj.xPos;
			this.yPos=animationObj.yPos;
		}
		else{
			//this.moveTo(animationObj.xPos,animationObj.yPos);
			this.xPos=animationObj.xPos;
			this.yPos=animationObj.yPos;
		}
		ellipse(this.xPos,this.yPos,this._width,this._length);		
		this.storeGivenVelocity(animationObj.dx,animationObj.dy);
		this.moveWithStoredVelocity();
		pop();


	}

	


	

}