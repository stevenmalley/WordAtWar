<?php

/**
 *   traverse PHP array
 */

require("config.php");


function getDefinition($word) {
  $firstLetter = $word[0];
  $wordLength = strlen($word);

  $content = file_get_contents("./definitions/$firstLetter/$wordLength.txt");

  $definitions = explode("|",$content);

  $definitionsLength = sizeof($definitions);
  for($i = 0; $i < $definitionsLength; $i++) {
    $entry = preg_split("/\t/",$definitions[$i]);
    if (sizeof($entry) != 2) {
      throw new Error("definition invalid: index: $i, sizeof: ".sizeof($entry)." $definitions[$i]");
    }

    if ($entry[0] == $word) return $entry[1];
  }
}



function getDefinitionQuiz($word,$gameID) {
  global $hashSalt;

  $word = strtoupper($word);

  $definition = getDefinition($word);


  if ($definition) {
    $definitionsQuiz = [];

    $ascii = ord($word[0]);
    for ($i = 0; $i < 4; $i++) {
      // add four random definitions, guaranteeing no duplicates, in random order
      $ascii = ($ascii+rand(2,5));
      if ($ascii > 90) $ascii -= 26;
      $randLetter = chr($ascii);

      array_splice($definitionsQuiz, rand(0,$i), 0, [randomDefinition($randLetter)]);
    }

    $correctIndex = rand(0,4);
    $correctDefinition = ["word"=>$word,"definition"=>sanitiseDefinition($definition)];
    array_splice($definitionsQuiz, $correctIndex, 0, [$correctDefinition]);


    return ["word" => $word, "quiz" => $definitionsQuiz];//, "hash" => hash("sha256",$correctDefinition.$hashSalt.$gameID)];
    // use a salt so it cannot be reproduced, and the gameID so each definition has a different hash in different games
  } else {
    return false;
  }
}


function sanitiseDefinition($def) {
  /*

    SQUIFFIEST	  SQUIFFY, (colloquial) tipsy, drunk, also SQUIFF, SQUIFFED [adj]
    SQUIFFY	      (colloquial) tipsy, drunk, also SQUIFF, SQUIFFED [adj SQUIFFIER, SQUIFFIEST]


    for words in brackets, include the first word (ie. [n], [v], [adj], [adv], [interj], [pron], [conj]) remove everything else
    if first words are all-caps (often singular versions of plural words), remove them, unless the first character is '(' (often '(US slang)')
    remove "also" when followed by all-caps words, as well as the following all-caps words

    NB. cannot remove any all-caps words as these include "US", "UK", "EU" etc. as legitimate parts of a definition


    some defintions are simply a variant of the word in all caps, (eg. "BOASTINGLY  BOASTING [adv]"). Find the definition of the variant and sanitise that instead, with the word type (eg. "[n]") replaced with the word type of the original word.

  */


  $defArray = explode(" ",$def);
  $defSanitised = [];


  $i = 0;
  if (sizeof($defArray) == 2 && $defArray[0] == strtoupper($defArray[0]) && $defArray[1][0] == '[') {
    // definition is a variant of the word in all caps (eg. "BOASTING [adv]" for "boastingly"). return the sanitised definition of the variant.
    $variantDef = sanitiseDefinition(getDefinition($defArray[0]));
    $varDefArray = explode(" ",$variantDef);
    array_pop($varDefArray); // remove word type (eg. [v])
    $varDefArray[] = $defArray[1]; // append word type of original word (eg. [adv])
    return implode(" ",$varDefArray);
  } else {
    while ($defArray[$i] == strtoupper($defArray[$i]) && $defArray[$i][0] != '(') {
      // skip leading words if they are capitalised (unless they begin with '(', often '(US slang)')
      $i++;
    }
  }

  $insideBrackets = false;
  $capsFollowingAlso = false;

  while ($i < sizeof($defArray)) {
    // for all words after the first...

    $defWord = $defArray[$i];

    if ($defWord[0] == '[') {
      if ($defWord[-1] != ']') {
        $insideBrackets = true;
        $defSanitised[] = $defWord.']';
      } else $defSanitised[] = $defWord;
    } else {
      
      if ($insideBrackets) {
        // skip words inside brackets after the first word
        if ($defWord[-1] == ']') $insideBrackets = false;

      } else if ($capsFollowingAlso) {
        if ($defWord != strtoupper($defWord)) {
          // include a lower-case word following "also"
          $defSanitised[] = $defWord;
          $capsFollowingAlso = false;
        }
        // skip an all-caps word following "also"

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

    $i++;
  }

  return implode(" ",$defSanitised);
}


function randomDefinition($letter) {

  // choose a word length that is representative of the distribution of word lengths (i.e. more common word lengths like 7-10 should be more likely than the less common word lengths like 2 and 15)
  $wordLength = 0;

  // average number of words of a given length (2-15) per letter
  //$lengthDistribution = [5,52,217,499,886,1321,1621,1651,1432,1116,809,552,361,228];

  // distribution that favours 4-7 letter words, with declining chances of other words
  $lengthDistribution = [80,180,400,800,800,400,70,40,30,20,10,10,10,5];

  if ($letter == 'V') {
    // there are no 2 letter words beginning with 'V' (all other letter and length combinations have words), so prevent selection of 2 letter words
    $lengthDistribution[1] += $lengthDistribution[0];
    $lengthDistribution[0] = 0;
  }

  $r = rand(1,array_sum($lengthDistribution));
  $cumulative = 0;

  for ($i = 0; $i < sizeof($lengthDistribution); $i++) {
    $cumulative += $lengthDistribution[$i];
    if ($r <= $cumulative) {
      $wordLength = $i+2;
      break;
    }
  }

  $content = file_get_contents("./definitions/$letter/$wordLength.txt");
  $definitions = explode("|",$content);
  $randIndex = rand(0,sizeof($definitions)-1);
  $randLine = $definitions[$randIndex];
  $randWord = preg_split("/\t/",$randLine);

  if (sizeof($randWord) != 2) throw new Error("bad definition: ".$letter." ".$wordLength." ".$randIndex." ".$randLine);

  return ["word"=>$randWord[0],"definition"=>sanitiseDefinition($randWord[1])];

}