'use strict';

function fetchHomeOptions($injector) {

    var $q = $injector.get('$q'),
        homeApi = $injector.get('homeApi'),
        $http = $injector.get('$http');

    return function() {

        var defer = $q.defer(),
            restCallPromise,
            serviceURL = homeApi.homeOptions;

        restCallPromise = $http.post(serviceURL, {});

        restCallPromise
            .then(function(response) {
                defer.resolve(response);
            })
            .catch(function(error) {
                defer.reject(error);
            });

        return defer.promise;
    };
}

function homeModel($injector) {
    var dataServices = {
        fetchHomeOptions: fetchHomeOptions($injector)
    };

    return dataServices;
}

// **********************************************************************************
// Private Methods
// **********************************************************************************

homeModel.$inject = ['$injector'];
module.exports = homeModel;
