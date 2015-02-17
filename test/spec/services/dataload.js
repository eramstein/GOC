'use strict';

describe('Service: dataLoad', function () {

  // load the service's module
  beforeEach(module('gocApp'));

  // instantiate service
  var dataLoad;
  beforeEach(inject(function (_dataLoad_) {
    dataLoad = _dataLoad_;
  }));

  it('should do something', function () {
    expect(!!dataLoad).toBe(true);
  });

});
