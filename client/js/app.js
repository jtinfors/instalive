var React = require('react');
var Api = require('./api/Api');
var InstagramApp = require('./components/InstagramApp.react');
var InstagramActions = require('./actions/InstagramActions');

Api.fetchRecentMedia(function(err, payload) {
	// TODO: errorHandling and empty response
	React.render(
		<InstagramApp instagrams={payload}/>,
		document.getElementById('content')
	);

	Api.setupSubscription();
});

$('body').keypress(function(event) {
	if (event.keyCode === 99) {
		Api.fetchRecentMedia();
	}
});
