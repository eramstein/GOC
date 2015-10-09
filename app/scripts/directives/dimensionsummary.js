'use strict';

angular.module('gocApp')
  .directive('dimensionSummary', function ($filter, Data) {
    return {
      templateUrl: '/views/templates/dimensionSummary.html',
      restrict: 'E',
      scope: {name: '@dimension', label: '@label', createChart: '=createfn'},
      link: function postLink(scope, element, attrs) {
        var dim = Data.dimensions[scope.name];        
        scope.dataType = dim.dataType;
        if(scope.dataType === 'text'){
            scope.dataRange = 'with ' + dim.groupOn().length + ' distinct values';
        } else {
            var quartiles = dim.getQuartiles();
            if(scope.dataType === 'number'){
                scope.dataRange =  'between ' + $filter('number')(quartiles.min) + ' and ' + $filter('number')(quartiles.max);
            } else {
                scope.dataRange =  'from ' + quartiles.min + ' to ' + quartiles.max;
            }
        }        
      }
    };
  });
