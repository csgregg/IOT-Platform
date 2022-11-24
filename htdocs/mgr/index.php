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
<script src="<?=$us_url_root?>core/mqttclient.js" type="text/javascript"></script>
<script src="mgr.js" type="text/javascript"></script>


<h1>Device Manager</h1>

<div id="status">Connection Status: Not Connected</div>
<br>


<style>


.statusdot {
  border-radius: 50%;
  display: inline-block;
  height: 15px;
  width: 15px;
  margin-top: 7px;
  margin-left: 1px;
}   

table.devicelist {
  background-color: #FFFFFF;
  border-collapse: collapse;
  border-width: 0px;
  border-color: #000000;
  border-style: solid;
  color: #000000;
}

table.devicelist td, table.devicelist th {
  border-width: 0px;
  border-color: #000000;
  border-style: solid;
  padding: 5px;
}

table.devicelist thead {
  background-color: #FFFFFF;
}
</style>
<table id="devicelist" class="devicelist">
  <tr>
    <td style="display:none;"></td>
    <td style="width:50px"></td>
    <td style="width:200px"></td>
    <td style="width:200px"></td>

</tr>
</table>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
