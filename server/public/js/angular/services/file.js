'use strict';

angular.module('floud.services').
    service('File', ['Auth', '$resource', function(Auth, $resource) {
        var filesApi = '/api/v1.0/files';
        var filesRes = $resource(filesApi, {}, {
            list: {
                method: 'GET',
                transformRequest:  function(data, headers) {
                    headers()['Authorization'] = Auth.getToken();
                    return JSON.stringify(data);
                }
            },
            upload: {
                method: 'POST',
                transformRequest:  function(data, headers) {
                    headers()['Authorization'] = Auth.getToken();
                    return JSON.stringify(data);
                }
            },
            get: {
                url: filesApi + '/file',
                method: 'GET',
                transformRequest:  function(data, headers) {
                    headers()['Authorization'] = Auth.getToken();
                    return JSON.stringify(data);
                }
            },
            delete: {
                url: filesApi + '/file',
                method: 'DELETE',
                transformRequest:  function(data, headers) {
                    headers()['Authorization'] = Auth.getToken();
                    return JSON.stringify(data);
                }
            }
        });

        return filesRes;
    }]);