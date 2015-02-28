var React = require('react');

var Tag = React.createClass({

	render: function() {
		return (
			<span title="Tag" className="label label-default"> {this.props.tag}</span>
		);
	}

});

module.exports = Tag;
