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

    var table = $('#logTable').DataTable(    );
    var newID = 0;
    newID = document.getElementById('logTable').rows.length;

    table.row.add( [
        table.rows().count()+1,
        topic,
        msg,
        "",
        "",
        ""
     ] ).draw();
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
    $(document).ready(function () {
        let table = new DataTable('#logTable', {
                "order":[[0,"des"]]
        });

    });


    deviceCode = urlParams.get('code');
    deviceID = urlParams.get('id');


    // Connect to broker
    MQTTConnect(

        true,                  // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
