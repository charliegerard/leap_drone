var express, path, drone, server, app, faye, client, controller, morgan, methodOverride, Leap;

express = require("express");
morgan = require("morgan");
bodyParser = require("body-parser");
methodOverride = require('method-override');
path = require("path");
http = require('http');
faye = require('faye');
Leap = require('leapjs');
drone = require("ar-drone").createClient(); // enables communication with drone in javascript
require("dronestream").listen(3001); // for video rendering
app = express();

var env = process.env.NODE_ENV || 'development';
if('development' == env){
  app.set('port', process.env.PORT || 3000); // process.env.PORT adjusts PORT to accept environmental parameter (ie deploying to Heroku)
  app.use(express.static(__dirname + '/public')); // serves static files from disk
  app.use("/node_modules", express.static(path.join(__dirname, 'node_modules')))
}

server = require('http').createServer(app);

var bayeux = new faye.NodeAdapter({  // central messaging server for clients to communicate with one another; Can also add 'engine' property, which controls backend of the server (ie faye-redis) and 'ping' property, which is how often, in seconds, to send keep-alive ping messages over WebSocket and EventSource connections. Used if Faye server will be accessed through a proxy that kills idle connections.
  mount: '/faye', // path on the host at which the Faye service is available (ie http://localhost:3001/faye).
  timeout: 50  // maximum time to hold connection open before returning response. Given in seconds and must be smaller than timeout on frontend webserver.
});

bayeux.attach(server); // attached to server; will handle all requests to paths matching the mount path and delegate all other requests to handlers.

client = new faye.Client("http://localhost:" + (app.get("port")) + "/faye", {}); // sets up new client at environmental port that accesses the server at the /faye mount

client.subscribe("/drone/move", function (d) { // move includes any directional actions
  console.log(d);
  console.log("drone move?")
  return drone[d.action](d.speed);
});

client.subscribe("/drone/drone", function (d) { // drone commands include takeoff and landing
  console.log(d);
  console.log("drone stuff")
  return drone[d.action]();
});

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get("port"));
})
