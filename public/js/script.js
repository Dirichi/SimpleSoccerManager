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
		console.log(game)
		createGame(game);
	});





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



function generateUniqueKey(){
	var d= new Date();
	var time=d.getTime();
	return time;

}

$(document).ready(function(){
	loadExistingGames();
})