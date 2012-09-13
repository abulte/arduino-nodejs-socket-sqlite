var temps = new TimeSeries();
var loads = new TimeSeries();
var lights = new TimeSeries();


var socket = io.connect('/');
socket.on('data_temp', function (data) {
  var timestamp = new Date().getTime();
  temps.append(timestamp, data['temp']);       
});

socket.on('data_cpu_load', function (data) {
  var timestamp = new Date().getTime();
  loads.append(timestamp, data['load']);
});

socket.on('data_light', function (data) {
  var timestamp = new Date().getTime();
  lights.append(timestamp, data['light']);
});

function populateTempHistory(selector, options){
  // get the temp history
  socket.emit('fetch_temp_history', '', function(data){
    console.log(data);
    $.plot($(selector), data, options);
  });
}

function createTimeline() {
  var chart = new SmoothieChart();
  chart.addTimeSeries(temps, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
  //chart.streamTo(document.getElementById("chart"), 1000);

  var chartload = new SmoothieChart();
  chartload.addTimeSeries(loads, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
  //chartload.streamTo(document.getElementById("chart_cpu"), 1000);

  var charlight = new SmoothieChart();
  charlight.addTimeSeries(lights, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
  //chartload.streamTo(document.getElementById("chart_light"), 1000);
} 