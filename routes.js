var _ = require('underscore'),
    instagram = require('./instagram'),
    https = require('https');

module.exports.index = function(req, res) {
  res.render('index')
};

module.exports.sthlm = function(req, res) {
  instagram.subscriptions(function(data) {
    if(JSON.parse(data).data.length > 0) {
      res.render('images', {data: data});
    } else {
      instagram.subscribe('sthlm', function(data) {
        res.render('images', {data: data});
      });
    }
  });
};

module.exports.subscription_updates = function(req, res) {
};

