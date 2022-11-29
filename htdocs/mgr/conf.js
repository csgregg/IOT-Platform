var deviceCode;
var deviceID;

var thisdevice;
var subscribed = false;

var loggingOn = false;
var loggingLevel = 0;
var loggingTick = false;

var logMQTTEnabled = false;



function logMQTT(topic,msg) {
    var table = $('#logTable').DataTable();
    var strTag = "";
    var strMsg = "";
    var time = "";
    
    strTag = topic;
    strMsg = msg;
    time = new Date();
    table.row.add( [
        table.rows().count()+1,
        time.toLocaleString( 'en-GB', {
            day: 'numeric',
            year: 'numeric',
            month: 'short', 
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            }),
        "MQTT",
        strTag,
        strMsg,
        "-"
    ] ).draw();
}


function handleEnvUpdate( topic, msg ) {
    handlernDeviceEnv( topic, msg);

    const topicparts = topic.split("/");

    document.getElementById("curRelease").innerHTML = thisdevice.release;
    var timestamp = new Date(thisdevice.timestamp);
    document.getElementById("curTimestamp").innerHTML = timestamp.toLocaleString( 'en-GB', {
        day: 'numeric',
        year: 'numeric',
        month: 'short', 
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        });
    document.getElementById("curEnv").innerHTML = thisdevice.environment+" ("+thisdevice.build+")";

    if( thisdevice.update ) $('#autoupdate').bootstrapToggle('on');
    else $('#autoupdate').bootstrapToggle('off');

    document.getElementById("device-serial").innerHTML = thisdevice.serial;
    document.getElementById("device-peri").innerHTML = thisdevice.peripherals;

    if( topicparts[4] == "brd" ) {
        var board = boardTypes.find(board => board.code === thisdevice.board);
        console.log(board)
        document.getElementById("device-proc").innerHTML = board.processeor;
        document.getElementById("device-board").innerHTML = board.name;  
    }

    if( logMQTTEnabled ) logMQTT( topic,msg );
}

function handleLogUpdate( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");

    if( topicparts[4] == "on" ) loggingOn = (msg=="true");
    if( topicparts[4] == "tick" ) loggingTick = (msg=="true");
    if( topicparts[4] == "level" ) loggingLevel = Number(msg);

    if( loggingOn ) $('#logOn').bootstrapToggle('on');
    else $('#logOn').bootstrapToggle('off');

    if( loggingTick ) $('#logTicker').bootstrapToggle('on');
    else $('#logTicker').bootstrapToggle('off');

    document.getElementById("logLevel0").classList.remove("active");
    document.getElementById("logLevel1").classList.remove("active");
    document.getElementById("logLevel2").classList.remove("active");
    document.getElementById("logLevel3").classList.remove("active");
    document.getElementById("logLevel"+loggingLevel).classList.add("active");


    if( logMQTTEnabled ) logMQTT( topic,msg );
}



function handlerUpdateDevice( topic, msg ){
    handlerKnownDevice(topic,msg);

    if( !subscribed ) {
        subscribed = true;
        thisdevice = devices[0];

        document.getElementById("device-code").innerHTML = thisdevice.code;
        document.getElementById("device-name").innerHTML = thisdevice.name;
        document.getElementById("device-desc").innerHTML = thisdevice.description;

        var app = applist.find(app => app.code === thisdevice.app);
        document.getElementById("app-name").innerHTML = app.name;
        document.getElementById("app-desc").innerHTML = app.description;
        document.getElementById("app-launch").setAttribute("href",app.url+"?device="+thisdevice.id);

        MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/env/#", 0, handleEnvUpdate );
        MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/log/#", 0, handleLogUpdate );

        var repo = thisdevice.code;
        repo = "csg-esp8266-rota";
        
        var githubrepo = new githubassetfetcher(repo,"csgregg");
        var latestRelease = githubrepo.getLatestRelease();
        document.getElementById("lateRelease").innerHTML = latestRelease.tag;
        var timestamp = new Date(latestRelease.date);
        document.getElementById("lateTimestamp").innerHTML = timestamp.toLocaleString( 'en-GB', {
            day: 'numeric',
            year: 'numeric',
            month: 'short', 
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
           });

    }

    var updatestatus = document.getElementById("device-status");
    if( thisdevice.status ) updatestatus.setAttribute("style","background:green;");
    else updatestatus.setAttribute("style","background:red;");
    
    if( logMQTTEnabled ) logMQTT( topic,msg );
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
    deviceCode = urlParams.get('code');
    deviceID = urlParams.get('id');

    let table = new DataTable('#logTable', {
        "order":[[0,"des"]],
        "columns": [
            { "width": "5%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "20%" },
            null,
            { "width": "10%" }
            ]
    });


    // Connect to broker
    MQTTConnect(

        true,                  // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
