// Load secrets
secrets = new varpasser("../core/secrets/private/secrets.php");

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
        "code"      : "rota",
        "name"      : "ROTA App",
        "url"       : "../apps/rota",
        "latest"    : "10.3.2",
        "fw"        : "/bin/fw.bin",
        "fs"        : "/bin/fs.bin"
    }
];

// Array of knowns devices
var devices = [];


function handlernDeviceEnv( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");
    var code = topicparts[1];
    var id = topicparts[2]

    var thisdevice = devices.find(thisdevice => (thisdevice.code === code) && (thisdevice.id === id));

    if( topicparts[4] == "hwd" )thisdevice.hardware = msg;
    if( topicparts[4] == "rel" )thisdevice.release = msg;
    if( topicparts[4] == "bld" )thisdevice.build = msg;

}


function deleteDeviceFromList(code,id) {
    var devicecard = document.getElementById("device-"+code+"-"+id);
    devicecard.remove();
}


function updateDeviceList() {

    var deviceLister = document.getElementById("device-lister");

    applist.forEach(function(app, index) {
        var appcontainer = document.getElementById("app-"+app.code);

        if( appcontainer == null ){

            // Create app container
            var newappcontainer = document.createElement("div");
            newappcontainer.setAttribute("id","app-"+app.code);
            newappcontainer.setAttribute("class","container border border-dark pt-3 pl-4 pb-3 pr-4");


            var appname = document.createElement("h5");
            appname.innerHTML = app.name;
            newappcontainer.appendChild(appname);

            var carddeck = document.createElement("div");
            carddeck.setAttribute("id","app-"+app.code+"-devices");
            carddeck.setAttribute("class","card-deck");
            newappcontainer.appendChild(carddeck);

            deviceLister.appendChild(newappcontainer);
            deviceLister.appendChild(document.createElement("br"));
        }
    });

    devices.forEach(function(dev, index) {

        var devicecard = document.getElementById("device-"+dev.code+"-"+dev.id);
        var thisapp = applist.find(thisapp => thisapp.code === dev.app);

        if( devicecard == null ) {

            // Create device card
            var newdevicecard = document.createElement("div");
            newdevicecard.setAttribute("id","device-"+dev.code+"-"+dev.id);
            newdevicecard.setAttribute("class","card m-2");
            newdevicecard.setAttribute("style","flex: 0 0 19rem;");

            // Add header
            var newcardheader = document.createElement("div");
            newcardheader.setAttribute("class","card-header");

            var devicename = document.createElement("h5");
            devicename.setAttribute("id","device-"+dev.code+"-"+dev.id+"-name");

            var devicestatusname = document.createElement("div");
            devicestatusname.setAttribute("class","pull-left");

            // Set status
            var devicestatus = document.createElement("span");
            devicestatus.setAttribute("id","device-"+dev.code+"-"+dev.id+"-status");
            devicestatus.setAttribute("class","statusdot");
            if( dev.status ) devicestatus.setAttribute("style", "background:green;");
            else devicestatus.setAttribute("style", "background:red;");

            devicestatusname.appendChild(devicestatus);
            devicestatusname.innerHTML += "&nbsp;&nbsp;&nbsp;"+dev.name;

            var deviceconf = document.createElement("a");
            deviceconf.setAttribute("id","device-"+dev.code+"-"+dev.id+"-conf");
            deviceconf.setAttribute("class","pull-right");
            deviceconf.setAttribute("href","conf.php?device="+dev.id);
            deviceconf.setAttribute("target","_blank");
            deviceconf.innerHTML = "<span class='fa fa-fw fa-cogs' style='color:grey'></span>";

            devicename.appendChild(devicestatusname);
            devicename.appendChild(deviceconf);
            newcardheader.appendChild(devicename);
            newdevicecard.appendChild(newcardheader);

            // Card body
            var newcardhbody = document.createElement("div");
            newcardhbody.setAttribute("class","card-body");

            var devicetext = document.createElement("div");
            devicetext.setAttribute("id","device-"+dev.code+"-"+dev.id+"-details");
            devicetext.setAttribute("class","card-text");
            devicetext.innerHTML = "An demo of using ESP8266 with Remote OTA and MQTT for management.";
         
            var space = document.createElement("br");

            var applaunch = document.createElement("a");
            applaunch.setAttribute("id","device-"+dev.code+"-"+dev.id+"-launch");
            applaunch.setAttribute("class","btn btn-primary");
            applaunch.setAttribute("href",thisapp.url+"?device="+dev.id);
            applaunch.setAttribute("target","_blank");
            applaunch.innerHTML = "Open &raquo;";

            newcardhbody.appendChild(devicetext);
            newcardhbody.appendChild(space);
            newcardhbody.appendChild(applaunch);
            newdevicecard.appendChild(newcardhbody);

            // Add card to deck
            var appdeck = document.getElementById("app-"+dev.app+"-devices");
            appdeck.appendChild(newdevicecard);

            // Now subscribe to device env
            MQTTSubTopic("devices/"+dev.code+"/"+dev.id+"/env/#", 0, handlernDeviceEnv );

        }
        else {

            // Update status
            var updatestatus = document.getElementById("device-"+dev.code+"-"+dev.id+"-status");

            if( dev.status ) updatestatus.setAttribute("style","background:green;");
            else updatestatus.setAttribute("style","background:red;");

        }
    });
}




/**
 * Called when matching status topic found for a device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function handlerKnownDevice( topic, msg ) {

    // Device details
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

            deleteDeviceFromList(code,id);
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
                    app : thisdevice.app,
                    hardware : "",
                    release : "",
                    build : ""
                }
            );
        } else {
            // Known device
            devices[devfound].status = online;
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
