var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var InstagramConstants = require('../constants/InstagramConstants');
var assign = require('object-assign');
var request = require('request');

var CHANGE_EVENT = 'change';

var _instagrams = [];

/*
 *[ (+new Date() + Math.floor(Math.random() * 999999)).toString(36),
 *(+new Date() + Math.floor(Math.random() * 999999)).toString(36),
 *(+new Date() + Math.floor(Math.random() * 999999)).toString(36) ].forEach(function(id) {
 *  _instagrams[id] = {
 *    text: 'yadda' + id,
 *    id: id
 *  }
 *});
 */

function update(updates) {
	console.log('old instagrams => ', _instagrams);
	console.log('updates!! => ', updates);
	_instagrams = _instagrams.concat(updates);
	// _instagrams[id] = assign({}, _instagrams[id], updates);
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
	switch(action.actionTypel) {
		case InstagramConstants.UPDATE:
			update(action.data);
			InstagramStore.emitChange();
			break;
		case InstagramConstants.RECENT_MEDIA:
			setData({ data: action.data });
			InstagramStore.emitChange();
		default:
	}
});

module.exports = InstagramStore;
