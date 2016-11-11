'use strict';

/**
 * @ngdoc service
 * @name homeApi
 * @memberOf myApp.home
 *
 * @description
 * REST API service constants for Home module
 */

function restApi($injector) {

    var apiEndPoint = $injector.get('appSettings').restApiEndPoint(),
        services = {
            homeOptions: apiEndPoint + '/home/options'
        };

    return services;
}

restApi.$inject = ['$injector'];
module.exports = restApi;
