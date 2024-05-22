<?php

include_once("boardData.php");

/* GAME DATA */

$query = $conn->prepare("SELECT mode, width, player1, player2, player1score, player2score, activePlayer FROM game WHERE game.id = ?");
$query->bind_param("i", $gameID);
$query->execute();
$result = $query->get_result();

$gameOutput = mysqli_fetch_assoc($result);



$query = $conn->prepare("SELECT name FROM user WHERE user.id = ?");
$query->bind_param("i", $gameOutput["player1"]);
$query->execute();
$result = $query->get_result();
$gameOutput["player1name"] = mysqli_fetch_assoc($result)["name"];
$query = $conn->prepare("SELECT name FROM user WHERE user.id = ?");
$query->bind_param("i", $gameOutput["player2"]);
$query->execute();
$result = $query->get_result();
$gameOutput["player2name"] = mysqli_fetch_assoc($result)["name"];




/* TILE DATA */

$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND (location = 'board' OR location = ?)");
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
// score output set in submitPlay.php

echo json_encode($output);