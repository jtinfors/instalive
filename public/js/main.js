$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    console.log(JSON.parse(event.data));
    for(int i=0;i< event.data.length;i++) {
      $.ajax("https://api.instagram.com/v1/geographies/" + event.data[i].object_id + 
             "/media/recent?client_id=6d64c9abeec04916bc18caae41cfa396&count=1", function(data) {
               var li = document.createElement('li');
               li.innerHTML = data;
               document.querySelector('#pings').appendChild(li);
             });
    }
  };
});

