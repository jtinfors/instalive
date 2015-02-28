var React = require('react/addons');
var Instagram = require('./Instagram.react');
var InstagramStore = require('../stores/InstagramStore');
var InstagramActions = require('../actions/InstagramActions');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

function getInstagrams() {
	return {
		instagrams: InstagramStore.getAll()
	};
}

var InstagramApp = React.createClass({

	getInitialState: function() {
		return getInstagrams();
	},

	componentDidMount: function() {
		InstagramStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
		InstagramStore.removeChangeListener(this._onChange);
	},

	render: function() {
		if (Object.keys(this.state.instagrams).length < 1) {
			return null;
		};

		var items = this.state.instagrams.map(function(item) {
			return <Instagram key={item.id} item={item} />
		});
		return (
			<ul id="pings" className="list-unstyled">
				<ReactCSSTransitionGroup transitionName="instagrams">
					{items}
				</ReactCSSTransitionGroup>
			</ul>
		);
	},

	_onChange: function() {
		var items = getInstagrams();
		this.setState(items);
	}
});

module.exports = InstagramApp;
