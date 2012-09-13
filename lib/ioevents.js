module.exports.init = init

function init(server){

  var emit_cpu = false;
  var emit_temp = false;
  var emit_light = false;

  serial_device = require('../config').serial_device;
  io = require('socket.io').listen(server);

  var serialport = require('serialport');
  var SerialPort = serialport.SerialPort; // localize object constructor
  var serialPort = new SerialPort(serial_device, { 
    parser: serialport.parsers.readline("\r\n"),
    stopbits: 2 
  });

  var libCpuUsage = require('cpu-usage');

  var last_timestamp = 0;
  var light = 0;
  var temp = 0;

  io.sockets.on('connection', function (socket) {
    serialPort.on('data', function (data) {
      // ambient temperature
      if (data.indexOf('degrees') != -1 && emit_temp) {
        temp = data.split(' ')[0];
        var timestamp = new Date().getTime();
        socket.emit('data_temp', {'timestamp': 0, 'temp': temp});   
          // log in DB every 1h
          if(timestamp - last_timestamp > 3600){
            require('./db').update_temp(timestamp, temp);
            last_timestamp = timestamp;
          }
        }
      // light sensor value
      if (data.indexOf('light') != -1 && emit_light) {
        light = data.split(' ')[0];
          // var timestamp = new Date().getTime();
          socket.emit('data_light', {'timestamp': 0, 'light': light});                
        }
      });

      // cpu usage
      libCpuUsage(1000, function(load) {
        if(emit_cpu){
          socket.emit('data_cpu_load', {'timestamp': 0, 'load': load});                          
        }
      } );

    socket.on('fetch_temp_history', function (input_value, fn){
      db = require('../lib/db');

      var data = [];
      last_ts = 0;

      db.each("SELECT ts, temp FROM temps", function(err, row) {
        if(err) { console.log(err); }
        else{
          // keep a value for every hour
          if((row.ts - last_ts) > 3600){
            data.push([parseFloat(row.ts * 1000), parseFloat(row.temp)]);
            last_ts = row.ts;
          }
        }
        }, function(err, num){
          console.log("Parsed " + num + " results in DB.");
          series = [{label: "Températures", data: data}];
          fn(series);
      });

      //db.close();
    });

  });



}


