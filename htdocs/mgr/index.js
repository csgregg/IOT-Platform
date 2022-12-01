/**
 * @file        index.js        (/mgr)
 * @author      Chris Gregg
 * 
 * @brief       Functionality for default page of Device Manager
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


//////////////
// UI Handling


/**
 * Called to update UI
 */
function updateDeviceList() {

    var deviceLister = document.getElementById("device-lister");

    // Add each App type
    coreAppList.forEach(function(app, index) {

        var appcontainer = document.getElementById("app-"+app.code);

        if( appcontainer == null ){         // Create app container each app type

            var newappcontainer = document.createElement("div");
            newappcontainer.setAttribute("id","app-"+app.code);
            newappcontainer.setAttribute("class","container border-top border-dark pt-3 pl-4 pb-3 pr-4");

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

    coreKnownDevices.forEach(function(dev, index) {         // Add or update each known device in turn

        var devicecard = document.getElementById("device-"+dev.code+"-"+dev.id);
        var thisapp = coreAppList.find(thisapp => thisapp.code === dev.app);            // TODO Error checking

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
            devicestatus.setAttribute("class","statusdot mr-3");

            if( dev.status ) devicestatus.setAttribute("style", "background:green;");
            else devicestatus.setAttribute("style", "background:red;");

            devicestatusname.appendChild(devicestatus);
            var devicetitle = document.createElement("span");
            devicetitle.setAttribute("id","device-"+dev.code+"-"+dev.id+"-title");
            devicetitle.innerHTML = dev.name;
            devicestatusname.appendChild(devicetitle);

            var deviceconf = document.createElement("a");
            deviceconf.setAttribute("id","device-"+dev.code+"-"+dev.id+"-conf");
            deviceconf.setAttribute("class","pull-right");
            deviceconf.setAttribute("href","conf.php?code="+dev.code+"&id="+dev.id);
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
            devicetext.setAttribute("class","card-text mb-3");
            devicetext.innerHTML = dev.description;

            var applaunch = document.createElement("a");
            applaunch.setAttribute("id","device-"+dev.code+"-"+dev.id+"-launch");
            applaunch.setAttribute("class","btn btn-primary");
            applaunch.setAttribute("href",thisapp.url+"?device="+dev.id);
            applaunch.setAttribute("target","_blank");
            applaunch.innerHTML = "Open &raquo;";

            newcardhbody.appendChild(devicetext);
            newcardhbody.appendChild(applaunch);
            newdevicecard.appendChild(newcardhbody);

            // Add card to deck
            var appdeck = document.getElementById("app-"+dev.app+"-devices");
            appdeck.appendChild(newdevicecard);

            MQTTSubTopic("iot/devices/"+dev.code+"/ids/"+dev.id+"/env/title", 0, callUpdateTitle );

        } else {

            // Update status
            var updatestatus = document.getElementById("device-"+dev.code+"-"+dev.id+"-status");

            if( dev.status ) updatestatus.setAttribute("style","background:green;");
            else updatestatus.setAttribute("style","background:red;");

        }

    });

}


/////////////////
// Event Handling


/**
 * Called to update devices
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
 function callUpdateDevices( topic, msg ){

    callCoreUpdateKnownDevice(topic,msg);           // Register this device in the known devices
    updateDeviceList();                             // Update UI

}


/**
 * Called (by core) when known device has been deleted
 * @param {string} code            Device code
 * @param {string} id              Device ID
 */
 function callDeviceDeleted( code, id ) {

    document.getElementById( "device-"+code+"-"+id ).remove();              // Remove the card

}


/**
 * Called to update device
 * @param {string} topic            Received topic
 * @param {string} msg              Received message
 */
 function callUpdateTitle( topic, msg ){

    callCoreDeviceEnv( topic, msg ); 
    
    const topicparts = topic.split("/");
    var code = topicparts[2];
    var id = topicparts[4];
    
    document.getElementById( "device-"+code+"-"+id+"-title" ).innerHTML = msg;

}

/**
 * Called when connected to broker
 */
 function callNowConnected() {
    
    MQTTSubTopic("iot/devices/+/ids/+/online", 0, callUpdateDevices );      // Subscribe to status topic // TODO - move to function in core with callback
    
}


/**
 * Called when DOM is ready (page loaded)
 */
$(function() {

    // Connect to broker
    MQTTConnect(
        true,                   // Clean session
        callNowConnected,       // Connect success callback
        function(){},           // Dummy connect failure callback
        "status"                // Element for status messages
    );

});
