'use strict';

angular.module('gocApp')
  .controller('StartupCtrl', function ($scope, Data, Dataload) {

    $scope.currentStep = 'uploadData';

    // Step 1 : data upload
    // --------------------------------------------------------

    $scope.acceptedFileExtensions = Dataload.acceptedFileExtensions;
    $scope.loadDataFromFile = Dataload.loadDataFromFile;

    // Step 2 : data report
    // --------------------------------------------------------

    $scope.dataSummary = {};

    $scope.showDataReport = function () {
        $scope.currentStep = 'showDataReport';
        //something gets lost while reading file
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        getDataSummary();
    };

    var getDataSummary = function () {
        _.forEach(Data.dimensions, function(dim, name) {
            console.log(dim);
        });
    };


    // TEST - autoload
    var testData = [{'Surface': '100', 'Price': '200000', 'District': 'Orangerie', 'Taxes': '500', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App1'}, {'Surface': '120', 'Price': '200000', 'District': 'Gare', 'Taxes': '175', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App2'}, {'Surface': '130', 'Price': '235000', 'District': 'Gare', 'Taxes': '192', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App3'}, {'Surface': '150', 'Price': '210000', 'District': 'Gare', 'Taxes': '146', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App4'}, {'Surface': '170', 'Price': '230000', 'District': 'Contades', 'Taxes': '135', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App5'}, {'Surface': '180', 'Price': '240000', 'District': 'Gare', 'Taxes': '138', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App6'}, {'Surface': '200', 'Price': '260000', 'District': 'Gare', 'Taxes': '130', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App7'}, {'Surface': '250', 'Price': '290000', 'District': 'Orangerie', 'Taxes': '100', 'Garden': '300', 'Category': 'House', 'Name': 'App8'}, {'Surface': '280', 'Price': '300000', 'District': 'Gare', 'Taxes': '114', 'Garden': '200', 'Category': 'House', 'Name': 'App9'}, {'Surface': '300', 'Price': '340000', 'District': 'Contades', 'Taxes': '113', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App10'}, {'Surface': '310', 'Price': '400000', 'District': 'Gare', 'Taxes': '129', 'Garden': '50', 'Category': 'Appartment', 'Name': 'App11'}, {'Surface': '350', 'Price': '410000', 'District': 'Gare', 'Taxes': '120', 'Garden': '100', 'Category': 'House', 'Name': 'App12'}, {'Surface': '300', 'Price': '420000', 'District': 'Gare', 'Taxes': '200', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App13'}, {'Surface': '320', 'Price': '510000', 'District': 'Contades', 'Taxes': '275', 'Garden': '200', 'Category': 'House', 'Name': 'App14'}, {'Surface': '330', 'Price': '580000', 'District': 'Orangerie', 'Taxes': '293', 'Garden': '150', 'Category': 'Appartment', 'Name': 'App15'}, {'Surface': '350', 'Price': '500000', 'District': 'Gare', 'Taxes': '246', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App16'}, {'Surface': '370', 'Price': '530000', 'District': 'Contades', 'Taxes': '235', 'Garden': '400', 'Category': 'House', 'Name': 'App17'}, {'Surface': '380', 'Price': '680000', 'District': 'Orangerie', 'Taxes': '338', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App18'}, {'Surface': '400', 'Price': '660000', 'District': 'Gare', 'Taxes': '330', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App19'}, {'Surface': '450', 'Price': '690000', 'District': 'Orangerie', 'Taxes': '380', 'Garden': '350', 'Category': 'House', 'Name': 'App20'}, {'Surface': '480', 'Price': '660000', 'District': 'Orangerie', 'Taxes': '342', 'Garden': '250', 'Category': 'House', 'Name': 'App21'}, {'Surface': '400', 'Price': '740000', 'District': 'Contades', 'Taxes': '313', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App22'}, {'Surface': '510', 'Price': '780000', 'District': 'Orangerie', 'Taxes': '420', 'Garden': '50', 'Category': 'Appartment', 'Name': 'App23'}, {'Surface': '450', 'Price': '820000', 'District': 'Contades', 'Taxes': '410', 'Garden': '380', 'Category': 'House', 'Name': 'App24'}];
    Data.prepareData(testData);
    $scope.showDataReport();

  });
