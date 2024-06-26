<?php

/* SWITCH ACTIVE PLAYER OR END GAME */

// check for end of game (player's tile supply is empty)
// TODO game also ends after three consecutive passes (or when one player passes twice in a row)
$query = $conn->prepare("SELECT COUNT(id) FROM tile WHERE gameID = ? AND location = ?");
$query->bind_param("ii", $gameID, $playerID);
$query->execute();
$tileQuery = $query->get_result();

if (mysqli_fetch_assoc($tileQuery)['COUNT(id)'] == 0) {
  $conn->query("UPDATE game SET complete = TRUE WHERE id = $gameID");
}



if (mysqli_fetch_assoc($conn->query("SELECT complete FROM game WHERE id = $gameID"))['complete']) {
  // GAME OVER
  // can occur due to tiles running out (above) or 3 consecutive passes (see submitPass.php)

  $conn->query("UPDATE game SET activePlayer = 0 WHERE id = $gameID");

  $query = $conn->prepare("SELECT score, location FROM tile WHERE gameID = ? AND location != 'board' AND location != 'bag'");
  $query->bind_param("i", $gameID);
  $query->execute();
  $penaltyQuery = $query->get_result();
  $penalty = [];
  while ($tile = mysqli_fetch_assoc($penaltyQuery)) {
    if (isset($penalty[$tile['location']])) {
      $penalty[$tile['location']] += $tile['score'];
    } else {
      $penalty[$tile['location']] = $tile['score'];
    }
  }

  foreach($penalty as $playerID => $points) {
    if ($points > 0) {
      $playerNumber = $gameData['player1'] == $playerID ? 'player1score' : 'player2score';
      $conn->query("UPDATE game SET $playerNumber = $playerNumber-$points WHERE id = $gameID");
    }
  }


} else {

  $nextPlayer = $activePlayer == 1 ? 2 : 1;

  $conn->query("UPDATE game SET activePlayer = $nextPlayer WHERE id = $gameID");

}