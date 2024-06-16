<?php

include("config.php");
include("checkWord.php");
include("boardData.php");
include("getDefinition.php");

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
// $blanks = $_POST['blanks']; // [ [tileID,letter], ... ]



$gameData = mysqli_fetch_assoc($conn->query("SELECT mode, width, player1, player2, activePlayer, player1passed, player2passed, complete FROM game WHERE id = $gameID"));
$activePlayer = $gameData["activePlayer"];
$activePlayerID = $activePlayer > 0 ? $gameData["player$activePlayer"] : null;

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
    $row['row'] = floor(($row['position']-1)/$gameData['width']);
    $row['col'] = ($row['position']-1)%$gameData['width'];
    array_push($boardTiles, $row);

  } else {
    // a player tile
    array_push($playerTiles, $row);
    foreach($tiles as $tile) {
      // one of the submitted tiles
      if ($row['id'] == $tile[0]) {
        $row['position'] = $tile[1];
        $row['row'] = floor(($tile[1]-1)/$gameData['width']);
        $row['col'] = ($tile[1]-1)%$gameData['width'];
        $submittedTiles[] = $row;
      }
    }
  }
}



/* LEGALITY CHECKS */



// TODO
// check currentPlayer login credentials



// check game is not already complete
if ($gameData['complete']) fail("Game has finished");

// check current player (the user making the request) is the active player (the player whose turn it is)
if ($activePlayerID != $playerID) fail("It is not your turn");

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

// check that all tiles are in a single line
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
  // tiles have been placed horizontally (or only a single tile has been placed)
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

// check that tiles have no gaps, unless they are filled by previously-placed tiles
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
      if (($horizontal && $tile['col'] == $c && $tile['row'] == $coordinate) ||
          (!$horizontal && $tile['row'] == $c && $tile['col'] == $coordinate)) {
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
  if (!$neighbour) fail("Tiles must be connected to other tiles");
}



// identify words
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

// find the word on the primary axis (the word that uses all of the submitted tiles)
$dimensionSearch = searchTiles($submittedTiles[0],$dimension);
if ($dimensionSearch) $submittedWords[] = $dimensionSearch;

// find words on the perpendicular axis
foreach($submittedTiles as $tile) {
  $perpendicularSearch = searchTiles($tile,$perpendicular);
  if ($perpendicularSearch) $submittedWords[] = $perpendicularSearch;
}



// when one tile has been placed and two words created (there can only be either one or two), the primary word (first in $submittedWords) should be the longest
if (sizeof($tiles) == 1 && sizeof($submittedWords) == 2) {
  if (strlen($submittedWords[1]['word']) > strlen($submittedWords[0]['word'])) {
    $submittedWords = [$submittedWords[1],$submittedWords[0]];
  }
}



// all words must be valid
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
$newTiles = sizeof($tiles);
while ($newTiles-- > 0) {
  $conn->query("UPDATE tile SET location = '$playerID', position = null
    WHERE gameID = $gameID AND location = 'bag' AND
      position = ( SELECT MIN(position) FROM (SELECT position, gameID, location FROM tile) t WHERE gameID = $gameID AND location = 'bag' )");
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




/* CALCULATE SCORE */

$bonuses;

switch ($gameData["mode"]) {
  case "scrabble" : $bonuses = $scrabbleBonus; break;
  case "feud" : $bonuses = $wordFeudBonus; break;
  case "friends" : break; // TODO words with friends bonuses
  case "custom" : break; // TODO fetch bonuses from database
}

$playScore = [
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
  $playScore['items'][] = [$word['word'],$wordScore];
  $playScore['total'] += $wordScore;
}

if (sizeof($submittedTiles) == 7) {
  $playScore['total'] += 40;
  //$playScore['items'][] = ["That's a bingo!",40];
  $playScore['items'][0][1] += 40; // the first word in submitted words is the primary word (the word that uses all of the submitted tiles), so add the bingo bonus here
}

$output['score'] = $playScore;

// score immediately for words
// $conn->query("UPDATE game SET player{$activePlayer}score = player{$activePlayer}score + {$playScore['total']} WHERE id = $gameID");




// for each unique word, generate a quiz
$uniqueSubmittedWords = [];
$quizzes = [];
foreach($submittedWords as $word) {
  if (!in_array($word['word'],$uniqueSubmittedWords)) {
    $quiz = getDefinitionQuiz($word['word'],$gameID);
    
    $wordScore = 0;
    foreach($playScore['items'] as $score) {
      // the same word might have been made more than once. combine scores for each incidence of the word.
      if ($score[0] == $word['word']) $wordScore += $score[1];
    }
    
    $quiz['score'] = $wordScore;
    $quizzes[] = $quiz;
    $uniqueSubmittedWords[] = $word['word'];
  }
}


$query = $conn->prepare("UPDATE game SET quizzes = ? WHERE id = ?");
$stringifiedQuizzes = json_encode($quizzes);
$query->bind_param("si", $stringifiedQuizzes, $gameID);
$query->execute();



include('getGameDataProcess.php');