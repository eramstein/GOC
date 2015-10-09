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
            data = dimensions[showMe.dim].aggregateOver({'dims': scope.userSelection.viewBy, 'aggregator':showMe.agg});
            chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
          }

          //if the dimension changed...
          if(showMe.dim !== previousChart.showMe.dim) {            

            //clear previous chart
            if(previousChart.chartTypeName) {              
              chart[previousChart.chartTypeName].clear(scope.userSelection.chartType.name);
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
              chart.constants.blobs.makeNew();
              chart[scope.userSelection.chartType.name].build();
              chart[scope.userSelection.chartType.name].update(data, []);
            }
          }          

          //update previousChart
          previousChart.showMe = showMe;
          previousChart.chartTypeName = scope.userSelection.chartType.name;
        };

        chart.viewByChanged = function () {
          chart[previousChart.chartTypeName].clear(scope.userSelection.chartType.name);
          chart[scope.userSelection.chartType.name].build();
          if(scope.userSelection.showMe.type === 'number') {
            setDataForNumericDim();
          }          
          chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
          previousChart.chartTypeName = scope.userSelection.chartType.name;
        };

        chart.viewByAggChanged = function () {
          chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
        };

        chart.chartTypeChanged = function () {
          chart[previousChart.chartTypeName].clear(scope.userSelection.chartType.name);
          chart[scope.userSelection.chartType.name].build();
          chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
          previousChart.chartTypeName = scope.userSelection.chartType.name;
        };

        chart.colorByChanged = function () {
          var dataType = scope.userSelection.colorBy ? dimensions[scope.userSelection.colorBy].dataType : null;
          chart.constants.bubles.changeColor(scope.userSelection.colorBy, dataType);
          var reColorMethod = chart[scope.userSelection.chartType.name].onRecolor;
          if(reColorMethod){ reColorMethod(); }
        };

        chart.sizeByChanged = function () {
          chart.constants.bubles.changeSize(scope.userSelection.sizeBy);
          chart[scope.userSelection.chartType.name].onResize();
        };

        // ------------------------------------------------------------------------------------------------
        // REACT TO DATA CHANGES
        // ------------------------------------------------------------------------------------------------  

        scope.$on('FILTERS_CHANGED', function(event, args) {

            //for bubles
            if(scope.userSelection.showMe.type === 'text') {
              data = dimensions[scope.userSelection.showMe.dim].groupOnAndAggAll();
                           
              chart.constants.bubles.setData(data, scope.userSelection.showMe.dim);
              
              chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
            }

            //for blobs
            if(scope.userSelection.showMe.type === 'number') {
              setDataForNumericDim();
              chart[scope.userSelection.chartType.name].update(data, scope.userSelection.viewBy);
            }   
        });

        function setDataForNumericDim() {
          data = dimensions[scope.userSelection.showMe.dim].aggregateOver({'dims': _.pluck(scope.userSelection.viewBy, 'dim'), 'aggregator':scope.userSelection.showMe.agg});          
        }

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

        //not nice, should use dim.label
        scope.formatDimLabel = function (d) {          
          return d ? d.replace(/\_/g, ' ') : '';
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
          
          //clear all other userSelection
          scope.userSelection.viewBy = [];
          scope.changeColorBy(null);
          scope.changeSizeBy(null); 
          //reset chart types dropdown
          scope.refreshAvailableChartTypes();          
          //tell the chart
          chart.showMeChanged();
        };

        scope.changeShowMeAgg = function (agg) {
          scope.userSelection.showMe.agg = agg;
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

        scope.changeViewByAgg = function (agg, index) {
          //update userSelection.viewBy
          scope.userSelection.viewBy[index].agg = agg;
          //tell the chart
          chart.viewByAggChanged();
        };

        scope.changeChartType = function (chartType) {
          scope.userSelection.chartType = chartType;
          chart.chartTypeChanged();
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

        // scope.userSelection.chartType.name = 'boxplots';
        // scope.userSelection.viewBy = [{agg: 'sum', dim: 'District', type: 'text'}, {agg: 'sum', dim: 'Price', type: 'number'}];
        // chart.viewByChanged();

      }
    };
  });
