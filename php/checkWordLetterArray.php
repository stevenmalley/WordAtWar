<?php

/**
 *   traverse PHP array
 *  
 */

 
$output = [
  'error' => "",
  'word' => "",
  'result' => "",
  'message' => ""
];

if (!isset($_GET['word'])) {
  $output['error'] = "no word supplied";
} else {

  $word = strtoupper($_GET['word']);

  $first_letter = $word[0];
  $word_length = strlen($word);

  if ($word_length < 2 || $word_length > 15 || preg_match("/[^A-Za-z]/",$word)) {
    $output['result'] = 'false';
    $output['message'] = $word." not recognised";

  } else {

    $content = file_get_contents("./wordLists/$first_letter/$word_length.txt");

    $words = preg_split("/\r\n|\n|\r/",$content);



    $output['word'] = $word;

    if (!in_array($word,$words)) {
      $output['result'] = 'false';
      $output['message'] = $word." not recognised";
    } else {
      $output['result'] = 'true';
      $output['message'] = $word." OK";
    }
  }
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);