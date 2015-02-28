var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var InstagramConstants = require('../constants/InstagramConstants');
var assign = require('object-assign');
var request = require('request');

var CHANGE_EVENT = 'change';

var _instagrams = [];

function update(updates) {
	console.log('old instagrams => ', _instagrams);
	console.log('new instagrams => ', updates);

	var newItems = updates.filter(function(item) {
		return _instagrams.indexOf(item) != -1;
	});

	console.log('items to be added => ', newItems);

	_instagrams = _instagrams.concat(newItems);
}

function setData(options) {
	_instagrams = options.data;
}

var InstagramStore = assign({}, EventEmitter.prototype, {

	getAll: function() {
		return _instagrams;
	},

	getInitial: function() {
		// return _instagrams;
	},

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}

});

AppDispatcher.register(function(action) {
	console.log('action.actionType => ', action.actionType);
	switch(action.actionType) {
		case InstagramConstants.INSTAGRAM_UPDATE:
			update(action.data);
			InstagramStore.emitChange();
			break;
		default:
	}
});

module.exports = InstagramStore;