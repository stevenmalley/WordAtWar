<?php


  $host_name = 'db5015954570.hosting-data.io';
  $database = 'dbs13000979';
  $user_name = 'dbu2364191';
  $password = 'j84t@Ko9378H[l1fDf%1#q';

  $link = new mysqli($host_name, $user_name, $password, $database);

  if ($link->connect_error) {
    die('<p>Failed to connect to MySQL: '. $link->connect_error .'</p>');
  } else {
    echo '<p>Connection to MySQL server successfully established.</p>';
  }
