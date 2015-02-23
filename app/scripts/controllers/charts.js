'use strict';

angular.module('gocApp')
  .controller('ChartsCtrl', function ($scope, ChartsManager) {    

    $scope.$on('CHARTS_COLLECTION_CHANGED', function(event, args) {
       $scope.charts = args;
    });
    
  });
