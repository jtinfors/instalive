var assert = require("assert"),
    _ = require('underscore'),
    querystring = require('querystring'),
    Instagram = require('../lib/instagram');
    instagram = new Instagram();

describe('instagram', function() {
  describe('#generate_post_data', function() {
    it('should return -1 when no location is given', function() {
      assert.equal(-1, instagram.generate_post_data({}));
    });

    it('should provide correct lat/lng for sthlm', function() {
      var data = instagram.generate_post_data({location: 'sthlm'});
      assert.equal(data.lat, '59.32536');
      assert.equal(data.lng, '18.071197');
      assert.equal(data.radius, 4000);
    });

    it('should return negative when location is unknown', function() {
      assert.equal(-1, instagram.generate_post_data('örebro'));
    });

    it('should handle both default and specified value for radius', function() {
      assert.equal(instagram.generate_post_data({location: 'sthlm', radius: 3000}).radius, 3000);
      assert.equal(instagram.generate_post_data({location: 'sthlm'}).radius, 4000);
    });
  });

  describe('#generate_subscriptions_options', function() {
    it('should generate non-nil Content-Length', function() {
      var data = querystring.stringify(instagram.generate_post_data({location: 'sthlm'}));
      var options = instagram.generate_subscriptions_options(Buffer.byteLength(data));
      assert.ok(options.headers['Content-Length'] > 0);
    });
  });

  describe('#subscribe', function() {
    it('should return Error for unknown location', function() {
      instagram.subscribe('pennybridge', function(err, data) {
        assert.ifError(data);
      });
    });
  });

});
