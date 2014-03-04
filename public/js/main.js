$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    console.log(event.data);
    var li = document.createElement('li');
    li.innerHTML = JSON.parse(event.data);
    document.querySelector('#pings').appendChild(li);

  };
});
