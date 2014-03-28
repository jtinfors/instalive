var https = require('https'),
    util = require('util'),
    fs = require('fs'),
    _ = require('underscore'),
    bl = require('bl'),
    querystring = require('querystring');

var instagram_client_id = process.env.INSTAGRAM_CLIENT_ID;
var instagram_client_secret = process.env.INSTAGRAM_CLIENT_SECRET;

var locations = {
  sthlm: {
    lat: '59.32536',
    lng: '18.071197',
  },
  gbg: {
    lat: '57.706944',
    lng: '11.966389'
  },
  malmo: {
    lat: '55.605833',
    lng: '13.0025'
  },
  uppsala: {
    lat: '59.858333',
    lng: '17.65'
  },
  vasteras: {
    lat: '59.609722',
    lng: '16.546389'
  },
  orebro: {
    lat: '59.273944',
    lng: '15.213361'
  }
  linkoping: {
    lat: '58.410833',
    lng: '15.621389'
  },
  helsingborg: {
    lat: '56.049722',
    lng: '12.699722'
  },
  jonkoping: {
    lat: '57.782778',
    lng: '14.160556'
  },
  norrkoping: {
    lat: '58.591944',
    lng: '16.185556'
  },
  lund: {
    lat: '55.7',
    lng: '13.2'
  },
  umea: {
    lat: '63.825556',
    lng: '20.263611'
  },
  gavle: {
    lat: '60.683333',
    lng: '17.166667'
  },
  boras: {
    lat: '57.716667',
    lng: '12.933333'
  },
  eskilstuna: {
    lat: '59.370556',
    lng: '16.512778'
  },
  sodertalje: {
    lat: '59.183333',
    lng: '17.633333'
  },
  karlstad: {
    lat: '59.383333',
    lng: '13.533333'
  },
  taby: {
    lat: '59.433333',
    lng: '18.083333'
  },
  vaxjo: {
    lat: '56.878333',
    lng: '14.809167'
  },
  halmstad: {
    lat: '56.666667',
    lng: '12.85'
  }
};

var generate_post_data = function(options) {
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

var urlencode = function(data) {
  return querystring.stringify(data);
};

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
  };
};

// Create a subscription to a geographical location as per =>
// http://instagram.com/developer/realtime/#geography-subscriptions
var subscribe = function(location, callback) {
  if(!locations[location]) {
    return callback(new Error("Unknown location. :("), null);
  }
  var data = generate_post_data({
    radius: location === 'sthlm' ? 4000 : 5000,
    location: location,
    path: '/subscriptions/callback/'});
  var content_length = Buffer.byteLength(querystring.stringify(data));
  var options = generate_subscriptions_options(content_length);
  var request = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(err, data) {
      var item = data.toString();
      callback(err, item);
    }));
  });
  request.write(querystring.stringify(data));
  request.end();
};

var search_media = function(location, callback) {
  if('development' == process.env.NODE_ENV) {
    fs.readFile('./data/media_search.json', 'utf-8', function(err, data) {
      if (err) throw err;
      return callback(null, data);
    });
  } else {
    var path = util.format('/v1/media/search/?client_id=%s&lat=%d&lng=%d',instagram_client_id, locations[location].lat, locations[location].lng);
    var req = https.request({
      hostname: 'api.instagram.com',
      path: path
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        var item = data.toString();
        callback(err, item);
      }));
    });
    req.end();
    req.on('error', function(e) {
      console.error("error when fetching searching recent media => ", e);
    });
  }
}

var fetch_new_geo_media = function(object_id, count, callback) {
  if('development' == process.env.NODE_ENV) {
    fs.readFile('./data/recent_media.json', 'utf-8', function(err, data) {
      if (err) throw err;
      return callback(null, data);
    });
  } else {
    var path = util.format('/v1/geographies/%s/media/recent?client_id=%s&count=%d', object_id, instagram_client_id, count);
    var req = https.request({
      hostname: 'api.instagram.com',
      path: path
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        var item = data.toString();
        callback(err, item);
      }));
    });
    req.end();
    req.on('error', function(e) {
      console.error("error when fetching new media => ", e);
    });
  }
};

var subscriptions = function(callback) {
  if ('development' == process.env.NODE_ENV) {
    fs.readFile('./data/list_subscriptions.json', 'utf-8', function(err, data) {
      if (err) throw err;
      return callback(null, data);
    });
  } else {
    var req = https.request({
      hostname: 'api.instagram.com',
      path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s', instagram_client_secret, instagram_client_id)
    }, function(res) {
      res.setEncoding('utf8');
      res.pipe(bl(function(err, data) {
        var item = data.toString();
        callback(err, item);
      }));
    });
    req.end();
    req.on('error', function(e) {
      //console.error("error when fetching subscription => ", e);
    });
  }
};

// https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&id=1&client_id=CLIENT-ID
var delete_subscription = function(id, callback) {
  var request = https.request({
    hostname: 'api.instagram.com',
    path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&id=%s', instagram_client_secret, instagram_client_id, id),
    method: 'DELETE'
  }, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(err, data) {
        var item = data.toString();
        callback(err, item);
    }));
  });
  request.end();
};

//https://api.instagram.com/v1/subscriptions?client_secret=CLIENT-SECRET&object=all&client_id=CLIENT-ID
var delete_all_subscription = function(callback) {
  var request = https.request({
    hostname: 'api.instagram.com',
    path: util.format('/v1/subscriptions?client_secret=%s&client_id=%s&object=all', instagram_client_secret, instagram_client_id),
    method: 'DELETE'
  }, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(err, data) {
      var item = data.toString();
      callback(err, item);
    }));
  });
  request.end();
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

