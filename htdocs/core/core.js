/**
 * @file        core.js
 * @author      Chris Gregg
 * 
 * @brief       Core functions for device handling
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

// Known device types
var coreDeviceTypes = [
    {
        code        : "rota",
        name        : "Remote OTA Test",
        description : "A device which does something",
        app         : "rota"
    }
];

// Known installed apps
var coreAppList = [
    {
        code        : "rota",
        name        : "ROTA App",
        description :  "An app which does something",
        url         : "../apps/rota"
    }
];

// Known board types
var coreBoardTypes = [
    {
        code        : "d1_mini",
        name        : "Wemos D1 Mini",
        processeor  : "ESP8266"
    }
]

// All knowns devices
var coreKnownDevices = [];


//////////////////////////
// Known device management

/**
 * Callback to update device enviroment data
 * - called from MQTT message arriving with +/+/+/env/#
 * @param {string} topic        String containing MQTT topic
 * @param {string} msg          String containing MQTT topic
 */
function callCoreDeviceEnv( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");
    var code = topicparts[1];
    var id = topicparts[2]

    // TODO - error checking
    var thisdevice = coreKnownDevices.find( thisdevice => ( thisdevice.code === code ) && ( thisdevice.id === id ) );

    if( topicparts[4] == "proc" )   thisdevice.processeor = msg;
    if( topicparts[4] == "brd" )    thisdevice.board = msg;
    if( topicparts[4] == "peri" )   thisdevice.peripherals = msg;
    if( topicparts[4] == "rel" )    thisdevice.release = msg;
    if( topicparts[4] == "bld" )    thisdevice.build = msg;
    if( topicparts[4] == "env" )    thisdevice.environment = msg;
    if( topicparts[4] == "time" )   thisdevice.timestamp = msg;
    if( topicparts[4] == "up" )     thisdevice.update = ( msg == "true" );
    if( topicparts[4] == "serl" )   thisdevice.serial = msg;
    if( topicparts[4] == "repo" )   thisdevice.repo = msg;

}


/**
 * Called when matching status topic found for a device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
function callCoreUpdateKnownDevice( topic, msg ) {

    // Device details
    const topicparts = topic.split("/");
    var code = topicparts[1];
    var id = topicparts[2]
    var online = msg.toLowerCase() == "online";
    var name;
    var app;
    var description;

    // Do we already know about this one?
    var devfound = coreKnownDevices.findIndex( devfound => devfound.statustopic === topic );

    if( msg == "" ) {

        // If blank message then forget device
        if( devfound != -1 ) {
            coreKnownDevices.splice(devfound, 1);
            callDeviceDeleted(code,id);                 // Call page function (needs to exist) TODO - error handling
        }

    } else {
        if( devfound == -1 ) {      // New device

            var thisdevice = coreDeviceTypes.find(thisdevice => thisdevice.code === code);

            if( thisdevice == undefined ) {             // Don't know this device code
                name = "Unrecognised";
                description = ""
                code = "";
            } else {
                name = thisdevice.name;
                description = thisdevice.description;
                app = thisdevice.app;
            }

            coreKnownDevices.push(                      // Add device to known devices
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
                    serial      : "",
                    repo        : ""
                }
            );
        } else {
            // Already nown device
            coreKnownDevices[devfound].status = online;
        }
    }

}


///////////////////////////
// Misc functions and fixes

/**
 * Fixes bug with Toggle not sizing correctly when initially hidden
 */
function coreFixToggle(object,source) {

    document.getElementById(object).parentElement.style.width =  document.getElementById(source).parentElement.style.width;
    document.getElementById(object).parentElement.style.height =  document.getElementById(source).parentElement.style.height;
    document.getElementById(object).parentElement.style.lineHeight =  document.getElementById(source).parentElement.style.lineHeight;

}


$(function() {

    var repo = "IOT-Platform";
    var repouser = "csgregg";

    var githubrepo = new githubassetfetcher( repo, repouser );
    var latestRelease = githubrepo.getLatestRelease();
    var timestamp = new Date(latestRelease.date);

    var time = timestamp.toLocaleString( 'en-GB', {
        day: 'numeric',
        year: 'numeric',
        month: 'short', 
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });

    var buildMessage = "<br>GitHub: "+repouser+"/"+repo+" "+"Release: "+latestRelease.tag+" "+time;
    $("#footer").children("p").append(buildMessage);
    $("#footer").children("p").wrap("<small><small>");
});
