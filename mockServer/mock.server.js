'use strict';

// Set up an express server (but not starting it yet)
var express = require('express'),
    livereload = require('connect-livereload'),
    server = express(),
    mockServerPort = (process.env.SERVER_PORT) || 7000,
    livereloadport = (process.env.LR_PORT) || 35729,
    ROOT_PATH = (process.env.ROOT_PATH) || './dist';

// Add live reload scrip to the mock server
server.use(livereload({
    port: livereloadport,
    ignore: ['.js', '.css']
}));

// Use our 'dist' folder as rootfolder
server.use(express.static(ROOT_PATH));

// configure our routes, this has to be set before the server.all
require('./routes')(server);

// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
    res.sendFile('index.html', { root: ROOT_PATH });
});

// Start webserver
server.listen(mockServerPort);
