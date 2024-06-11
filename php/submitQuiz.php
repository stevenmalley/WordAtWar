<?php

include("config.php");

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");
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


$post = json_decode(file_get_contents('php://input'), true);

$playerID = $post['playerID'];
$gameID = $post['gameID'];
$answers = $post['answers']; // [ [word => <string>, definitionIndex => <int> ], ... ]

// $playerID = $_POST['playerID'];
// $gameID = $_POST['gameID'];
// $tiles = $_POST['tiles']; // [ tileID, ... ]



$gameData = mysqli_fetch_assoc($conn->query("SELECT player1, player2, activePlayer, quizzes, complete FROM game WHERE id = $gameID"));
$activePlayer = $gameData["activePlayer"]; // 1 or 2 (or 0 if game is over)
$activePlayerID = $gameData["player$activePlayer"];


/* LEGALITY CHECKS */



// TODO
// check currentPlayer login credentials



// check current player (the user making the request) is the active player (the player whose turn it is)
if ($activePlayerID != $playerID) fail("It is not your turn");

// check game is not already complete
if ($gameData['complete']) fail("Game has finished");

// at least one tile has been submitted
if (sizeof($answers) == 0) fail("No answers submitted");

// the bag contains at least one tile
if (strlen($gameData['quizzes']) == 0) {
  fail("There is no current quiz");
}

foreach($answers as $answer) {
  // check all answers have a 'word' and 'definitionIndex' property, and the 'definitionIndex' is an integer [0..4]
  if (!isset($answer['word']) || !isset($answer['definitionIndex'])) {
    fail("Invalid quiz answers submitted");
  }
  if (gettype($answer['definitionIndex']) != 'integer' || $answer['definitionIndex'] < 0 || $answer['definitionIndex'] > 4) {
    fail("Invalid answer choice selected");
  }
}


$quizzes = json_decode($gameData['quizzes'],true);


// check answer words correspond to the quiz words
foreach($answers as $answer) {
  $wordFound = false;
  foreach($quizzes as $quiz) {
    if ($answer['word'] == $quiz['word']) {
      $wordFound = true;
    }
  }
  if (!$wordFound) {
    fail("Answer submitted for wrong word");
  }
}
foreach($quizzes as $quiz) {
  $wordFound = false;
  foreach($answers as $answer) {
    if ($answer['word'] == $quiz['word']) {
      $wordFound = true;
    }
  }
  if (!$wordFound) {
    fail("Required answer to quiz missing");
  }
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



/* CALCULATE QUIZ RESULT */
$quizResults = [];

foreach($quizzes as $quiz) {
  $submittedIndex;
  foreach($answers as $answer) {
    if ($answer['word'] == $quiz['word']) $submittedIndex = $answer['definitionIndex'];
  }

  // $correctIndex;
  // $hashes = [];
  // for($i = 0; $i < sizeof($quiz['quiz']); $i++) {
  //   $defHash = hash("sha256",$quiz['quiz'][$i].$hashSalt.$gameID);
  //   $hashes[] = $defHash;
  //   if ($defHash == $quiz['hash']) $correctIndex = $i;
  // }

  $correctIndex;
  for ($i = 0; $i < sizeof($quiz['quiz']); $i++) {
    if ($quiz['quiz'][$i]['word'] == $quiz['word']) {
      $correctIndex = $i;
    }
  }

  $quizResults[] = [
    'word' => $quiz['word'],
    'result' => $submittedIndex == $correctIndex,
    'correctAnswer' => $quiz['quiz'][$correctIndex]['definition'],
    'correctIndex' => $correctIndex,
    'submittedIndex' => $submittedIndex,
    'score' => $quiz['score'],
  ];
}

$output['quizResults'] = ['quizzes'=>$quizzes,'results'=>$quizResults];





/* MODIFY DATABASE */

$conn->query("UPDATE game SET quizzes = '' WHERE id = $gameID");

/* only award word points with a correct definition */
$totalScore = 0;
foreach($quizResults as $result) {
  if ($result['result']) $totalScore += $result['score'];
}
if ($totalScore > 0) {
  $conn->query("UPDATE game SET player{$activePlayer}score = player{$activePlayer}score + $totalScore WHERE id = $gameID");
}

/* 5 point penalty for each mistake */
// $penalty = 0;
// foreach($quizResults as $result) {
//   if (!$result['result']) $penalty += 5;
// }
// if ($penalty > 0) {
//   $conn->query("UPDATE game SET player{$activePlayer}score = player{$activePlayer}score - $penalty WHERE id = $gameID");
// }










include("nextPlayer.php");





include('getGameDataProcess.php');