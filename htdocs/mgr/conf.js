var deviceCode;
var deviceID;


function updateDeviceInfo() {
    console.log(devices);

    // var repo = devices[0].code;
    var repo = "csg-esp8266-rota";
    
    var githubrepo = new githubassetfetcher(repo,"csgregg");
    console.log(githubrepo.getLatestRelease());
}





function handlerUpdateDevice( topic, msg ){
    handlerKnownDevice(topic,msg);
    updateDeviceInfo();
}


/**
 * Called when connected to broker
 */
function nowConnected() {

    // Subscribe to status topic
    MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/status", 0, handlerUpdateDevice );

}

// Run on page load
window.addEventListener("load", function() {

    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);

    deviceCode = urlParams.get('code');
    deviceID = urlParams.get('id');

    console.log(deviceCode);
    console.log(deviceID);


    // Connect to broker
    MQTTConnect(

        true,                  // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
