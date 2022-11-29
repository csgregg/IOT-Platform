

// Array of device tyoes
var deviceTypes = [
    {
        code        : "rota",
        name        : "Remote OTA Test",
        description : "A device which does something",
        app         : "rota"
    }
];


// Array of installed apps
var applist = [
    {
        code        : "rota",
        name        : "ROTA App",
        description :   "An app which does something",
        url         : "../apps/rota"
    }
];

var boardTypes = [
    {
        code        : "d1_mini",
        name        : "Wemos D1 Mini",
        processeor  : "ESP8266"
    }
]

// Array of knowns devices
var devices = [];


function handlernDeviceEnv( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");
    var code = topicparts[1];
    var id = topicparts[2]

    var thisdevice = devices.find(thisdevice => (thisdevice.code === code) && (thisdevice.id === id));

    if( topicparts[3] == "env" ) {
        if( topicparts[4] == "proc" )thisdevice.processeor = msg;
        if( topicparts[4] == "brd" )thisdevice.board = msg;
        if( topicparts[4] == "peri" )thisdevice.peripherals = msg;
        if( topicparts[4] == "rel" )thisdevice.release = msg;
        if( topicparts[4] == "bld" )thisdevice.build = msg;
        if( topicparts[4] == "env" )thisdevice.environment = msg;
        if( topicparts[4] == "time" )thisdevice.timestamp = msg;
        if( topicparts[4] == "up" ) thisdevice.update = (msg=="true");
        if( topicparts[4] == "serl" ) thisdevice.serial = msg;
    }

}


function deleteDeviceFromList(code,id) {
    var devicecard = document.getElementById("device-"+code+"-"+id);
    devicecard.remove();
}


function fixtoggle(object,source){
    document.getElementById(object).parentElement.style.width =  document.getElementById(source).parentElement.style.width;
    document.getElementById(object).parentElement.style.height =  document.getElementById(source).parentElement.style.height;
    document.getElementById(object).parentElement.style.lineHeight =  document.getElementById(source).parentElement.style.lineHeight;
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
    var name;
    var app;
    var description;

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

            if( thisdevice == undefined ) {
                name = "Unrecognised";
                description = ""
                code = "";
            }
            else {
                name = thisdevice.name;
                description = thisdevice.description;
                app = thisdevice.app;
            }

            devices.push(
                {
                    id          : id,
                    status      : online,
                    statustopic : topic,
                    code        : code,
                    name        : name,
                    description : description,
                    app         : app,
                    processeor  : "",
                    board       : "",
                    peripherals : "",
                    release     : "",
                    build       : "",
                    environment : "",
                    timestamp   : "",
                    update      : false,
                    serial      : ""
                }
            );
        } else {
            // Known device
            devices[devfound].status = online;
        }
        
    }

}
