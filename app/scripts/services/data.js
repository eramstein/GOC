'use strict';

/*
    Builds a dimensional model on input data
    ---------------------------------------------------

    Data.prepareData(data: array of objects)
    - checks and cleans data
    - builds Data.dimensions. each attribute in the data objects becomes a dimension.

    Data.dimensions: {'dimName': Dimension}
    This is the API to filter, group and aggregate data.
    Each dimension has the following public attributes and methods.

    Dimension {
        name: the attribute's key in the source data ('price', 'country')
        type: 'nominal', 'quantNum' or 'quantDate'

        groupOn(): creates a group of distinct values for that dimension (discretizes it if needed), and aggregates values of other dimensions passed as an array param
                   if no param passed, returns number of record per group in the dimension                   
                   input:  [{'name': dimension.name, 'aggregator': 'sum' or 'avg' or 'countUniques' or 'none'}]
                           e.g. [{'name': 'GDP', 'aggregator': 'sum'}, {'name': 'Life Expectancy', 'aggregator': 'avg'}]
                   output: [{'continent': 'Europe', 'GDP': 1000, 'Life Expectancy': 80}]

        aggregateOver(): aggregates values of that dimension. other dimensions can be used to group the data into categories, up to 2 dimensions
                         the first dimension to group on can be quantitative, in this case it gets discretized
                         input: {'dims':[dimension.name], 'aggregator':'sum' or 'avg'}
                         output : for 0 dim:  1000
                                  for 1 dim:  [{'key': 'France', 'value': 1000}]
                                  for 2 dims: [{'key': 'France', 'value': [{'key': 'Shoes', 'value': 500}]}]

        getQuartiles(): returns min, max, med, Q1 and Q3

        filterRange([min, max])
        filterForValue(value)
        filterForValues([values])
    }

    Note: filters act on all OTHER dimensions

    TODO: this service's design is too tightly coupled with what the chart manager needs
          a more generic abstract layer could be easier to maintain and more re-usable
          e.g. get rid of Dimension.groupOn and aggregateOver, replace by Data.getData(dimsToGroup, dimsToMeasure)

*/

angular.module('gocApp')
  .service('Data', function Data() {

    var _this = this;
    var _sourceData;

    // PUBLIC
    // ---------------------------------------------------

    this.dimensions = {};

    this.prepareData = function(data) {

        _sourceData = data;

        if (!checkDataValidity(data)) {
            console.log('problem with your data!');
            return false;
        }

        cleanData(data);

        buildDimensions(data);

        console.log('data loaded');
    };

    // PRIVATE
    // ---------------------------------------------------
    
    var _cf;
    var _cfAll;
    var _cfAllGroupBy;

    function buildDimensions(data) {    

        //create crossfilter
        _cf = crossfilter(data);

        //store a group with all records
        _cfAll = _cf.groupAll();

        //build each dimension
        _.forEach(data[0], function(value, key) {
            _this.dimensions[key] = new Dimension(key);
        });

    }

    function checkDataValidity(data) {        
        return true;
    }

    function cleanData(data) {
        // TODO : this is redundant with the Dimension constructor, it also checks data types
        //force numeric fields to be numbers
        var sample = _.clone(data[0], true);
        _.forEach(sample, function(value, key) {
            if(getType(key) === 'quantNum'){
                _.forEach(data, function(d, i) {
                    d[key] = +d[key];
                });
            }
        });
    }

    function getType(key) {

        var dataType;
        // TODO: this looks only at the first record !
        var sample = _sourceData[0][key];
        
        if (isDate(sample)) {
            if (isNaN(sample)) {
                dataType = 'quantDate';
            } else {
                dataType = 'quantNum';
            }
        } else {
            if (isNaN(sample)) {
                dataType = 'nominal';
            } else {
                dataType = 'quantNum';
            }
        }

        return dataType;

        function isDate(val) {
            var d = new Date(val);
            return !isNaN(d.valueOf());
        }
    }

    // DIMENSION objects
    // ---------------------------------------------------

    function Dimension(key) {
        this.name = key;
        this.type = getType(key);
        this._groupedBy = null;
        this._cfGroup = null;
        this._cfDim = _cf.dimension(function(d) {
            return d[key];
        });
    }

    //filters for a [min, max] range
    Dimension.prototype.filterRange = function(range) {
        this._cfDim.filterRange(range);
    };

    //filters for a specific value
    Dimension.prototype.filterForValue = function(value) {
        this._cfDim.filterExact(value);
    };

    //filters for an array of values
    Dimension.prototype.filterForValues = function(values) {
        this._cfDim.filterFunction(function (d) {
            return values.indexOf(d) + 1;
        });
    };
    
    //create groups on that dimension and aggregate other dimensions on these groups - e.g. for continents, give me sum of GDP and avg of life expectancy
    Dimension.prototype.groupOn = function(dimsToAgg) {
        var _dim = this;
        //create groups if needed
        if(!_.isEqual(dimsToAgg, _dim._groupedBy)){
            _dim._setGroups(dimsToAgg);
            _dim._groupedBy = dimsToAgg;
        }
        //fetch data from the groups
        var values = _dim._cfGroup.all(); 
        var valuesForChart = [];

        if(dimsToAgg){
            //transform the {key:"groupName", value: {dim1: val1, dim2: val2}} hash into an array usable by d3
            _.forEach(values, function(d) {
                var newVal = {};
                newVal[_dim.name] = d.key;
                _.forEach(d.value, function(v, k) {
                    //ignore private attributes (e.g. temp stuff used while computing averages)
                    if(k.substr(0,1) !== '_'){
                        newVal[k] = v;
                    }                
                });
                //if empty, ignore that object
                if(_.size(newVal) > 1){
                    valuesForChart.push(newVal);
                }            
            });
        } else {
            //if there was no grouping we directly get an array of key/value pairs, returning counts
            valuesForChart = values;
        }
        
        return valuesForChart;
    };

    //aggregate values of this dimension, split over 0 to 2 other dimensions groups - e.g. for price, sum it by country/product combinations
    Dimension.prototype.aggregateOver = function(groupBy) {
        var _dim = this;
        var values;
        var valuesForChart = [];
        var dimToGroupOn;

        //case no dim to group on, we aggregate on _dim itself and return the value
        if(groupBy.dims.length === 0){
            if(!_.isEqual('groupAll', _dim._groupedBy)){
                _dim._setGroupAll(groupBy.aggregator);
                _dim._groupedBy = 'groupAll';
            }
            values = _dim._cfGroup.value();
            if(groupBy.aggregator === 'avg'){
                valuesForChart = values._avg;
            } else {
                valuesForChart = values;
            }
        }
        
        //if we need to gorup on 1 or 2 dims, we'll store data on groups of the first one
        if(groupBy.dims.length >= 1){
            dimToGroupOn = _this.dimensions[groupBy.dims[0]];
        }

        //case 1 dim to group on, we group it, aggregate on it and return the value        
        if(groupBy.dims.length === 1){            
            if(!_.isEqual('group' + groupBy.aggregator, dimToGroupOn._groupedBy)){
                dimToGroupOn._setGroups([{'name': _dim.name, 'aggregator': groupBy.aggregator}]);
                dimToGroupOn._groupedBy = 'group' + groupBy.aggregator;
            }
            values = dimToGroupOn._cfGroup.all();            
            //transform the value hashes into primitives (we only have 1 dim anyways)
            _.forEach(values, function(d) {
                valuesForChart.push({
                    'key': d.key,
                    'value': d.value[Object.keys(d.value)[0]]
                });
            });
        }

        //case 2 dims to group on, we group on the first, aggregate on unique values of the second and return the value
        if(groupBy.dims.length === 2){
            if(!_.isEqual(groupBy, dimToGroupOn._groupedBy)){
                _dim._aggregateOverTwoDims(groupBy);
                dimToGroupOn._groupedBy = groupBy;
            }
            values = dimToGroupOn._cfGroup.all();
            //transform the value hashes into arrays usable by d3
            _.forEach(values, function(d) {
                var newVals = [];
                _.forEach(d.value, function(v, k) {
                    //ignore private attributes (e.g. temp stuff used while computing averages)
                    if(k.substr(0,1) !== '_'){
                        newVals.push({'key': k, 'value': v});
                    }                
                });
                valuesForChart.push({
                    'key': d.key,
                    'value': newVals
                });        
            });
        }

        return valuesForChart;
    };

    Dimension.prototype.getQuartiles = function() {
        var dimSize = this._cfDim.top(Infinity).length;
        var medPos = Math.floor(dimSize/2);
        var q1Pos = Math.floor(3*dimSize/4);
        var q3Pos = Math.floor(dimSize/4);
        var stats = {
            'max': this._cfDim.top(1)[0][this.name],
            'min': this._cfDim.bottom(1)[0][this.name],
            'med': this._cfDim.top(Math.floor(medPos))[medPos-1][this.name],
            'q1': this._cfDim.top(Math.floor(q1Pos))[q1Pos-1][this.name],
            'q3': this._cfDim.top(Math.floor(q3Pos))[q3Pos-1][this.name]
        };
        return stats;
    };

    Dimension.prototype._setGroupAll = function(aggregator) {
       this._cfGroup = this._cfDim.groupAll();
       if(aggregator === 'sum'){
            var reduceSumFunc = new Function('d', 'return d.' + this.name);
            this._cfGroup.reduceSum(reduceSumFunc);
       }
       if(aggregator === 'avg'){
            var tempString = '';

            tempString += 'p._count++;';
            tempString += 'p._sum += v.' + this.name + ';';
            tempString += 'p._avg = p._sum/p._count;';
            tempString += 'return p;';
            var reduceAdd = new Function('p', 'v', tempString);

            tempString = '';
            tempString += 'p._count--;';
            tempString += 'p._sum -= v.' + this.name + ';';
            tempString += 'p._avg = p._sum/p._count;';
            tempString += 'return p;';
            var reduceRemove = new Function('d', 'return d.' + this.name);

            var reduceInit = function() {
                return {'_count': 0, '_sum': 0, '_avg': 0};
            };

            this._cfGroup.reduce(reduceAdd, reduceRemove, reduceInit);
       }
    };

    //groups this dimension on unique values and
    //aggregates on the quantNum dimensions specified in the groupBy parameter [{name: dim1, aggregator: sum}]
    //aggregator can be sum, avg, countUniques, none (in that case it just returns the last found value - works fine if they are all the same)
    Dimension.prototype._setGroups = function(groupBy) {
        var _dim = this;
        //build group
        if(_dim.type === 'nominal'){
            _dim._cfGroup = _dim._cfDim.group();
        } else {
            //for quantitative dimensions, we discretize them on rounded values
            _dim._discretize();
        }

        //compute reduce functions based on groupBy
        if (groupBy) {
            //pre-build reduce functions so that they don't have to evaluate dim names every execution (eats > 20% of exec time)
            // TODO efficient but ugly, maybe put it in a separate service ?
            var tempString = '';
            _.forEach(groupBy, function(dim) {
                if (dim.aggregator === 'sum') {
                    tempString += 'p.' + dim.name + '_sum+=v.' + dim.name + ';';
                }
                if (dim.aggregator === 'avg') {
                    tempString += 'p._count_' + dim.name + '++;';
                    tempString += 'p._sum_' + dim.name + ' += v.' + dim.name + ';';
                    //TODO: check if we really need to do the division every time the reduce function is called
                    tempString += 'p.' + dim.name + '_avg= p._sum_' + dim.name + ' / p._count_' + dim.name + ';';
                }
                if (dim.aggregator === 'none') {
                    tempString += 'p.' + dim.name + '_sum=v.' + dim.name + ';';
                }
                if (dim.aggregator === 'countUniques') {
                    //we maintain a counter of how many time each value appears, so that the reduceRemove function nows if the last one got removed
                    tempString += 'if( v.' + dim.name + ' in p._' + dim.name + '_uniqueValuesCount) {p._' + dim.name + '_uniqueValuesCount[v.' + dim.name + ']++;}';
                    tempString += ' else {p._' + dim.name + '_uniqueValuesCount[v.' + dim.name + '] = 1;}';
                    tempString += 'p.' + dim.name + '_uniques= _.size(p._' + dim.name + '_uniqueValuesCount);';
                }
            });
            tempString += 'return p;';
            var reduceAdd = new Function('p', 'v', tempString);

            tempString = '';
            _.forEach(groupBy, function(dim) {
                if (dim.aggregator === 'sum') {
                    tempString += 'p.' + dim.name + '-=v.' + dim.name + ';';
                }
                if (dim.aggregator === 'avg') {
                    tempString += 'p._count_' + dim.name + '--;';
                    tempString += 'p._sum_' + dim.name + ' -= v.' + dim.name + ';';
                    tempString += 'p.' + dim.name + '_avg= p._sum_' + dim.name + ' / p._count_' + dim.name + ';';
                }
                if (dim.aggregator === 'none') {
                    tempString += 'p.' + dim.name + '=v.' + dim.name + ';';
                }
                if (dim.aggregator === 'countUniques') {
                    tempString += 'p._' + dim.name + '_uniqueValuesCount[v.' + dim.name + ']--;';
                    tempString += 'if(p._' + dim.name + '_uniqueValuesCount[v.' + dim.name + '] === 0) {delete p._' + dim.name + '_uniqueValuesCount[v.' + dim.name + ']};';
                    tempString += 'p.' + dim.name + '_uniques= _.size(p._' + dim.name + '_uniqueValuesCount);';
                }
            });
            tempString += 'return p;';
            var reduceRemove = new Function('p', 'v', tempString);

            var reduceInit = function() {
                var p = {};
                _.forEach(groupBy, function(dim) {
                    if (dim.aggregator === 'sum') {
                        p[dim.name + '_sum'] = 0;
                    }
                    if (dim.aggregator === 'avg') {
                        p['_count_' + dim.name] = 0;
                        p['_sum_' + dim.name] = 0;
                    }
                    if (dim.aggregator === 'countUniques') {
                        p[dim.name + '_uniques'] = 0;
                        p['_' + dim.name + '_uniqueValuesCount'] = {};
                    }
                });
                return p;
            };
            //assign computed reduce functions
            this._cfGroup.reduce(reduceAdd, reduceRemove, reduceInit);
        } else {
            //if no groupBy, just count
            this._cfGroup.reduceCount();
        }    
    };

    //aggregate on this dimension, grouping on two other dimensions 
    //groupBy.dims is an array of 2 dims, groupBy.aggregator is sum or avg
    //if the first dim is quantNum, groups will be based on rounded values
    // TODO: allow rounding if teh second dim is quantNum (atm it would use all unique values)
    Dimension.prototype._aggregateOverTwoDims = function(groupBy) {
        
        var _dim = this;
        var dim1 = _this.dimensions[groupBy.dims[0]];
        var dim2 = _this.dimensions[groupBy.dims[1]];

        //group on the first dim
        if(dim1.type === 'nominal'){
            dim1._cfGroup = dim1._cfDim.group();
        } else {
            //for quantitative dimensions, we discretize them on rounded values
            dim1._discretize();
        }

        //pre-build reduce functions 
        var tempString = '';

        if (groupBy.aggregator === 'sum') {
            tempString += 'p[v.' + dim2.name + '] += v.' + _dim.name + ';';            
        }
        if (groupBy.aggregator === 'avg') {
            tempString += 'p._counts[v.' + dim2.name + ']++;';
            tempString += 'p._sums[v.' + dim2.name + '] += v.' + _dim.name + ';';
            tempString += 'p[v.' + dim2.name + '] = p._sums[v.' + dim2.name + '] / p._counts[v.' + dim2.name + '];';
        }
        tempString += 'return p;';

        var reduceAdd = new Function('p', 'v', tempString);
        tempString = '';

        if (groupBy.aggregator === 'sum') {
            tempString += 'p[v.' + dim2.name + '] -= v.' + _dim.name + ';';
        }
        if (groupBy.aggregator === 'avg') {
            tempString += 'p._count_' + dim2.name + '--;';
            tempString += 'p._sum_' + dim2.name + ' -= v.' + _dim.name + ';';
            tempString += 'p[v.' + dim2.name + '] = p._sum_' + dim2.name + ' / p._count_' + dim2.name + ';';
        }
        tempString += 'return p;';

        var reduceRemove = new Function('p', 'v', tempString);

        var reduceInit = function() {
            //initialize all possible values of dim2 to 0
            var values = _.pluck(dim2._cfDim.group().all(), 'key');
            var p = {
                _counts: {},
                _sums: {}
            };
            _.each(values, function (d) {
                p[d] = 0;
                if (groupBy.aggregator === 'avg') {
                    p._counts[d] = 0;
                    p._sums[d] = 0;
                }
            });            
            return p;
        };

        //aggregate on distinct values of the second dim
        dim1._cfGroup.reduce(reduceAdd, reduceRemove, reduceInit);
        
    };

    Dimension.prototype._discretize = function() {
        var maxValue = this._cfDim.top(1)[0][this.name];
        var minValue = this._cfDim.bottom(1)[0][this.name];
        var diff = maxValue - minValue;
        var diffMagnitudeOrder = Math.pow(10, Math.floor(Math.log(diff) / Math.LN10));
        var rounding = diff / diffMagnitudeOrder > 5 ? diffMagnitudeOrder : diffMagnitudeOrder / 2;
        this._cfGroup = this._cfDim.group(function (d) {                
            return Math.floor(d / rounding) * rounding;
        });
    };


// ---------------------------------------------------
// TEST
// ---------------------------------------------------
// var testData = [{'Surface': '100', 'Price': '200000', 'District': 'Orangerie', 'Taxes': '500', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App1'}, {'Surface': '120', 'Price': '200000', 'District': 'Gare', 'Taxes': '175', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App2'}, {'Surface': '130', 'Price': '235000', 'District': 'Gare', 'Taxes': '192', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App3'}, {'Surface': '150', 'Price': '210000', 'District': 'Gare', 'Taxes': '146', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App4'}, {'Surface': '170', 'Price': '230000', 'District': 'Contades', 'Taxes': '135', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App5'}, {'Surface': '180', 'Price': '240000', 'District': 'Gare', 'Taxes': '138', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App6'}, {'Surface': '200', 'Price': '260000', 'District': 'Gare', 'Taxes': '130', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App7'}, {'Surface': '250', 'Price': '290000', 'District': 'Orangerie', 'Taxes': '100', 'Garden': '300', 'Category': 'House', 'Name': 'App8'}, {'Surface': '280', 'Price': '300000', 'District': 'Gare', 'Taxes': '114', 'Garden': '200', 'Category': 'House', 'Name': 'App9'}, {'Surface': '300', 'Price': '340000', 'District': 'Contades', 'Taxes': '113', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App10'}, {'Surface': '310', 'Price': '400000', 'District': 'Gare', 'Taxes': '129', 'Garden': '50', 'Category': 'Appartment', 'Name': 'App11'}, {'Surface': '350', 'Price': '410000', 'District': 'Gare', 'Taxes': '120', 'Garden': '100', 'Category': 'House', 'Name': 'App12'}, {'Surface': '300', 'Price': '420000', 'District': 'Gare', 'Taxes': '200', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App13'}, {'Surface': '320', 'Price': '510000', 'District': 'Contades', 'Taxes': '275', 'Garden': '200', 'Category': 'House', 'Name': 'App14'}, {'Surface': '330', 'Price': '580000', 'District': 'Orangerie', 'Taxes': '293', 'Garden': '150', 'Category': 'Appartment', 'Name': 'App15'}, {'Surface': '350', 'Price': '500000', 'District': 'Gare', 'Taxes': '246', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App16'}, {'Surface': '370', 'Price': '530000', 'District': 'Contades', 'Taxes': '235', 'Garden': '400', 'Category': 'House', 'Name': 'App17'}, {'Surface': '380', 'Price': '680000', 'District': 'Orangerie', 'Taxes': '338', 'Garden': '0', 'Category': 'Appartment', 'Name': 'App18'}, {'Surface': '400', 'Price': '660000', 'District': 'Gare', 'Taxes': '330', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App19'}, {'Surface': '450', 'Price': '690000', 'District': 'Orangerie', 'Taxes': '380', 'Garden': '350', 'Category': 'House', 'Name': 'App20'}, {'Surface': '480', 'Price': '660000', 'District': 'Orangerie', 'Taxes': '342', 'Garden': '250', 'Category': 'House', 'Name': 'App21'}, {'Surface': '400', 'Price': '740000', 'District': 'Contades', 'Taxes': '313', 'Garden': '20', 'Category': 'Appartment', 'Name': 'App22'}, {'Surface': '510', 'Price': '780000', 'District': 'Orangerie', 'Taxes': '420', 'Garden': '50', 'Category': 'Appartment', 'Name': 'App23'}, {'Surface': '450', 'Price': '820000', 'District': 'Contades', 'Taxes': '410', 'Garden': '380', 'Category': 'House', 'Name': 'App24'}];
// console.table(testData);

// this.prepareData(testData);

// this.dimensions.District.filterForValues(['Gare', 'Contades']);

//console.log(this.dimensions.Surface.aggregateOver({dims: ['Taxes'], aggregator: 'sum'}));
// console.log(this.dimensions.Surface.aggregateOver({dims: ['Category', 'District'], aggregator: 'sum'}));
//  this.dimensions.District.filterForValues(['Orangerie', 'Contades']);
// console.log(this.dimensions.Surface.aggregateOver({dims: ['Category', 'District'], aggregator: 'sum'}));

//console.log(this.dimensions.District.groupOn([{name:'Price', aggregator:'avg'}, {name:'Taxes', aggregator:'avg'}, {name:'Surface', aggregator:'sum'}, {name:'Taxes', aggregator:'sum'}]));

//console.log(this.dimensions.District.groupOn([{name:'Price', aggregator:'avg'}, {name:'Taxes', aggregator:'avg'}, {name:'Price', aggregator:'sum'}, {name:'Taxes', aggregator:'sum'}]));

//console.log(this.dimensions.Taxes.groupOn([{name:'Price', aggregator:'sum'}, {name:'Category', aggregator:'countUniques'}]));

// console.log(this.dimensions.District.groupOn());
// console.log(this.dimensions.Surface.getQuartiles());
  });
