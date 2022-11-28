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

<script type="text/javascript">var us_url_root ="<?=$us_url_root?>";</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript"></script>
<script src="<?=$us_url_root?>core/varpasser.js" type="text/javascript"></script>
<script src="<?=$us_url_root?>core/mqttclient.js" type="text/javascript"></script>
<script src="<?=$us_url_root?>core/core.js" type="text/javascript"></script>
<link href="<?=$us_url_root?>core/core.css" type="text/css" rel="stylesheet">
<script src="index.js" type="text/javascript"></script>

<h3>Device Manager</h3>
<div id="status">Connection Status: Not Connected</div>
<br>

<div id="device-lister"></div>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
