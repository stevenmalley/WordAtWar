<?php
 
include("getDefinition.php");


header('Content-Type: application/json; charset=UTF-8');



$post = json_decode(file_get_contents('php://input'), true);


$quizzes = [];
foreach($post['words'] as $word) {
  $quizzes[] = getDefinitionQuiz($word,6);
}

echo json_encode($quizzes);