'use strict';

angular.module('gocApp')
  .directive('filterAutocomplete', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the filterAutocomplete directive');
      }
    };
  });
