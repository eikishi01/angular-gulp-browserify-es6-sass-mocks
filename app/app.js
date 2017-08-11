'use strict';

window.jQuery = window.$ = window.jQuery || require('jquery');

const angular = require('angular'),
    dependencies = [
        require('angular-ui-router').default,
        require('./core').name,
        require('./modules/home').name
    ];

module.exports = angular.module('myApp', dependencies)
    .config(require('./app.config'))
    .constant('VERSION', require('../package.json').version)
    .run(require('./app.run.js'))
;
