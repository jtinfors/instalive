var mustache = require('mustache'),
    util = require('./util');

$(function() {
  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  // Assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    var media = JSON.parse(event.data);
    if(media.meta.code == 200 && media.data.length > 0) {
      for(var i=0; i < media.data.length;i++) {
        var item = mustache.render("<li><div class=\"row\">\
                   <div class=\"col-xs-6 col-md-6 col-lg-6\">\
                     <img title=\"{{{caption.text}}}\"\
                          src=\"{{{images.standard_resolution.url}}}\"\
                          class=\"img-responsive img-rounded\"\
                          height=\"{{images.standard_resolution.height}}\"\
                          width=\"{{images.standard_resolution.width}}\"/>\
                   </div>\
                   <div class=\"col-xs-6 col-md-6 col-lg-6\">\
                     <div class=\"well well-sm\">{{caption.text}}</div>\
                     {{#tags}}\
                       <span class=\"label label-default\">{{.}}</span>\
                     {{/tags}}\
                   </div>\
                 </div></li>", util.strip_tags(media.data[i]));
        $(item).prependTo("#pings");
      }
    }
  };

  setInterval(fetch_nr_sockets, 60000);
});

function fetch_nr_sockets() {
  $.getJSON('/sockets', function(data) {
    $('.glyphicon-cloud-download').attr('title', data);
  });
}

