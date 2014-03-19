var express = require('express'),
    url = require('url'),
    instagram = require('./instagram'),
    path = require('path'),
    engine = require('ejs-locals'),
    WebSocketServer = require('ws').Server,
    http = require('http'),
    _ = require('underscore'),
    shortId = require('shortid'),
    routes = require('./routes'),
    clients = [];

app = express();
module.exports = app; // To make it available to tests

app.set('port', process.env.PORT || 3000);
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

app.get('/sthlm', routes.sthlm);

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
  if('subscribe' === parsedRequest['query']['hub.mode'] && parsedRequest['query']['hub.challenge'] != null) {
    //console.log("sending back hub_challange => ", parsedRequest['query']['hub.challenge']);
    res.send(parsedRequest['query']['hub.challenge']);
  } else {
    //console.log("sending back nok => ");
    res.send(400, "nok");
  }
});

// Recieves updates to the subscription we've setup
app.post('/subscriptions/callback/', function(req, res) {
  //console.log("POST /subscriptions/callback/ => ", req.body);
  var updates = _.where(req.body, {changed_aspect: "media", object: 'geography'});
  if(updates != null && updates.length > 0 && 'development' != process.env.NODE_ENV) {
    var object_id = updates[0].object_id;
    instagram.fetch_new_geo_media(object_id, 1, function(data) {
        console.log("new medias type! => " + typeof(data));
        for(var i in clients) {
          clients[i].send(JSON.stringify(data));
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

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  //console.log('Express server listening on port ' + app.get('port'));
});

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  ws.id = shortId.generate();
  clients[ws.id] = ws;
  //console.log(Object.keys(clients).length);
  ws.on('close', function() {
    delete clients[ws.id];
    //console.log(Object.keys(clients).length);
  });
});

