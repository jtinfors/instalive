var React = require('react');
var ReactPropTypes = React.PropTypes;
var Instagram = require('./Instagram.react');

var Main = React.createClass({

	render: function() {

		var items = this.props.instagrams.map(function(item) {
			return <Instagram key={item.id} item={item} />
		});

		return (
			<ul id="pings" className="list-unstyled">
				{items}
			</ul>
		);
	}
});

module.exports = Main;
