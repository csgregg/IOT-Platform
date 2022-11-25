/**
 * @file        mqttclilent.js
 * @author      Chris Gregg
 * 
 * @brief       Wrapper class for paho-MQTT
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

// Load secrets
var secrets = new varpasser(us_url_root+"core/secrets/private/secrets.php");

// Globals
var mqtt;
var connectedFlag = false;      // Is the broker currently connected
var reconnectTimeout = 2000;

// Broker details
var mqttHost = "";
var mqttPort = 0;
var mqttSSL = true;
var mqttUsername = "";
var mqttPwd = "";
var cleanSession = true;

// Handlers for connection
var connectSuccessHandler;
var connectFailureHandler;

var statusBar;              // Page element for status messages

var subscriptions = [];     /** Array of subscriptions
                             *   {
                             *       "topic" : topic,
                             *       "sqos" : sqos,
                             *       "handler" : handler
                             *   }
                             */ 

/**
 * Called when connection lost
 */
function onMQTTConnectionLost(){
    var msg = "MQTT Connection Lost";
    console.log(msg);
    document.getElementById(statusBar).innerHTML = msg;

    connectedFlag = false;
}

/**
 * Called when connecting fails
 * @param {string} message          String containing error
 */
function onMQTTConnectionFailure(message) {
    var msg = "Connection Failure : " + message + " - Retrying";
    console.log(msg);
    document.getElementById(statusBar).innerHTML = msg;

    connectedFlag = false;
    setTimeout(MQTTConnect, reconnectTimeout);
}

/**
 * Called when message arrives
 * @param {string} r_message          String containing message
 */
function onMQTTMessageArrived(r_message){
    subscriptions.forEach( sub => { 
        if( topicMatchesTopicFilter(sub.topic,r_message.destinationName) )
            sub.handler(r_message.destinationName,r_message.payloadString);
        }
    );
}

/**
 * Called when connected
 * @param {string} recon
 * @param {string} url
 */
function onMQTTConnected(recon,url){
    var msg = " in onMQTTConnected " + recon;
    console.log(msg);
    document.getElementById(statusBar).innerHTML = msg;
}

/**
 * Called when connecting succeeds
 */
function onMQTTConnectionSuccess() {
    var msg = "Connected";
    console.log(msg);
    document.getElementById(statusBar).innerHTML = msg;

    connectedFlag = true;
    connectSuccessHandler();
}

/**
 * Called when disconnection occurs
 */
function MQTTDisconnect() {
    if ( connectedFlag ) {
        var msg = "Disconnecting from : " + mqttHost;
        console.log(msg);
        document.getElementById(statusBar).innerHTML = msg;
        mqtt.disconnect();
    }
}

/**
 * Connects to MQTT Broker
 * @param {string} host                 Broker host name
 * @param {int} port                    Broker port
 * @param {string} username             Broker username
 * @param {string} password             Broker password
 * @param {bool} ssl                    Is broker requiring SSL connection (bool)
 * @param {bool} clean                  Is this a clean session (bool)
 * @param {funciton} successhandler     Handler called when connection succeeds
 * @param {function} failurehandler     Handler called when connection fails
 * @param {string} statusbar            Page element for status messages
 */
function MQTTConnect( clean, successhandler, failurehandler, statusbar ) {

    mqttHost = secrets.getSecret("broker_host");                // Host
    mqttPort = parseInt(secrets.getSecret("broker_port"));      // Port
    mqttUsername = secrets.getSecret("broker_user");            // Username
    mqttPwd = secrets.getSecret("broker_pwd");                  // Password
    mqttSSL = (secrets.getSecret("broker_ssl") == "true");      // SSL

    cleanSession = clean;
    
    connectSuccessHandler = successhandler;
    connectFailureHandler = failurehandler;

    statusBar = statusbar;

    console.log("Connecting to MQTT Broker : " + mqttHost + " on mqttPort " + mqttPort + " with Clean Session = " + cleanSession);

    var x = Math.floor(Math.random() * 10000); 
    var clientName = "iotplatform-"+x;;

    mqtt = new Paho.MQTT.Client(mqttHost, mqttPort, clientName);

    var options = {
        timeout: 3,
        cleanSession: cleanSession,
        onSuccess: onMQTTConnectionSuccess,
        onFailure: onMQTTConnectionFailure,
        useSSL: mqttSSL
    };

    if( mqttUsername != "" )
        options.userName = mqttUsername;
    if( mqttPwd != "" )
        options.password = mqttPwd;

    mqtt.onConnectionLost = onMQTTConnectionLost;
    mqtt.onMessageArrived = onMQTTMessageArrived;
    mqtt.onConnected = onMQTTConnected;

    mqtt.connect(options);
    return false;
}

/**
 * Subscribe to a topic
 * @param {string} stopic           Topic string
 * @param {int} soptions         QoS for topic
 * @param {function} handler        Handler to be called when matching message arrives
 */
function MQTTSubTopic(stopic,sqos,handler){

    if ( !connectedFlag ){
        console.log("Not Connected to MQTT Broker so can't subscribe");
        return false;
    }

    if (sqos>2) sqos=0;

    console.log("Subscribing to MQTT topic = " + stopic + " QOS " + sqos);

    var soptions = {
        qos:sqos,
    };

    subscriptions.push(
        {
            "topic" : stopic,
            "sqos" : sqos,
            "handler" : handler
        }
    );

    mqtt.subscribe(stopic,soptions);

    return false;
}

/**
 * Send a message
 * @param {string} msg      Message to send
 * @param {int} pqos        QoS
 * @param {string} topic    Topic string
 * @param {bool} retain     Message retention
 */
function MQTTSendMessage(msg,pqos,topic,retain){

    if ( !connectedFlag ){
        console.log("Not Connected to MQTT Broker so can't send");
        return false;
    }

    if (pqos>2) pqos=0;

    console.log("Sending MQTT Message : " + msg);

    if (retain)
        retain_flag = true;
    else
        retain_flag = false;

    message = new Paho.MQTT.Message(msg);

    if ( topic == "" ) message.destinationName = "test-topic";
    else message.destinationName = topic;

    message.qos = pqos;
    message.retained = retain_flag;

    mqtt.send(message);

    return false;
}



/**
 * Return a boolean indicating whether the topic filter the topic.
 * @param {string} topicFilter
 * @param {string} topic
 */
function topicMatchesTopicFilter(topicFilter, topic) {

    // convert topic filter to a regex and see if the incoming topic matches it
    topicFilterRegex = convertMqttTopicFilterToRegex(topicFilter);
    match = topic.match(topicFilterRegex);

    // if the match index starts at 0, the topic matches the topic filter
    if (match && match.index == 0) {

    // guard: check edge case where the pattern is a match but the last character is *
    if (topicFilterRegex.lastIndexOf("*") == topic.length - 1) {
        // if the number of topic sections are not equal, the match is a false positive
        if (topicFilterRegex.split("/").length != topic.split("/").length) {
        return false;
        }
    }
    // if no edge case guards return early, the match is genuine
    return true;

    }

    // else the match object is empty, and the topic is not a match with the topic filter
    else {
    return false;
}
}

/**
 * Convert MQTT topic filter wildcards and system symbols into regex
 * Useful resource for learning: https://regexr.com/
 * @param {string} topicFilter
 */
function convertMqttTopicFilterToRegex(topicFilter) {
    // convert single-level wildcard + to .*, or "any character, zero or more repetitions"
    topicFilterRegex = topicFilter.replace(/\+/g, ".*").replace(/\$/g, ".*");
    // convert multi-level wildcard # to .* if it is in a valid position in the topic filter
    if (topicFilter.lastIndexOf("#") == topicFilter.length - 1) {
        topicFilterRegex = topicFilterRegex
        .substring(0, topicFilterRegex.length - 1)
        .concat(".*");
    }
    // convert system symbol $ to .

    return topicFilterRegex;
}