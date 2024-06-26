<?php

include_once("boardData.php");

/* GAME DATA */

$query = $conn->prepare("SELECT game.id, game.creation_time, game.modification_time, game.mode, game.width, game.player1, game.player2, game.player1score, game.player2score, game.activePlayer, game.player1passed, game.player2passed, game.complete, t2.player1name, t2.player2name FROM
  (SELECT t1.player1name, users.name as player2name FROM
    (SELECT game.id, game.player2, users.name as player1name FROM game JOIN users ON game.player1 = users.id WHERE game.id = ?) as t1
    JOIN users on t1.player2 = users.id WHERE t1.id = ?) AS t2
  JOIN game WHERE game.id = ?");
$query->bind_param("iii", $gameID, $gameID, $gameID);
$query->execute();
$result = $query->get_result();

$gameOutput = mysqli_fetch_assoc($result);

if (!$gameOutput) {
  echo json_encode(["game"=>null, "message"=>"game $gameID not found"]);
  exit;
}






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