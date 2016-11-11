'use strict';

var fs = require('fs'),
    dummyjson = require('dummy-json'),
    helpers = require('../../dummyJsonHelpers');

module.exports = function(req, res) {
    fs.readFile(__dirname + '/templates/options.hbs', {encoding: 'utf8'}, function(err, options) {
        var results = JSON.parse(dummyjson.parse(options, {helpers: helpers}));
        res.type('json');
        res.send(JSON.stringify(results));
    });
};
