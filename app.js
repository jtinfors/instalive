require('newrelic');
var express         = require('express'),
    http            = require('http'),
    morgan          = require('morgan'),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    favicon         = require('static-favicon'),
    hbs             = require('hbs'),
    url             = require('url'),
    instagram       = require('./lib/instagram'),
    path            = require('path'),
    WebSocketServer = require('ws').Server,
    _               = require('underscore'),
    clients         = [],
    subscriptions   = {};

app = express();
module.exports = app; // To make it available to tests

app.use(morgan('default'));
app.use(bodyParser());
app.use(methodOverride());

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');

var blocks = {};

hbs.registerHelper('extend', function(name, context) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }
  block.push(context.fn(this));
});

hbs.registerHelper('block', function(name) {
  var val = (blocks[name] || []).join('\n');
  // clear the block
  blocks[name] = [];
  return val;
});

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/om', function(req, res) {
  res.render('about');
});

app.get('/stats/?', function(req, res) {
  res.render('stats', {items: map_subscriptions()});
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
  var parsedRequest = url.parse(req.url, true);
  /*jshint sub: true */
  if('subscribe' === parsedRequest['query']['hub.mode'] && parsedRequest['query']['hub.challenge'] !== null) {
    res.send(parsedRequest['query']['hub.challenge']);
  } else {
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
          if(err.message === "not opened") { deallocate_socket(clients[i]); }
        }
      });
  }
}

// Recieves updates from Instagram to our subscriptions
app.post('/subscriptions/callback/', function(req, res) {
  // console.log("POST /subscriptions/callback/ => ", req.body);
  var updates = _.where(req.body, {changed_aspect: "media", object: 'geography'});
  if(updates !== null && updates.length > 0) {
    /* jshint -W083 */ // TODO: http://jslinterrors.com/dont-make-functions-within-a-loop/
    for(var i=0;i < updates.length;i++) {
      (function(subscription) {
        instagram.fetch_new_geo_media(subscription.object_id, 1, function(err, data) {
          if(!err) {
            var item;
            try { // TODO: Most likely we will not get broken json at this stage. remove suspenders
              item = JSON.parse(data);
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
  instagram.delete_subscription(req.params.id, function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

app.post('/subscriptions/all/delete', function(req, res) {
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
server.listen(app.get('port'));

// var wss = new WebSocketServer({server: server}); olden

var io = require('socket.io').listen(server);
io.on('connection', function(ws) {
  ws.on('message', function(message) {
    var mess = JSON.parse(message);
    switch(mess.type) {
      case "subscribe":
        if(subscriptions[mess.location]) {
          ws.subscription_id = subscriptions[mess.location].subscription_id;
          ws.object_id = subscriptions[mess.location].object_id;
          ws.location = mess.location;
          clients.push(ws);
          fetch_som_pics(mess.location, 5, function(err, data) {
            if(!err) {
              var json_data = JSON.parse(data);
              if(json_data !== undefined && json_data.data !== undefined) {
                json_data.data.reverse();
                ws.send(JSON.stringify({type: "update", message: json_data}), function(err) {
                  if(err) {
                    console.log("Failed to send update to client=> ", err);
                  }
                });
              }
            }
          });
        } else {
          instagram.subscribe(mess.location, function(err, data) {
            if(err) {
              console.log("problem creating new subscription => ", err);
              ws.send(JSON.stringify({type: "alert", heading: "Fel vid anslutning", message: "Kunde inte ansluta till Instagram (" + err.message + ")"}),
                  function(err) {
                    if(err) {
                      console.log("Failed to send message to client => ", err);
                      if(err.message === "not opened") { deallocate_socket(ws); }
                    }
                  });
            } else {
              var json_data = JSON.parse(data);
              if(json_data !== undefined && json_data.data !== undefined) {
                if(json_data.meta.code === 200) {
                  subscriptions[mess.location] = { object_id: json_data.data.object_id, subscription_id: json_data.data.id };
                  ws.subscription_id = json_data.data.id;
                  ws.object_id = json_data.data.object_id;
                  ws.location = mess.location;
                  clients.push(ws);
                  ws.send(JSON.stringify({type: "message", message: "Ansluten"}),
                    function(err) {
                      if(err) { if(err.message === "not opened") { deallocate_socket(ws); } }
                    });
                  fetch_som_pics(mess.location, 5, function(err, data) {
                    if(!err) {
                      var json_data = JSON.parse(data);
                      json_data.data.reverse();
                      ws.send(JSON.stringify({type: "update", message: json_data}), function(err){
                        if(err) { console.log("Failed to send update to client=> ", err); }
                      });
                    }
                  });
                }
              } else {
                ws.send(JSON.stringify({
                  type: "alert",
                  heading: "Problem vid anslutning till Instagram",
                  message: [json_data.meta.code, json_data.meta.error_type, json_data.meta.error_message].join(", ")}),
                  function(err) {
                    if(err) { console.log("Failed to send message to client => ", err);
                      if(err.message === "not opened") { deallocate_socket(ws); }
                    }
                });
              }
            }
          });
        }
        break;
    }

  });
  ws.on('disconnect', function() {
    console.log('client decided do disconnect');
    deallocate_socket(ws);
  });
});

function fetch_som_pics(location, count, callback) {
  instagram.search_media(location, count, callback);
}

function deallocate_socket(ws) {
  var remaining_clients = _.where(clients, {subscription_id: ws.subscription_id});
  if(remaining_clients.length === 1) {
    instagram.delete_subscription(ws.subscription_id, function(err, data) {
      if(err) {
        console.log("Failed to unsubscribe from ", ws.subscription_id, err);
      } else {
        delete subscriptions[ws.location];
        clients.pop(ws);
      }
    });
  }
}

function map_subscriptions() {
  var keys = _.keys(subscriptions);
  var result = [];
  for(var i=0;i<keys.length;i++) {
    var item = {};
    item.location = keys[i];
    item.num = _.where(clients, subscriptions[keys[i]]).length;
    result.push(item);
  }
  return result;
}

// All these are exported for testing purposes only
// TODO: find a better way
module.exports.deallocate_socket = deallocate_socket;
module.exports.instagram = instagram;
module.exports.clients = clients;
module.exports.subscriptions = subscriptions;
module.exports.map_subscriptions = map_subscriptions;
