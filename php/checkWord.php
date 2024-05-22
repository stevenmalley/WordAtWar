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

function checkWord($word) {

  $word = strtoupper($word);
  $recursions = 0;
  $word_length = strlen($word);

  if ($word_length < 2 || $word_length > 15 || preg_match("/[^A-Z]/",$word)) {
    return false;

  } else {

    $first_letter = $word[0];
    $list_file = "./wordFiles/$first_letter/$word_length.txt";

    $lower_word_limit = 0;
    $upper_word_limit = (filesize($list_file)/$word_length)-1;

    $recursionLimit = 120;

    while ($lower_word_limit <= $upper_word_limit) {

      if ($recursions++ >= $recursionLimit) {
        throw new Error("check word recursion limit exceeded");
      }

      $search_target = floor(($lower_word_limit+$upper_word_limit)/2);
      $search_word = file_get_contents($list_file,false,null,$search_target*$word_length,$word_length);

      // DEBUGGING
      // echo "$lower_word_limit $search_target $upper_word_limit $search_word\n";
      
      if ($search_word == $word) {
        return true;
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

  return false;

}
