var React = require('react');
var Main = require('./Main.react');
var Instagram = require('./Instagram.react');
var InstagramStore = require('../stores/InstagramStore');
var InstagramActions = require('../actions/InstagramActions');

function getInstagrams() {
	return {
		instagrams: InstagramStore.getAll()
	};
}

var InstagramApp = React.createClass({

	componentDidMount: function() {
		InstagramStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
		InstagramStore.removeChangeListener(this._onChange);
	},

	render: function() {
		var items = this.props.instagrams.map(function(item) {
			return <Instagram key={item.id} item={item} />
		});
		return (
			<ul id="pings" className="list-unstyled">
				{items}
			</ul>
		);
	},

	_onChange: function() {
		console.log('State change!! Items => ', getInstagrams().instagrams.length);
		this.setState(getInstagrams());
	}
});

module.exports = InstagramApp;
