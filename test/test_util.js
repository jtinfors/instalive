var assert = require("assert"),
    fs = require('fs'),
    client = require('../client/js/util');

describe('client', function() {
  describe('strip_tags', function() {
    it('strip tags and replace text', function(done) {
      fs.readFile('./data/recent_media.json', 'utf8', function(err, data) {
        var parsed = JSON.parse(data);
        var new_data = client.strip_tags(parsed.data[0]);
        assert.equal("I väntan på musiken @marikaberggrund", new_data.caption.text);
        done();
      });
    });
  });
});

