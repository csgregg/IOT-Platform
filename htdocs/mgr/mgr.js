// Load secrets
secrets = new varpasser("secrets/private/secrets.php");

// Array of device tyoes
var deviceTypes = [
    {
        "code"  : "rota",
        "name"  : "Remote OTA Test",
        "app"   : "rota"
    }
];


// Array of installed apps
var applist = [
    {
        "code"  : "rota",
        "name"  : "ROTA App",
        "url"   : "../apps/rota"
    }
];

// Array of knows devices
var devices = [];



function updateDeviceList() {
    var table = document.getElementById("devicelist");

    devices.forEach(function(dev, index) {

        var rowCount = table.rows.length;

        // Add table row if not enough
        if( index >= rowCount ) {
            var newRow = table.insertRow(rowCount);
            newRow.insertCell(0);
            newRow.insertCell(1);
            newRow.insertCell(2);
        }

        // Set status
        if( dev.status ) table.rows[index].cells[0].innerHTML = "<span class='statusdot' style='background:green'></span>"
        else table.rows[index].cells[0].innerHTML = "<span class='statusdot' style='background:red'></span>"

        // Retrive and set app
        var thisapp = applist.find(thisapp => thisapp.code === dev.app);
        var applink = document.createElement('a');
        var linkText = document.createTextNode(thisapp.name);
        applink.appendChild(linkText);
        applink.title = "Device Application";
        applink.href = thisapp.url + "?deviceID=" + dev.id;
        applink.target = "_blank";

        // Remove old link and add new one
        while (table.rows[index].cells[1].firstChild) {
            table.rows[index].cells[1].removeChild(table.rows[index].cells[1].firstChild);
        }
        table.rows[index].cells[1].appendChild(applink);

        // Set device id
        table.rows[index].cells[2].innerHTML = "Device ID : " + dev.id;

    });

    // Remove any extra table rows
    for( var extrarows = table.rows.length - devices.length; table.rows.length - devices.length > 0; table.deleteRow(table.rows.length-1) ){}

}



/**
 * Called when matching status topic found for a device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function handlerKnownDevice( topic, msg ) {

  //  var table = document.getElementById("devicelist");

    const topicparts = topic.split("/");
    var code = topicparts[1];
    var id = topicparts[2]
    var online = msg.toLowerCase() == "online";

    // Do we already know about this one?
    var devfound = devices.findIndex(devfound => devfound.statustopic === topic);

    if( msg == "" ){

        // If blank message then forget device
        if( devfound != -1 ) {
            devices.splice(devfound, 1);
   //         table.rows[devfound].remove();
        }

    } else {
        if( devfound == -1 ) {
            
            // New device
            var thisdevice = deviceTypes.find(thisdevice => thisdevice.code === code);

            devices.push(
                {
                    id : id,
                    status : online,
                    statustopic : topic,
                    code : thisdevice.code,
                    name : thisdevice.name,
                    app : thisdevice.app
                }
            );

   /*         var rowCount = table.rows.length;
            var newRow = table.insertRow(rowCount);
        
            newRow.insertCell(0);
            newRow.insertCell(1);
            newRow.insertCell(2);

            if( online ) newRow.cells[0].innerHTML = "<span class='statusdot' style='background:green'></span>";
            else newRow.cells[0].innerHTML = "<span class='statusdot' style='background:red'></span>";

            var thisapp = applist.find(thisapp => thisapp.code === thisdevice.app);

            var applink = document.createElement('a');
            var linkText = document.createTextNode(thisapp.name);
            applink.appendChild(linkText);
            applink.title = "Device Application";
            applink.href = thisapp.url + "?deviceID=" + id;
            applink.target = "_blank";
            newRow.cells[1].appendChild(applink);

            newRow.cells[2].innerHTML = "Device ID : " + id;
*/
        } else {
            // Known device
            devices[devfound].status = online;

      //      if( online ) table.rows[devfound].cells[0].innerHTML = "<span class='statusdot' style='background:green'></span>";
      //      else table.rows[devfound].cells[0].innerHTML = "<span class='statusdot' style='background:red'></span>";
        }
        
    }

    updateDeviceList();
}

/**
 * Called when connected to broker
 */
function nowConnected() {

    // Subscribe to status topic
    MQTTSubTopic("devices/+/+/status", 0, handlerKnownDevice );
}

// Run on page load
window.addEventListener("load", function() {

    // Connect to broker
    MQTTConnect(
        secrets.getSecret("hivemq_host"),               // Host
        parseInt(secrets.getSecret("hivemq_port")),     // Port
        secrets.getSecret("hivemq_user"),               // Username
        secrets.getSecret("hivemq_pwd"),                // Password
        (secrets.getSecret("hivemq_ssl") == "true"),    // SSL
        true,                                           // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
