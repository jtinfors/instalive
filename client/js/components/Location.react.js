var React = require('react');

var Location = React.createClass({

	render: function() {
		return (
			<span title="Location" className="label label-success">
				<span className="glyphicon glyphicon-cloud-upload"> {this.props.location}</span>
			</span>
		);
	}

});

module.exports = Location;
