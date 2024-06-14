<?php

include_once("boardData.php");

/* GAME DATA */

$query = $conn->prepare("SELECT id, mode, width, player1, player2, player1score, player2score, activePlayer, player1passed, player2passed, complete FROM game WHERE game.id = ?");
$query->bind_param("i", $gameID);
$query->execute();
$result = $query->get_result();

$gameOutput = mysqli_fetch_assoc($result);

if (!$gameOutput) {
  echo json_encode(["game"=>null, "message"=>"game $gameID not found"]);
  exit;
}



$query = $conn->prepare("SELECT name FROM users WHERE users.id = ?");
$query->bind_param("i", $gameOutput["player1"]);
$query->execute();
$result = $query->get_result();
$gameOutput["player1name"] = mysqli_fetch_assoc($result)["name"];
$query = $conn->prepare("SELECT name FROM users WHERE users.id = ?");
$query->bind_param("i", $gameOutput["player2"]);
$query->execute();
$result = $query->get_result();
$gameOutput["player2name"] = mysqli_fetch_assoc($result)["name"];




/* TILE DATA */

$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND (location = 'board' OR location = ?)");
$playerIDstring = (string) $playerID;
$query->bind_param("is", $gameID, $playerIDstring);
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




/* QUIZ DATA */

$quizOutput = null;
// only send quiz if the user making the request is the active player (player whose turn it is)
if ($gameOutput['activePlayer'] > 0 && $gameOutput['player'.$gameOutput['activePlayer']] == $playerID) {
  $query = $conn->prepare("SELECT quizzes FROM game WHERE id = ?");
  $query->bind_param("i", $gameID);
  $query->execute();
  $result = $query->get_result();
  $row = mysqli_fetch_assoc($result);

  $quizOutput = null;

  if ($row && $row["quizzes"]) {
    $quizData = json_decode($row["quizzes"],true);
    for($i = 0; $i < sizeof($quizData); $i++) {
      $quiz = $quizData[$i]["quiz"];
      for ($q = 0; $q < sizeof($quiz); $q++) {
        // hide the word associated with each definition
        $quizData[$i]["quiz"][$q]["word"] = "???";
      }
    }
    $quizOutput = $quizData;
  }
}




/* OUTPUT */

$output['game'] = $gameOutput;
$output['tiles'] = $tileOutput;
$output['bonuses'] = $bonusOutput;
$output['quizzes'] = $quizOutput;
// 'score' output for a submitted play set in submitPlay.php
// 'quizResults' output for a submitted quiz answer set it submitQuiz.php

echo json_encode($output);