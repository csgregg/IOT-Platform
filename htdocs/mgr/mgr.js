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


/**
 * Called when matching status topic found for a device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function handlerKnownDevice( topic, msg ) {

    var table = document.getElementById("devicelist");
    const topicparts = topic.split("/");

    var found = null;
    for (const row of table.rows) {  
          if(row.cells[0].innerText == topic) found = row;
    }

    if( msg == "" ) {
        if( found != null ) found.remove();
    } else
    {
        if( found == null) {
            var rowCount = table.rows.length;
            found = table.insertRow(rowCount);
        
            found.insertCell(0);
            found.insertCell(1);
            found.insertCell(2);
            found.insertCell(3);

            found.cells[0].innerHTML = topic;
            found.cells[0].style="display:none;"

            thisdevice = deviceTypes.find(thisdevice => thisdevice.code === topicparts[1]);

            if( thisdevice !== undefined ){
                thisapp = applist.find(thisapp => thisapp.code === thisdevice.app);
                if( thisapp !== undefined)
                {           
                    var applink = document.createElement('a');
                    var linkText = document.createTextNode(thisapp.name);
                    applink.appendChild(linkText);
                    applink.title = "Device Application";
                    applink.href = thisapp.url + "?deviceID=" + topicparts[2];
                    applink.target = "_blank";
                    found.cells[2].appendChild(applink);

                } else {
                    found.cells[2].innerHTML = "Unknown App";
                }

            } else {
                found.cells[2].innerHTML = "Unknown Device";
            }
         
            found.cells[3].innerHTML = "Device ID : " + topicparts[2];

        }

        if( msg == "Online" )
        {
            found.cells[1].innerHTML = "<span class='statusdot' style='background:green'></span>"
        }
        else
        {
            found.cells[1].innerHTML = "<span class='statusdot' style='background:red'></span>"
        }
    }

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
