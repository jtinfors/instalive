var mustache = require('mustache'),
    util = require('./util');

$(function() {

  if (!("WebSocket" in window)) {
    $(".page-header h1").text("Your browser is too old for me too handle, buy a new one, with WebSocket support and come back later.");
    return;
  }

  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  ws.onopen = function(event) {
    console.log("onopen!");
    var location = window.location.pathname.substring(1);
    if(location) {
      var message = JSON.stringify({type: "subscribe", location: location});
      console.log("sending subscribe message to server => ", message);
      ws.send(message);
      document.getElementById('location').innerHTML = location;
    }

    setInterval(function() {
      ws.send(JSON.stringify({ type: "ping" }));
    }, 50000);
  };

  // For now; assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    if(!event.data) {return;} // TODO: does this ever happen? Do we ever recieve empty messages? control frames?
    try { // sometimes event.data is split in half, not sure why.. but catch and move on!
      var media = JSON.parse(event.data.replace(/[\s\0]/g, ' '));
      switch(media.type) {
        case "update":
          handle_incoming_media(media.message);
          break;
        case "alert":
          display_alert(media);
          break;
        case "message":
          console.log(media.message)
          break;
        case "pong":
          console.log("received pong");
          break;
      }
    } catch (e) {
      console.log("exception => ", e);
      console.log("problem parsing data => ", event.data);
      return;
    }
  };

  ws.onclose = function() { display_alert({heading: "Tappade anslutningen", message: "Ladda om sidan för fler Instagrams"}); };
  ws.onerror = function() { display_alert({heading: "Tappade anslutningen", message: "Ladda om sidan för fler Instagrams"}); };

  setInterval(remove_some_items, 90000);
});

function remove_some_items() {
  $("#pings li:gt(50)").remove();
}

function display_alert(media) {
  console.log(media.message);
  var tmpl = document.getElementById('mustache_alert').innerHTML;
  var alert = mustache.render(tmpl, media);
  $(alert).prependTo("#content");
}

function handle_incoming_media(media) {
  if(media.meta.code == 200 && media.data.length > 0) {
    var tmpl = document.getElementById('mustache_post').innerHTML;
    mustache.parse(tmpl);
    for(var i=0; i < media.data.length;i++) {
      if(document.getElementById("image_"+media.data[i].id)) {
        return;
      }

      var item = mustache.render(tmpl, util.parse_date(util.strip_tags(media.data[i])));
      $(item).prependTo("#pings");
    }
  }
}

