var React = require('react');

var Filter = React.createClass({

	render: function() {
		return (
			<span title="Filter" className="label label-info">
				<span className="glyphicon glyphicon-tint">
					{this.props.filter}
				</span>
			</span>
		);
	}

});

module.exports = Filter;
