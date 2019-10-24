var noble = require("noble");
var mqtt  = require('mqtt');
var request = require('request');

var MQTT_TOPIC_NAME = 'mock-sensor-data';
var ACK_MQTT_TOPIC_NAME = 'ack-topic';
var mqtt_client = mqtt.connect('mqtt://localhost');

cloudIP = "198.199.83.16";
cloudPort = 5000;

cloudletIP = "172.27.44.129";
cloudletPort = 5000;

// packetTs => sendTime
pendingACKPackets = {}

function getCurrentDateTime() {
  return new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
}

function logWithTs(log) {
  console.log(`[${getCurrentDateTime()}] ${log}`);
}

function handleNobleStateChange(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
    // logWithTs("[BLE Radio] Started peripheral discovery");
  } else if(state === 'poweredOff'){
    noble.stopScanning();
  }
}

function sendToServer(ipAdrr, port, label) {
  var cloudStartTime = Date.now();
  request.get(`http://${ipAdrr}:${port}/record?packetTs=1234`, function (error, response, body) {
    var cloudEndTime = Date.now();
    console.log(`${label} latency = ${cloudEndTime - cloudStartTime}`);
  });
}

function handleDiscoveredPeripheral(peripheral) {
  if (!peripheral.advertisement.manufacturerData) {
    // console.log("[BLE Radio] Peripheral discovered: " + peripheral.address);
    
    const localName = peripheral.advertisement.localName;
    if(!(typeof localName === "undefined")) {
      var data = localName.toString('utf8');
      if (data.startsWith('mock-sensor')) {
        // console.log(`[BLE Radio] Received advertisement data = ${data}`);
        
        sendToServer(cloudIP, cloudPort, "cloud")
        sendToServer(cloudletIP, cloudletPort, "cloudlet")
        

        //publish packet in mqtt topic
        receiveTime = Date.now();
        mqtt_client.publish(MQTT_TOPIC_NAME, JSON.stringify(data));
        pendingACKPackets[packetTs] = receiveTime;
      }
    }
  }
}

console.log('#packetTs\tlatency');
mqtt_client.on('connect', function () {
    //start discovering BLE peripherals
    //we do noble's listener initialization here as there's a dependency on ranging key and iv
    noble.on('stateChange', handleNobleStateChange);
    noble.on('discover', handleDiscoveredPeripheral);

    client.subscribe(ACK_MQTT_TOPIC_NAME);
});

client.on('message', (topic, message) => {
  if(topic === ACK_MQTT_TOPIC_NAME) {
    data = JSON.parse(message.toString());

    //record the time of receiving the ack
    ackReceiveTime = Date.now();
    packetTs = parseInt(data.split("#")[1]);
    
    receiveTime = pendingACKPackets[packetTs]
    latency = ackReceiveTime - receiveTime;
    console.log(`mqtt ack received for ${packetTs} latency = ${latency}`);

    delete pendingACKPackets[packetTs]
  }
});