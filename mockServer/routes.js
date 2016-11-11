'use strict';

var services = require('./services');

module.exports = function(app) {

    var apiPaths = {
            local: '/services'
        },
        routes = [
            [apiPaths.local + '/home/options', services.home.options]
        ];

    // ROUTES HERE
    // Mimic the production env tomcat context-path and base URL for the GRA Data Services
    routes.forEach(function(route) {
        app.use(route[0], function(req, res) {
            console.log('REQUESTED MOCK:', req.path,  '->', req.originalUrl);
            route[1](req, res);
        });
    });

    // PRIVATE METHODS
};
