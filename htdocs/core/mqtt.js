var connected_flag=0	
var mqtt;
var reconnectTimeout = 2000;
var host="";
var port=0;
var row=0;
var out_msg="";
var mcount=0;


function onMQTTConnectionLost(){
    console.log("MQTT Connection Lost");
    document.getElementById("status").innerHTML = "Connection Lost";
    connected_flag=0;
}

function onMQTTConnectionFailure(message) {
    console.log("MQTT Failure - Retrying");
    setTimeout(MQTTConnect, reconnectTimeout);
}

function onMQTTMessageArrived(r_message){
    out_msg="Message received "+r_message.payloadString;
    out_msg=out_msg+"      Topic "+r_message.destinationName +"<br/>";
    out_msg="<b>"+out_msg+"</b>";

    try{
        document.getElementById("out_messages").innerHTML+=out_msg;
    }
    catch(err){
    document.getElementById("out_messages").innerHTML=err.message;
    }

    if (row==10){
        row=1;
        document.getElementById("out_messages").innerHTML=out_msg;
        }
    else
        row+=1;
        
    mcount+=1;
}
            
function onMQTTConnected(recon,url){
    console.log(" in onMQTTConnected " + recon);
}

function onMQTTConnectionSuccess() {
    // Once a connection has been made, make a subscription and send a message.
    connected_flag=1;
    document.getElementById("status").innerHTML = "Connected";
    console.log("Connected to MQTT Broker : " + host + " on port " + port);
}

function MQTTDisconnect(){
    if (connected_flag==1) {
        console.log("Disconnecting from MQTT Broker : " + host);
        mqtt.disconnect();
    }
}
    
function MQTTConnect() {

    var clean_sessions=true;

    host = hivemq_host;
    port = parseInt(hivemq_port);
    user_name = hivemq_user;
    password = hivemq_pwd;

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
        options.userName=hivemq_user;
    if (password !="")
        options.password=hivemq_pwd;

    mqtt.onConnectionLost = onMQTTConnectionLost;
    mqtt.onMessageArrived = onMQTTMessageArrived;
    mqtt.onConnected = onMQTTConnected;

    mqtt.connect(options);
    return false;
}


function MQTTSubTopic(){

    if (connected_flag==0){
        console.log("Not Connected to MQTT Broker so can't subscribe");
        return false;
    }
    var stopic= document.forms["subs"]["Stopic"].value;

    var sqos=parseInt(document.forms["subs"]["sqos"].value);
    if (sqos>2)
        sqos=0;
    console.log("Subscribing to MQTT topic = " + stopic + " QOS " + sqos);

    var soptions={
    qos:sqos,
    };
    mqtt.subscribe(stopic,soptions);
    return false;
}

function MQTTSendMessage(){
    if (connected_flag==0){
        console.log("Not Connected to MQTT Broker so can't send");
        return false;
    }
    var pqos=parseInt(document.forms["smessage"]["pqos"].value);
    if (pqos>2)
        pqos=0;
    var msg = document.forms["smessage"]["message"].value;
    console.log("Sending MQTT Message : " + msg);

    var topic = document.forms["smessage"]["Ptopic"].value;
    //var retain_message = document.forms["smessage"]["retain"].value;
    if (document.forms["smessage"]["retain"].checked)
        retain_flag=true;
    else
        retain_flag=false;
    message = new Paho.MQTT.Message(msg);
    if (topic=="")
        message.destinationName = "test-topic";
    else
        message.destinationName = topic;
    message.qos=pqos;
    message.retained=retain_flag;
    mqtt.send(message);
    return false;
}
    
        
