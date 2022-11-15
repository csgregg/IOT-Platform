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
<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.2/mqttws31.js">

// Create a client instance: Broker, Port, Websocket Path, Client ID
client = new Paho.MQTT.Client("9840f44798c7434ab5fea3ff5c993221.s2.eu.hivemq.cloud", Number(8884), "clientId-12032470912",);

// set callback handlers
client.onConnectionLost = function (responseObject) {
    console.log("Connection Lost: "+responseObject.errorMessage);
}

client.onMessageArrived = function (message) {
  console.log("Message Arrived: " + message.payloadString);
  console.log(“Topic:     “ + message.destinationName);
  console.log(“QoS:       “ + message.qos);
  console.log(“Retained:  “ + message.retained);
  // Read Only, set if message might be a duplicate sent from broker
  console.log(“Duplicate: “ + message.duplicate);
}

// Called when the connection is made
function onConnect(){
	console.log(“Connected!”);
}


client.tls_set("isrgrootx1.pem", tls_version=ssl.PROTOCOL_TLSv1_2)
client.tls_insecure_set(True)



// Connect the client, providing an onConnect callback
var options = {
        useSSL: true,
        userName : "testtest",
        password : TestTest1",
        onSuccess: onConnect,
        onFailure: onFail
    };
client.connect(options);



client.subscribe("testtopic");






</script>

b

<div class="row">
	<div class="col-sm-12">
	</div>
</div>

<?php require_once $abs_us_root.$us_url_root.'users/includes/html_footer.php'; ?>
