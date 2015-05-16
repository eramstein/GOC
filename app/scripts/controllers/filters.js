'use strict';

angular.module('gocApp')
  .controller('FiltersCtrl', function ($scope, Data, Config) {
    
    $scope.dimensions = Data.dimensions;

    $scope.$on('BUILD_FILTERS', function() {
       drawFilters();
    });

    $scope.textFewDims = [];
    $scope.textManyDims = [];
    $scope.numberDims = [];

    function drawFilters () {
        _.forEach($scope.dimensions, function (dim) {
            if(dim.dataType === 'text'){
                var distinctValues = dim._cfDim.group().size();
                if(distinctValues <= Config.filterCheckboxTreshold){
                    $scope.textFewDims.push(dim);
                } else {
                    // TODO - autocomplete filters
                    //$scope.textManyDims.push(dim);
                }
            }
            if(dim.dataType === 'number'){
                $scope.numberDims.push(dim);
            }
        });
    }
    

  });
