'use strict';

angular.module('floud.controllers').controller('MainCtrl', ['$location', 'Auth', '$scope', function($location, Auth, $scope) {
    $scope.user = null;

    Auth.getUser().then(function(userData) {
        $scope.user = userData;
    }, function() {
        $location.path('/login');
    });
}]);