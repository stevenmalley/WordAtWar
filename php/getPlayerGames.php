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


$post = json_decode(file_get_contents('php://input'), true);

$playerID = $post['playerID'];
//$playerID = $_POST['playerID'];

$query = $conn->prepare("SELECT game.id, game.mode, game.width, game.player1, game.player2, game.player1score, game.player2score, game.activePlayer, game.player1passed, game.player2passed, game.complete, t2.player1name, t2.player2name FROM
  (SELECT t1.id, t1.player1name, users.name as player2name FROM
    (SELECT game.id, game.player1, game.player2, users.name as player1name FROM game JOIN users ON game.player1 = users.id WHERE game.player1 = ? OR game.player2 = ?) as t1
    JOIN users on t1.player2 = users.id WHERE t1.player1 = ? OR t1.player2 = ?) AS t2
  JOIN game ON t2.id = game.id WHERE game.player1 = ? OR game.player2 = ?
ORDER BY game.id");
$query->bind_param("iiiiii", $playerID, $playerID, $playerID, $playerID, $playerID, $playerID);
$query->execute();
$playerGamesQuery = $query->get_result();
$playerGames = [];
while ($game = mysqli_fetch_assoc($playerGamesQuery)) {
  $playerGames[] = $game;
}


echo json_encode($playerGames);