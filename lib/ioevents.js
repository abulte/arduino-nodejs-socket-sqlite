module.exports = function(options) {
  var server = options.server;
};

var emit_cpu = true
  , emit_temp = true
  , emit_light = true;

var last_temp = last_light = light = temp = 0;

serial_device = require('../config').serial_device;
io = require('socket.io').listen(server);

var serialport = require('serialport');
var SerialPort = serialport.SerialPort; // localize object constructor
var serialPort = new SerialPort(serial_device, { 
  parser: serialport.parsers.readline("\r\n"),
  stopbits: 2 
});

var libCpuUsage = require('cpu-usage');

// sent data to websocket
io.sockets.on('connection', function (socket) {
  // serial Arduino stuff
  serialPort.on('data', function (data) {
    // ambient temperature
    if (data.indexOf('degrees') != -1 && emit_temp) {
      temp = data.split(' ')[0];
      socket.emit('data_temp', {'timestamp': 0, 'temp': temp});   
    }
    // light sensor value
    if (data.indexOf('light') != -1 && emit_light) {
      light = data.split(' ')[0];
      socket.emit('data_light', {'timestamp': 0, 'light': light}); 
    }
  });

  // stream cpu usage
  libCpuUsage(1000, function(load) {
    if(emit_cpu){
      socket.emit('data_cpu_load', {'timestamp': 0, 'load': load});                          
    }
  });

  // helper function
  // element : {ts : XX, data : XX}
  function normalize_data(element, index, array){
    array[index] = [element.ts, element.data];
  }

  // get history from DB
  socket.on('fetch_history', function (input_value, fn){
    db = require('../lib/db');
    // [temps, lights] series
    var data = [];

    db.all("SELECT temps.ts, temp as data FROM temps", function(err, rows){
      rows.forEach(normalize_data);
      err ? console.log(err) : data[0] = rows;
      db.all("SELECT lights.ts, light as data FROM lights", function(err, rows){
        rows.forEach(normalize_data);
        err ? console.log(err) : data[1] = rows;
        series = [
          {label: "Températures", data: data[0], yaxis: 1},
          {label: "Luminosité", data: data[1], yaxis: 2}
        ];
        fn(series);
      });
    });
  });
  //db.close();
});

// log serial data to DB
serialPort.on('data', function (data) {
// ambient temperature
if (data.indexOf('degrees') != -1 && emit_temp) {
  temp = data.split(' ')[0];
  var timestamp = new Date().getTime();
  last_temp = log_every_hour('temps', temp, timestamp, last_temp);
}
// light sensor value
if (data.indexOf('light') != -1 && emit_light) {
  light = data.split(' ')[0];
  var timestamp = new Date().getTime();
  last_light = log_every_hour('lights', light, timestamp, last_light);               
}
});

// log in DB every 1h
function log_every_hour(table, value, timestamp, last_timestamp){
  if(timestamp - last_timestamp > (3600 * 1000)){
    require('./db').update(table, timestamp, value);
    return timestamp;
  }
  else { return last_timestamp };
}

