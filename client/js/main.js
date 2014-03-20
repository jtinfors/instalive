var mustache = require('mustache'),
    util = require('./util');

$(function() {
  if (typeof console == "undefined") {
    var console = { log: function() {} }
  } else if ((window.location.search.indexOf("debug=true") == -1) || typeof console.log == "undefined") {
    console.log = function() {};
  }

  if (!"WebSocket" in window) {
    document.write("<h1>Your browser is too old for me too handle, buy a new one</h1>");
    return;
  }

  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  // For now; assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    console.log('even', event);
    if(!event.data) {return;} // TODO: does this ever happen? Are they control frames?
    try { // sometimes event.data is split in half, not sure why..
      var media = JSON.parse(event.data.replace(/[\s\0]/g, ' '));
      setInterval(handle_incoming_media(media), 10);
    } catch (e) {
      console.log("exception => ", e);
      console.log("problem parsing data => ", event.data);
      return;
    }

  };

  ws.onclose = function() { console.log("ws closed for some reason..");}
  ws.onerror = function() { console.log("ws errored for some reason..");}
  ws.onopen = function() { console.log("ws opened!");}

  setInterval(remove_some_items, 90000);
});

function remove_some_items() {
  $("#pings li:gt(50)").remove()
}

function handle_incoming_media(media) {
    if(media.meta.code == 200 && media.data.length > 0) {
      for(var i=0; i < media.data.length;i++) {
        var item = mustache.render("<li><div class=\"row\">\
                   <div class=\"col-md-6 col-lg-6\">\
                     <a href=\"{{link}}\" target=\"_blank\">\
                     <img title=\"{{{caption.text}}}\"\
                          src=\"{{{images.standard_resolution.url}}}\"\
                          class=\"img-responsive img-rounded\"\
                          height=\"{{images.standard_resolution.height}}\"\
                          width=\"{{images.standard_resolution.width}}\"/>\
                     </a>\
                   </div>\
                   <div class=\"col-md-6 col-lg-6\">\
                     {{#caption}}\
                       {{#text}}\
                         <div class=\"well well-sm\">{{caption.text}}</div>\
                       {{/text}}\
                     {{/caption}}\
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

