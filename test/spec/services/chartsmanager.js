'use strict';

describe('Service: chartsManager', function () {

  // load the service's module
  beforeEach(module('gocApp'));

  // instantiate service
  var chartsManager;
  beforeEach(inject(function (_chartsManager_) {
    chartsManager = _chartsManager_;
  }));

  it('should do something', function () {
    expect(!!chartsManager).toBe(true);
  });

});
