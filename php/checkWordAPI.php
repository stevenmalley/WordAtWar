<?php

include("checkWord.php");

$output = [
  'error' => "",
  'word' => "",
  'result' => "",
  'message' => "",
  'recursions' => 0
];

if (!isset($_GET['word'])) {
  $output['error'] = "no word supplied";
} else {

  $word = $_GET['word'];

  $output['word'] = $word;

  if (checkWord($word)) {
    $output['result'] = "true";
    $output['message'] = "$word OK";
  } else {
    $output['result'] = "false";
    $output['message'] = "$word not found";
  }
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);