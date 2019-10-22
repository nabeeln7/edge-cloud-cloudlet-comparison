var noble = require("noble");
var mqtt  = require('mqtt');
var request = require('request');

var MQTT_TOPIC_NAME = 'mock-sensor-data';
var mqtt_client = mqtt.connect('mqtt://localhost');

cloudIP = "198.199.83.16";
cloudPort = 5000;
cloudletIP = "172.27.44.129";
cloudletPort = 5000;

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

function handleDiscoveredPeripheral(peripheral) {
  if (!peripheral.advertisement.manufacturerData) {
    // console.log("[BLE Radio] Peripheral discovered: " + peripheral.address);
    
    const localName = peripheral.advertisement.localName;
    if(!(typeof localName === "undefined")) {
      var data = localName.toString('utf8');
      if (data.startsWith('mock-sensor')) {
        // console.log(`[BLE Radio] Received advertisement data = ${data}`);
        
        //record the time of receiving the sensor data
        receiveTime = new Date().getTime();
        packetTs = parseInt(data.split("#")[1]);
        latency = receiveTime - packetTs;
        console.log(`${packetTs}\t${latency}`);

        //send stuff to the http server
        request.get(`http://${cloudletIP}:${cloudletPort}/record?packetTs=${packetTs}`);

        //publish packet in mqtt topic
        mqtt_client.publish(MQTT_TOPIC_NAME, JSON.stringify(data));
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
});