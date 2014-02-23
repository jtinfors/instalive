var https = require('https'),
    util = require('util'),
    querystring = require('querystring');

var client_id = '6d64c9abeec04916bc18caae41cfa396';
var client_secret = '6f09b31327a14d28a312dc42bc266cb9';

// TODO: the lat and lng needs to be parameterized
// perhaps using that init pattern?
var data = querystring.stringify({
  client_id: client_id,
  client_secret: client_secret,
  object: 'geography',
  aspect: 'media',
  lat: '59.32536',
  lng: '18.071197',
  radius: 4000,
  callback_url: 'http://' + process.env.DOMAINNAME + '/subscriptions/callback/'
});

var options = {
  hostname: 'api.instagram.com',
  path: '/v1/subscriptions/',
  port: 443,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data)
  },
};

var subscribe = function(callback) {
  console.log("Creating new subscription!");
  var request = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.write(data);
  request.end();
};

var subscriptions = function(callback) {
  var req = https.request({
    hostname: 'api.instagram.com',
    path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s', client_secret, client_id)
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
      console.log("[subscriptions] Recieved data => ", data, " sending it to callback");
      callback(data);
    })
  });
  req.end();
  req.on('error', function(e) {
    console.error("error when fetching subscription => ", e);
  });
}

// https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&id=1&client_id=CLIENT-ID
var delete_subscription = function(id, callback) {
  var _data = querystring.stringify({ client_id: client_id, client_secret: client_secret, id: id });
  console.log('delete_subscription() _data => ', _data);
  var request = https.request({
    hostname: 'api.instagram.com',
    path: '/v1/subscriptions/',
    port: 443,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(_data)
    },
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.write(_data);
  request.end();
}

//https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&object=all&client_id=CLIENT-ID
var delete_all_subscription = function(callback) {
  var _data = querystring.stringify({ client_id: client_id, client_secret: client_secret, object: 'all' });
  console.log('delete_subscription() _data => ', _data);
  var request = https.request({
    hostname: 'api.instagram.com',
    path: '/v1/subscriptions/',
    port: 443,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(_data)
    },
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      callback(chunk);
    });
  });
  request.write(_data);
  request.end();
}

module.exports.subscriptions = subscriptions;
module.exports.subscribe = subscribe;
module.exports.delete_subscription = delete_subscription;
module.exports.delete_subscription = delete_all_subscription;

