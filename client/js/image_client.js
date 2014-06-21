var mustache = require('mustache'),
    util = require('./util');

$(function() {

  $('#mustache_post').load('/tmpl/post.mustache');
  $('#mustache_alert').load('/tmpl/alert.mustache');

  var host = location.origin.replace(/^http/, 'ws');
  var socket = io.connect(host);

  socket.on('connect', function() {
    var location = window.location.pathname.substring(1);
    if(location) {
      var message = JSON.stringify({type: 'subscribe', location: location});
      socket.send(message);
      document.getElementById('location').innerHTML = location;
    }
  });

  socket.on('message', function(payload) {
    var media = JSON.parse(payload);
    switch(media.type) {
      case 'update':
        handle_incoming_media(media.message);
        break;
      case 'alert':
        display_alert(media);
        break;
      case 'message':
        break;
    }
  });

  socket.on('disconnect', function() {
    display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });
  socket.on('error', function() {
    display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });

  setInterval(remove_some_items, 90000);
});

function remove_some_items() {
  $('#pings li:gt(50)').remove();
}

function display_alert(media) {
  var tmpl = document.getElementById('mustache_alert').innerHTML;
  var alert = mustache.render(tmpl, media);
  $(alert).prependTo('#content');
}

function handle_incoming_media(media) {
  if(media.meta.code == 200 && media.data.length > 0) {
    var tmpl = document.getElementById('mustache_post').innerHTML;
    mustache.parse(tmpl);
    for(var i=0; i < media.data.length;i++) {
      if(document.getElementById('image_'+media.data[i].id)) {
        return; // To avoid duplicates
      }
      var item = mustache.render(tmpl, util.parse_date(util.strip_tags(media.data[i])));

      var current_scroll_position = $(document).scrollTop();
      if(current_scroll_position > 80) {
        $(item).hide().prependTo('#pings').fadeIn('slow');
        $('html, body').animate({ scrollTop: (current_scroll_position + $('#pings li:last').outerHeight(true))});
      } else {
        $(item).hide().prependTo('#pings').fadeIn('slow');
      }
    }
  }
}

