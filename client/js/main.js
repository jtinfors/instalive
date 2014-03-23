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
    }
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
        case "message":
          show_flash(media.message);
          break;
      }
    } catch (e) {
      console.log("exception => ", e);
      console.log("problem parsing data => ", event.data);
      return;
    }
  };

  ws.onclose = function() { show_flash("websocket closed.. sad sad thing. Reload page for more pics!");};
  ws.onerror = function() { show_flash("websocket errored on us :( Reload page for more pics!");};

  setInterval(remove_some_items, 90000);
});

function remove_some_items() {
  $("#pings li:gt(50)").remove();
}

function show_flash(message) {
  $(".page-header h1 .flash")
  .text(message)
  .fadeIn("slow")
  .delay(3000)
  .fadeOut("slow");
}

function handle_incoming_media(media) {
    if(media.meta.code == 200 && media.data.length > 0) {
      for(var i=0; i < media.data.length;i++) {
        if(document.getElementById("image_"+media.data[i].id)) { return; }
        /*jshint multistr: true */
        var item = mustache.render("<li id=\"image_{{id}}\"><div class=\"row\">\
                   <div class=\"image col-md-6 col-lg-6\">\
                     <a href=\"{{link}}\" target=\"_blank\">\
                     <img title=\"{{{caption.text}}}\"\
                          src=\"{{{images.standard_resolution.url}}}\"\
                          class=\"img-responsive img-rounded\"\
                          height=\"{{images.standard_resolution.height}}\"\
                          width=\"{{images.standard_resolution.width}}\"/>\
                     </a>\
                   </div>\
                   <div class=\"meta col-md-6 col-lg-6\">\
                     <div class=\"media\">\
                       <a href=\"http://instagram.com/{{user.username}}\" class=\"pull-left\" target=\"_blank\">\
                         <img class=\"media-object img-rounded\" src=\"{{user.profile_picture}}\"/>\
                       </a>\
                       <div class=\"media-body\">\
                          <a href=\"http://instagram.com/{{user.username}}\" class=\"pull-left\" target=\"_blank\">\
                           <h4 class=\"media-heading\">{{user.full_name}}</h4>\
                          </a>\
                       </div>\
                     {{#caption}}\
                       {{#text}}\
                         <p>{{caption.text}}</p>\
                       {{/text}}\
                     {{/caption}}\
                     </div>\
                     {{#tags}}\
                       <span title=\"Tag\" class=\"label label-default\">{{.}}</span>\
                     {{/tags}}\
                     {{#filter}}\
                       <span title=\"Filter\" class=\"label label-info\"><span class=\"glyphicon glyphicon-tint\"></span> {{.}}</span>\
                     {{/filter}}\
                     {{#location}}\
                       {{#name}}\
                         <span title=\"Location\" class=\"label label-success\"><span class=\"glyphicon glyphicon-cloud-upload\"></span> {{.}}</span>\
                       {{/name}}\
                     {{/location}}\
                     {{#datetime}}\
                       <span class=\"label label-primary\"><span class=\"glyphicon glyphicon-time\"></span> <date datetime=\"{{datetime}}\">{{relative_time}}</date></span>\
                     {{/datetime}}\
                   </div>\
                 </div></li>", util.parse_date(util.strip_tags(media.data[i])));
        $(item).prependTo("#pings");
      }
    }
}

