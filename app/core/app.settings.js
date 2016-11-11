'use strict';
function appSettings($injector) {

    var appSettings,
        CONSTANTS = $injector.get('CONSTANTS'), 
        environment = $injector.get('environment');

    function getEnvironment() {
        return environment.name();
    }

    function getRestApiEndPoint() {
        return CONSTANTS.APP_SERVICES_URL;
    }

    appSettings = {

        environment: getEnvironment(),

        restApiEndPoint: getRestApiEndPoint
    };

    return appSettings;
}

appSettings.$inject = ['$injector'];
module.exports = appSettings;
