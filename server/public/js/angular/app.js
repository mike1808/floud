'use strict';

var app = angular.module('floud', [
    'ngRoute', 'LocalStorageModule', 'mgcrea.ngStrap', 'angularTreeview',
    'floud.controllers', 'floud.services', 'floud.directives'
]);

angular.module('LocalStorageModule').value('prefix', 'floud');

angular.module('floud.controllers', []);
angular.module('floud.services', ['ngResource']);
angular.module('floud.directives', []);

app.config(['$routeProvider', '$locationProvider' , '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider.
        when('/', { templateUrl: '/views/index.html', controller: 'FileCtrl'}).
        when('/login', { templateUrl: '/views/login.html', controller: 'UserCtrl'}).

        otherwise({ redirectTo: '/'});

}]);