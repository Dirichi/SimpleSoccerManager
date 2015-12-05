("#startGame").click(){
	function(){
		var key=generateUniqueKey();
		var game={
			id: key,
			startTime: key,
			status: "playing",
			time: 0

		}
	}


}

// function setup(){
//   var inp = createInput('');
//   inp.input(myInputEvent);
// }

// function myInputEvent(){
//   console.log('you are typing: ', this.value());
// }


function generateUniqueKey(){
	var d= new Date();
	var time=d.getTime();
	return time;

}