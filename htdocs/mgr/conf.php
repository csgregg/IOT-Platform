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
<script src="<?=$us_url_root?>core/githubassetfetch.js" type="text/javascript"></script>
<link href="<?=$us_url_root?>core/core.css" type="text/css" rel="stylesheet">
<script src="conf.js" type="text/javascript"></script>

<link href="https://cdn.jsdelivr.net/gh/digittal/bootstrap4-toggle/css/bootstrap4-toggle.min.css" rel="stylesheet">  
<script src="https://cdn.jsdelivr.net/gh/digittal/bootstrap4-toggle/js/bootstrap4-toggle.min.js"></script>

<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css">
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.1/js/jquery.dataTables.js"></script>


<h3>Device Setup</h3>
<div id="status">Connection Status: Not Connected</div>
<br>

<div class="card mb-3">

  <div class="card-header">
    <h5>
      <div class="pull-left">
        <span id="device-status" class="statusdot mr-3" style="background:green;"></span><span id="device-name"></span>
      </div>
      <a class="pull-right badge badge-secondary" style="width: 75px;" href="index.php"><span class="fa fa-fw fa-mixcloud secondary"></span></a>
    </h5>
  </div>

  <div class="card-body">
    <div class="card-text">
      <p id="device-desc" class="card-text"></p>
      <div class="container">
        <div class="row">
          <div class="col-auto">
            <a id="app-launch" href="#" target="_blank" class="btn btn-primary btn-sm">Open &raquo;</a>
          </div>
          <div class="col-auto">
            <b id="app-name" class="card-text"></b>
          </div>
          <div class="col-auto mr-auto">
            <p id="app-desc" class="card-text"></p>
          </div>
        </div>
      </div>
    </div>

    
    
  </div>
</div>

<div class="card mb-3">
  <div class="card-header">
    <ul class="nav nav-tabs card-header-tabs">
      <li class="nav-item">
        <a class="nav-link text-dark active" data-toggle="tab" href="#firmware">Firmware</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark" data-toggle="tab" href="#system">System</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-dark" data-toggle="tab" href="#hardware">Hardware</a>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <div class="tab-content">
      <div class="tab-pane active" id="firmware">
        <div class="card-deck">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Current</h5>
              <p class="card-text">Release: <b id="curRelease"></b><br>
              Timestamp: <b id="curTimestamp"></b><br>
              Environment: <b id="curEnv"></b></p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Latest</h5>
              <p class="card-text">Release: <b id="lateRelease"></b><br>
              Timestamp: <b id="lateTimestamp"></b></p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="container p-0">
                <div class="row">
                  <div class="col-auto mr-auto mb-2">
                    <h5 class="card-title">Update</h5>
                  </div>
                  <div class="col-auto">
                    <input id="autoupdate" class="" type="checkbox" data-toggle="toggle" data-onstyle="secondary" data-on="<i class='fa fa-play'></i> Auto" data-off="Auto <i class='fa fa-pause'></i>" data-size="sm">
                  </div>
                </div> 
              </div>
              <p class="card-text">Request firmware update.</p>
              <a href="#" class="btn btn-secondary btn-sm">Update Now</a>
            </div>
          </div>
        </div>

      </div>
      <div class="tab-pane" id="system">
        <div class="card-deck">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Device</h5>
              <p class="card-text">Reboot the device.</p>
              <a href="#" class="btn btn-secondary btn-sm">Restart</a>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Settings</h5>
              <p class="card-text">Reset settings to default.</p>
              <div class="container p-0">
                <div class="row">
                  <div class="col-auto mb-2">
                    <a href="#" style="width: 120px;" class="btn btn-outline-danger btn-sm">All Settings</a>
                  </div>
                  <div class="col-auto">
                    <a href="#" style="width: 120px;" class="btn btn-secondary btn-sm">Network</a>
                  </div>
                  <div class="col-auto mr-auto">
                    <a href="#" style="width: 120px;" class="btn btn-secondary btn-sm">Time/Location</a>
                  </div>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>      
      <div class="tab-pane" id="hardware">
        <div class="card-deck">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Device</h5>
              <p class="card-text">Processor: <b>ESP8266</b><br>
              Board: <b>Wemos D1 Mini</b><br>
              Device Code: <b>esp-8266-rota</b></p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Peripherals</h5>
              <p class="card-text">LED controls</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="card">
  <b class="card-header text-dark">Logging</b>
  <div class="card-body">
    <div class="container">
      <div class="row">
        <div class="col-auto mr-auto">
          <input id="logOn" type="checkbox"  data-toggle="toggle" data-onstyle="secondary" data-on="<i class='fa fa-play'></i> On" data-off="Off <i class='fa fa-pause'></i>" data-size="sm">
          <div id="logLevel" class="btn-group btn-group-toggle mt-1 mb-1 mr-1" data-toggle="buttons">
            <label id="logLevel0" class="btn btn-sm btn-light">
              <input type="radio" name="options" autocomplete="off"> Critical
            </label>
            <label id="logLevel1" class="btn btn-sm btn-light">
              <input type="radio" name="options" autocomplete="off"> Normal
            </label>
            <label id="logLevel2" class="btn btn-sm btn-light">
              <input type="radio" name="options" autocomplete="off"> High
            </label>
            <label id="logLevel3" class="btn btn-sm btn-light">
              <input type="radio" name="options" autocomplete="off"> Verbose
            </label>
          </div>
        </div>
        <div class="col-auto">
          <input id="logMQTT" type="checkbox" onChange="evntToggleClicked();" data-toggle="toggle" data-onstyle="secondary" data-on="<i class='fa fa-play'></i> MQTT" data-off="MQTT <i class='fa fa-pause'></i>" data-size="sm"> 
          <script>
            $(function() {
              $('#logMQTT').change(function() {
                logMQTTEnabled = $(this).prop('checked');
              })
            })
          </script>
          <input id="logTicker" type="checkbox" data-toggle="toggle" data-onstyle="secondary" data-on="<i class='fa fa-play'></i> Ticker" data-off="Ticker <i class='fa fa-pause'></i>" data-size="sm"> 
        </div>
      </div>
    </div>
  </div>
  <hr class="mt-0">
  <small>
    <div class="container mb-3 table-responsive">
      <table id="logTable" class="display compact">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Type</th>
            <th>Tag</th>
            <th>Message</th>
            <th>Heap</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
  </small>
</div>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
