var https = require('https'),
    util = require('util'),
    fs = require('fs'),
    _ = require('underscore'),
    querystring = require('querystring');

var instagram_client_id = process.env.INSTAGRAM_CLIENT_ID;
var instagram_client_secret = process.env.INSTAGRAM_CLIENT_SECRET;

var locations = {
  sthlm: {
    lat: '59.32536',
    lng: '18.071197',
  },
  gbg: { }
};

var generate_post_data = function(options) {
  var location = options['location'];
  var radius = options['radius'] != null ? options['radius'] : 4000;
  var path = options['path'] != null ? options['path'] : '/subscriptions/callback/';

  var lat_lng = locations[location];

  if(!lat_lng || !location) {
    return -1;
  } else {
    return _.extend({
      client_id: instagram_client_id,
      client_secret: instagram_client_secret,
      object: 'geography',
      aspect: 'media',
      radius: (radius != null ? radius : 4000),
      callback_url: 'http://' + process.env.INSTALIVE_DOMAINNAME + path
    }, lat_lng);
  }
};

var urlencode = function(data) {
  return querystring.stringify(data);
}

var generate_subscriptions_options = function(content_length) {
  return {
    hostname: 'api.instagram.com',
    path: '/v1/subscriptions/',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content_length
    }
  }
};

// Create a subscription to a geographical location as per =>
// http://instagram.com/developer/realtime/#geography-subscriptions
var subscribe = function(location, callback) {
  //console.log("Creating new subscription!");
  var data = generate_post_data({location: location, path: '/subscriptions/callback/'});
  var content_length = Buffer.byteLength(querystring.stringify(data));
  var options = generate_subscriptions_options(content_length);
  var request = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.write(querystring.stringify(data));
  request.end();
};

var fetch_new_geo_media = function(object_id, count, callback) {
  if('development' == process.env.NODE_ENV) {
    fs.readFile('./data/subscription_update.json', 'utf-8', function(err, data) {
      if (err) throw err;
      return callback(data);
    });
  } else {
    var path = util.format('/v1/geographies/%s/media/recent?client_id=%s&count=%d', object_id, instagram_client_id, count);
    var req = https.request({
      hostname: 'api.instagram.com',
      path: path
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(data) {
        callback(data);
      });
    });
    req.end();
    req.on('error', function(e) {
      //console.error("error when fetching new media => ", e);
    });
  }
}

var subscriptions = function(callback) {
  if ('development' == process.env.NODE_ENV) {
    fs.readFile('./data/list_subscriptions.json', 'utf-8', function(err, data) {
      if (err) throw err;
      return callback(data);
    });
  } else {
    var req = https.request({
      hostname: 'api.instagram.com',
      path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s', instagram_client_secret, instagram_client_id)
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(data) {
        //console.log("[subscriptions] Recieved data => ", data, " sending it to callback");
        callback(data);
      });
    });
    req.end();
    req.on('error', function(e) {
      //console.error("error when fetching subscription => ", e);
    });
  }
}

// https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&id=1&client_id=CLIENT-ID
var delete_subscription = function(id, callback) {
  var request = https.request({
    hostname: 'api.instagram.com',
    path: '/v1/subscriptions/',
    path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&id=%s', instagram_client_secret, instagram_client_id, id),
    method: 'DELETE'
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.end();
}

//https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&object=all&client_id=CLIENT-ID
var delete_all_subscription = function(callback) {
  var request = https.request({
    hostname: 'api.instagram.com',
    path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&object=all', instagram_client_secret, instagram_client_id),
    method: 'DELETE'
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.end();
}

module.exports.generate_post_data = generate_post_data;
module.exports.generate_subscriptions_options = generate_subscriptions_options;
module.exports.urlencode = urlencode;
module.exports.subscriptions = subscriptions;
module.exports.subscribe = subscribe;
module.exports.fetch_new_geo_media = fetch_new_geo_media;
module.exports.delete_subscription = delete_subscription;
module.exports.delete_all_subscription = delete_all_subscription;

