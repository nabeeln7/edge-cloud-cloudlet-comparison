const express = require('express');
const bodyParser = require('body-parser');
var request = require('request');
//init app
const app = express();

cloudIP = "198.199.83.16";
cloudPort = 5000;

//body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/record', function(req,res){
	var packetTs = req.query["packetTs"];
	var receiveTime = Date.now();
	var latency = receiveTime - packetTs;

	console.log(`${packetTs}\t${latency}`);

	//send to cloud
	request.get(`http://${cloudIP}:${cloudPort}/record?packetTs=${packetTs}`);

	res.sendStatus(200);
});

const port = (process.env.PORT || 5000);
app.set('port', port);

app.listen(port, function() {
	console.log('#packetTs\tlatency');
});