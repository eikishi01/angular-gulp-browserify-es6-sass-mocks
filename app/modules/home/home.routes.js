'use strict';

function homeRoutes($stateProvider) {

    var home = {
        url: '/',
        template: require('./home.tpl.html'),
        controller: 'homeController',
        controllerAs: 'Home',
        resolve: {}
    };

    $stateProvider.state('home', home);
}

homeRoutes.$inject = ['$stateProvider'];
module.exports = homeRoutes;
