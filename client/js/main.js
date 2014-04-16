var mustache = require('hbs'),
    util = require('./util');

$(function() {

  if (!('WebSocket' in window)) {
    $('.page-header h1').text('Your browser is too old for me too handle, buy a new one, with WebSocket support and come back later.');
    return;
  }

  $('#mustache_post').load('/tmpl/post.mustache');
  $('#mustache_alert').load('/tmpl/alert.mustache');

  var host = location.origin.replace(/^http/, 'ws');
  var ws = new WebSocket(host);

  ws.onopen = function(event) {
    var location = window.location.pathname.substring(1);
    if(location) {
      var message = JSON.stringify({type: 'subscribe', location: location});
      ws.send(message);
      document.getElementById('location').innerHTML = location;
    }

    setInterval(function() {
      ws.send(JSON.stringify({ type: 'ping' }));
    }, 50000);
  };

  // For now; assumes data in form of instagram media updates
  ws.onmessage = function (event) {
    if(!event.data) {return;} // TODO: does this ever happen? Do we ever recieve empty messages? control frames?
    try { // sometimes event.data is split in half, not sure why.. but catch and move on!
      var media = JSON.parse(event.data.replace(/[\s\0]/g, ' '));
      switch(media.type) {
        case 'update':
          handle_incoming_media(media.message);
          break;
        case 'alert':
          display_alert(media);
          break;
        case 'message':
          break;
        case 'pong':
          break;
      }
    } catch (e) {
      return;
    }
  };

  ws.onclose = function() { display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'}); };
  ws.onerror = function() { display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'}); };

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

