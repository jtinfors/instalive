$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws')
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    var media = JSON.parse(event.data);
    if(media.meta.code == 200) {
      console.log(media);
      var text = "";
      var tags = [];
      var mentions = [];
      for(var i=0; i < media.data.length;i++) {
        if(media.data[i].caption && media.data[i].caption.text) {
          text = media.data[i].caption.text;
          tags = media.data[i].caption.text.match((/#\w+/gi));
          mentions = media.data[i].caption.text.match((/@\w+/gi));
        }

        var line_item = $('<li></li>');
        var div = $('<div></div>');

        $('<span>' + "hej" + "</span>", {"class": "badge"}).appendTo(div);
        $('<img/>', {
          "class": "img-responsive img-rounded",
          "title": text,
          "src": media.data[0].images.low_resolution.url
        }).appendTo(div);
        div.appendTo(line_item);
        line_item.appendTo("#pings");
      }
    } else {
      console.log("fail", event);
    }
  };
});

