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
<script src="<?=$us_url_root?>core/mqtt.js" type="text/javascript"></script>

<script type="text/javascript">

    window.addEventListener("load", function() {
        MQTTConnect();
    });

    window.addEventListener("beforeunload", function(evt) {
        MQTTDisconnect();

        // Cancel the event (if necessary)
        evt.preventDefault();

        // Google Chrome requires returnValue to be set
        evt.returnValue = '';

        return null;
    });

</script>

<h1>Device Manager</h1>
<div id="status">Connection Status: Not Connected</div>

<br>


<style>
table.devicelist {
  width: 100%;
  background-color: #FFFFFF;
  border-collapse: collapse;
  border-width: 0px;
  border-color: #FFFFFF;
  border-style: solid;
  color: #000000;
}

table.devicelist td, table.devicelist th {
  border-width: 0px;
  border-color: #FFFFFF;
  border-style: solid;
  padding: 5px;
}

table.devicelist thead {
  background-color: #FFFFFF;
}
</style>

<table id="devicelist" class="devicelist">
  <tbody>
    <tr>
      <td>Row 1, Cell 1</td>
      <td>Row 1, Cell 2</td>
      <td>Row 1, Cell 3</td>
    </tr>
  </tbody>
</table>




<br>
<table>
<tr>
<td id="subscribe" width="300">
<form name="subs" action="" onsubmit="return MQTTSubTopic()">
Subscribe Topic:   <input type="text" name="Stopic"><br>
Subscribe QOS:   <input type="text" name="sqos" value="0"><br>
<input type="submit" value="Subscribe">
</form> 
</td>
<td id="publish" width="300">
<form name="smessage" action="" onsubmit="return MQTTSendMessage()">

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
