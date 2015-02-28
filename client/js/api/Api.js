var request = require('request');
var InstagramActions = require('../actions/InstagramActions');

module.exports.fetchRecentMedia = function(callback) {
	request.get('http://' + window.location.host + '/media/recent/', function(err, resp, payload) {
		InstagramActions.update(JSON.parse(payload).data);
		if (callback) {
			callback(err, JSON.parse(payload).data);
		}
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
        break;
      case 'alert':
				console.log('alert! ', media.message);
        // display_alert(media);
        break;
      case 'message':
				console.log('message => ', media.message);
        break;
    }
  });

  socket.on('disconnect', function() {
		console.log('socket disconnect');
    // display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });
  socket.on('error', function() {
		console.log('socket error');
    // display_alert({heading: 'Tappade anslutningen', message: 'Ladda om sidan för fler Instagrams'});
  });

};

