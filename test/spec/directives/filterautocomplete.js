'use strict';

describe('Directive: filterAutocomplete', function () {

  // load the directive's module
  beforeEach(module('gocApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-autocomplete></filter-autocomplete>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the filterAutocomplete directive');
  }));
});
