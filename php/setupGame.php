<?php

$post = json_decode(file_get_contents('php://input'), true);

$playerIDs = $post['playerIDs'];
$mode = $post['mode'];


include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);


if (mysqli_connect_errno()) {
  
  $output['status']['code'] = "500";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "database unavailable";
  $output['data'] = [];

  mysqli_close($conn);

  echo json_encode($output);

  exit;

}

function fail($failureMessage) {
  global $conn;
  
  $output['status']['code'] = "401";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "bad request";
  $output['status']['message'] = $failureMessage;

  mysqli_close($conn);

  echo json_encode($output);

  exit;

}



/** CHECK INPUTS */

include('tileDistributions.php');

$tileDistribution;
switch ($mode) {
  case "scrabble" : $tileDistribution = $scrabbleTiles; break;
  case "feud" : $tileDistribution = $wordFeudTiles; break;
  case "friends" : $tileDistribution = $wordsWithFriendsTiles; break;
  case "custom" : break; // TODO create random bonus pattern, decide how to choose tile distribution
  default :
    fail("game mode '$mode' not recognised");
}


if (sizeof($playerIDs) != 2) fail("2 players required to start a new game");

$players = [];

$query = $conn->prepare('SELECT id FROM users WHERE id = ? OR id = ?');
$query->bind_param("ii", $playerIDs[0], $playerIDs[1]);
$query->execute();
$userQuery = $query->get_result();
while ($row = mysqli_fetch_assoc($userQuery)) {
  $players[] = $row;
}

if (sizeof($players) != 2) fail("Player ID not recognised");







$r = rand(0,1);
$player1ID = $r? $playerIDs[0] : $playerIDs[1];
$player2ID = $r? $playerIDs[1] : $playerIDs[0];


$tiles = [];

foreach ($tileDistribution as $tileType) {
  for ($i = 0; $i < $tileType[1]; $i++) {
    array_push($tiles,[$tileType[0],$tileType[2]]);
  }
}

$shuffledTiles = [];

while (sizeof($tiles) > 0) {
  array_push($shuffledTiles,array_splice($tiles,rand(0,sizeof($tiles)-1),1)[0]);
}




$query = $conn->prepare('INSERT INTO game (mode, width, player1, player2) VALUES (?, 15, ?, ?)');
$query->bind_param("sii", $mode, $player1ID, $player2ID);
$query->execute();
$gameID = mysqli_insert_id($conn);


$tileQuery = "INSERT INTO tile (id, letter, score, location, position, gameID) VALUES ";
$tileQueryArray = [];

$t = 0;
foreach ($shuffledTiles as $tile) {
  $letter = $tile[0] ? "'$tile[0]'" : "null";
  $location = $t < 7 ? $player1ID :
              ($t < 14 ? $player2ID : "'bag'");
  $position = $t >= 14 ? $t : "null";
  $tileQueryArray[] = "($t,$letter,$tile[1],$location,$position,$gameID)";

  $t++;
}

$query = $conn->prepare($tileQuery.implode(',',$tileQueryArray));

$query->execute();






$output['gameID'] = $gameID;
$output['message'] = "New game created successfully";

echo json_encode($output);