var assert = require("assert"),
    fs = require('fs'),
    routes = require('../routes'),
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
});
