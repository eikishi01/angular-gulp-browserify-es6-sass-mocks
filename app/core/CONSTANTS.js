'use strict';

var CONSTANTS = (function() {

    var mockApiPort = 7000;

    return {

        APP_DEFAULT_ENV: 'PRD',

        APP_ENV_HOSTS: {
            'LCL': 'localhost',
            'PRD': '/'
        },

        // Dev servers ports
        mockApiPort: mockApiPort,

        // Server identifiers
        isMockApi: Number(location.port) === mockApiPort,

        APP_SERVICES_URL: '/services'
    };
}());

CONSTANTS.$inject = [];
module.exports = CONSTANTS;
