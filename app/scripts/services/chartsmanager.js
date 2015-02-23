'use strict';

/*
    Handles the collection of chart directives currently displayed
    -------------------------------------------------------------------
*/

angular.module('gocApp')
  .service('ChartsManager', function ChartsManager($rootScope) {
    
    this.charts = [];

    this.addChart = function(options){        
        this.charts.push(options);
        //$rootScope.$broadcast('CHART_ADDED', options);
        $rootScope.$broadcast('CHARTS_COLLECTION_CHANGED', this.charts);
    };

  });
