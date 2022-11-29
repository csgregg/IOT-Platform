


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
            devicestatus.setAttribute("class","statusdot mr-3");
            if( dev.status ) devicestatus.setAttribute("style", "background:green;");
            else devicestatus.setAttribute("style", "background:red;");

            devicestatusname.appendChild(devicestatus);
            devicestatusname.innerHTML += dev.name;

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



function handlerUpdateDevices( topic, msg ){
    handlerKnownDevice(topic,msg);
    updateDeviceList();
}


/**
 * Called when connected to broker
 */
function nowConnected() {

    // Subscribe to status topic
    MQTTSubTopic("devices/+/+/status", 0, handlerUpdateDevices );
}

// Run on page load
window.addEventListener("load", function() {

    // Connect to broker
    MQTTConnect(

        true,                                           // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
