"use strict";

var express = require('express');
var app = express();
var routes = require('./routes');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var http = require('http').Server(app);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('view-options', {
	layout: false
})

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride());
app.use(express.static(__dirname + '/pub'));

app.get('/', routes.game);

var port = process.env.PORT || 8080;
http.listen(port);

console.log("server is running on port: " +  port)