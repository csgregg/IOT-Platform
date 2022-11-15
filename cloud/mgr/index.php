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
a
<script src="<?=$us_url_root?>core/varpasser.js" type="text/javascript"></script>
<script src="<?=$us_url_root?>core/mqtt.js" type="text/javascript"></script>
b
<h1>Websockets MQTT Monitor</h1>
	
    <script type = "text/javascript">
//ll

</script>


<div id="status">Connection Status: Not Connected</div>

<br>
<table>
<tr>

<td id="connect" width="300" >

 <form name="connform" action="" onsubmit="return MQTTconnect()">

Server:  <input type="text" name="server"><br><br>
Port:    <input type="text" name="port"><br><br>
Clean Session: <input type="checkbox" name="clean_sessions" value="true" checked><br><br>
Username: <input type="text" name="username" value=""><br><br>
Password: <input type="text" name="password" value=""><br><br>
<input name="conn" type="submit" value="Connect">
<input TYPE="button" name="discon " value="DisConnect" onclick="disconnect()">
</form>
</td>
<td id="subscribe" width="300">
<form name="subs" action="" onsubmit="return sub_topics()">
Subscribe Topic:   <input type="text" name="Stopic"><br>
Subscribe QOS:   <input type="text" name="sqos" value="0"><br>
<input type="submit" value="Subscribe">
</form> 
</td>
<td id="publish" width="300">
<form name="smessage" action="" onsubmit="return send_message()">

Message: <input type="text" name="message"><br><br>
Publish Topic:   <input type="text" name="Ptopic"><br><br>
Publish QOS:   <input type="text" name="pqos" value="0"><br>
Retain Message:   <input type="checkbox" name="retain" value="true" ><br>
<input type="submit" value="Submit">
</form>
</td>
</tr>
</table>
Status Messages:
<div id="status_messages">
</div>
Received Messages:

<div id="out_messages">
</div>
<script>
var connected_flag=0	
var mqtt;
var reconnectTimeout = 2000;
var host="192.168.1.157";
var port=9001;
var row=0;
var out_msg="";
var mcount=0;
</script>

c
<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
