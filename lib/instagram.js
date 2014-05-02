var https                   = require('https'),
    util                    = require('util'),
    _                       = require('underscore'),
    bl                      = require('bl'),
    querystring             = require('querystring'),
    locations               = require('../config/locations'),
    instagram_client_id     = process.env.INSTAGRAM_CLIENT_ID,
    instagram_client_secret = process.env.INSTAGRAM_CLIENT_SECRET,
    InstagramApiError       = require('./error/InstagramApiError');

function Instagram() {

  this.generate_post_data = function(options) {
    var location = options.location;
    var radius = options.radius ? options.radius : 4000;
    var path = options.path ? options.path : '/subscriptions/callback/';

    var lat_lng = locations[location];

    if(!lat_lng || !location) {
      return -1;
    } else {
      return _.extend({
        client_id: instagram_client_id,
        client_secret: instagram_client_secret,
        object: 'geography',
        aspect: 'media',
        radius: (radius !== null ? radius : 4000),
        callback_url: 'http://' + process.env.INSTALIVE_DOMAINNAME + path
      }, lat_lng);
    }
  };

  this.generate_subscriptions_options = function(content_length) {
    return {
      hostname: 'api.instagram.com',
        path: '/v1/subscriptions/',
        port: 443,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': content_length
        }
    };
  };

  // Create a subscription to a geographical location as per =>
  // http://instagram.com/developer/realtime/#geography-subscriptions
  this.subscribe = function(location, callback) {
    if(!locations[location]) {
      return callback(new Error("Unknown location. :("), null);
    }
    var data = this.generate_post_data({
      radius: location === 'sthlm' ? 4000 : 5000,
        location: location,
        path: '/subscriptions/callback/'});
    var content_length = Buffer.byteLength(querystring.stringify(data));
    var options = this.generate_subscriptions_options(content_length);
    var request = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        callback(err, data.toString());
      }));
    });
    request.write(querystring.stringify(data));
    request.end();
  };

  this.search_media = function(location, count, callback) {
    var path = util.format('/v1/media/search/?client_id=%s&lat=%d&lng=%d&count=%d',instagram_client_id, locations[location].lat, locations[location].lng, count);
    var req = https.request({
      hostname: 'api.instagram.com',
        path: path
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        callback(err, data.toString());
      }));
    });
    req.end();
    req.on('error', function(e) {
      console.error("error when fetching searching recent media => ", e);
    });
  };

  this.fetch_new_geo_media = function(object_id, count, callback) {
    var path = util.format('/v1/geographies/%s/media/recent?client_id=%s&count=%d', object_id, instagram_client_id, count);
    var req = https.request({
      hostname: 'api.instagram.com',
        path: path
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        callback(err, data.toString());
      }));
    });
    req.end();
    req.on('error', function(e) {
      console.error("error when fetching new media => ", e);
    });
  };

  this.subscriptions = function(callback) {
    var req = https.request({
      hostname: 'api.instagram.com',
        path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s', instagram_client_secret, instagram_client_id)
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        callback(err, data.toString());
      }));
    });
    req.end();
    req.on('error', function(e) {
      //console.error("error when fetching subscription => ", e);
    });
  };

  this.delete_subscription = function(id, callback) {
    var request = https.request({
      hostname: 'api.instagram.com',
        path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&id=%s', instagram_client_secret, instagram_client_id, id),
        method: 'DELETE'
    }, function(res) {
      res.setEncoding('utf8');
      if(callback) {
        res.pipe(bl(function(err, data) {
          callback(err, data.toString());
        }));
      } else {
        res.on('data', function(payload) {
          console.log(payload.toString());
        });
      }
    });
    request.end();
  };

  this.delete_each_subscription = function(callback) {
    var self = this;
    this.subscriptions(function(err, data) {
      if(!err) {
        var items = JSON.parse(data).data;
        for(var i=0;i < items.length;i++) {
          self.delete_subscription(items[i].id);
        }
      }
    });
    if (callback)
      callback('ok');
  };

  this.delete_all_subscription = function(callback) {
    var request = https.request({
      hostname: 'api.instagram.com',
        path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&object=all', instagram_client_secret, instagram_client_id),
        method: 'DELETE'
    }, function(res) {
      res.setEncoding('utf8');
      if (res.statusCode !== 200) {
        return callback(new InstagramApiError('Problem deleting subscriptions'), res);
      }
      res.pipe(bl(function(err, data, res) {
        callback(err, data.toString(), res);
      }));
    });
    request.end();
  };
}


module.exports = Instagram;

