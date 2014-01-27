'use strict';

angular.module('floud.services').
    service('Auth', ['localStorageService', '$location', '$resource', '$q', function(localStorageService, $location, $resource, $q) {
        var self = this;

        var user = null;
        var token = localStorageService.get('token');

        var usersApi = '/api/v1.0/users';
        var usersRes = $resource(usersApi + '/:id', {}, {
            login: {
                url: usersApi + '/login',
                method: 'POST'
            },
            register: {
                method: 'PUT'
            },
            current: {
                url: usersApi + '/current',
                method: 'GET',
                transformRequest:  function(data, headers) {
                    headers()['Authorization'] = self.getToken();
                    return JSON.stringify(data);
                }
            }
        });

        self.isAuthenticated = function() {
            return !!user;
        };

        self.getToken = function() {
            if (!token) $location.path('/login');
            return token;
        };

        self.setToken = function(newToken) {
            token = newToken;
            localStorageService.set('token', token);
        };

        self.getUser = function() {
            var d = $q.defer();

            if (!user) {
                usersRes.current(function(currentUser) {
                    user = currentUser;
                    d.resolve(currentUser);
                }, d.reject);
            } else {
                d.resolve(user);
            }

            return d.promise;
        };

        self.logout = function() {
            user = null;
            self.setToken(null);
        };

        self.login = function(userData) {
            var d = $q.defer();
            usersRes.login(userData, function(data) {
                self.setToken(data.token);
                self.getUser().then(d.resolve, d.reject);
            }, function(response) {
                d.reject(response);
            });

            return d.promise;
        };

        self.register = function(userData) {
            var d = $q.defer();
            usersRes.register(userData, function(data) {
                self.setToken(data.token);
                self.getUser().then(d.resolve, d.reject);
            }, function(response) {
                d.reject(response);
            });

            return d.promise;
        };

    }]);