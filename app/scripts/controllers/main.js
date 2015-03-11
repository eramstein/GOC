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

        $scope.resizeCharts = function () {
            var chart = d3.select('.svg-container');
            chart.style('width', '200px');
        };

    });