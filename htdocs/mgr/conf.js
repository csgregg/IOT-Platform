/**
 * @file        conf.js        (/mgr)
 * @author      Chris Gregg
 * 
 * @brief       Functionality for device configuration page
 * 
 * @copyright   Copyright (c) 2022
 * 
 */

/* MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */


//////////
// Globals

var deviceCode;                     // Code for this device
var deviceID;                       // ID for this device

var thisDevice;                     // Device pulled from known devices (where all the details are held)
var subscribed = false;             // Have we subcribed yet to the device env?

var loggingOn = false;              // Is logging on? Are we therefore subscribed to device log/
var loggingLevel = 0;               // Logging level
var loggingTick = false;            // Logging ticker

var logMQTTEnabled = false;         // Are we logging MQTT messages too?


////////////////////
// Logging Functions


/**
 * Called to update log status and messages
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
 function callLogUpdate( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");

    // Update status
    if( topicparts[4] == "on" ) {
        loggingOn = (msg=="true");
        if( loggingOn ) $('#logOn').bootstrapToggle('on');
        else $('#logOn').bootstrapToggle('off');
    }

    if( topicparts[4] == "tick" ) {
        loggingTick = (msg=="true");
        if( loggingTick ) $('#logTicker').bootstrapToggle('on');
        else $('#logTicker').bootstrapToggle('off');
    }

    if( topicparts[4] == "level" ) {
        loggingLevel = Number(msg);
        // Update level buttons
        document.getElementById("logLevel0").classList.remove("active");
        document.getElementById("logLevel1").classList.remove("active");
        document.getElementById("logLevel2").classList.remove("active");
        document.getElementById("logLevel3").classList.remove("active");
        document.getElementById("logLevel"+loggingLevel).classList.add("active");
    }

    // Log this message if logging MQTT
    if( logMQTTEnabled ) logMQTT( topic,msg );

    if( topicparts[4] == "json" && loggingOn ) {
        // TODO - decode msg JSON and add to table
    }
}


/**
 * Called to log the MQTT message
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function logMQTT( topic, msg ) {

    var table = $('#logTable').DataTable();     // Get the table

    // Set types - needed for some reason
    var strTag = "";
    var strMsg = "";
    var time = "";
    
    strTag = topic;
    strMsg = msg;

    // Get time
    time = new Date();

    // Add the row
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


/**
 * Called to fully update device UI
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function callEnvUpdate( topic, msg ) {
    callCoreDeviceEnv( topic, msg );

    const topicparts = topic.split("/");
    
    // Update GitHub repo and latest release details
    if( topicparts[4] == "repo" ) {

        var githubrepo = new githubassetfetcher(thisDevice.repo,"csgregg");
        var repoURL = "https://github.com/csgregg/"+thisDevice.repo;
        document.getElementById("lateRepo").innerHTML = repoURL;
        document.getElementById("lateRepo").setAttribute("href",repoURL);

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

    // Update current relese on device
    document.getElementById("curRelease").innerHTML = thisDevice.release;
    document.getElementById("curEnv").innerHTML = thisDevice.environment+" ("+thisDevice.build+")";

    if( topicparts[4] == "time" ) {
        var timestamp = new Date(thisDevice.timestamp);
        document.getElementById("curTimestamp").innerHTML = timestamp.toLocaleString( 'en-GB', {
            day: 'numeric',
            year: 'numeric',
            month: 'short', 
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            });
    }

    // Set status of auto firmware updater
    if( thisDevice.update ) $('#autoupdate').bootstrapToggle('on');
    else $('#autoupdate').bootstrapToggle('off');

    // Set serial and peripheral detils
    document.getElementById("device-serial").innerHTML = thisDevice.serial;
    document.getElementById("device-peri").innerHTML = thisDevice.peripherals;

    // Set board type
    if( topicparts[4] == "brd" ) {
        var board = coreBoardTypes.find( board => board.code === thisDevice.board );        // TODO error handling
        document.getElementById("device-proc").innerHTML = board.processeor;
        document.getElementById("device-board").innerHTML = board.name;  
    }

    // Update title
    if( thisDevice.knownas != "" ) document.getElementById("device-title").innerHTML = thisDevice.title+" ("+thisDevice.name+") - "+thisDevice.id;

    // Log this message if logging MQTT
    if( logMQTTEnabled ) logMQTT( topic,msg );
}


/**
 * Called to update device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function callUpdateDevice( topic, msg ){

    callCoreUpdateKnownDevice( topic, msg );           // Register this device in the known devices

    if( !subscribed ) {                             // Get fully subscribed to this devlice

        subscribed = true;
        thisDevice = coreKnownDevices[0];

        // Update UI with basics
        document.getElementById("device-code").innerHTML = thisDevice.code;
        document.getElementById("device-desc").innerHTML = thisDevice.description;
        document.getElementById("device-title").innerHTML = thisDevice.name+" - "+thisDevice.id;;

        var app = coreAppList.find( app => app.code === thisDevice.app );           // TODO error handling
        document.getElementById("app-name").innerHTML = app.name;
        document.getElementById("app-desc").innerHTML = app.description;
        document.getElementById("app-launch").setAttribute("href",app.url+"?device="+thisDevice.id);

        MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/env/#", 0, callEnvUpdate );         // Now subscribe to full device env/
        MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/log/#", 0, callLogUpdate );         // Subscribe to log/
    }

    // Update status dot
    var updatestatus = document.getElementById("device-status");
    if( thisDevice.status ) updatestatus.setAttribute("style","background:green;");
    else updatestatus.setAttribute("style","background:red;");
    
    // Log this message if logging MQTT
    if( logMQTTEnabled ) logMQTT( topic,msg );

}


/**
 * Called (by core) when known device has been deleted
 * @param {string} code            Device code
 * @param {string} id              Device ID
 */
 function callDeviceDeleted( code, id ) {

    console.log("Deleted")      // TODO handle this

}


/**
 * Called when connected to broker
 */
function callNowConnected() {

    // Subscribe to status topic
    MQTTSubTopic("devices/"+deviceCode+"/"+deviceID+"/status", 0, callUpdateDevice );

}


/**
 * Called when DOM is ready (page loaded)
 */
$(function() {

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    deviceCode = urlParams.get('code');
    deviceID = urlParams.get('id');

    // Set up listeners
    $('#logMQTT').change(function() {
      logMQTTEnabled = $(this).prop('checked');
    });

    // Apply DataTable extension to logging table
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

    // Connect to MQTT broker
    MQTTConnect(
        true,                   // Clean session
        callNowConnected,           // Connect success callback
        function(){},           // Dummy connect failure callback
        "status"                // Element for status messages
    );

});
