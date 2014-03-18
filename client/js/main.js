var mustache = require('mustache');

$(function() {
  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  // Assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    var media = JSON.parse(event.data);
    if(media.meta.code == 200 && media.data.length > 0) {
      for(var i=0; i < media.data.length;i++) {
        var item = mustache.render("<li><div>\
                          <img title=\"{{{caption.text}}}\"\
                                   src=\"{{{images.standard_resolution.url}}}\"\
                                   class=\"img-responsive img-rounded\"\
                                   height=\"{{images.standard_resolution.height}}\"\
                                   width=\"{{images.standard_resolution.width}}\"/>\
                          <div class=\"caption\">\
                          <p>{{caption.text}}</p>\
                            {{#tags}}\
                              <span class=\"label label-default\">{{.}}</span>\
                            {{/tags}}\
                          </div>\
                        </div></li>", media.data[i]);
        $(item).prependTo("#pings");
      }
    }
  };

  setInterval(fetch_nr_sockets, 10000);
});

function fetch_nr_sockets() {
  $.getJSON('/sockets', function(data) {
    $('.glyphicon-cloud-download').attr('title', data);
  });
}
