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



/* Log Message JSON Format

{
    "pld"   : {
        "tag"   : "123456",
        "type"  : "12345678",
        "msg"   : "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"
    },
    "env"   : {
        "time": "yyyy-mm-ddThh:mm:ss+0000",
        "heap": "1234567890"
    }
}

*/




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

var modaloptions = {                // Modal set up
    title           : "",           // Modal title
    message         : "",           // Modal message
    btnPrimary      : "",           // Primary button text
    btnSecondary    : "",           // Secondary button text
    callPrimary     : function(){}, // Called whem primary button clicked
    callSecondary   : function(){}, // Called whem secondary button clicked
    callClose       : function(){}  // Called whem closed clicked
 };


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
    if( topicparts[6] == "on" ) {
        loggingOn = (msg=="true");
        if( loggingOn ) $('#logOn').bootstrapToggle('on');
        else $('#logOn').bootstrapToggle('off');
    }

    if( topicparts[6] == "tick" ) {
        loggingTick = (msg=="true");
        if( loggingTick ) $('#logTicker').bootstrapToggle('on');
        else $('#logTicker').bootstrapToggle('off');
    }

    if( topicparts[6] == "level" ) {
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

    if( topicparts[6] == "msg" && loggingOn ) {

        var table = $('#logTable').DataTable();     // Get the table

        var json;
        var validMsg = false;
        var strMsg = ""
        var strTag = "";
        var strType = "";
        var strHeap = "";
        var strtime = "";

        try {
            json = JSON.parse(msg);
            validMsg = true;
        } catch (e) { }

        
        if( validMsg ) {
            strMsg = json.pld.msg;
            strTag = json.pld.tag;
            strType = json.pld.type;
            strHeap = json.env.heap;

            var time = new Date(json.env.time);
            strTime = time.toLocaleString( 'en-GB', {
                day: 'numeric',
                year: 'numeric',
                month: 'short', 
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short'
                });
        }
        else {
            strMsg = "Corrupt log message";
            strType = "System";
            strTag = "DEBUG";
            var now = new Date();
            strTime = now.toLocaleString( 'en-GB', {
                day: 'numeric',
                year: 'numeric',
                month: 'short', 
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short'
                });
        }

        // Add the row
        table.row.add( [
            table.rows().count()+1,
            strTime,
            strType,
            strTag,
            strMsg,
            strHeap
        ] ).draw();
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
            timeZoneName: 'short'
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
    if( topicparts[6] == "repo" ) {

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
            timeZoneName: 'short'
        });
        // TODO implement moment.js for all date handling

    }

    // Update current relese on device
    document.getElementById("curRelease").innerHTML = thisDevice.release;
    document.getElementById("curEnv").innerHTML = thisDevice.environment+" ("+thisDevice.build+")";

    if( topicparts[6] == "time" ) {
        var timestamp = new Date(thisDevice.timestamp);
        document.getElementById("curTimestamp").innerHTML = timestamp.toLocaleString( 'en-GB', {
            day: 'numeric',
            year: 'numeric',
            month: 'short', 
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
            });
    }

    // Set status of auto firmware updater
    if( thisDevice.update ) $('#autoupdate').bootstrapToggle('on');
    else $('#autoupdate').bootstrapToggle('off');

    // Set serial and peripheral detils
    document.getElementById("device-serial").innerHTML = thisDevice.serial;
    document.getElementById("device-peri").innerHTML = thisDevice.peripherals;

    // Set board type
    if( topicparts[6] == "brd" ) {
        var board = coreBoardTypes.find( board => board.code === thisDevice.board );

        if( board == undefined ) {
            document.getElementById("device-proc").innerHTML = "Unknown";
            document.getElementById("device-board").innerHTML = "Unknown";  
        } else {
            document.getElementById("device-proc").innerHTML = board.processor;
            document.getElementById("device-board").innerHTML = board.name;  
        }

    }

    // Update title
    if( thisDevice.title == "" ) document.getElementById("device-title").innerHTML = thisDevice.name+" - ID: "+thisDevice.id;
    else document.getElementById("device-title").innerHTML = thisDevice.title+" ("+thisDevice.name+" - ID: "+thisDevice.id+")";

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
        document.getElementById("device-title").innerHTML = thisDevice.name+" - ID: "+thisDevice.id;

        var app = coreAppList.find( app => app.code === thisDevice.app );

        if( app == undefined ) {
            document.getElementById("app-name").innerHTML = "Unknown";
            document.getElementById("app-desc").innerHTML = "Unknown";
        } else {
            document.getElementById("app-name").innerHTML = app.name;
            document.getElementById("app-desc").innerHTML = app.description;
            document.getElementById("app-launch").setAttribute("href",app.url+"?device="+thisDevice.id);
        }

        coreGetDeviceEnv( deviceCode ,deviceID, callEnvUpdate );                                 // Now subscribe to full device env/
        coreStartLogging( deviceCode, deviceID, callLogUpdate );         // Subscribe to log/
    }

    // Update status and controls

    if( thisDevice.status ) {
        $("#device-status").css("background","green");
        $("#app-launch").removeClass("disabled");
    } else {
        $("#device-status").css("background","red");
        $("#app-launch").addClass("disabled");
    }
    
    // Log this message if logging MQTT
    if( logMQTTEnabled ) logMQTT( topic,msg );

}


/**
 * Called (by core) when known device has been deleted
 * @param {string} code            Device code
 * @param {string} id              Device ID
 */
 function callDeviceDeleted( code, id ) {

    console.log("Deleted")      // TODO handle what happens if device deleted while on conf page

}


/**
 * Called when connected to broker
 */
function callNowConnected() {

    // Subscribe to status topic
    coreFindKnownDevice( deviceCode, deviceID, callUpdateDevice );

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
    ///////////////////

    // Logging MQTT toggle change
    $('#logMQTT').change(function() {
      logMQTTEnabled = $(this).prop('checked');
    });

    // Auto update firmware toggle clicked
    $('#autoupdate').closest('.togglewrapper').on('click',function(e) {

        // Stop togge toggling until dialog completes
        e.preventDefault(); e.stopPropagation();

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = $(this).find('input').prop('checked') ? "Turn off firmware auto update" : "Turn on firmware auto update";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){

            // TODO - Don't toggle this in real life, let message acknowledge update this
            $('#autoupdate').bootstrapToggle('toggle');

            // TODO - replace with send MQTT message
            console.log($('#autoupdate').prop('checked') ? "Turn on firmware auto update" : "Turn off firmware auto update");
        
        };

        $('#dlgConfirm').modal('show');

    });

    // Logging ticker toggle clicked
    $('#logTicker').closest('.togglewrapper').on('click',function(e) {

        // Stop togge toggling until dialog completes
        e.preventDefault(); e.stopPropagation();

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = $(this).find('input').prop('checked') ? "Turn ticker off" : "Turn ticker on";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){

            // TODO - Don't toggle this in real life, let message acknowledge update this
            $('#logTicker').bootstrapToggle('toggle');

            // TODO - replace with send MQTT message
            console.log($('#logTicker').prop('checked') ? "Turn ticker on" : "Turn ticker off");
        
        };

        $('#dlgConfirm').modal('show');

    });

    // Logging on/off toggle clicked
    $('#logOn').closest('.togglewrapper').on('click',function(e) {

        // Stop togge toggling until dialog completes
        e.preventDefault(); e.stopPropagation();

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = $(this).find('input').prop('checked') ? "Turn off logging" : "Turn on logging";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){

            // TODO - Don't toggle this in real life, let message acknowledge update this
            $('#logOn').bootstrapToggle('toggle');

            // TODO - replace with send MQTT message
            console.log($('#logOn').prop('checked') ? "Turn on logging" : "Turn off logging");
        
        };

        $('#dlgConfirm').modal('show');

    });

    // Update firmware clicked
    $('#requestupdate').on('click',function(e) {
        
        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Update firmware now";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title);
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Update restart clicked
    $('#requestrestart').on('click',function(e) {
    
        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Restart device now";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title);
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Reset all settings clicked
    $('#requestrstall').on('click',function(e) {

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Reset all settings";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title);
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Reset network settings clicked
    $('#requestrstnetwork').on('click',function(e) {

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Reset network settings";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title);
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Reset time/locatiom settings clicked
    $('#requestrsttimeloc').on('click',function(e) {

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Reset time/locatiom settings";
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title);
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Set logging level to critical
    $('#logLevel').find('.btn').on('click',function(e) {
        e.preventDefault(); e.stopPropagation();

        // Nasty way to find out which button is pressed
        var levelName = this.getElementsByTagName('span')[0].innerHTML
        var btnGroup = this.parentNode.getElementsByTagName('label');
        var level;
        for( level = 0; level < btnGroup.length; level++ ) {
            if( btnGroup[level].getElementsByTagName('span')[0].innerHTML == this.getElementsByTagName('span')[0].innerHTML ) break;
        }

        // Setup confirm modal
        modaloptions.btnPrimary = "Yes";
        modaloptions.btnSecondary = "Cancel";
        modaloptions.title = "Set level to "+levelName;
        modaloptions.message = "Are you sure?";
        modaloptions.callPrimary = function(){
            // TODO - replace with send MQTT message
            console.log(modaloptions.title + " ("+level+")");
        };

        $('#dlgConfirm').modal('show');
        
    });

    // Set up modal listeners

    var id = "#dlgConfirm";
    $(id).find('.btn-primary').on('click',function(){
        modaloptions.callPrimary();
    });
    $(id).find('.btn-secondary').on('click',function(){
        modaloptions.callSecondary();
    });
    $(id).find('.close').click(function(){
        modaloptions.callClose();
    }); 
    $(id).on('show.bs.modal', function() {
        // Update modal
        $(id).find('.modal-title').html(modaloptions.title);
        $(id).find('.modal-body').html(modaloptions.message);
        $(id).find('.btn-primary').html(modaloptions.btnPrimary);
        $(id).find('.btn-secondary').html(modaloptions.btnSecondary);
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
