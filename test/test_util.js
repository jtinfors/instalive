var assert = require("assert"),
    fs = require('fs'),
    util = require('../client/js/util');

describe('util', function() {
  describe('strip_tags', function() {
    it('strip tags and replace text from file', function(done) {
      fs.readFile('./data/recent_media.json', 'utf8', function(err, data) {
        var parsed = JSON.parse(data);
        var new_data = util.strip_tags(parsed.data[0]);
        assert.equal("I väntan på musiken @marikaberggrund \u2744\u26c4", new_data.caption.text);
        done();
      });
    });
    it('should tamper with strings containing hash', function() {
      var item = {caption: {text: "Jag har aldrig ätit #hash"}};
      assert.equal("Jag har aldrig ätit", util.strip_tags(item).caption.text);
    });
    it('should not tamper with strings not containing hash', function() {
      var item = {caption: {text: "Jag har aldrig ätit hash"}};
      assert.equal("Jag har aldrig ätit hash", util.strip_tags(item).caption.text);
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

