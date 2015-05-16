'use strict';

angular.module('gocApp')
    .controller('MainCtrl', function($scope) {

        $scope.state = {
            visibility: {
                sidebar: false,
                charts: false,
                options: false,
                startup: true
            }
        };

    });