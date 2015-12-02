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
  			console.log(data.teams)
  			var numTeams=data.teams.length;
  			for (var i = numTeams - 1; i >= 0; i--) {
  				makeTeamDivs(data.teams[i]);
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

function makeTeamDivs(teamObj){
	var teamDivHTML="";
	teamDivHTML+="<div class='teamDiv'>";
	teamDivHTML+="<a href=''>"
	teamDivHTML+="<div class='teamCrest'>";
	teamDivHTML+="<img src='"+teamObj.crestUrl+"' width=40%/>";
	teamDivHTML+="</div>";
	teamDivHTML+="</a>";
	teamDivHTML+="</div>";

	$("#activityAreaDiv").append(teamDivHTML);



}

$(document).ready(
	function(){	
	getTeams(398);

	
});

