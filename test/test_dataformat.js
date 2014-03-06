var assert = require("assert"),
    fs = require('fs'),
    _ = require('underscore');

describe('#instagram data format', function() {
  it('should be able to get the object_id changed_aspect for \'geograpy\'', function(done) {
    fs.readFile('./data/subscription_update.json', 'utf-8', function(err, data) {
      var result = _.where(JSON.parse(data), { changed_aspect: "media", object: 'geography'})
      assert.ok(result[0].object_id == 4750158)
      done();
    });
  });
});
