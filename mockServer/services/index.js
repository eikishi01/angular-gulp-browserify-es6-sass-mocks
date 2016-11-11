'use strict';

function services() {
    return {
        home: {
            options: require('./home/options')
        }
    };
}

module.exports = services();
