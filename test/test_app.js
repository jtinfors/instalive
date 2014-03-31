var assert = require("assert"),
    fs = require('fs'),
    request = require('supertest'),
    app = require('../app'),
    _ = require('underscore');

describe('app', function() {
  describe('GET#/sthlm', function() {
    it('respond with a 200 and text/html payload', function(done) {
      request(app).get('/sthlm').expect(200, done);
    });
  });

  describe('POST#/subscriptions/callback', function() {
    it('should handle JSON body', function(done) {
      request(app).post('/subscriptions/callback/')
      .set('Content-Type', 'application/json')
      .send({data: 'some data'})
      .expect('Content-Type', /text\/html/)
      .end(function(err, res){
        if(err) {
          done(err);
        } else {
          done();
        }
      });
    });
  });

  describe('deallocate_socket', function() {
    it('should handle unsubscribe', function() {
      app.instagram.delete_subscription = function(id, callback) {
        return callback(null, "");
      };
      ws = {};
      subscription = {
        "aspect": "media",
        "callback_url": "http://www.instalive.se/subscriptions/callback/",
        "id": "4462330",
        "object": "geography",
        "object_id": "4807619",
        "type": "subscription"
      };
      ws.subscription_id = subscription.id;
      ws.object_id = subscription.object_id;

      app.clients.push(ws);
      app.subscriptions['sthlm'] = {
        object_id: subscription.object_id,
        subscription_id: subscription.subscription_id
      };

      app.deallocate_socket(ws);
      assert.ok(Object.keys(app.subscriptions).length === 0);
    });
  });

  describe('map_subscriptions', function() {
    it('should work', function() {
      subscriptions = {
        gbg: {
          object_id: "4824258",
          subscription_id: "4517047"

        },
        sthlm: {
          object_id: "4824597",
          subscription_id: "4518013"

        }
      }
      var ws = { object_id: "4824258", subscription_id: "4517047" }
      app.subscriptions['gbg']  = subscriptions['gbg'];
      app.clients.push(ws)
      var result = app.map_subscriptions();
      assert.ok(result[0].location == 'gbg');
      assert.ok(result[0].num == 1);
    })
  })
});
