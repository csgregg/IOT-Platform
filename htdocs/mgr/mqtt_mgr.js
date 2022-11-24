secrets = new varpasser("secrets/private/secrets.php");



var connected_flag=0	
var mqtt;
var reconnectTimeout = 2000;
var host="";
var port=0;
var row=0;
var out_msg="";
var mcount=0;

var subscriptions = [];
var devices = [];

var deviceTypes = [
    {
        "code" : "rota",
        "name" : "Remote OTA Test",
        "app" : "rota"
    }
];

var applist = [
    {
        "code" :  "rota",
        "name" : "ROTA App",
        "url" : "../apps/rota"
    }
];


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


function onMQTTConnectionLost(){
    console.log("MQTT Connection Lost");
    document.getElementById("status").innerHTML = "Connection Lost";
    connected_flag=0;
}

function onMQTTConnectionFailure(message) {
    console.log("MQTT Failure : " + message + " - Retrying");
    setTimeout(MQTTConnect, reconnectTimeout);
}



function handlerKnownDevice( topic, msg ) {

    var table = document.getElementById("devicelist");
    const topicparts = topic.split("/");

    var found = null;
    for (const row of table.rows) {  
          if(row.cells[0].innerText == topic) found = row;
    }

    if( msg == "" ) {
        if( found != null ) found.remove();
    } else
    {
        if( found == null) {
            var rowCount = table.rows.length;
            found = table.insertRow(rowCount);
        
            found.insertCell(0);
            found.insertCell(1);
            found.insertCell(2);
            found.insertCell(3);

            found.cells[0].innerHTML = topic;
            found.cells[0].style="display:none;"

            thisdevice = deviceTypes.find(thisdevice => thisdevice.code === topicparts[1]);

            if( thisdevice !== undefined ){
                thisapp = applist.find(thisapp => thisapp.code === thisdevice.app);
                if( thisapp !== undefined)
                {           
                    var applink = document.createElement('a');
                    var linkText = document.createTextNode(thisapp.name);
                    applink.appendChild(linkText);
                    applink.title = "Device Application";
                    applink.href = thisapp.url + "?deviceID=" + topicparts[2];
                    applink.target = "_blank";
                    found.cells[2].appendChild(applink);

                } else {
                    found.cells[2].innerHTML = "Unknown App";
                }

            } else {
                found.cells[2].innerHTML = "Unknown Device";
            }
         
            found.cells[3].innerHTML = "Device ID : " + topicparts[2];

        }

        if( msg == "Online" )
        {
            found.cells[1].innerHTML = "<span class='statusdot' style='background:green'></span>"
        }
        else
        {
            found.cells[1].innerHTML = "<span class='statusdot' style='background:red'></span>"
        }
    }

}

function handlerStatusMessage( topic, msg ) {
    out_msg="Message received "+msg;
    out_msg=out_msg+"      Topic "+topic +"<br/>";
    out_msg="<b>"+out_msg+"</b>";

    try{
        document.getElementById(messageBar).innerHTML+=out_msg;
    }
    catch(err){
        document.getElementById(messageBar).innerHTML=err.message;
    }

    if (row==10){
        row=1;
        document.getElementById(messageBar).innerHTML=out_msg;
        }
    else
        row+=1;
        
    mcount+=1;
}

function onMQTTMessageArrived(r_message){

    subscriptions.forEach( sub => { 
        if( topicMatchesTopicFilter(sub.topic,r_message.destinationName) )
            sub.handler(r_message.destinationName,r_message.payloadString);
        }
    );
}
            
function onMQTTConnected(recon,url){
    // console.log(" in onMQTTConnected " + recon);
}

function onMQTTConnectionSuccess() {
    // Once a connection has been made, make a subscription and send a message.
    connected_flag=1;
    document.getElementById("status").innerHTML = "Connected";
    console.log("Connected to MQTT Broker : " + host + " on port " + port);

    MQTTSubTopic("devices/+/+/status",0,handlerKnownDevice);
}

function MQTTDisconnect(){
    if (connected_flag==1) {
        console.log("Disconnecting from MQTT Broker : " + host);
        mqtt.disconnect();
    }
}
    
function MQTTConnect() {

    var clean_sessions=true;

    host = secrets.getSecret("hivemq_host");
    port = parseInt(secrets.getSecret("hivemq_port"));
    user_name = secrets.getSecret("hivemq_user");
    password = secrets.getSecret("hivemq_pwd");

    console.log("Connecting to MQTT Broker : " + host + " on port " + port + " with Clean Session = " + clean_sessions);

    var x=Math.floor(Math.random() * 10000); 
    var cname="orderform-"+x;

    mqtt = new Paho.MQTT.Client(host,port,cname);

    var options = {
        timeout: 3,
        cleanSession: clean_sessions,
        onSuccess: onMQTTConnectionSuccess,
        onFailure: onMQTTConnectionFailure,
        useSSL: true,
    };

    if (user_name !="")
        options.userName = secrets.getSecret("hivemq_user");
    if (password !="")
        options.password = secrets.getSecret("hivemq_pwd");

    mqtt.onConnectionLost = onMQTTConnectionLost;
    mqtt.onMessageArrived = onMQTTMessageArrived;
    mqtt.onConnected = onMQTTConnected;

    mqtt.connect(options);
    return false;
}


function MQTTSubTopic(stopic,sqos,handler){

    if (connected_flag==0){
        console.log("Not Connected to MQTT Broker so can't subscribe");
        return false;
    }

    if (sqos>2) sqos=0;

    console.log("Subscribing to MQTT topic = " + stopic + " QOS " + sqos);

    var soptions={
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

function MQTTSendMessage(msg,pqos,topic,retain){

    if (connected_flag==0){
        console.log("Not Connected to MQTT Broker so can't send");
        return false;
    }

    if (pqos>2) pqos=0;

    console.log("Sending MQTT Message : " + msg);

    if (retain)
        retain_flag=true;
    else
        retain_flag=false;

    message = new Paho.MQTT.Message(msg);

    if (topic=="") message.destinationName = "test-topic";
    else message.destinationName = topic;

    message.qos=pqos;
    message.retained=retain_flag;

    mqtt.send(message);

    return false;
}




function loadKnownDevices() {
    MQTTSubTopic()
}

    


window.addEventListener("load", function() {
    MQTTConnect();

});
