<?php

/**
 *   traverse PHP array
 */

require("config.php");


function getDefinition($word) {
  $word = strtoupper($word);

  $content = file_get_contents("./definitions/definitions.txt");

  $definitions = preg_split("/\r\n|\n|\r/",$content);

  $dictionary = [];
  foreach($definitions as $definition) {
    $entry = preg_split("/\t/",$definition);
    if (sizeof($entry) != 2) {
      throw new Error("definition invalid: $definition");
    }
    $dictionary[$entry[0]] = $entry[1];
  }

  if (in_array($word,array_keys($dictionary))) {
    return $dictionary[$word];
  } else {
    return false;
  }
}

function getDefinitionQuiz($word) {
  global $hashSalt;

  $word = strtoupper($word);

  $content = file_get_contents("./definitions/definitions.txt");

  $definitions = preg_split("/\r\n|\n|\r/",$content);

  $wordIndex = -1;
  $wordArray = [];
  $definitionArray = [];
  $definitionsLength = sizeof($definitions);
  for($i = 0; $i < $definitionsLength; $i++) {
    $entry = preg_split("/\t/",$definitions[$i]);
    if (sizeof($entry) != 2) {
      throw new Error("definition invalid: $definitions[$i]");
    }
    $wordArray[] = $entry[0];
    $definitionArray[] = $entry[1];

    if ($entry[0] == $word) $wordIndex = $i;
  }


  if ($wordIndex > -1) {
    $definitionsQuiz = [];

    $index = $wordIndex;
    for ($i = 0; $i < 4; $i++) {
      // add four random definitions, guaranteeing no duplicates, in random order
      $index = ($index+rand(100,50000))%$definitionsLength;
      array_splice($definitionsQuiz, rand(0,$i), 0, sanitiseDefinition($definitionArray[$index]));
    }

    $correctIndex = rand(0,4);
    $correctDefinition = sanitiseDefinition($definitionArray[$wordIndex]);
    array_splice($definitionsQuiz, $correctIndex, 0, $correctDefinition);


    return ["word" => $word, "quiz" => $definitionsQuiz, "hash" => hash("sha256",$correctDefinition.$hashSalt)];
  } else {
    return false;
  }
}


function sanitiseDefinition($def) {
  /*

    SQUIFFIEST	  SQUIFFY, (colloquial) tipsy, drunk, also SQUIFF, SQUIFFED [adj]
    SQUIFFY	      (colloquial) tipsy, drunk, also SQUIFF, SQUIFFED [adj SQUIFFIER, SQUIFFIEST]



    for words in brackets, include the first word (ie. [n], [v], [adj], [adv], [interj], [pron], [conj]) remove everything else
    if first word is all-caps, remove it (often singular versions of plural words)
    remove "also" when followed by all-caps words, as well as the following all-caps words

    NB. cannot remove any all-caps words as these include "US", "UK", "EU" etc. as legitimate parts of a definition

  */


  $defArray = explode(" ",$def);
  $defSanitised = [];

  if ($defArray[0] != strtoupper($defArray[0])) {
    // include the first word if it is lower-case
    $defSanitised[] = $defArray[0];
  }

  $insideBrackets = false;
  $capsFollowingAlso = false;
  for ($i = 1; $i < sizeof($defArray); $i++) {
    // for all words after the first...

    $defWord = $defArray[$i];

    if ($defWord[0] == '[') {
      if ($defWord != strtoupper($defWord)) {
        if ($defWord[-1] != ']') {
          $insideBrackets = true;
          $defSanitised[] = $defWord.']';
        } else $defSanitised[] = $defWord;
      } else {
        // only true for "[ANTAS]", ignore
      }
    } else {
      
      if ($insideBrackets) {
        // skip words inside brackets after the first word
        if ($defWord[-1] == ']') $insideBrackets = false;

      } else if ($capsFollowingAlso) {
        if ($defWord != strtoupper($defWord)) {
          // include a lower-case word following also
          $defSanitised[] = $defWord;
          $capsFollowingAlso = false;
        }
        // skip an all-caps word following also

      } else {
        if ($defWord == "also") {
          if ($i < sizeof($defArray)-1 && $defArray[$i+1] == strtoupper($defArray[$i+1])) {
            // an "also" is followed by all-caps words, skip it
            $capsFollowingAlso = true;
            // also remove the comma from the preceding word, if there is one
            $previousWord = $defSanitised[sizeof($defSanitised)-1];
            if ($previousWord[-1] == ",") {
              $defSanitised[sizeof($defSanitised)-1] = substr($previousWord,0,strlen($previousWord)-1);
            }
          } else {
            // an "also" is not followed by all-caps words, include it
            $defSanitised[] = $defWord;
          }
        } else {
          // include any word that is neither inside brackets, following "also", or "also" itself, even if it is all-caps
          $defSanitised[] = $defWord;
        }
      }
    }
  }

  return implode(" ",$defSanitised);
}