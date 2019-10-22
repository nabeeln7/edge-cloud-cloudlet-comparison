const express = require('express');
const bodyParser = require('body-parser');
//init app
const app = express();

//body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/record', function(req,res){
	var packetTs = req.query["packetTs"];
	var receiveTime = Date.now();
	var latency = receiveTime - packetTs;

	console.log(`${packetTs}\t${latency}`);

	res.sendStatus(200);
});

const port = (process.env.PORT || 5000);
app.set('port', port);

app.listen(port, function() {
	console.log('#packetTs\tlatency');
});