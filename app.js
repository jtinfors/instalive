var express = require('express'),
    instagram = require('./instagram'),
    // redis = require("redis"),
    // client = redis.createClient(), // TODO: handle error on create?
    http = require('http');

app = express();
app.set('port', process.env.PORT || 3000);


app.get('/', function(req, res) {
  instagram.subscribe(function(data) {
    if(data.data.length > 0) {
      res.send(data.data);
    }
  });
});

app.get('/subscriptions/', function(req, res) {
  instagram.subscriptions(function(data) {
    res.send(data);
  });
});

app.get('/subscriptions/callback/', function(req, res) {
  var hub_challange = req.query['hub.challange'];
  var hub_token = req.query['hub.token'];
  if(hub_challange != null) {
    res.send(hub_challange);
  } else {
    res.writeHead(400);
    res.send(req.query)
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGTERM', function() {
  console.log('closing..');
  app.close();
});

