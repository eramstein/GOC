'use strict';

/*
    Handles the interactions with the filters UI
    -------------------------------------------------------------------
*/

angular.module('gocApp')
  .service('FiltersManager', function FiltersManager($rootScope, Data) {

    this.buildFilters = function(){
        $rootScope.$broadcast('BUILD_FILTERS', null);
    };

    // maintain state of current filters
    var filters = {};
    $rootScope.$on('CHANGE_FILTERS', function(event, args) {
        if(!filters[args.dim]){
            filters[args.dim] = [];
        }
        //for nominal dims we expect one parameter - a value to toggle (e.g. a country to add or remove)
        if(args.scaleType === 'nominal'){
            toggleArrayItem(filters[args.dim], args.val);
            Data.dimensions[args.dim].filterForValues(filters[args.dim]);
        }
        //for quantitative dims we expect 1 array - min and max
        if(args.scaleType === 'quantitative'){
            if(args.val){
                Data.dimensions[args.dim].filterRange(args.val);
            } else {                
                Data.dimensions[args.dim].resetFilterRange();
            }            
        }
        $rootScope.$broadcast('FILTERS_CHANGED', {'dim': args.dim, 'scaleType': args.scaleType});
    });

    function toggleArrayItem(a, v) {
        var i = a.indexOf(v);
        if (i === -1){
            a.push(v);
        } else {
            a.splice(i,1);
        }            
    }

  });
