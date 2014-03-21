var express = require('express'),
    url = require('url'),
    instagram = require('./instagram'),
    path = require('path'),
    engine = require('ejs-locals'),
    WebSocketServer = require('ws').Server,
    http = require('http'),
    _ = require('underscore'),
    clients = [],
    subscriptions = {};

app = express();
module.exports = app; // To make it available to tests

app.set('port', process.env.PORT || 3000);
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.redirect('/sthlm');
});

app.get('/sockets', function(req, res) {
  res.json(Object.keys(clients).length);
});

app.get('/subscriptions/?', function(req, res) {
  instagram.subscriptions(function(data) {
    res.send(data);
  });
});

app.get('/subscriptions/callback/', function(req, res) {
  //console.log("GET /subscriptions/callback/ => ", req.query);
  var parsedRequest = url.parse(req.url, true);
  if('subscribe' === parsedRequest['query']['hub.mode'] && parsedRequest['query']['hub.challenge'] !== null) {
    //console.log("sending back hub_challange => ", parsedRequest['query']['hub.challenge']);
    res.send(parsedRequest['query']['hub.challenge']);
  } else {
    //console.log("sending back nok => ");
    res.send(400, "nok");
  }
});

// Recieves updates to the subscription we've setup
app.post('/subscriptions/callback/', function(req, res) {
  // console.log("POST /subscriptions/callback/ => ", req.body);
  var updates = _.where(req.body, {changed_aspect: "media", object: 'geography'});
  if(updates !== null && updates.length > 0) {
    var object_id = updates[0].object_id;
    instagram.fetch_new_geo_media(object_id, 1, function(data) {
      try {
        var item = JSON.parse(data);
      } catch (e) {
        console.log("exception => ", e);
        console.log("problem parsing data => ", data);
        return;
      }
      var subset = _.where(clients, {location : object_id});
      for(var i in subset) {
        subset[i].send(
          JSON.stringify({type: "update", message: item}),
          /*jshint -W083 */
          function(err) {
            if(err) { console.log("failed to send update to client => ", err); }
          });
      }
    });
  }
  res.send("ok");
});

app.post('/subscriptions/:id(\\d+)/delete', function(req, res) {
  //console.log("POST /subscriptions/:id/delete => ", req.params);
  instagram.delete_subscription(req.params.id, function(data) {
    res.send(data);
  });
});

app.post('/subscriptions/all/delete', function(req, res) {
  //console.log("POST /subscriptions/all/delete => ", req.params);
  instagram.delete_all_subscription(function(data) {
    res.send(data);
  });
});

app.get('/:name', function(req, res) {
  res.render("images");
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  //console.log('Express server listening on port ' + app.get('port'));
});

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    var mess = JSON.parse(message);
    console.log("incoming message => ", mess);
    if(mess.type == "subscribe") {
      if(subscriptions[mess.location]) {
        ws.location = subscriptions[mess.location];
        clients.push(ws);
      } else {
        instagram.subscribe(mess.location, function(err, data) {
          if(err) {
            console.log("problem creating new subscription => ", err);
            ws.send(JSON.stringify({type: "message", message: err.message}));
          } else {
            var json_data = JSON.parse(data);
            if(json_data.meta.code === 200) {
              subscriptions[mess.location] = json_data.data.object_id;
              ws.location = json_data.data.object_id;
              clients.push(ws);
              ws.send(JSON.stringify({type: "message", message: "Subscription created"}));
            } else {
              ws.send(JSON.stringify({
                type: "message",
                message: [obj.meta.code, obj.meta.error_type, obj.meta.error_message].join(", ") }));
            }
          }
        });
      }
    }
  });
  ws.on('close', function() {
    console.log("client " + ws + " decieded to disconnect");
    clients.splice(clients.indexOf(ws), clients.indexOf(ws)+1);
  });
});

