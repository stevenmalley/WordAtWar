<?php

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


$post = json_decode(file_get_contents('php://input'), true);

$playerID = $post['playerID'];
$gameID = $post['gameID'];

// $playerID = $_POST['playerID'];
// $gameID = $_POST['gameID'];



$gameData = mysqli_fetch_assoc($conn->query("SELECT player1, player2, activePlayer, player1passed, player2passed, complete FROM game WHERE id = $gameID"));
$activePlayer = $gameData["activePlayer"];
$activePlayerID = $gameData["player$activePlayer"];




/* LEGALITY CHECKS */



// TODO
// check currentPlayer login credentials



// check game is not already complete
if ($gameData['complete']) fail("Game has finished");

// check current player (the user making the request) is the active player (the player whose turn it is)
if ($activePlayerID != $playerID) fail("It is not your turn");



if ($gameData["player1passed"] && $gameData["player2passed"]) $conn->query("UPDATE game SET complete = TRUE WHERE id = $gameID");

$conn->query("UPDATE game SET player{$activePlayer}passed = TRUE WHERE id = $gameID");



include('nextPlayer.php');




include('getGameDataProcess.php');