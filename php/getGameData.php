<?php

include("config.php");
include("boardData.php");

header('Access-Control-Allow-Origin: *');
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


// $playerID = $_POST['playerID'];
// $gameID = $_POST['gameID'];
$playerID = $_GET['playerID'];
$gameID = $_GET['gameID'];



/* GAME DATA */

$query = $conn->prepare("SELECT mode, width, player1, player2, player1score, player2score FROM game WHERE game.id = ?");
$query->bind_param("i", $gameID);
$query->execute();
$result = $query->get_result();

$gameOutput = mysqli_fetch_assoc($result);



/* TILE DATA */

$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND location = 'board' OR location = ?");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$result = $query->get_result();

$tileOutput = [];
while ($row = mysqli_fetch_assoc($result)) {
  array_push($tileOutput, $row);
}

// tile count
$query = $conn->prepare("SELECT COUNT(id) FROM tile WHERE gameID = ? AND location = 'bag'");
$query->bind_param("i", $gameID);
$query->execute();
$result = $query->get_result();

$gameOutput["bag"] = mysqli_fetch_assoc($result)["COUNT(id)"];






/* BONUS DATA */

$bonusOutput;

switch ($gameOutput["mode"]) {
  case "scrabble" : $bonusOutput = $scrabbleBonus; break;
  case "feud" : $bonusOutput = $wordFeudBonus; break;
  case "friends" : break; // TODO words with friends bonuses
  case "custom" : break; // TODO fetch bonuses from database
}



/* OUTPUT */



$output['game'] = $gameOutput;
$output['tiles'] = $tileOutput;
$output['bonuses'] = $bonusOutput;

echo json_encode($output);