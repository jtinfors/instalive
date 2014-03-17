var mustache = require('mustache');

$(function() {
  console.log("loaded");
  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);
  ws.onmessage = function (event) {
    var media = JSON.parse(event.data);
    if(media.meta.code == 200 && media.data.length > 0) {
      for(var i=0; i < media.data.length;i++) {
        console.log(media.data[i]);
        var item = mustache.render("<li><div>\
                        <a href=\"{{{link}}}\" class=\"thumbnail\">\
                          <img title=\"{{{caption.text}}}\" src=\"{{{images.thumbnail.url}}}\" class=\"img-responsive img-rounded\"/>\
                          <div class=\"caption\">\
                          <p>{{caption.text}}</p>\
                            {{#tags}}\
                              <span class=\"label label-default\">{{.}}</span>\
                            {{/tags}}\
                          </div>\
                        </a>\
                        </div></li>", media.data[i]);
        console.log(item);
        $(item).appendTo("#pings");
      }
    } else {
      console.log("fail", event);
    }
  };
});

