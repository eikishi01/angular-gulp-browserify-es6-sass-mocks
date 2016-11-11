// This config file does not define any routes.
// For module-level route definitions, use the *Routes.js files found in the module folders.

'use strict';

function appConfig($urlRouterProvider, $httpProvider, $compileProvider, $locationProvider, CONSTANTS) {

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(false);

    // https://docs.angularjs.org/guide/production
    if (!CONSTANTS.isMockApi && !CONSTANTS.isDevApi) {
        $compileProvider.debugInfoEnabled(false);
    }
}

appConfig.$inject = ['$urlRouterProvider', '$httpProvider', '$compileProvider', '$locationProvider', 'CONSTANTS'];
module.exports = appConfig;
