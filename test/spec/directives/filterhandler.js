'use strict';

describe('Directive: filterHandler', function () {

  // load the directive's module
  beforeEach(module('gocApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-handler></filter-handler>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the filterHandler directive');
  }));
});
