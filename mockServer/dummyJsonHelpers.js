'use strict';

var dummyjson = require('dummy-json'),
    helpers = (function() {
        return {
            randomString: function(length) {
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                    stringLength = length || 5,
                    randomString = [];

                for (var i = 0; i < stringLength; i++) {
                    randomString.push(possible[Math.floor(Math.random() * possible.length)]);
                }

                return randomString.join('');
            },
            currency: function() {
                // Use randomArrayItem to ensure the seeded random number generator is used
                return dummyjson.utils.randomArrayItem(['USD', 'GBP', 'CAD', 'AUD']);
            }
        };
    }());

module.exports = helpers;
