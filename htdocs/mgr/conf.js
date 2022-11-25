

/**
 * Called when connected to broker
 */
function nowConnected() {


}

// Run on page load
window.addEventListener("load", function() {

    // Connect to broker
    MQTTConnect(

        true,                  // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
