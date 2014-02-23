var express = require('express'),
    instagram = require('./instagram'),
    // redis = require("redis"),
    // client = redis.createClient(), // TODO: handle error on create?
    http = require('http');

app = express();
app.set('port', process.env.PORT || 3000);


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
  console.log("IN CALLBACK! => ", req.query);
  var hub_challange = req.query['hub.challange'];
  var hub_token = req.query['hub.token'];
  console.log(hub_challange);
  if(hub_challange != null) {
    console.log("sending back hub_challange => ", hub_challange);
    res.send(hub_challange);
  } else {
    console.log("sending back ok => ");
    res.send(400, "nok");
  }
});

app.post('/subscriptions/callback/', function(req, res) {
  console.log("RECIEVED UPDATE! => ", req);
  res.send("ok");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

