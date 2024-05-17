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

//$gameID = $_POST['gameID'];
$gameID = $_GET['gameID'];

$conn->query("DELETE FROM game WHERE id = $gameID");
$conn->query("DELETE FROM tile WHERE gameID = $gameID");


echo json_encode(['message' => "game $gameID deleted"]);