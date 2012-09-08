module.exports.init = init

function init(server){

    serial_device = require('../config').serial_device;
    io = require('socket.io').listen(server);

    var serialport = require('serialport');
    var SerialPort = serialport.SerialPort; // localize object constructor
    var serialPort = new SerialPort(serial_device, { 
        parser: serialport.parsers.readline("\r\n"),
        stopbits: 2 
    });

    var libCpuUsage = require('cpu-usage');

    io.sockets.on('connection', function (socket) {
        // ambient temperature
        serialPort.on('data', function (data) {
            if (data.indexOf('degrees') != -1) {
                temp = data.split(' ')[0];
                // var timestamp = new Date().getTime();
                socket.emit('data_temp', { 'timestamp': 0, 'temp': temp});                
            }
        });

        // cpu usage
        libCpuUsage( 1000, function( load ) {
            socket.emit('data_cpu_load', { 'timestamp': 0, 'load': load});                
        } );
    });

}


