'use strict';

angular.module('gocApp')
  .service('Dataload', function Dataload(Data) {

    this.acceptedFileExtensions = '.tsv,.csv';
    
    // TODO, error handling, make it a promise (callback is really deep in the function), check why it forces a scope.apply
    this.loadDataFromFile = function(input, callback) {
        var _this = this;
        if (input.files && input.files[0]) {
            var extension = input.files[0].name.split('.').pop().toLowerCase();

            if(_this.acceptedFileExtensions.indexOf(extension)>-1){
                var reader = new FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;
                    data = d3[extension].parse(data);
                    Data.prepareData(data);
                    if(callback){
                        callback();
                    }
                };
                reader.readAsText(input.files[0]);
            }
        }        
    };

  });
