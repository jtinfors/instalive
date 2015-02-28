var React = require('react');
var ReactPropTypes = React.PropTypes;
var InstagramActions = require('../actions/InstagramActions');
var Tag = require('./Tag.react');
var Filter = require('./Filter.react');
var Location = require('./Location.react');
var DateWrapper = require('./DateWrapper.react');
var ImageCarousel = require('./ImageCarousel.react');

var Instagram = React.createClass({

	render: function() {
		var id = "image_" + this.props.item.id;
		var userLink = "http://instagram.com/" + this.props.item.user.username;
		var tags = this.props.item.tags.map(function(tag, index) {
			return <Tag key={index} tag={tag}/>
		});
		var filter = <Filter filter={this.props.item.filter} />
		var location = <Location location={this.props.item.location.name} />
		var date = <DateWrapper created_time={this.props.item.created_time} />
		var captionText = this.props.item.caption ? this.props.item.caption.text : '';

		return (
			<li id={id} key={this.props.item.id}>
        <div className="row">
          <div className="image col-md-6 col-lg-6">
            <a href={this.props.item.link} target="_blank">
							<ImageCarousel imageSrc={this.props.item.images.standard_resolution.url} />
            </a>
					</div>

          <div className="meta col-md-6 col-lg-6">
            <div className="media">
              <a href={userLink} className="pull-left" target="_blank">
                <img className="media-object img-circle" src={this.props.item.user.profile_picture}/>
              </a>
              <div className="media-body">
                <a href={userLink} className="pull-left" target="_blank">
                  <h4 className="media-heading">{this.props.item.user.full_name}</h4>
                </a>
              </div>
							<p>{captionText}</p>
            </div>
						{tags}
						{filter}
						{location}
						{date}
          </div>
				</div>
			</li>
		);
	}
});

module.exports = Instagram;
