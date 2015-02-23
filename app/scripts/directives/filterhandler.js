'use strict';

angular.module('gocApp')
  .directive('filterHandler', function (Data) {
    return {
      templateUrl: '/views/templates/filterHandler.html',
      restrict: 'E',
      scope: {name: '@dimension'},
      link: function postLink(scope, element, attrs) {

        console.log(attrs.dimension);
      }
    };
  });
