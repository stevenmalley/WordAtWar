<?php

include("config.php");
include("checkWord.php");
include("boardData.php");

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
$tiles = $post['tiles']; // [ [tileID,position], ... ]
$blanks = $post['blanks']; // [ [tileID,letter], ... ]

// $playerID = $_POST['playerID'];
// $gameID = $_POST['gameID'];
// $tiles = $_POST['tiles']; // [ [tileID,position], ... ]



$gameData = mysqli_fetch_assoc($conn->query("SELECT mode, width, player1, player2, activePlayer, complete FROM game WHERE id = $gameID"));
$activePlayer = $gameData["activePlayer"];
$activePlayerID = $gameData["player$activePlayer"];

// collect position (including row and col) data for easier checking
$boardTiles = [];
$playerTiles = [];
$submittedTiles = [];
$query = $conn->prepare("SELECT id, letter, score, location, position FROM tile WHERE gameID = ? AND (location = 'board' OR location = ?)");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$tileQuery = $query->get_result();
while ($row = mysqli_fetch_assoc($tileQuery)) {
  if ($row['location'] == 'board') {
    // a tile already on the board
    $row['row'] = floor(($row['position']-1)/15);
    $row['col'] = ($row['position']-1)%15;
    array_push($boardTiles, $row);

  } else {
    // a player tile
    foreach($tiles as $tile) {
      // one of the submitted tiles
      if ($row['id'] == $tile[0]) {
        $row['position'] = $tile[1];
        $row['row'] = floor(($tile[1]-1)/15);
        $row['col'] = ($tile[1]-1)%15;
        $submittedTiles[] = $row;
      }
    }
    array_push($playerTiles, $row);
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
if (sizeof($tiles) == 0) {
  fail("No tiles submitted");
}

foreach($tiles as $tile) {

  // check all tile data are length 2 arrays
  if (sizeof($tile) != 2) {
    fail("Invalid tile data");
  }

  // check all tile ids and positions are integers 
  if (gettype($tile[0]) != "integer" || gettype($tile[1]) != "integer") {
    fail("Invalid tile positions");
  }

  // check positions exist on the board
  if ($tile[1] < 1 || $tile[1] > ($gameData['width']*$gameData['width'])) {
    fail("Not a valid board space");
  }

  // check positions are not already occupied
  foreach($boardTiles as $boardTile) {
    if ($boardTile['position'] == $tile[1]) {
      fail("That position is occupied");
    }
  }
}

// check player owns submitted tiles and collect tile data for submitted tiles
foreach($tiles as $tile) {
  $tileFound = false;
  foreach($playerTiles as $playerTile) {
    if ($playerTile['id'] == $tile[0]) {
      $tileFound = true;
    }
  }
  if (!$tileFound) {
    fail("You do not own that tile");
  }
}

// check all blank data are length 2 arrays
foreach($blanks as $blank) {
  if (sizeof($blank) != 2 || gettype($blank[0]) != "integer") {
    fail("Invalid blank tile data");
  }
}

// check that any blank tiles have corresponding chosen letters and that letters chosen for blank tiles are valid (and load 'blankLetter' data into $submittedTiles for easier checking of valid words)
foreach($submittedTiles as &$tile) { // PASS BY REFERENCE to add 'blankLetter' property to $submittedTiles
  if (is_null($tile['letter'])) {
    $chosenLetter = null;
    foreach($blanks as $blank) {
      if ($blank[0] == $tile['id'] && preg_match("/[A-Z]/",$blank[1])) {
        $chosenLetter = $blank[1];
        $tile['blankLetter'] = $chosenLetter;
      }
    }
    if (is_null($chosenLetter)) {
      fail("Invalid letter for blank tile");
    }
  }
}
unset($tile); // $tile must be unset after being used to pass by reference

// all tiles are in a single line
$horizontal = true;
$coordinate; $minCoord; $maxCoord;
$rowsUsed = [];
$colsUsed = [];
foreach($submittedTiles as $tile) {
  if (!in_array($tile['row'],$rowsUsed)) $rowsUsed[] = $tile['row'];
  if (!in_array($tile['col'],$colsUsed)) $colsUsed[] = $tile['col'];
}
if (sizeof($rowsUsed) > 1 && sizeof($colsUsed) > 1) {
  fail("Tiles must be placed in one line");
}
if (sizeof($rowsUsed) == 1) {
  // tiles have been placed horizontally
  $coordinate = $rowsUsed[0];
  $minCoord = min($colsUsed);
  $maxCoord = max($colsUsed);
} else {
  // tiles have been placed vertically
  $horizontal = false;
  $coordinate = $colsUsed[0];
  $minCoord = min($rowsUsed);
  $maxCoord = max($rowsUsed);
}

// tiles have no gaps not filled by previously-placed tiles
for ($c = $minCoord; $c <= $maxCoord; $c++) {
  $tileFound = false;
  foreach($submittedTiles as $tile) {
    if (($horizontal && $tile['col'] == $c) || (!$horizontal && $tile['row'] == $c)) {
      $tileFound = true;
      break;
    }
  }
  if (!$tileFound) {
    foreach($boardTiles as $tile) {
      $row = floor(($tile['position']-1)/15);
      $col = ($tile['position']-1)%15;
      if (($horizontal && $col == $c && $row == $coordinate) ||
          (!$horizontal && $row == $c && $col == $coordinate)) {
        $tileFound = true;
        break;
      }
    }
  }
  if (!$tileFound) {
    fail("Placed tiles may not leave a gap");
  }
}

// if it's the first move (no tiles on the board already), more than one tile must be placed, and one submitted tile must cover the centre
if (sizeof($boardTiles) == 0) {
  if (sizeof($submittedTiles) < 2) fail("Words must contain at least two letters");
  $centreCovered = false;
  foreach($submittedTiles as $tile) {
    if ($tile['row'] == floor($gameData['width']/2) && $tile['col'] == floor($gameData['width']/2)) $centreCovered = true;
  }
  if (!$centreCovered) fail("First word must be placed on the centre");

} else {
  // if it's not the first move, at least one submitted tile must touch a previous tile
  $neighbour = false;
  foreach($submittedTiles as $submittedTile) {
    foreach($boardTiles as $boardTile) {
      if (($boardTile['col'] == $submittedTile['col'] &&
            ($boardTile['row'] == $submittedTile['row']-1 || $boardTile['row'] == $submittedTile['row']+1)) ||
          ($boardTile['row'] == $submittedTile['row'] &&
            ($boardTile['col'] == $submittedTile['col']-1 || $boardTile['col'] == $submittedTile['col']+1))) {
        $neighbour = true;
        break;
      }
    }
  }
  if (!$neighbour) fail("Tiles must touch other tiles");
}



// all words must be valid
$submittedWords = [];

$dimension = $horizontal? 'col' : 'row'; // move along 'col' coordinate to find a horizontal word
$perpendicular = $horizontal? 'row' : 'col'; // move along 'row' coordinate to find words perpendicular to a horizontal word

function findTile($coord) {
  global $submittedTiles, $boardTiles;
  foreach(array_merge($submittedTiles,$boardTiles) as $tile) {
    if ($tile['row'] == $coord['row'] && $tile['col'] == $coord['col']) return $tile;
  }
  return false;
}

function searchTiles($pointedTile,$direction) {
  $pointer1 = ['row' => $pointedTile['row'], 'col' => $pointedTile['col']];
  $pointer2 = ['row' => $pointedTile['row'], 'col' => $pointedTile['col']];
  $word = $pointedTile['letter'] ?? $pointedTile['blankLetter'];
  $wordTiles = [$pointedTile];

  $pointer1[$direction]--;
  while ($pointedTile = findTile($pointer1)) {
    $word = ($pointedTile['letter'] ?? $pointedTile['blankLetter']).$word;
    $wordTiles[] = $pointedTile;
    $pointer1[$direction]--;
  }

  $pointer2[$direction]++;
  while ($pointedTile = findTile($pointer2)) {
    $word .= $pointedTile['letter'] ?? $pointedTile['blankLetter'];
    $wordTiles[] = $pointedTile;
    $pointer2[$direction]++;
  }

  if (strlen($word) > 1) return ['word' => $word, 'tiles' => $wordTiles];
  else return false;
}

// find the word on the primary axis
$dimensionSearch = searchTiles($submittedTiles[0],$dimension);
if ($dimensionSearch) $submittedWords[] = $dimensionSearch;

// find words on the perpendicular axis
foreach($submittedTiles as $tile) {
  $perpendicularSearch = searchTiles($tile,$perpendicular);
  if ($perpendicularSearch) $submittedWords[] = $perpendicularSearch;
}

$invalidWords = [];
foreach($submittedWords as $word) {
  if (!checkWord($word['word'])) $invalidWords[] = $word['word'];
}
if (sizeof($invalidWords) > 0) fail("Word(s) not in our dictionary: ".implode(", ",$invalidWords));



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

// set tiles to new locations and positions
$queryString = "UPDATE tile SET location = 'board', position = CASE id";
$idArray = [];
foreach($tiles as $tile) {
  $queryString .= " WHEN '$tile[0]' THEN '$tile[1]'";
  $idArray[] = $tile[0];
}
$queryString .= " ELSE position END WHERE gameID = $gameID AND id IN (".implode(",",$idArray).")";
$result = $conn->query($queryString);

// set blanks as their chosen letters
foreach($blanks as $blank) {
  $conn->query("UPDATE tile SET letter = '{$blank[1]}' WHERE gameID = $gameID AND id = {$blank[0]}");
}

// give new tiles to player
$newPosition = 0;
while ($newPosition < 7) {
  if ($newPosition < 7-sizeof($tiles)) {
    // adjust a player's tile to the left
    $conn->query("UPDATE tile SET position = $newPosition WHERE gameID = $gameID AND location = '$playerID' AND position = ( SELECT MIN(position) FROM tile WHERE gameID = $gameID AND location = '$playerID' AND position >= $newPosition )");
  } else {
    // move a tile from the bag to the player, if one exists in the bag
    $conn->query("UPDATE tile SET location = '$playerID', position = $newPosition WHERE gameID = $gameID AND location = 'bag' AND position = ( SELECT MIN(position) FROM tile WHERE gameID = $gameID AND location = 'bag' )");
  }
  $newPosition++;
}




/* CALCULATE SCORE AND SWITCH ACTIVE PLAYER OR END GAME */

$bonuses;

switch ($gameData["mode"]) {
  case "scrabble" : $bonuses = $scrabbleBonus; break;
  case "feud" : $bonuses = $wordFeudBonus; break;
  case "friends" : break; // TODO words with friends bonuses
  case "custom" : break; // TODO fetch bonuses from database
}

$totalScore = 0;
$scoreOutput = [
  'total' => 0,
  'items' => []
];

foreach($submittedWords as $word) {
  $wordMultiplier = 1;
  $wordScore = 0;
  foreach($word['tiles'] as $tile) {
    $letterMultiplier = 1;
    if ($tile['location'] != "board") {
      foreach($bonuses['doubleLetter'] as $bonus) {
        if ($tile['row'] == $bonus[0] && $tile['col'] == $bonus[1]) $letterMultiplier = 2;
      }
      foreach($bonuses['tripleLetter'] as $bonus) {
        if ($tile['row'] == $bonus[0] && $tile['col'] == $bonus[1]) $letterMultiplier = 3;
      }
      foreach($bonuses['doubleWord'] as $bonus) {
        if ($tile['row'] == $bonus[0] && $tile['col'] == $bonus[1]) $wordMultiplier *= 2;
      }
      foreach($bonuses['tripleWord'] as $bonus) {
        if ($tile['row'] == $bonus[0] && $tile['col'] == $bonus[1]) $wordMultiplier *= 3;
      }
    }
    $wordScore += $tile['score']*$letterMultiplier;
  }
  $wordScore *= $wordMultiplier;
  $scoreOutput['items'][] = [$word['word'],$wordScore];
  $scoreOutput['total'] += $wordScore;
}

if (sizeof($submittedTiles) == 7) {
  $scoreOutput['total'] += 40;
  $scoreOutput['items'][] = ["That's a bingo!",40];
}

$output['score'] = $scoreOutput;

$conn->query("UPDATE game SET player{$activePlayer}score = player{$activePlayer}score + {$scoreOutput['total']} WHERE id = $gameID");




// check for end of game (player's tile supply is empty)
$query = $conn->prepare("SELECT COUNT(id) FROM tile WHERE gameID = ? AND location = ?");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$tileQuery = $query->get_result();
if (mysqli_fetch_assoc($tileQuery)['COUNT(id)'] == 0) {
  $conn->query("UPDATE game SET complete = TRUE WHERE id = $gameID");
  
  // TODO
  // deduct points for left over tiles?


}




$nextPlayer = $activePlayer == 1 ? 2 : 1;

$conn->query("UPDATE game SET activePlayer = $nextPlayer WHERE id = $gameID");



include('getGameDataProcess.php');