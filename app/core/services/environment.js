'use strict';

function invert(obj) {
    var i, n,
        result = {},
        keys = Object.keys(obj);

    for (i = 0, n = keys.length; i < n; i++) {
        result[obj[keys[i]]] = keys[i];
    }

    return result;
}

function EnvironmentFactory($location, CONSTANTS) {
    var nameByHost = invert(CONSTANTS.APP_ENV_HOSTS);

    return {
        name: function() {
            return nameByHost[$location.host()] || CONSTANTS.APP_DEFAULT_ENV;
        }
    };
}

EnvironmentFactory.$inject = ['$location', 'CONSTANTS'];
module.exports = EnvironmentFactory;
