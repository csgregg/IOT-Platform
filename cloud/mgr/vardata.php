<?php
require_once '../users/init.php';
if (!securePage($_SERVER['PHP_SELF'])) {
    die();
}

 $host = "myhost.com";
 $pwd = "password";

 $vars = array(
    "host"=>$host,
    "pwd"=>$pwd
 );

echo json_encode($vars); // In the end, you need to echo the result.
                      // All data should be json_encode()d.

                      // You can json_encode() any value in PHP, arrays, strings,
                      //even objects.

                      
?>