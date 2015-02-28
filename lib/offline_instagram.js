var fs = require('fs');

module.exports.search_media = function(location, count, callback) {
	fs.readFile(__dirname + '/../data/recent_media.json', { encoding: 'utf8' }, callback);
};

module.exports.subscribe = function(location, callback) {
	fs.readFile(__dirname + '/../data/new_subscription_response.json', { encoding: 'utf8' }, callback);
};
