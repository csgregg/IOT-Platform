<?php
// Secure to only logged in users
require_once '../../../users/init.php';
if (!securePage($_SERVER['PHP_SELF'])) { die(); }
 
// Variables to pass
$hivemq_host = "9840f44798c7434ab5fea3ff5c993221.s2.eu.hivemq.cloud";
$hivemq_port = "9840f44798c7434ab5fea3ff5c993221.s2.eu.hivemq.cloud";
$hivemq_user = "platform";
$hivemq_pwd = "Vickiliz123!";
 
// Add them all to the array
$vars = array(
  "hivemq_host"=>$hivemq_host,
	"hivemq_port"=>$hivemq_port,
  "hivemq_user"=>$hivemq_user,
	"hivemq_pwd"=>$hivemq_pwd
);
 
echo json_encode($vars);             
?>