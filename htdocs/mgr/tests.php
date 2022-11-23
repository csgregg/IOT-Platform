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

<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript"></script>
<script src="<?=$us_url_root?>core/varpasser.js" type="text/javascript"></script>
<script src="mqtt_tests.js" type="text/javascript"></script>


<h1>MQTT Tester</h1>
<div id="status">Connection Status: Not Connected</div>

<br>

<br>
<table>
<tr>
<td id="subscribe" width="300">
<form name="subs" action="" onsubmit="return MQTTSubTopic(document.forms['subs']['Stopic'].value,parseInt(document.forms['subs']['sqos'].value));">
Subscribe Topic:   <input type="text" name="Stopic"><br>
Subscribe QOS:   <input type="text" name="sqos" value="0"><br>
<input type="submit" value="Subscribe">
</form> 
</td>
<td id="publish" width="300">
<form name="smessage" action="" onsubmit="return MQTTSendMessage(document.forms['smessage']['message'].value,parseInt(document.forms['smessage']['pqos'].value),document.forms['smessage']['Ptopic'].value,document.forms['smessage']['retain'].checked);">

Message: <input type="text" name="message"><br><br>
Publish Topic:   <input type="text" name="Ptopic"><br><br>
Publish QOS:   <input type="text" name="pqos" value="0"><br>
Retain Message:   <input type="checkbox" name="retain" value="true" ><br>
<input type="submit" value="Submit">
</form>
</td>
</tr>
</table>
<br>
Received Messages:
<div id="out_messages">
</div>


<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
