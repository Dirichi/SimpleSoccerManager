var OBJ={
  val: "yeah"
}
var teamName;
var playerObjs=[];
var formation;
var teamNames=[];
var teamplayersURL="";

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
            playerObjs[i]=createPlayerObj(result[i]);
          };
        };
        console.log(playerObjs);
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

function createPlayerObj(playerObj){
  var player={
    name: playerObj.name,
    position: playerObj.position
  };

  return player;

}


$(document).ready(
	function(){	
	getTeams(398);

	
});



