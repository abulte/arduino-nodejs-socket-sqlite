module.exports.init = init

function init(server){

    io = require('socket.io').listen(server);

    var serialport = require("serialport");
    var SerialPort = serialport.SerialPort; // localize object constructor
    var serialPort = new SerialPort("/dev/ttyACM0", { 
        parser: serialport.parsers.readline("\r\n"),
        stopbits: 2 
    });


    io.sockets.on('connection', function (socket) {
        serialPort.on("data", function (data) {
            if (data.indexOf('degrees') != -1) {
                temp = data.split(' ')[0];
                var timestamp = new Date().getTime();
                socket.emit('new_data', { 'timestamp': timestamp, 'temp': temp});                
            }
        });
    });

}


