var AppDispatcher = require('../dispatcher/AppDispatcher');
var InstagramConstants = require('../constants/InstagramConstants');
var request = require('request');

var InstagramActions = {

	update: function(data) {
		AppDispatcher.dispatch({
			actionType: InstagramConstants.INSTAGRAM_UPDATE,
			data: data
		});
	}
}

module.exports = InstagramActions;
