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
    it('should unsubscribe if no clients are attached', function() {
      app.instagram.delete_subscription = function(id, callback) {
        return callback(null, "");
      };
      ws_sthlm = {};
      ws_gbg = {};
      subscription_sthlm = {
        "aspect": "media",
        "callback_url": "http://www.instalive.se/subscriptions/callback/",
        "id": "200",
        "object": "geography",
        "object_id": "201",
        "type": "subscription"
      };
      subscription_gbg = {
        "aspect": "media",
        "callback_url": "http://www.instalive.se/subscriptions/callback/",
        "id": "300",
        "object": "geography",
        "object_id": "301",
        "type": "subscription"
      };
      ws_gbg.subscription_id = subscription_gbg.id;
      ws_gbg.object_id = subscription_gbg.object_id;
      ws_gbg.location = 'gbg';
      ws_sthlm.subscription_id = subscription_sthlm.id;
      ws_sthlm.object_id = subscription_sthlm.object_id;
      ws_sthlm.location = 'sthlm';

      app.clients.push(ws_gbg);
      app.clients.push(ws_sthlm);

      app.subscriptions.sthlm = {
        object_id: subscription_sthlm.object_id,
        subscription_id: subscription_sthlm.id
      };
      app.subscriptions.gbg = {
        object_id: subscription_gbg.object_id,
        subscription_id: subscription_gbg.id
      };

      app.deallocate_socket(ws_sthlm);
      assert.equal(Object.keys(app.subscriptions).length, 1);
      assert.equal(Object.keys(app.clients).length, 1);
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
