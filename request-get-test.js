var request = require('request');

cloudIP = "198.199.83.16";
cloudPort = 5000;

request(`http://198.199.83.16:5000/record?packetTs=1234567890`);
// request.get(`http://${cloudIP}:${cloudPort}/record?packetTs=${sensorTs}`);