var request = require('request');
var InstagramActions = require('../actions/InstagramActions');

// TODO: One could argue that this should trigger an action...
module.exports.fetchRecentMedia = function(callback) {
	request.get('http://localhost:3000/media/recent/', function(err, resp, payload) {
		InstagramActions.update(JSON.parse(payload).data);
		callback(err, JSON.parse(payload).data);
	});
};

module.exports.setupSubscription = function() {

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
				console.log('media.message => ', media.message);
				InstagramActions.update(media.message.data);
        //handle_incoming_media(media.message);
        break;
      case 'alert':
        display_alert(media);
        break;
      case 'message':
				console.log('message => ', media.message);
        break;
    }
  });

  socket.on('disconnect', function() {
    display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });
  socket.on('error', function() {
    display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });

};

