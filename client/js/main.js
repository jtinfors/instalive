var mustache = require('mustache'),
    util = require('./util');

$(function() {
  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  // Assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    if(!event.data) {return;} // TODO: does this ever happen?
    try { // This can actually happen, not sure why yet..
      var media = JSON.parse(event.data);
    } catch (e) {
      console.log("exception => ", e);
      console.log("problem parsing data => ", event.data);
      return;
    }
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
  };

  ws.onclose = function() { alert("ws closed for some reason..");}
  ws.onerror = function() { alert("ws errored for some reason..");}
  ws.onopen = function() { console.log("ws opened!");}

  setInterval(fetch_nr_sockets, 60000);
});

// Here for debug reasons mainly.
// Sets a title attr on the site logo to easily see the number of connected sockets
function fetch_nr_sockets() {
  $.getJSON('/sockets', function(data) {
    $('.glyphicon-cloud-download').attr('title', data);
  });
}

