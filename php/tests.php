<?php


$f = [0,0,0,0,0,0,0,0,0,0];
for ($r = 0; $r < 1000; $r++) {
  $bagPositions = [];
  for ($i = 0; $i < 10; $i++) {
    array_splice($bagPositions, rand(0,$i), 0, $i);
  }
  for ($i = 0; $i < 10; $i++) {
    $f[$i] += $bagPositions[$i];
  }
}


print_r($f);