var https                   = require('https'),
    util                    = require('util'),
    fs                      = require('fs'),
    _                       = require('underscore'),
    bl                      = require('bl'),
    querystring             = require('querystring'),
    locations               = require('./config/locations'),
    instagram_client_id     = process.env.INSTAGRAM_CLIENT_ID,
    instagram_client_secret = process.env.INSTAGRAM_CLIENT_SECRET;


var search_media = function(location, count, callback) {
};

var fetch_new_geo_media = function(object_id, count, callback) {
};

var subscriptions = function(callback) {
};

// https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&id=1&client_id=CLIENT-ID
var delete_subscription = function(id, callback) {
};

var delete_all_subscription = function(callback) {
};

module.exports.locations = locations;
module.exports.generate_post_data = generate_post_data;
module.exports.generate_subscriptions_options = generate_subscriptions_options;
module.exports.urlencode = urlencode;
module.exports.subscriptions = subscriptions;
module.exports.subscribe = subscribe;
module.exports.fetch_new_geo_media = fetch_new_geo_media;
module.exports.search_media = search_media;
module.exports.delete_subscription = delete_subscription;
module.exports.delete_all_subscription = delete_all_subscription;

