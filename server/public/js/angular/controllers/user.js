'use strict';

angular.module('floud.controllers').controller('UserCtrl', ['$scope', 'Auth', '$location', function($scope, Auth, $location) {
    $scope.login = function(username, password) {
        Auth.login({
            username: username,
            password: password
        }).then(function() {
                $location.path('/');
            });
    }
}]);