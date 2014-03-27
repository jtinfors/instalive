var moment = require('moment'),
    _ = require('underscore');

// Strips tags from the caption.text part of an update
module.exports.strip_tags = function(item) {
  if(item.caption && item.caption.text && ~item.caption.text.indexOf('#')) {
    var stripped = _.filter(item.caption.text.split(' '),
                            function(item) {
                              return item.indexOf('#');
                            }).join(' ');
    item.caption.text = stripped;
  }
  return item;
};

module.exports.parse_date = function(item) {
  if(item.created_time) {
    var date = new Date(item.created_time);
    item.datetime = moment(item.created_time * 1000).toISOString();
    item.relative_time = moment(item.created_time * 1000).fromNow();
  }
  return item;
};
