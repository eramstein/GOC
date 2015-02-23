'use strict';

angular.module('gocApp')
  .controller('StartupCtrl', function ($scope, Data, Dataload, ChartsManager) {

    $scope.data = {};
    $scope.currentStep = 'uploadData';

    // Step 1 : data upload
    // --------------------------------------------------------

    $scope.acceptedFileExtensions = Dataload.acceptedFileExtensions;
    $scope.loadDataFromFile = Dataload.loadDataFromFile;

    // Step 2 : data report
    // --------------------------------------------------------

    $scope.showDataReport = function () {
        $scope.currentStep = 'showDataReport';        
        getDataSummary();
        //something gets lost while reading file
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };

    var getDataSummary = function () {
        $scope.data.recordCount = Data.getRecordCount();
        $scope.data.dims = Data.dimensions;
    };

    // Step 3 : first chart creation
    // --------------------------------------------------------
    $scope.createChart = function (dim) {
        var options = {'pivotDim': dim};
        ChartsManager.addChart(options);
        $scope.state.visibility.charts = true;
        $scope.state.visibility.sidebar = true;
        $scope.state.visibility.startup = false;
    };

    // TEST - autoload
    var testData = [{'ConstructionYear': '2010-01-05', 'Surface': '100', 'Price': '200000', 'District': 'Orangerie', 'Taxes': '500', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App1'}, {'ConstructionYear': '2010-01-05', 'Surface': '120', 'Price': '200000', 'District': 'Gare', 'Taxes': '175', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App2'}, {'ConstructionYear': '2010-01-05', 'Surface': '130', 'Price': '235000', 'District': 'Gare', 'Taxes': '192', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App3'}, {'ConstructionYear': '2011-01-05', 'Surface': '150', 'Price': '210000', 'District': 'Gare', 'Taxes': '146', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App4'}, {'ConstructionYear': '2011-01-05', 'Surface': '170', 'Price': '230000', 'District': 'Contades', 'Taxes': '135', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App5'}, {'ConstructionYear': '2011-01-05', 'Surface': '180', 'Price': '240000', 'District': 'Gare', 'Taxes': '138', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App6'}, {'ConstructionYear': '2012-01-05', 'Surface': '200', 'Price': '260000', 'District': 'Gare', 'Taxes': '130', 'Garden': '20', 'Category': 'Appartment', 'Item': 'App7'}, {'ConstructionYear': '2012-01-05', 'Surface': '250', 'Price': '290000', 'District': 'Orangerie', 'Taxes': '100', 'Garden': '300', 'Category': 'House', 'Item': 'App8'}, {'ConstructionYear': '2012-01-05', 'Surface': '280', 'Price': '300000', 'District': 'Gare', 'Taxes': '114', 'Garden': '200', 'Category': 'House', 'Item': 'App9'}, {'ConstructionYear': '2013-01-05', 'Surface': '300', 'Price': '340000', 'District': 'Contades', 'Taxes': '113', 'Garden': '20', 'Category': 'Appartment', 'Item': 'App10'}, {'ConstructionYear': '2013-01-05', 'Surface': '310', 'Price': '400000', 'District': 'Gare', 'Taxes': '129', 'Garden': '50', 'Category': 'Appartment', 'Item': 'App11'}, {'ConstructionYear': '2013-01-05', 'Surface': '350', 'Price': '410000', 'District': 'Gare', 'Taxes': '120', 'Garden': '100', 'Category': 'House', 'Item': 'App12'}, {'ConstructionYear': '2014-01-05', 'Surface': '300', 'Price': '420000', 'District': 'Gare', 'Taxes': '200', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App13'}, {'ConstructionYear': '2014-01-05', 'Surface': '320', 'Price': '510000', 'District': 'Contades', 'Taxes': '275', 'Garden': '200', 'Category': 'House', 'Item': 'App14'}, {'ConstructionYear': '2014-01-05', 'Surface': '330', 'Price': '580000', 'District': 'Orangerie', 'Taxes': '293', 'Garden': '150', 'Category': 'Appartment', 'Item': 'App15'}, {'ConstructionYear': '2010-01-05', 'Surface': '350', 'Price': '500000', 'District': 'Gare', 'Taxes': '246', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App16'}, {'ConstructionYear': '2015-01-05', 'Surface': '370', 'Price': '530000', 'District': 'Contades', 'Taxes': '235', 'Garden': '400', 'Category': 'House', 'Item': 'App17'}, {'ConstructionYear': '2015-01-05', 'Surface': '380', 'Price': '680000', 'District': 'Orangerie', 'Taxes': '338', 'Garden': '0', 'Category': 'Appartment', 'Item': 'App18'}, {'ConstructionYear': '2015-01-05', 'Surface': '400', 'Price': '660000', 'District': 'Gare', 'Taxes': '330', 'Garden': '20', 'Category': 'Appartment', 'Item': 'App19'}, {'ConstructionYear': '2016-01-05', 'Surface': '450', 'Price': '690000', 'District': 'Orangerie', 'Taxes': '380', 'Garden': '350', 'Category': 'House', 'Item': 'App20'}, {'ConstructionYear': '2016-01-05', 'Surface': '480', 'Price': '660000', 'District': 'Orangerie', 'Taxes': '342', 'Garden': '250', 'Category': 'House', 'Item': 'App21'}, {'ConstructionYear': '2016-01-05', 'Surface': '400', 'Price': '740000', 'District': 'Contades', 'Taxes': '313', 'Garden': '20', 'Category': 'Appartment', 'Item': 'App22'}, {'ConstructionYear': '2017-01-05', 'Surface': '510', 'Price': '780000', 'District': 'Orangerie', 'Taxes': '420', 'Garden': '50', 'Category': 'Appartment', 'Item': 'App23'}, {'ConstructionYear': '2017-01-05', 'Surface': '450', 'Price': '820000', 'District': 'Contades', 'Taxes': '410', 'Garden': '380', 'Category': 'House', 'Item': 'App24'}, {'ConstructionYear': '2017-01-05', 'Surface': '490', 'Price': '850000', 'District': 'Contades', 'Taxes': '430', 'Garden': '240', 'Category': 'House', 'Item': 'App25'}]; 
    Data.prepareData(testData);
    $scope.showDataReport();
    $scope.createChart('Item');

  });
