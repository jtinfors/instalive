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

	var ids = _instagrams.map(function(item) {
		return 'image_' + item.id;
	});
	console.log('ids => ', ids);
	var newItems = _instagrams.filter(function(item) {
		return ids.indexOf(item.id) != -1;
	});

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
