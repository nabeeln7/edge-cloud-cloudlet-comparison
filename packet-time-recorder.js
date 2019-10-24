// given a sensor-id and a source-ip-address, listens to mqtt on that ip address and records the time that the packets were received
const mqtt = require('mqtt')

var ACK_MQTT_TOPIC_NAME = 'ack-topic';

sourceIP = process.argv[2];

const client = mqtt.connect(`mqtt://${sourceIP}`);

client.on('connect', () => {
  client.subscribe('mock-sensor-data')
});

client.on('message', (topic, message) => {
  if(topic === 'mock-sensor-data') {
    // data = JSON.parse(message.toString());

    // //record the time of receiving the sensor data
    // receiveTime = Date.now();
    // packetTs = parseInt(data.split("#")[1]);
    // latency = receiveTime - packetTs;
    // console.log(`${packetTs}\t${latency}`);

    client.publish(ACK_MQTT_TOPIC_NAME, message.toString());
    console.log("received message. ack sent");
  }
});