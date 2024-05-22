<?php

/**
 * use text files divided according to first letter and word length, traverse that text file. no separators are needed in the text files because word lengths in each file are known, and therefore can be used to identify the end of one word and beginning of the next.
 * 
 * take the word from the middle of the wordList.
 * filesize/word_length gives the number of words; use these numbers to define limits of the search range, and multiply by word_length when extracting text from the wordList file.
 * if the search term is later in the alphabet, search the second half of the current search range. if earlier, search the first half.
 * repeat until word found or range limits overlap.
 * 
 */

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

  $word = strtoupper($_GET['word']);
  $output['word'] = $word;
  $recursions = 0;
  $word_length = strlen($word);

  if ($word_length < 2 || $word_length > 15 || preg_match("/[^A-Z]/",$word)) {
    $output['result'] = "false";
    $output['message'] = "$word not found";
  } else {


    $first_letter = $word[0];
    $list_file = "./wordFiles/$first_letter/$word_length.txt";

    $lower_word_limit = 0;
    $upper_word_limit = (filesize($list_file)/$word_length)-1;

    $recursionLimit = 120;


    while ($lower_word_limit <= $upper_word_limit) {

      if ($recursions++ >= $recursionLimit) {
        $output['error'] = "R limit exceeded. ".$lower_word_limit."-".$upper_word_limit." ".file_get_contents($list_file,false,null,$lower_word_limit*$word_length,($upper_word_limit-$lower_word_limit)*$word_length);
        break;
      }

      $search_target = floor(($lower_word_limit+$upper_word_limit)/2);
      $search_word = file_get_contents($list_file,false,null,$search_target*$word_length,$word_length);

      // DEBUGGING
      // echo "$lower_word_limit $search_target $upper_word_limit $search_word\n";
      
      if ($search_word == $word) {
        $output['result'] = "true";
        $output['message'] = "$word OK";
        break;
      } else {
        $c = 1;
        while ($word[$c] == $search_word[$c]) $c++;
        $wordEarlier = ord($word[$c]) < ord($search_word[$c]);
        // starting from second letter (because we know that first letter is the same), go through letters until a difference is found, then determine which is earlier alphabetically
        if ($wordEarlier) {
          $upper_word_limit = $search_target-1;
        } else {
          $lower_word_limit = $search_target+1;
        }
      }
    }
  }

  if ($output['result'] != "true") {
    $output['result'] = "false";
    $output['message'] = "$word not found";
  }

  $output['recursions'] = $recursions;

}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);