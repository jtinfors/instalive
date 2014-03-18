var assert = require("assert"),
    fs = require('fs'),
    util = require('../client/js/util');

describe('util', function() {
  describe('strip_tags', function() {
    it('strip tags and replace text', function(done) {
      fs.readFile('./data/recent_media.json', 'utf8', function(err, data) {
        var parsed = JSON.parse(data);
        var new_data = util.strip_tags(parsed.data[0]);
        assert.equal("I väntan på musiken @marikaberggrund", new_data.caption.text);
        done();
      });
    });
  });

  describe('parse_date', function() {
    it('should properly parse the date', function(done) {
      fs.readFile('./data/recent_media.json', 'utf8', function(err, data) {
        var parsed = JSON.parse(data);
        var new_data = util.parse_date(parsed.data[0]);
        assert.equal("2014-03-17T18:01:16.000Z", new_data.datetime);
        done();
      });
    });
  });
});

