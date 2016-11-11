'use strict';

const angular = require('angular');

module.exports = angular.module('myApp.core', [])
    .constant('CONSTANTS', require('./CONSTANTS'))
    .service('appSettings', require('./app.settings'))
    .service('environment', require('./services/environment'))
;
