<?php
// Secure to only logged in users
require_once '../users/init.php';
if (!securePage($_SERVER['PHP_SELF'])) { die(); }

// Variables to pass
$host = "myhost.com";
$pwd = "password";

// Add them all to the array
$vars = array(
"host"=>$host,
"pwd"=>$pwd
);

echo json_encode($vars);             
?>