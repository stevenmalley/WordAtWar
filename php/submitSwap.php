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
$tiles = $post['tiles']; // [ tileID, ... ]

// $playerID = $_POST['playerID'];
// $gameID = $_POST['gameID'];
// $tiles = $_POST['tiles']; // [ tileID, ... ]



$gameData = mysqli_fetch_assoc($conn->query("SELECT player1, player2, activePlayer, player1passed, player2passed, complete FROM game WHERE id = $gameID"));
$activePlayer = $gameData["activePlayer"];
$activePlayerID = $gameData["player$activePlayer"];

$bagTiles = [];
$playerTiles = [];
$swappedTiles = [];
$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND (location = 'bag' OR location = ?)");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$tileQuery = $query->get_result();
while ($row = mysqli_fetch_assoc($tileQuery)) {
  if ($row['location'] == 'bag') {
    // a tile in the bag
    $bagTiles[] = $row;
  } else {
    // a player tile
    $playerTiles[] = $row;
    if (in_array($row['id'],$tiles)) {
    // one of the tiles submitted for swapping
      $swappedTiles[] = $row;
    }
  }
}



/* LEGALITY CHECKS */



// TODO
// check currentPlayer login credentials



// check current player (the user making the request) is the active player (the player whose turn it is)
if ($activePlayerID != $playerID) fail("It is not your turn");

// check game is not already complete
if ($gameData['complete']) fail("Game has finished");

// at least one tile has been submitted
if (sizeof($tiles) == 0) fail("No tiles submitted");

// the bag contains at least one tile
if (sizeof($bagTiles) == 0) {
  fail("Swapping is not allowed when there are no tiles remaining");
}

foreach($tiles as $tile) {
  // check all tile ids are integers
  if (gettype($tile) != "integer") {
    fail("Invalid tile submitted");
  }
}

// check player owns submitted tiles
foreach($tiles as $tile) {
  $tileFound = false;
  foreach($playerTiles as $playerTile) {
    if ($playerTile['id'] == $tile) {
      $tileFound = true;
    }
  }
  if (!$tileFound) {
    fail("You do not own that tile");
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




/* MODIFY DATABASE */

// return swapped tiles to the bag and reshuffle bag
$bagIDs = $tiles;
foreach($bagTiles as $tile) {
  $bagIDs[] = $tile['id'];
}
$bagPositions = [];
for ($i = 0; $i < sizeof($bagIDs); $i++) {
  array_splice($bagPositions, rand(0,$i), 0, $i);
}
$queryString = "UPDATE tile SET location = 'bag', position = CASE id";
for ($i = 0; $i < sizeof($bagIDs); $i++) {
  $queryString .= " WHEN '$bagIDs[$i]' THEN '$bagPositions[$i]'";
}
$queryString .= " ELSE position END WHERE gameID = $gameID AND id IN (".implode(",",$bagIDs).")";
$result = $conn->query($queryString);

// give new tiles to player
$newTiles = sizeof($tiles);
while ($newTiles-- > 0) {
  $conn->query("UPDATE tile SET location = '$playerID', position = null
    WHERE gameID = $gameID AND location = 'bag' AND
      position = ( SELECT MIN(position) FROM tile WHERE gameID = $gameID AND location = 'bag' )");
}

// $newPosition = 0;
// while ($newPosition < 7) {
//   if ($newPosition < 7-sizeof($tiles)) {
//     // adjust a player's tile to the left
//     $conn->query("UPDATE tile SET position = $newPosition WHERE gameID = $gameID AND location = '$playerID' AND position = ( SELECT MIN(position) FROM tile WHERE gameID = $gameID AND location = '$playerID' AND position >= $newPosition )");
//   } else {
//     // move a tile from the bag to the player, if one exists in the bag
//     $conn->query("UPDATE tile SET location = '$playerID', position = $newPosition WHERE gameID = $gameID AND location = 'bag' AND position = ( SELECT MIN(position) FROM tile WHERE gameID = $gameID AND location = 'bag' )");
//   }
//   $newPosition++;
// }



// get updated tile data
$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND location = ?");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$result = $query->get_result();

$tileOutput = [];
while ($row = mysqli_fetch_assoc($result)) {
  array_push($tileOutput, $row);
}



/* CHANGE ACTIVE PLAYER */

$nextPlayer = $activePlayer == 1 ? 2 : 1;

$conn->query("UPDATE game SET activePlayer = $nextPlayer WHERE id = $gameID");



$output['tilesRemoved'] = $tiles;
$output['newPlayerTiles'] = $tileOutput;
$output['activePlayer'] = $nextPlayer;

echo json_encode($output);