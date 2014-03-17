$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    var parsed_data = JSON.parse(event.data);
    console.log(parsed_data);
    $('<img/>', {
      "src": parsed_data.data[0].images.low_resolution.url
    }).appendTo($('<li>')).appendTo("#pings");
  };
});

