'use strict';

describe('Directive: filterboxplots', function () {

  // load the directive's module
  beforeEach(module('gocApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filterboxplots></filterboxplots>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the filterboxplots directive');
  }));
});
