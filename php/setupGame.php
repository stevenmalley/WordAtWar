<?php


// $player1ID = $_POST['player1ID'];
// $player2ID = $_POST['player2ID'];
// $gameMode = $_POST['gameMode'];
$player1ID = $_GET['player1ID'];
$player2ID = $_GET['player2ID'];
$gameMode = $_GET['gameMode'];


$scrabbleTiles = [
  [null,2,0],
  ['A',9,1],
  ['B',2,3],
  ['C',2,3],
  ['D',4,2],
  ['E',12,1],
  ['F',2,4],
  ['G',3,2],
  ['H',2,4],
  ['I',9,1],
  ['J',1,8],
  ['K',1,5],
  ['L',4,1],
  ['M',2,3],
  ['N',6,1],
  ['O',8,1],
  ['P',2,3],
  ['Q',1,10],
  ['R',6,1],
  ['S',4,1],
  ['T',6,1],
  ['U',4,1],
  ['V',2,4],
  ['W',2,4],
  ['X',1,8],
  ['Y',2,4],
  ['Z',1,10],
];

$wordFeudTiles = [
  [null,2,0],
  ['A',10,1],
  ['B',2,4],
  ['C',2,4],
  ['D',5,2],
  ['E',12,1],
  ['F',2,4],
  ['G',3,3],
  ['H',3,4],
  ['I',9,1],
  ['J',1,10],
  ['K',1,5],
  ['L',4,1],
  ['M',2,3],
  ['N',6,1],
  ['O',7,1],
  ['P',2,4],
  ['Q',1,10],
  ['R',6,1],
  ['S',5,1],
  ['T',7,1],
  ['U',4,2],
  ['V',2,4],
  ['W',2,4],
  ['X',1,8],
  ['Y',2,4],
  ['Z',1,10],
];

$wordsWithFriendsTiles = [
  [null,2,0],
  ['A',9,1],
  ['B',2,4],
  ['C',2,4],
  ['D',5,2],
  ['E',13,1],
  ['F',2,4],
  ['G',3,3],
  ['H',4,3],
  ['I',8,1],
  ['J',1,10],
  ['K',1,5],
  ['L',4,2],
  ['M',2,4],
  ['N',5,2],
  ['O',8,1],
  ['P',2,4],
  ['Q',1,10],
  ['R',6,1],
  ['S',5,1],
  ['T',7,1],
  ['U',4,2],
  ['V',2,5],
  ['W',2,4],
  ['X',1,8],
  ['Y',2,3],
  ['Z',1,10],
];



$tileDistribution;
switch ($gameMode) {
  case "scrabble" : $tileDistribution = $scrabbleTiles; break;
  case "feud" : $tileDistribution = $wordFeudTiles; break;
  case "friends" : $tileDistribution = $wordsWithFriendsTiles; break;
  case "custom" : break; // TODO create random bonus pattern, decide how to choose tile distribution
  default :
    $output['status']['code'] = "404";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "game mode '$gameMode' not recognised";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

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


$query = $conn->prepare('INSERT INTO game (mode, width, player1, player2) VALUES (?, 15, ?, ?)');
$query->bind_param("sii", $gameMode, $player1ID, $player2ID);
$query->execute();
$gameID = mysqli_insert_id($conn);


$tileQuery = "INSERT INTO tile (id, letter, score, location, position, gameID) VALUES ";
$tileQueryArray = [];

$t = 0;
foreach ($shuffledTiles as $tile) {
  $letter = $tile[0] ? "'$tile[0]'" : "null";
  $location = $t < 7 ? $player1ID :
              ($t < 14 ? $player2ID : "'bag'");
  $position = $t < 14 ? $t%7 : $t-14;
  $tileQueryArray[] = "($t,$letter,$tile[1],$location,$position,$gameID)";

  $t++;
}

$query = $conn->prepare($tileQuery.implode(',',$tileQueryArray));

$query->execute();






$output['gameID'] = $gameID;
$output['message'] = "New game created successfully";

echo json_encode($output);