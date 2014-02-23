var express = require('express'),
    url = require('url'),
    instagram = require('./instagram'),
    // redis = require("redis"),
    // client = redis.createClient(), // TODO: handle error on create?
    http = require('http');

app = express();
app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded());

app.get('/', function(req, res) {
  instagram.subscriptions(function(data) {
    if(JSON.parse(data).data.length > 0) {
      res.send(data);
    } else {
      instagram.subscribe(function(data) {
        res.send(data);
      });
    }
  });
});

app.get('/subscriptions/', function(req, res) {
  instagram.subscriptions(function(data) {
    res.send(data);
  });
});

app.get('/subscriptions/callback/', function(req, res) {
  console.log("GET /subscriptions/callback/ => ", req.query);
  var parsedRequest = url.parse(req.url, true);
  if('subscribe' === parsedRequest['query']['hub.mode'] && parsedRequest['query']['hub.challenge'] != null) {
    console.log("sending back hub_challange => ", parsedRequest['query']['hub.challenge']);
    res.send(parsedRequest['query']['hub.challenge']);
  } else {
    console.log("sending back nok => ");
    res.send(400, "nok");
  }
});

app.post('/subscriptions/callback/', function(req, res) {
  console.log("POST /subscriptions/callback/ => ", req.body);
  res.send("ok");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

