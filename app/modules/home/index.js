'use strict';

var angular = require('angular');

// Home View
module.exports = angular.module('myApp.home', [])
    .controller('homeController', require('./home.controller'))
    .factory('homeModel', require('./home.model'))
    .factory('homeApi', require('./home.restapi'))
    .config(require('./home.routes'))
;

