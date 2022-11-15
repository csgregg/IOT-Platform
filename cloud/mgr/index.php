<?php
/*
UserSpice 5
An Open Source PHP User Management System
by the UserSpice Team at http://UserSpice.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
require_once '../users/init.php';
require_once $abs_us_root.$us_url_root.'users/includes/template/prep.php';
if (!securePage($_SERVER['PHP_SELF'])) {
    die();
}
?>

<?php
require("phpMQTT.php");

echo "One
";
//MQTT client id to use for the device. "" will generate a client id automatically
$mqtt = new bluerhinos\phpMQTT("9840f44798c7434ab5fea3ff5c993221.s2.eu.hivemq.cloud", 8884, "ClientID".rand(), "server.pem");
echo "Two
";
if ($mqtt->connect(true,NULL,"testtest","TestTest1")) {
    echo "Three
";
  $mqtt->publish("topic","Hello CloudAMQP MQTT!", 0);
  echo "Four
";
  $mqtt->close();
  echo "Five
";
}else{
  echo "Fail or time out
";
}
echo "Six
";
?>





<div class="row">
	<div class="col-sm-12">
        Hmm3
	</div>
</div>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
