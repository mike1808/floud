'use strict';

angular.module('floud.controllers').controller('FileCtrl', ['$location', 'Auth', '$scope', 'File', function($location, Auth, $scope, File) {
    $scope.files = null;

    File.list({}, function(filesTree) {
        $scope.files = filesTree.files;
    });
}]);