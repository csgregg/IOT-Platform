<?php
// Secure to only logged in users
require_once '../../../users/init.php';
if (!securePage($_SERVER['PHP_SELF'])) { die(); }
 
// Variables to pass
$hivemq_host = "";
$hivemq_port = "";
$hivemq_user = "";
$hivemq_pwd = "";
$hivemq_ssl = "";
 
// Add them all to the array
$vars = array(
  "hivemq_host"=>$hivemq_host,
	"hivemq_port"=>$hivemq_port,
  "hivemq_user"=>$hivemq_user,
	"hivemq_pwd"=>$hivemq_pwd,
  "hivemq_ssl"=>$hivemq_ssl
);
 
echo json_encode($vars);             
?>