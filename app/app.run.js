'use strict';

function commonInit($injector, $rootScope) {

    var $state =        $injector.get('$state'),
        // $trace =        $injector.get('$trace'),
        $log =          $injector.get('$log'),
        $transitions =  $injector.get('$transitions');

    $rootScope.$state = $state;

    // $trace.enable('TRANSITION');

    $transitions.onStart({ }, function(trans) {
        trans.promise.finally(()=>{
            $log.info('TRANSITION START:', 'INFO:', 'https://ui-router.github.io/ng1/docs/latest/classes/transition.transitionservice.html#onstart');
        });
    });

    $transitions.onSuccess({ }, function(trans) {
        trans.promise.finally(()=>{
            $log.info('TRANSITION SUCCESS:', 'INFO:', 'https://ui-router.github.io/ng1/docs/latest/classes/transition.transitionservice.html#onsuccess');
        });
    });

    $transitions.onError({ }, function(trans) {
        trans.promise.finally(()=>{
            $log.info('TRANSITION ERROR:', 'INFO:', 'https://ui-router.github.io/ng1/docs/latest/classes/transition.transitionservice.html#onerror');
        });
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
