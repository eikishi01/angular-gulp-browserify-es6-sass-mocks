'use strict';

function commonInit($injector, $rootScope) {

    var $state = $injector.get('$state');

    $rootScope.$state = $state;

    $rootScope.$on('$stateChangeError', function(evt, to, toParams, from, fromParams, error) {
        if (error.redirectTo) {
            $state.go(error.redirectTo);
        }
    });

    $rootScope.$on('$stateChangeStart', function(/*event, toState, toParameters, fromState, fromParameters*/) {
        // do nothing
    });

    $rootScope.$on('$stateChangeSuccess', function(/*event, toState, toParameters, fromState, fromParameters*/) {
        // do nothing
    });

    // Make sure the page scrolls to the top on all state transitions
    $rootScope.$on('$viewContentLoaded', function() {
        if (document.readyState === 'complete') {
            window.scrollTo(0, 0);
        }
    });
}

commonInit.$inject = ['$injector', '$rootScope'];
module.exports = commonInit;
