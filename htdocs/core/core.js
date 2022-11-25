

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

    if( topicparts[3] == "env" ) {
        if( topicparts[4] == "hwd" )thisdevice.hardware = msg;
        if( topicparts[4] == "rel" )thisdevice.release = msg;
        if( topicparts[4] == "bld" )thisdevice.build = msg;
    }

}


function deleteDeviceFromList(code,id) {
    var devicecard = document.getElementById("device-"+code+"-"+id);
    devicecard.remove();
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

}
