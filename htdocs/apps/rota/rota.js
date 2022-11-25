// Load secrets
secrets = new varpasser("../../core/secrets/private/secrets.php");

/**
 * Called when connected to broker
 */
function nowConnected() {

}

// Run on page load
window.addEventListener("load", function() {

    // Connect to broker
    MQTTConnect(
        secrets.getSecret("hivemq_host"),               // Host
        parseInt(secrets.getSecret("hivemq_port")),     // Port
        secrets.getSecret("hivemq_user"),               // Username
        secrets.getSecret("hivemq_pwd"),                // Password
        (secrets.getSecret("hivemq_ssl") == "true"),    // SSL
        true,                                           // Clean session

        nowConnected,           // Connect success handler
        function(){},           // Dummy connect failure handler

        "status"                // Element for status messages
    );

});
