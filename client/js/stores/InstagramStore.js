var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var InstagramConstants = require('../constants/InstagramConstants');
var assign = require('object-assign');
var request = require('request');

var CHANGE_EVENT = 'change';

var _instagrams = [];

function update(updates) {
	var newItems = updates.filter(function(newItem) {
		return _instagrams.every(function(existingItem) {
			return newItem.id != existingItem.id;
		});
	});

	_instagrams = newItems.concat(_instagrams);
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
	switch(action.actionType) {
		case InstagramConstants.INSTAGRAM_UPDATE:
			update(action.data);
			InstagramStore.emitChange();
			break;
		default:
	}
});

module.exports = InstagramStore;
