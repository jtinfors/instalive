require('newrelic');
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
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/sockets', function(req, res) {
  res.json(Object.keys(clients).length);
});

app.get('/stored_subscriptions/?', function(req, res) {
  res.send(subscriptions);
});

app.get('/subscriptions/?', function(req, res) {
  instagram.subscriptions(function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }
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

function update_clients(clients, item) {
  for(var i in clients) {
    clients[i].send(
      JSON.stringify({type: "update", message: item}),
      /*jshint -W083 */
      function(err) {
        if(err) {
          console.log("failed to send update to client => ", err);
          if(err.message === "not opened") { deallocate_socket(clients[i]) }
        }
      });
  }
}

// Recieves updates from Instagram to our subscriptions
app.post('/subscriptions/callback/', function(req, res) {
  // console.log("POST /subscriptions/callback/ => ", req.body);
  var updates = _.where(req.body, {changed_aspect: "media", object: 'geography'});
  if(updates !== null && updates.length > 0) {
    for(var i=0;i < updates.length;i++) {
      (function(subscription) {
        instagram.fetch_new_geo_media(subscription.object_id, 1, function(err, data) {
          if(err) {
            console.log("problem fetching new geo_media => ", err);
          } else {
            try { // TODO: Most likely we will not get broken json at this stage. remove suspenders
              var item = JSON.parse(data);
            } catch (e) {
              console.log("exception => ", e + "\nproblem parsing data => ", data);
              return;
            }
            update_clients(_.where(clients, {object_id: subscription.object_id}), item);
          }
        });
      })(updates[i]);
    }
  }
  res.send("ok");
});

app.post('/subscriptions/:id(\\d+)/delete', function(req, res) {
  //console.log("POST /subscriptions/:id/delete => ", req.params);
  instagram.delete_subscription(req.params.id, function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

app.post('/subscriptions/all/delete', function(req, res) {
  //console.log("POST /subscriptions/all/delete => ", req.params);
  instagram.delete_all_subscription(function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }
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
    switch(mess.type) {
      case "subscribe":
        if(subscriptions[mess.location]) {
          ws.subscription_id = subscriptions[mess.location].subscription_id;
          ws.object_id = subscriptions[mess.location].object_id;
          clients.push(ws);
          fetch_som_pics(mess.location, function(err, data) {
            if(!err) {
              var json_data = JSON.parse(data);
              json_data.data.reverse();
              ws.send(JSON.stringify({type: "update", message: json_data}), function(err){
                console.log("oh noes => ", err);
              });
            }
          });
        } else {
          instagram.subscribe(mess.location, function(err, data) {
            if(err) {
              console.log("problem creating new subscription => ", err);
              ws.send(JSON.stringify({type: "alert", heading: "Fel vid anslutning", message: "Kunde inte ansluta till Instagram (" + err.message + ")"}),
                  function(err) {
                    if(err) {
                      console.log("failed to send message to client => ", err);
                      if(err.message === "not opened") { deallocate_socket(ws) }
                    }
                  });
            } else {
              var json_data = JSON.parse(data);
              if(json_data.meta.code === 200) {
                console.log("adding ", json_data.data, " to subscriptions => ", mess.location);
                subscriptions[mess.location] = { object_id: json_data.data.object_id, subscription_id: json_data.data.id };
                ws.subscription_id = json_data.data.id;
                ws.object_id = json_data.data.object_id;
                clients.push(ws);
                ws.send(JSON.stringify({type: "message", message: "Ansluten"}),
                        function(err) {
                          if(err) { if(err.message === "not opened") { deallocate_socket(ws) } }
                        });
                fetch_som_pics(mess.location, function(err, data) {
                  if(!err) {
                    var json_data = JSON.parse(data);
                    json_data.data.reverse();
                    ws.send(JSON.stringify({type: "update", message: json_data}), function(err){
                      console.log("oh noes => ", err);
                    });
                  }
                });
              } else {
                ws.send(JSON.stringify({
                  type: "alert",
                  heading: "Problem vid anslutning till Instagram",
                  message: [obj.meta.code, obj.meta.error_type, obj.meta.error_message].join(", ")}),
                  function(err) {
                    if(err) { console.log("failed to send message to client => ", err);
                      if(err.message === "not opened") { deallocate_socket(ws) }
                    }
                });
              }
            }
          });
        }
        break;
      case "ping":
        ws.send(JSON.stringify({type: "pong"}));
        break;
    }

  });
  ws.on('close', function() {
    console.log("client " + ws + " decided to disconnect");
    deallocate_socket(ws)
  });
});

// TODO: Refactor to use http://instagram.com/developer/endpoints/media/ search API
function fetch_som_pics(location, callback) {
  instagram.search_media(location, callback);
}

function deallocate_socket(ws) {
  if(clients.indexOf(ws) !== -1) {
    clients.splice(clients.indexOf(ws), 1);
    var remaining_clients = _.where(clients, {subscription_id: ws.subscription_id});
    if(remaining_clients.length === 0) {
      instagram.delete_subscription(ws.subscription_id, function(err, data) {
        if(err) {
          console.log("Could not unsubscribe from ", ws.subscription_id, err);
        } else {
          var logical_location = _.invert(subscriptions)[{
            subscription_id: ws.subscription_id,
            object_id: ws.object_id
          }];
          if(logical_location) {
            delete subscriptions[logical_location];
          }
        }
      });
    }
  }
}

// All these are exported for testing purposes only
// TODO: find a better way
module.exports.deallocate_socket = deallocate_socket;
module.exports.instagram = instagram;
module.exports.clients = clients;
module.exports.subscriptions = subscriptions;
