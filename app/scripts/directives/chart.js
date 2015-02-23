'use strict';

angular.module('gocApp')
  .directive('chart', function ($window, Data) {
    return {
      templateUrl: '/views/templates/chart.html',
      restrict: 'E',
      scope: {initConfig: '=config'},
      link: function postLink(scope, element, attrs) {

        // CHART CONFIG UI
        // ---------------------------------------------------

        var dimensions = Data.dimensions;

        scope.userSelection = {
            'showMe': {'dim': null, 'agg': null, 'type': null},
            'sliceBy': [],
            'posBy': [],
            'colorBy': null,
            'sizeBy': null,
            'chartType': null
        };        

        //list of dims available as "show me" - all but time        
        scope.showMeDims = {
          'text':  _.pluck(_.filter(dimensions, { 'dataType': 'text' }), 'name'),
          'number':  _.pluck(_.filter(dimensions, { 'dataType': 'number' }), 'name')
        };

        //setters (can't use ng-model with bootstrap dropdowns, don't want to use angular UI just for that)  
        scope.showMe = function (dim) {
          scope.userSelection.showMe.dim = dim;
          scope.userSelection.showMe.type = dimensions[dim].dataType;
          if(dimensions[dim].dataType === 'number' && !scope.userSelection.showMe.agg){
            scope.userSelection.showMe.agg = 'sum';
          }
        };

        scope.posBy = function (dim, index) {
          if(dim){
            scope.userSelection.posBy[index] = {'dim': dim, 'agg': 'sum'};
          } else {
            scope.userSelection.posBy[index] = null;
          }          
        };

        //initial config
        if(scope.initConfig.pivotDim){
          scope.showMe(scope.initConfig.pivotDim);
        }


        // INTERACTION WITH D3 MODULES
        // ---------------------------------------------------
        var svg = element[0].querySelector('svg');
        var chart = new $window.CHARTS(svg);
        var data = dimensions.District.groupOn();
        chart.constants.bubles.circles.setup(data, 'key');

      }
    };
  });
