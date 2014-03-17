$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    var parsed_data = JSON.parse(event.data);
    console.log(parsed_data);

    // for(var i=0;i< parsed_data.length;i++) {
    //   $.ajax("https://api.instagram.com/v1/geographies/" + parsed_data[i].object_id +
    //          "/media/recent?client_id=6d64c9abeec04916bc18caae41cfa396&count=1", function(data) {
    //            var li = document.createElement('li');
    //            li.innerHTML = data;
    //            document.querySelector('#pings').appendChild(li);
    //          });
    // }
  };
});

