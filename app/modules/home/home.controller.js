'use strict';

/**
 * Request fund left nav data from server and return response
 */
function getHomeData(ctrl, $injector) {

    var homeModel = $injector.get('homeModel'),
        $log =      $injector.get('$log');

    // make server call
    homeModel.fetchHomeOptions()
        .then(function(response) {
            $log.info('SUCCESS SERVER CALL', response);
        })
        .catch(function() {
            $log.info('ERROR ON SERVER CALL');
        });
}

// Controller naming conventions should start with an uppercase letter
function homeCtrl($injector) {
    var $log =          $injector.get('$log'),
        VERSION =       $injector.get('VERSION'),
        _self = this;

    _self.VERSION = VERSION;

    getHomeData(_self, $injector);

    $log.debug('Home Controller LOADED');
}

// $inject is necessary for minification. See http://bit.ly/1lNICde for explanation.
homeCtrl.$inject = ['$injector'];
module.exports = homeCtrl;
