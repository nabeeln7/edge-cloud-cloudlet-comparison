var bleno = require("bleno");

process.env.BLENO_ADVERTISING_INTERVAL = 1000;

function getCurrentDateTime() {
  return new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
}

function logWithTs(log) {
  console.log(`[${getCurrentDateTime()}] ${log}`);
}

bleno.on('stateChange', handleBlenoStateChange);
bleno.on('advertisingStop', function() {
  logWithTs("[BLE Radio] Bleno advertisement stopped");
});
bleno.on('advertisingStartError', function(error) {
  logWithTs("[BLE Radio] Bleno advertisingStartError:");
  logWithTs(error);
});

function handleBlenoStateChange(state) {
  if (state === 'poweredOn') {
    while(true) {
      startAdvertising();  
      bleno.stopAdvertising();
    }
    
  } else if (state === 'poweredOff') {
    bleno.stopAdvertising();
  } else {
    logWithTs("[BLE Radio] bleno state changed to " + state);
  }
}

/*
The advertisement data payload consists of several AD structures. 
Each AD structure has a length field (1 byte), AD Type (1 byte), and the data corresponding to the AD type.
Length => Number of bytes for the AD type and the actual data (excluding the length byte itself).
AD type => 
As defined here: https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile/

Packet format:
https://www.libelium.com/forum/libelium_files/bt4_core_spec_adv_data_reference.pdf
*/
function startAdvertising() {  
  const currentTs = new Date().getTime();
  const sensorId = "mock-sensor";
  const payload = `${sensorId}#${currentTs}`;

  //create a buffer for the payload. 
  //buffer size = 2 bytes for length and AD type + byte size of the encrypted-ip 
  const bufferSize = 2 + payload.length;
  var advertisementData = new Buffer(bufferSize); 

  //payload length = 1 byte for AD type + rest for the actual data. 
  const payloadLength = 1 + payload.length;

  //Write it at the byte position 0 of the buffer. Since the length is stored in 1 byte, use writeUInt8
  advertisementData.writeUInt8(payloadLength, 0); 
  
  //AD type – 0x09 = complete local name
  advertisementData.writeUInt8(0x09, 1); 

  //write the actual data
  advertisementData.write(payload, 2);

  bleno.startAdvertisingWithEIRData(advertisementData);
  logWithTs(`[BLE Radio] Started Advertising with data = ${payload}`);
}