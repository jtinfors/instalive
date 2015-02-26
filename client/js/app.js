var React = require('react');
var Api = require('./api/Api');
var InstagramApp = require('./components/InstagramApp.react');

Api.fetchRecentMedia(function(err, payload) {
	// TODO: errorHandling and empty response
	React.render(
		<InstagramApp instagrams={payload}/>,
		document.getElementById('content')
	);

	Api.setupSubscription();
});

