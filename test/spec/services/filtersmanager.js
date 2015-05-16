'use strict';

describe('Service: filtersManager', function () {

  // load the service's module
  beforeEach(module('gocApp'));

  // instantiate service
  var filtersManager;
  beforeEach(inject(function (_filtersManager_) {
    filtersManager = _filtersManager_;
  }));

  it('should do something', function () {
    expect(!!filtersManager).toBe(true);
  });

});
