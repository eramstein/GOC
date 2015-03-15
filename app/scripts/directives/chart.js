'use strict';

angular.module('gocApp')
  .directive('chart', function ($window, Data, Config) {
    return {
      templateUrl: '/views/templates/chart.html',
      restrict: 'E',
      scope: {initConfig: '=config'},
      link: function postLink(scope, element, attrs) {

        var dimensions = Data.dimensions;

        // ------------------------------------------------------------------------------------------------
        // INTERACTION WITH D3 MODULES
        // ------------------------------------------------------------------------------------------------
                
        var svg = element[0].querySelector('svg');    
        var chart = new $window.CHARTS(svg);
        var data;
        var previousChart = {
          'showMe': {'dim': null, 'agg': null, 'type': null},
          'viewBy': [],
          'chartTypeName': null
        };

        chart.showMeChanged = function () {
          var showMe = {'dim': scope.userSelection.showMe.dim, 'agg': scope.userSelection.showMe.agg, 'type': scope.userSelection.showMe.type};

          if(_.isEqual(showMe, previousChart.showMe)){
            return false;
          }

          //if only the aggregation method changed
          if(showMe.dim === previousChart.showMe.dim && showMe.agg !== previousChart.showMe.agg){
            // TODO
          }

          //if the dimension changed...
          if(showMe.dim !== previousChart.showMe.dim) {            

            //clear previous chart
            if(previousChart.chartTypeName) {
              //if the previous dim was text, clear old bubles
              if(previousChart.showMe.type === 'text') {
                chart.constants.bubles.makeNew([], showMe.dim);
              }

              //if the previous dim was number, clear old paths
              if(previousChart.showMe.type === 'number') {
                // TODO
              }
              
              chart[previousChart.chartTypeName].clear();
            }            

            //if the new dim is text, create new bubles
            if(showMe.type === 'text') {
              data = dimensions[showMe.dim].groupOnAndAggAll();
              chart.constants.bubles.makeNew(data, showMe.dim);
              chart[scope.userSelection.chartType.name].build();
              chart[scope.userSelection.chartType.name].update(data, []);
            }

            //if the new dim is number, create new paths
            if(showMe.type === 'number') {
              data = dimensions[showMe.dim].aggregateOver({'dims':[], 'aggregator':showMe.agg});
              //TODO
            }
          }          

          //update previousChart
          previousChart.showMe = showMe;
          previousChart.chartTypeName = scope.userSelection.chartType.name;
        };

        chart.viewByChanged = function () {
          chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
        };

        chart.chartTypeChanged = function () {
          var chartType = scope.userSelection.chartType.name;

        };

        chart.colorByChanged = function () {          
          chart.constants.bubles.changeColor(scope.userSelection.colorBy, dimensions[scope.userSelection.colorBy].dataType);
        };

        chart.sizeByChanged = function () {
          chart.constants.bubles.changeSize(scope.userSelection.sizeBy);
          chart[scope.userSelection.chartType.name].onResize();
        };

        // ------------------------------------------------------------------------------------------------
        // CHART CONFIG UI
        // ------------------------------------------------------------------------------------------------                

        scope.userSelection = {
            'showMe': {'dim': null, 'agg': null, 'type': null},
            'viewBy': [],
            'colorBy': null,
            'sizeBy': null,
            'chartType': null
        };

        //list of dims available as "show me" - all but time        
        scope.showMeDims = {
          'text':  _.pluck(_.filter(dimensions, { 'dataType': 'text' }), 'name'),
          'number':  _.pluck(_.filter(dimensions, { 'dataType': 'number' }), 'name')
        };

        //setters 
        scope.changeShowMe = function (dim) {
          //update userSelection.showMe
          scope.userSelection.showMe.dim = dim;
          scope.userSelection.showMe.type = dimensions[dim].dataType;
          scope.userSelection.showMe.hasUniqueValues = dimensions[dim].hasUniqueValues;
          if(dimensions[dim].dataType === 'number' && !scope.userSelection.showMe.agg){
            scope.userSelection.showMe.agg = 'sum';
          }
          //reset chart types dropdown
          scope.refreshAvailableChartTypes();
          //clear all other userSelection
          scope.userSelection.viewBy = [];
          scope.changeColorBy(null);
          scope.changeSizeBy(null);          
          //tell the chart
          chart.showMeChanged();
        };

        scope.changeViewBy = function (dim, index) {
          //update userSelection.viewBy
          if(dim){
            scope.userSelection.viewBy[index] = {'dim': dim, 'type': dimensions[dim].dataType, 'agg': 'sum'};
          } else {
            scope.userSelection.viewBy.splice(index, 1);
          }
          //reset chart types dropdown
          scope.refreshAvailableChartTypes();
          //tell the chart
          chart.viewByChanged();
        };

        scope.changeChartType = function (chartType) {
          scope.userSelection.chartType = chartType;
        };

        scope.changeColorBy = function (dim) {
          if(dim !== scope.userSelection.colorBy){
            scope.userSelection.colorBy = dim;
            chart.colorByChanged();
          }
        };

        scope.changeSizeBy = function (dim) {
          if(dim !== scope.userSelection.sizeBy){
            scope.userSelection.sizeBy = dim;
            chart.sizeByChanged();
          }          
        };

        //find which chart types are relevant based on the currently selected showMe (primaryDataType) and viewBy (secondaryDatatypes)
        scope.refreshAvailableChartTypes = function() {

          //get primaryDataType and secondaryDatatypes
          var primaryDataType = scope.userSelection.showMe.type;
          var secondaryDatatypes = [];
          if (scope.userSelection.viewBy[0]) {
            if (scope.userSelection.viewBy[1]) {
              secondaryDatatypes = [scope.userSelection.viewBy[0].type, scope.userSelection.viewBy[1].type];
            } else {
              secondaryDatatypes = [scope.userSelection.viewBy[0].type];
            }
          }

          //filter Config.chartTypes accordingly
          var relevantTypes = _.filter(Config.chartTypes, function(d) {            
            var primaryDatatypeMatches = d.primaryDatatypes.indexOf(primaryDataType) >= 0;            
            var secondaryDatatypesMatch = _.filter(d.secondaryDatatypes, function (dt) {
              return _.isEqual(dt.sort(), secondaryDatatypes.sort());
            }).length;
            return primaryDatatypeMatches && secondaryDatatypesMatch;
          });

          scope.chartTypes = relevantTypes;
          scope.userSelection.chartType = scope.chartTypes[0];

        };

        //initial config
        if(scope.initConfig.pivotDim){
          scope.changeShowMe(scope.initConfig.pivotDim);
        }        

      }
    };
  });
