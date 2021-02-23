const routeController = require('./routes/routeController');
const SERVER_PORT = 3000;
const http = require('http')

let express = require('express');

var settings = require('./settings');

var app = express();

// Set up routes
routeController(app);

// Start server
http.createServer(app).listen(SERVER_PORT);
