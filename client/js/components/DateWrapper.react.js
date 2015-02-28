var React = require('react');
var moment = require('moment');

var DateWrapper = React.createClass({

	render: function() {
    var datetime = moment(this.props.created_time * 1000).toISOString();
    var display_time_short = moment(this.props.created_time * 1000).format('HH:mm.ss');
    var display_time_long = moment(this.props.created_time * 1000).format('HH:mm Do MMMM YYYY');

		return (
			<span className="label label-primary">
				<span className="glyphicon glyphicon-time"></span>
				<time title={display_time_long} dateTime={datetime}>{display_time_short}</time>
			</span>
		);
	}

});

module.exports = DateWrapper;
